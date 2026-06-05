# bloom-proxy

A tiny Cloudflare Worker that lets the public `/bloom-tree/` page talk to **Claude** and
**ElevenLabs (Rachel)** without putting any API key in the browser. The keys live as Worker
secrets; the page only ever talks to this proxy, which is locked to `siddharthmehta.design`.

## One-time deploy (run these in this folder)

```bash
cd bloom-proxy
npx wrangler login                 # opens a browser, log in to your Cloudflare account
npx wrangler secret put ANTHROPIC_KEY   # paste your sk-ant-... key when prompted
npx wrangler secret put ELEVEN_KEY      # paste your ElevenLabs sk_... key when prompted
npx wrangler deploy
```

`deploy` prints the live URL, e.g. `https://bloom-proxy.<your-subdomain>.workers.dev`.
Send that URL back (or set it yourself) in `../bloom-tree/index.html` at the `PROXY` constant,
replacing `bloom-proxy.REPLACE-ME.workers.dev`.

You can test before hardcoding by visiting:
`/bloom-tree/?proxy=https://bloom-proxy.<your-subdomain>.workers.dev`

## Cost & abuse notes

- Model is **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`), `max_tokens` 160 — cheap per turn.
- Voice is ElevenLabs `eleven_turbo_v2_5`, billed per character.
- The Worker is origin-locked and caps message size/turns, but `Origin` is not a hard security
  boundary. For real protection, add a **Rate Limiting rule** on this Worker's route in the
  Cloudflare dashboard (e.g. 20 requests / 10 min / IP), and/or set a monthly budget alert on
  both API accounts.

## Endpoints

- `POST /chat` — `{ messages: [{role, content}] }` → streams Anthropic SSE.
- `POST /voice` — `{ text }` → `audio/mpeg`.
