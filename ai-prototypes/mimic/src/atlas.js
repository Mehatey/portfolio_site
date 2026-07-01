// atlas.js — a single texture holding every living face on screen at once.
// Per-instance textures aren't a thing in one draw call, so every organism's
// photograph is packed into one big atlas and each billboard samples its tile.
// Slots are recycled as organisms decay out — capacity is finite on purpose, so
// the atlas is always forgetting to make room for what's arriving.

import * as THREE from "three";

export class Atlas {
  constructor({ size = 2048, tile = 128 } = {}) {
    this.size = size;
    this.tile = tile;
    this.cols = Math.floor(size / tile);
    this.count = this.cols * this.cols;

    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: false });
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, size, size);

    // tiny scratch canvas for average-colour extraction
    this._mini = document.createElement("canvas");
    this._mini.width = this._mini.height = 1;
    this._miniCtx = this._mini.getContext("2d", { willReadFrequently: true });

    this.free = [];
    for (let i = this.count - 1; i >= 0; i--) this.free.push(i);

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;
  }

  alloc() {
    return this.free.length ? this.free.pop() : null;
  }

  release(slot) {
    if (slot == null) return;
    this.free.push(slot);
  }

  // tile uv rectangle (0..1) for a slot
  rect(slot) {
    const c = slot % this.cols;
    const r = Math.floor(slot / this.cols);
    const u = this.tile / this.size;
    return [c * u, r * u, u, u];
  }

  // draw an ImageBitmap into a slot with a centre-crop "cover" fit.
  // returns the average colour [r,g,b] (0..1) of the image as a tint seed.
  draw(slot, bmp) {
    const c = slot % this.cols;
    const r = Math.floor(slot / this.cols);
    const x = c * this.tile;
    const y = r * this.tile;
    const ctx = this.ctx;

    // cover fit
    const s = Math.max(this.tile / bmp.width, this.tile / bmp.height);
    const dw = bmp.width * s;
    const dh = bmp.height * s;
    const dx = x + (this.tile - dw) / 2;
    const dy = y + (this.tile - dh) / 2;
    ctx.clearRect(x, y, this.tile, this.tile);
    ctx.drawImage(bmp, dx, dy, dw, dh);

    // average colour
    let tint = [0.6, 0.7, 0.6];
    try {
      this._miniCtx.drawImage(bmp, 0, 0, 1, 1);
      const d = this._miniCtx.getImageData(0, 0, 1, 1).data;
      tint = [d[0] / 255, d[1] / 255, d[2] / 255];
    } catch (e) {
      /* tainted-canvas guard; CORS is open so this should not fire */
    }

    this.texture.needsUpdate = true;
    return tint;
  }
}

// Fetch a cross-origin image as an ImageBitmap (iNat S3 sends ACAO:*).
export async function loadBitmap(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`img ${res.status}`);
  const blob = await res.blob();
  return await createImageBitmap(blob);
}
