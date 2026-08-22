"""Watercolour a whole frame sequence.
The paper, its tooth and the granulation are computed ONCE and held static -
if you reseed them per frame the sheet boils and it reads as noise, not paint.
Only the wash warp and the ink line cycle, on 2s, which is the gentle boil a
hand-painted sequence actually has.
"""
import os, sys, glob, math
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from styles import fbm, sample, edges, paper

SRC = sys.argv[1]
DST = sys.argv[2]
os.makedirs(DST, exist_ok=True)
frames = sorted(glob.glob(os.path.join(SRC, "f_*.png")))
h, w = np.asarray(Image.open(frames[0])).shape[:2]
print("frames", len(frames), "size", w, h, flush=True)

RS = np.random.default_rng(90210)
PAPER = paper(h, w, RS)                      # static sheet
GRAN = fbm(h, w, 150, 4, RS)                 # static granulation
BLOOM = np.clip(fbm(h, w, 9, 3, RS) * 1.5 - 0.55, 0, 1)
YY, XX = np.mgrid[0:h, 0:w].astype(np.float32)

NW = 3                                       # boil cycle, held for 2 frames
WARPS, LWARPS, LGRAIN = [], [], []
for k in range(NW):
    r = np.random.default_rng(500 + k)
    WARPS.append(((fbm(h, w, 26, 4, r) - 0.5) * 11.0,
                  (fbm(h, w, 26, 4, r) - 0.5) * 11.0))
    r2 = np.random.default_rng(900 + k)
    LWARPS.append(((fbm(h, w, 40, 4, r2) - 0.5) * 7.0,
                   (fbm(h, w, 40, 4, r2) - 0.5) * 7.0))
    LGRAIN.append(0.55 + 0.75 * fbm(h, w, 90, 3, np.random.default_rng(1300 + k)))

INK = np.array([0.14, 0.17, 0.22], np.float32)[None, None, :]

for i, fp in enumerate(frames):
    k = (i // 2) % NW                        # shoot the boil on 2s
    arr = np.asarray(Image.open(fp).convert("RGBA")).astype(np.float32) / 255.0
    rgb, a = arr[..., :3], arr[..., 3]
    ln = edges(rgb.mean(-1), a)

    dx, dy = WARPS[k]
    wr = sample(np.dstack([rgb, a]), XX + dx, YY + dy)
    c, aw = wr[..., :3], np.clip(wr[..., 3], 0, 1)
    c = 0.30 + 0.74 * c
    grey = c.mean(-1, keepdims=True)
    c = grey + (c - grey) * 0.86
    blur = np.asarray(Image.fromarray((aw * 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255.0
    rim = np.clip(aw - blur, 0, 1)
    c *= (1.0 - rim[..., None] * 0.55)
    c *= (0.90 + 0.20 * GRAN[..., None])
    c = c * (1 - BLOOM[..., None] * 0.30) + BLOOM[..., None] * 0.30
    cov = np.clip(aw * 1.05, 0, 1)[..., None]
    img = PAPER * (1 - cov) + c * cov

    ldx, ldy = LWARPS[k]
    lw = sample(ln[..., None], XX + ldx, YY + ldy)[..., 0]
    lw = np.clip(lw * LGRAIN[k] * 2.3, 0, 1)
    img = img * (1 - lw[..., None] * 0.88) + INK * lw[..., None] * 0.88

    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(
        os.path.join(DST, os.path.basename(fp)))
    if (i + 1) % 20 == 0:
        print("styled", i + 1, flush=True)
print("STYLEDONE")
