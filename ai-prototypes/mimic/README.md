# MIMIC

*A live atlas of life on Earth, arranged by how it looks to a machine instead of
by what science calls it — and, where the feed outruns the eye, filled with the
life the machine expects to be there but no one has seen.*

MIMIC drinks the global [iNaturalist](https://www.inaturalist.org) observation
firehose: every research-grade sighting being logged worldwide, right now, with
its photograph, species, place, and time. As each organism arrives, **CLIP** (a
vision model running in your browser) embeds its photo into a 512-dimensional
visual space, and the piece arranges life by *resemblance* rather than taxonomy.
A moth and the leaf it imitates drift together; convergent forms from unrelated
branches of the tree of life pool into the same neighbourhood. You are looking at
the planet's living forms organised by the machine's eye instead of by science's
categories.

Then the unstable part. The feed is faster and vaster than anything can hold, so
the atlas continuously **forgets** — older sightings fade and free their place
for what's arriving. And into the gaps between known forms, the machine paints
the life it *expects*: hollow, glowing **"expected forms"**, predicted at the
midpoint between two real neighbours in CLIP space — resemblances that should
exist but that no one has logged. When a real observation later lands close to
one of these guesses, the guess is **confirmed** and collapses into the real
thing. A field of real, living, logged organisms, bleeding into the machine's
hallucinated continuation of them.

Real life versus the machine's idea of life, pointed at the biosphere.

## Run it

```bash
./serve.sh           # -> http://localhost:5173
# or: python3 -m http.server 5173
```

Open it in **Chrome or Edge (desktop)**, or **Safari 18+ / Safari Technology
Preview**. The first load downloads the quantised CLIP weights (~90 MB) once and
caches them; after that it starts in seconds.

No build step, no `npm install`, no API keys, no backend. Everything — `three`
(WebGPU/TSL) and `transformers.js` — is pulled from a CDN via the import map in
`index.html`.

For a public portfolio, deploy the directory unchanged to any static HTTPS host.
The live renderer needs WebGPU; unsupported browsers receive a lightweight live
animal-field preview instead. A short screen recording beside the live link is
still recommended so reviewers can see the full motion piece immediately.

## Reading the screen

- **soft round photograph** — a real organism, logged minutes ago.
- **hollow glowing ring** — an *expected* form: never observed, the machine's
  guess at the resemblance between two real neighbours.
- drag to orbit · scroll to zoom · hover any form for its name / place / time.
- use arrow keys to browse forms · Escape to return to the full field.
- use the motion control, or enable your system's reduced-motion preference, to
  stop the ambient camera drift and ring shimmer.

## How it's built

| file | role |
|---|---|
| `feed.js` | iNaturalist firehose consumer (no key), de-duped, chronological |
| `clip.worker.js` | CLIP vision tower via transformers.js, off the main thread |
| `layout.js` | online force-directed 3-D embedding by cosine similarity + the "expected form" interpolation |
| `atlas.js` | one recycled texture atlas holding every on-screen photograph |
| `render.js` | WebGPU/TSL instanced billboards, one draw call |
| `main.js` | wiring: intake → embed → place → decay → ghosts → HUD → hover |

### Notes

- **CLIP runs on WASM, not WebGPU**, on purpose: the renderer owns the GPU, and
  the eye only has to keep pace with the feed (~15–20 sightings/min), not race it.
- **Capacity is finite by design.** The atlas holds ~260 living forms; when it
  fills, the oldest fade. The forgetting *is* the piece.
- **Expected forms are embedding-space extrapolation, not a generative image
  model.** The machine predicts *where* a resemblance should cluster, not what it
  would photograph like — which is both cheaper and the sharper idea.

Built with Claude Code.
