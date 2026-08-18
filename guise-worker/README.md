# guise-api

The backend for `/ai-prototypes/guise/`. It holds the fal.ai key so the browser
never sees it, and fronts three models: Florence-2 to read the camera frame,
FLUX Kontext to repaint it, and Clarity to upscale a keeper.

`guise_proxy.py` is the original localhost version, kept because it is still the
fastest way to iterate: run it and load the page on `localhost`, which the page
detects and talks to directly on port 8011.

`src/index.js` is the deployed Cloudflare Worker at
`https://guise-api.mehta-sidhu.workers.dev`, which is what the live site uses.

## Why the Worker exists

The site is served by GitHub Pages, which is static. The page previously called
`${location.origin}/guise-api`, an endpoint nothing was serving, so GUISE loaded
and then failed on every button for anyone who was not running the Python proxy
locally.

## Deploying

```bash
npm install
npx wrangler deploy
```

The key is a Worker secret, not a file:

```bash
npx wrangler secret put FAL_KEY
```

## Spend guards

The Python proxy was open because only one person could reach it. The Worker is
public, so it caps three ways:

- `GUISE_BURST`, a rate-limit binding at 14 requests/60s per IP. One orbit is up
  to 11 generations fired three at a time, so anything tighter breaks the piece
  for an ordinary visitor.
- `PER_IP_PER_HOUR` (26), roughly two orbits per visitor per hour.
- `GLOBAL_PER_DAY` (400), the ceiling that actually bounds the bill.

The last two are KV counters. KV is eventually consistent, so concurrent
requests can undercount slightly; these are coarse spend ceilings, not
billing-grade accounting. Tune them in `src/index.js`.
