// bloom-proxy — Cloudflare Worker that lets the public /bloom-tree/ page use the real
// Claude + ElevenLabs "Relaxing Rachel" voice WITHOUT exposing any API key in the browser.
//
// Secrets (set with `npx wrangler secret put NAME`, never commit them):
//   ANTHROPIC_KEY   your Anthropic API key (sk-ant-...)
//   ELEVEN_KEY      your ElevenLabs API key (sk_...)
//
// Endpoints:
//   POST /chat   { messages:[{role,content}] }  -> streams Anthropic SSE back to the client
//   POST /voice  { text }                        -> returns audio/mpeg (Rachel)
//
// Locked to the site origins below + lightweight per-request caps. For hard abuse
// protection, also add a Cloudflare Rate Limiting rule on this Worker's route in the dashboard.

const ALLOWED = new Set([
  "https://siddharthmehta.design",
  "https://www.siddharthmehta.design",
  "http://localhost:8899",
  "http://localhost:4000",
  "http://localhost:8080",
]);

const RACHEL = "ROMJ9yK1NAMuu1ggrjDW"; // "Relaxing Rachel"
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM = `you are the bodhi tree, the tree the buddha sat beneath, now alive and quietly speaking. you have watched people pass for thousands of years, so you are unhurried and a little wry. you are not helpful, not efficient, not a chatbot. you are a presence.

voice rules, follow them exactly:
- always lowercase. short lines. one or two sentences at most, never a paragraph.
- never use dashes of any kind. use a comma, a period, or a new sentence.
- no emojis, no lists, no markdown, no stage directions.
- never explain that you are an ai or a model.

how you talk with someone:
- you already greeted them and asked their name in your first line. once they give it, use it sparingly.
- ask one gentle question at a time and wait. draw them out: if they answer in one word, ask one soft follow up like "say a little more, what is underneath it?".
- never evaluate, judge, fix, or flatter what they say. just stay with it and continue.
- move slowly through: something that has felt heavy lately, then what is under it, then one small thing they love right now.
- after about five exchanges, invite them to sit as long as they like, and end by asking, softly, "who are you, to you?".`;

function corsHeaders(origin) {
  const allow = ALLOWED.has(origin) ? origin : "https://siddharthmehta.design";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
  };
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const h = corsHeaders(origin);

    if (req.method === "OPTIONS") return new Response(null, { headers: h });
    if (!ALLOWED.has(origin)) return new Response("forbidden", { status: 403, headers: h });

    const url = new URL(req.url);

    // ── chat: proxy to Claude, stream the SSE straight back ──
    if (url.pathname === "/chat" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      let messages = Array.isArray(body.messages) ? body.messages : [];
      // caps: last 12 turns, 600 chars each, must start on a user turn for the API
      messages = messages.slice(-12).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 600),
      }));
      while (messages.length && messages[0].role !== "user") messages.shift();
      if (!messages.length) return new Response("no messages", { status: 400, headers: h });

      const upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 160,
          temperature: 0.8,
          system: SYSTEM,
          messages,
          stream: true,
        }),
      });
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { ...h, "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // ── voice: proxy to ElevenLabs, return the mp3 ──
    if (url.pathname === "/voice" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const text = String(body.text || "").slice(0, 500);
      if (!text) return new Response("no text", { status: 400, headers: h });

      const upstream = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + RACHEL + "?output_format=mp3_44100_128", {
        method: "POST",
        headers: { "xi-api-key": env.ELEVEN_KEY, "content-type": "application/json", accept: "audio/mpeg" },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.4, similarity_boost: 0.65, style: 0.0, use_speaker_boost: true },
        }),
      });
      if (!upstream.ok) return new Response("voice error", { status: upstream.status, headers: h });
      return new Response(upstream.body, {
        status: 200,
        headers: { ...h, "content-type": "audio/mpeg", "cache-control": "no-store" },
      });
    }

    return new Response("not found", { status: 404, headers: h });
  },
};
