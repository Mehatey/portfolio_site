# ai-prototypes-proxy

Cloudflare setup so **AI Prototypes** work on `siddharthmehta.design` (GitHub Pages behind Cloudflare).

| Prototype    | Needs in production                                                        |
| ------------ | -------------------------------------------------------------------------- |
| **FLATTEN**  | WebGPU + camera. Optional: cross-origin isolation for threaded ONNX WASM.  |
| **FERAL**    | `/inat-audio/*` proxy (this Worker) for real iNaturalist field recordings. |
| **Amnesiac** | Cross-origin isolation for `@mlc-ai/web-llm` (WebGPU + workers).           |

iNaturalist **JSON** already has CORS — only **audio** needs the proxy.

---

## Part 1 — FERAL audio proxy (this Worker)

### Deploy

```bash
cd ai-prototypes-proxy
npx wrangler login          # once
npx wrangler deploy
```

### Attach routes (dashboard)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **ai-prototypes-proxy**
2. **Settings** → **Domains & Routes** → **Add route**
3. Add both:
   - `siddharthmehta.design/inat-audio/*`
   - `www.siddharthmehta.design/inat-audio/*`
4. Zone: `siddharthmehta.design`, Worker: `ai-prototypes-proxy`

### Test

```bash
curl -I "https://siddharthmehta.design/inat-audio/sounds/1.wav"
```

Expect `200` or `404` from upstream (not GitHub Pages HTML), plus `access-control-allow-origin: *`.

Then open **FERAL** → Begin → wait for a sighting with audio → you should hear real recordings mixed in.

---

## Part 2 — WebGPU / web-llm isolation headers

**Amnesiac** and **FLATTEN** (threaded WASM) need the page to be [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated). GitHub Pages does not set these headers — add them in Cloudflare.

### Transform Rule (recommended)

1. Dashboard → **siddharthmehta.design** → **Rules** → **Transform Rules**
2. **Modify Response Header** → **Create rule**
3. **Rule name:** `AI prototypes — cross-origin isolation`
4. **When incoming requests match:**
   - Field: **URI Path**
   - Operator: **wildcard**
   - Value: `/ai-prototypes/*`
5. **Then modify response header** — set these (add two operations):

   | Header                         | Value            |
   | ------------------------------ | ---------------- |
   | `Cross-Origin-Opener-Policy`   | `same-origin`    |
   | `Cross-Origin-Embedder-Policy` | `credentialless` |

6. **Deploy**

> Start with `credentialless` — it enables isolation with less breakage when models load from CDNs. If **Amnesiac** still fails to boot, change COEP to `require-corp` and test again.

### Verify isolation

Open `/ai-prototypes/amnesiac/` in Chrome DevTools → Console:

```js
crossOriginIsolated;
```

Should be `true`. Then click **begin** and confirm the model loads.

---

## Part 3 — Optional hardening

- **Rate limiting** on `/inat-audio/*` (e.g. 60 req / min / IP) — audio files are small but public.
- **Budget alerts** on your Cloudflare account if traffic spikes.

---

## What you do NOT need

- No API keys for this Worker.
- No change to FERAL’s frontend — it already calls `/inat-audio/…`.
- No Flask server in production if this Worker + Transform Rule are live.

---

## Troubleshooting

| Symptom                                | Fix                                                      |
| -------------------------------------- | -------------------------------------------------------- |
| FERAL: synth works, no animal sounds   | Check Part 1 — route not attached or wrong path          |
| Amnesiac: “WebGPU” / model never loads | Check Part 2 — `crossOriginIsolated` is false            |
| FLATTEN: depth model stuck             | Same as Amnesiac — isolation headers + Chrome/Edge       |
| `curl /inat-audio/…` returns HTML      | Worker route missing — GitHub Pages is answering instead |
