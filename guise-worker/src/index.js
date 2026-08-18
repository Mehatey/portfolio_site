/**
 * GUISE proxy — Cloudflare Worker port of guise_proxy.py.
 *
 * Holds the fal.ai key so the browser never sees it, and fronts three models:
 *   POST /see              { image_data_url }                  -> { ok, caption }
 *   POST /transform/start  { prompt, image_data_url, control } -> { ok, job_id, stage }
 *   GET  /transform/status ?id=                                -> { ok, stage, queue_position, url }
 *   POST /enhance          { image_url }                       -> { ok, url }
 *   GET  /health
 *
 * Differences from the Python original, and why:
 *  - No fal storage upload. fal accepts a base64 data URI directly as image_url,
 *    which removes a whole round trip and the tempfile dance.
 *  - Job state lives in fal's own queue rather than an in-process dict, since a
 *    Worker has no memory between requests. We keep only the fal status/response
 *    URLs in KV, so a forged job_id cannot point our authenticated key at an
 *    arbitrary host.
 *  - Spend guards, which a localhost-only proxy never needed.
 */

const GEN_MODEL = "fal-ai/flux-pro/kontext";
const SEE_MODEL = "fal-ai/florence-2-large/detailed-caption";
const UPSCALE_MODEL = "fal-ai/clarity-upscaler";

// One orbit is up to 11 generations fired 3-at-a-time, so the burst ceiling has
// to clear a full orbit or the piece breaks for an ordinary visitor.
const BURST_PER_MINUTE = 14;
const PER_IP_PER_HOUR = 26; // ~2 orbits
const GLOBAL_PER_DAY = 400; // the actual ceiling on the bill

const ALLOWED_ORIGINS = new Set([
  "https://siddharthmehta.design",
  "https://www.siddharthmehta.design",
  "http://localhost:8080",
  "http://localhost:4000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:4000",
]);

