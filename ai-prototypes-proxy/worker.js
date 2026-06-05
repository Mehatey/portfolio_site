// ai-prototypes-proxy — production helpers for browser AI prototypes on siddharthmehta.design
//
// Route this Worker on your zone (see README):
//   siddharthmehta.design/inat-audio/*
//   www.siddharthmehta.design/inat-audio/*
//
// FERAL fetches real animal recordings from iNaturalist's audio CDN, which sends
// no CORS headers. The frontend already requests same-origin paths at /inat-audio/…
// (see feral/src/feeds.ts). This Worker mirrors those bytes with CORS so
// decodeAudioData works in production — same job as feral/server/app.py in dev.

const UPSTREAM = "https://static.inaturalist.org";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (!url.pathname.startsWith("/inat-audio/")) {
      return new Response("ai-prototypes-proxy: use /inat-audio/…", { status: 404, headers: CORS });
    }

    const subpath = url.pathname.slice("/inat-audio/".length);
    if (!subpath) return new Response("missing path", { status: 400, headers: CORS });

    const upstream = new URL(`${UPSTREAM}/${subpath}`);
    upstream.search = url.search;

    let res;
    try {
      res = await fetch(upstream.href, {
        method: request.method === "HEAD" ? "HEAD" : "GET",
        headers: { Accept: "*/*" },
        cf: { cacheTtl: 3600 },
      });
    } catch (e) {
      return new Response(`upstream error: ${e}`, { status: 502, headers: CORS });
    }

    const headers = new Headers(res.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "public, max-age=3600");
    }

    return new Response(request.method === "HEAD" ? null : res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
};
