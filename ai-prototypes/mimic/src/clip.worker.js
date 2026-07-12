// clip.worker.js — the machine's eye.
// Runs CLIP (vision tower) via transformers.js off the main thread, turning each
// organism's photograph into a 512-d vector. Everything downstream — the layout,
// the clustering, the hallucinated gaps — is geometry over these vectors.
//
// We keep the model on WASM rather than WebGPU on purpose: the renderer already
// owns the GPU, and the eye only has to roughly keep pace with the feed (~17/min),
// not race it.

import {
  pipeline,
  env,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2";

// Pull weights straight from the Hub; cache in the browser after first load.
env.allowLocalModels = false;
env.useBrowserCache = true;

let extractor = null;
let ready = false;
const queue = [];
let working = false;

async function boot() {
  try {
    extractor = await pipeline(
      "image-feature-extraction",
      "Xenova/clip-vit-base-patch16",
      {
        dtype: "q8", // ~90MB quantised vision tower instead of the ~350MB fp32
        progress_callback: (p) => {
          if (p && p.status === "progress" && p.file && /\.onnx/.test(p.file)) {
            postMessage({ type: "boot", pct: p.progress || 0, file: p.file });
          } else if (p && p.status === "ready") {
            postMessage({ type: "boot", pct: 100 });
          }
        },
      }
    );
    ready = true;
    postMessage({ type: "ready" });
    pump();
  } catch (e) {
    postMessage({ type: "fatal", error: String(e && e.message ? e.message : e) });
  }
}

async function embed(job) {
  // transformers.js fetches + decodes the URL itself (CORS on iNat S3 is open).
  const out = await extractor(job.photo, { normalize: true });
  // out.data is a Float32Array (512). Copy into a transferable buffer.
  const vec = new Float32Array(out.data);
  // Force L2-normalisation: the image-feature-extraction pipeline does NOT always
  // unit-normalise its output, which left dot products around ~87 instead of a
  // 0..1 cosine — breaking every similarity %, spring length and threshold
  // downstream (and crushing the whole field into one jittering clump). Normalise
  // here so a dot product is a true cosine resemblance.
  let n = 0;
  for (let i = 0; i < vec.length; i++) n += vec[i] * vec[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= n;
  return vec;
}

async function pump() {
  if (working || !ready) return;
  working = true;
  while (queue.length) {
    const job = queue.shift();
    try {
      const vec = await embed(job);
      postMessage({ type: "embedding", id: job.id, vec }, [vec.buffer]);
    } catch (e) {
      postMessage({ type: "miss", id: job.id, error: String(e && e.message ? e.message : e) });
    }
  }
  working = false;
}

onmessage = (ev) => {
  const m = ev.data;
  if (m.type === "embed") {
    // bound the backlog: if the eye falls behind, drop the oldest pending work
    // (the world moved on — that's the piece, not a bug).
    queue.push({ id: m.id, photo: m.photo });
    // bound the backlog: if the eye falls behind, drop the oldest pending work
    // (the world moved on — that's the piece). Tell the main thread so it can free
    // the atlas slot instead of leaking it.
    if (queue.length > 72) {
      const dropped = queue.splice(0, queue.length - 72);
      for (const j of dropped) postMessage({ type: "miss", id: j.id, error: "eye fell behind" });
    }
    pump();
  }
};

boot();