function corsHeaders(origin) {
  const h = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

function json(payload, origin, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function falFetch(url, init, env) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Key ${env.FAL_KEY}`,
      "Content-Type": "application/json",
      ...(init && init.headers),
    },
  });
}

/** Synchronous fal call, for the fast models. */
async function falRun(model, args, env) {
  const r = await falFetch(
    `https://fal.run/${model}`,
    {
      method: "POST",
      body: JSON.stringify(args),
    },
    env
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`fal ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

function dayKey(now) {
  return `day:${new Date(now).toISOString().slice(0, 10)}`;
}
function hourKey(ip, now) {
  return `ip:${ip}:${new Date(now).toISOString().slice(0, 13)}`;
}

async function bump(env, key, ttl) {
  // KV is eventually consistent, so concurrent requests can undercount. That is
  // fine here: these are coarse spend ceilings, not billing-grade counters.
  const current = parseInt((await env.GUISE_KV.get(key)) || "0", 10);
  await env.GUISE_KV.put(key, String(current + 1), { expirationTtl: ttl });
  return current + 1;
}

/** Returns an error string if the caller is over any limit, else null. */
async function checkBudget(env, ip, now) {
  const { success } = await env.GUISE_BURST.limit({ key: ip });
  if (!success) return "too many requests, give it a moment";

  const day = parseInt((await env.GUISE_KV.get(dayKey(now))) || "0", 10);
  if (day >= GLOBAL_PER_DAY) return "GUISE has hit its daily limit, try again tomorrow";

  const hour = parseInt((await env.GUISE_KV.get(hourKey(ip, now))) || "0", 10);
  if (hour >= PER_IP_PER_HOUR) return "you have used your hourly share, try again later";

  return null;
}

async function spend(env, ip, now) {
  await Promise.all([bump(env, dayKey(now), 172800), bump(env, hourKey(ip, now), 3600)]);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
    const now = Date.now();

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ ok: false, error: "origin not allowed" }, origin, 403);
    }

    try {
      if (path === "/health") {
        return json({ ok: true, gen: GEN_MODEL, see: SEE_MODEL, enhance: UPSCALE_MODEL }, origin);
      }

      if (path === "/transform/status" && request.method === "GET") {
        const id = url.searchParams.get("id") || "";
        if (!/^[a-zA-Z0-9-]{6,80}$/.test(id)) {
          return json({ ok: false, error: "bad job id" }, origin);
        }
        const stored = await env.GUISE_KV.get(`job:${id}`, "json");
        if (!stored) return json({ ok: false, error: "unknown transform job" }, origin);

        const sr = await falFetch(stored.status_url, { method: "GET" }, env);
        if (!sr.ok) {
          return json({ ok: true, stage: "error", error: `fal status ${sr.status}` }, origin);
        }
        const s = await sr.json();

        if (s.status === "IN_QUEUE") {
          // fal positions are zero based; show a human friendly count.
          return json({ ok: true, stage: "queued", queue_position: Math.max(0, s.queue_position || 0) + 1 }, origin);
        }
        if (s.status === "IN_PROGRESS") {
          return json({ ok: true, stage: "processing", queue_position: null }, origin);
        }
        if (s.status === "COMPLETED") {
          const rr = await falFetch(stored.response_url, { method: "GET" }, env);
          const body = await rr.json();
          const out = body && body.images && body.images[0] && body.images[0].url;
          if (!out) return json({ ok: true, stage: "error", error: "no image returned" }, origin);
          return json({ ok: true, stage: "complete", url: out }, origin);
        }
        return json({ ok: true, stage: "error", error: s.status || "transform failed" }, origin);
      }

      if (request.method !== "POST") {
        return json({ ok: false, error: "not found" }, origin, 404);
      }

      const body = await request.json().catch(() => ({}));

      if (path === "/see") {
        const dataUrl = body.image_data_url || "";
        if (!dataUrl.startsWith("data:image")) {
          return json({ ok: false, error: "need image_data_url" }, origin);
        }
        const over = await checkBudget(env, ip, now);
        if (over) return json({ ok: false, error: over }, origin);
        const r = await falRun(SEE_MODEL, { image_url: dataUrl }, env);
        return json({ ok: true, caption: (r.results || "").trim() }, origin);
      }

      if (path === "/transform/start") {
        const prompt = (body.prompt || "").trim();
        const dataUrl = body.image_data_url || "";
        if (!prompt || !dataUrl.startsWith("data:image")) {
          return json({ ok: false, error: "need prompt + image_data_url" }, origin);
        }
        const over = await checkBudget(env, ip, now);
        if (over) return json({ ok: false, error: over }, origin);

        const r = await falFetch(
          `https://queue.fal.run/${GEN_MODEL}`,
          {
            method: "POST",
            body: JSON.stringify({ prompt, image_url: dataUrl, guidance_scale: 3.5 }),
          },
          env
        );
        const text = await r.text();
        if (!r.ok) return json({ ok: false, error: `fal ${r.status}: ${text.slice(0, 200)}` }, origin);
        const q = JSON.parse(text);
        if (!q.request_id || !q.status_url || !q.response_url) {
          return json({ ok: false, error: "fal did not return a queue handle" }, origin);
        }

        await env.GUISE_KV.put(`job:${q.request_id}`, JSON.stringify({ status_url: q.status_url, response_url: q.response_url }), {
          expirationTtl: 600,
        });
        await spend(env, ip, now);
        return json({ ok: true, job_id: q.request_id, stage: "preparing" }, origin);
      }

      if (path === "/enhance") {
        const imageUrl = body.image_url || "";
        if (!imageUrl.startsWith("http")) {
          return json({ ok: false, error: "need image_url" }, origin);
        }
        const over = await checkBudget(env, ip, now);
        if (over) return json({ ok: false, error: over }, origin);
        const r = await falRun(UPSCALE_MODEL, { image_url: imageUrl, upscale_factor: 2 }, env);
        await spend(env, ip, now);
        return json({ ok: true, url: r.image.url }, origin);
      }

      return json({ ok: false, error: "not found" }, origin, 404);
    } catch (error) {
      return json({ ok: false, error: `${error.name}: ${error.message}` }, origin);
    }
  },
};
