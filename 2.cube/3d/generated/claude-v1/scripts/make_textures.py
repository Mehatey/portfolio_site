"""Procedural texture set for Cube Guy.
Outputs:
  cubeguy_basecolor_2k.png   flat plane colour + canvas weave + screenprint
                             halftone + hand-inked island contours + decals
  cubeguy_normal_1k.png      canvas / textile weave
  cubeguy_mask_1k.png        R = baked-ish AO   G = roughness   B = FX mask
No photographic or AI surface noise: every layer is a stated material idea.
"""
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cg_layout import ATLAS, NORMAL_RES, MASK_RES, PAL, BOXES, BOX_COLOR, FX_MASK_BOXES

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tex")
os.makedirs(OUT, exist_ok=True)
RNG = np.random.default_rng(20260821)


# ---------------------------------------------------------------- noise --
def value_noise(res, cells, rng):
    """Smooth tileable value noise via bilinear upsampling of a lattice."""
    g = rng.random((cells + 1, cells + 1)).astype(np.float32)
    g[-1, :] = g[0, :]
    g[:, -1] = g[:, 0]
    im = Image.fromarray((g * 255).astype(np.uint8)).resize((res, res), Image.BICUBIC)
    return np.asarray(im).astype(np.float32) / 255.0


def fbm(res, base_cells, octaves, rng, gain=0.5):
    out = np.zeros((res, res), np.float32)
    amp, tot, cells = 1.0, 0.0, base_cells
    for _ in range(octaves):
        out += amp * value_noise(res, cells, rng)
        tot += amp
        amp *= gain
        cells *= 2
    return out / tot


def canvas_weave(res, thread_px=4.0, jitter=0.35, rng=None):
    """Woven canvas: two perpendicular thread systems with irregular spacing."""
    rng = rng or RNG
    x = np.arange(res, dtype=np.float32)
    wob_u = (fbm(res, 8, 3, rng) - 0.5) * jitter * thread_px
    wob_v = (fbm(res, 8, 3, rng) - 0.5) * jitter * thread_px
    U = (x[None, :] + wob_u)
    V = (x[:, None] + wob_v)
    warp = 0.5 + 0.5 * np.cos(2 * math.pi * U / thread_px)
    weft = 0.5 + 0.5 * np.cos(2 * math.pi * V / thread_px)
    # over/under interlacing checker
    inter = ((np.floor(U / thread_px) + np.floor(V / thread_px)) % 2.0)
    weave = warp * inter + weft * (1.0 - inter)
    slub = fbm(res, 24, 3, rng)          # thread thickness variation
    return np.clip(weave * (0.75 + 0.5 * slub), 0, 1)


def halftone(res, dot_px=7.0, angle=22.0, radius=0.30):
    """Screen-print rosette dots."""
    y, x = np.mgrid[0:res, 0:res].astype(np.float32)
    a = math.radians(angle)
    u = (x * math.cos(a) - y * math.sin(a)) / dot_px
    v = (x * math.sin(a) + y * math.cos(a)) / dot_px
    du, dv = u - np.floor(u) - 0.5, v - np.floor(v) - 0.5
    d = np.sqrt(du * du + dv * dv)
    return np.clip((radius - d) * dot_px * 0.9, 0, 1)


def photocopy(res, rng):
    """Sparse toner speckle + a couple of drum streaks."""
    sp = rng.random((res, res)).astype(np.float32)
    grit = (sp > 0.9975).astype(np.float32)
    grit = np.asarray(Image.fromarray((grit * 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255.0
    streak = fbm(res, 3, 2, rng)
    streak = np.clip((streak - 0.62) * 3.0, 0, 1) * 0.25
    return np.clip(grit + streak, 0, 1)


# --------------------------------------------------------------- decals --
def draw_thought_tangle(dr, cx, cy, w, h, colour, width):
    """The 'THOUGHT' motif: a knotted scribble that resolves into one line."""
    pts, r = [], 0.0
    n = 260
    for i in range(n):
        t = i / (n - 1)
        # knot at the left, unspooling to a calm line on the right
        knot = math.exp(-((t - 0.30) ** 2) / 0.020)
        r = 0.34 * knot
        ang = t * math.pi * 13.0
        x = cx + (t - 0.5) * w * 0.98 + math.cos(ang) * r * w * 0.55
        y = cy + math.sin(ang * 1.31) * r * h * 1.25 + math.sin(t * math.pi) * h * 0.06
        pts.append((x, y))
    dr.line(pts, fill=colour, width=width, joint="curve")


def draw_patch(dr, box, colour, ink):
    x0, y0, x1, y1 = box
    dr.rounded_rectangle(box, radius=(x1 - x0) * 0.30, fill=colour, outline=ink, width=5)
    step = (x1 - x0) / 7.0
    for i in range(1, 7):                      # running stitch
        x = x0 + i * step
        dr.line([(x, y0 + 8), (x, y1 - 8)], fill=ink + (90,) if len(ink) == 3 else ink, width=2)


# ------------------------------------------------------------ base color --
def build_basecolor():
    res = ATLAS
    img = Image.new("RGB", (res, res), PAL["paper"])
    dr = ImageDraw.Draw(img)

    for name, (x0, y0, x1, y1) in BOXES.items():
        dr.rectangle((x0, y0, x1, y1), fill=BOX_COLOR[name])

    # decals ------------------------------------------------------------
    sx0, sy0, sx1, sy1 = BOXES["shirt_front"]
    draw_thought_tangle(dr, (sx0 + sx1) / 2, sy0 + (sy1 - sy0) * 0.46,
                        (sx1 - sx0) * 0.46, (sy1 - sy0) * 0.13, PAL["navy"], 6)
    # collar + sleeve trim band across the top of the shirt islands
    for b in ("shirt_front", "shirt_back"):
        x0, y0, x1, y1 = BOXES[b]
        dr.rectangle((x0, y0, x1, y0 + int((y1 - y0) * 0.11)), fill=PAL["rust"])

    tx0, ty0, tx1, ty1 = BOXES["trou_front"]
    pw, ph = (tx1 - tx0) * 0.20, (ty1 - ty0) * 0.13
    draw_patch(dr, (tx0 + (tx1 - tx0) * 0.16, ty0 + (ty1 - ty0) * 0.52,
                    tx0 + (tx1 - tx0) * 0.16 + pw, ty0 + (ty1 - ty0) * 0.52 + ph),
               PAL["cobalt"], PAL["ink"])

    # shoes stay one solid graphic mass - no sole band to mis-map

    # eye specular notch (drawn, not shaded - it is an ink highlight)
    ex0, ey0, ex1, ey1 = BOXES["eye"]
    dr.rounded_rectangle((ex0 + (ex1 - ex0) * 0.30, ey0 + (ey1 - ey0) * 0.14,
                          ex0 + (ex1 - ex0) * 0.44, ey0 + (ey1 - ey0) * 0.34),
                         radius=14, fill=PAL["offwhite"])

    base = np.asarray(img).astype(np.float32) / 255.0

    # --- material layers ------------------------------------------------
    weave = canvas_weave(res, thread_px=5.0, rng=RNG)
    ht = halftone(res, dot_px=8.0)
    copy = photocopy(res, RNG)
    blotch = fbm(res, 6, 4, RNG)

    shade = 1.0 + (weave - 0.5) * 0.16          # thread relief in albedo
    shade *= 1.0 + (blotch - 0.5) * 0.13        # dye / wash unevenness
    shade -= ht * 0.045                          # screenprint dot bite
    base *= shade[..., None]
    base = base * (1.0 - copy[..., None] * 0.55) + PAL["ink"][0] / 255.0 * copy[..., None] * 0.55

    # --- hand-inked contour just inside every island --------------------
    ink_layer = Image.new("L", (res, res), 0)
    idr = ImageDraw.Draw(ink_layer)
    for name, (x0, y0, x1, y1) in BOXES.items():
        jitter = 3
        for k in range(3):                       # three passes = wobbly dry line
            off = [(RNG.integers(-jitter, jitter + 1)) for _ in range(4)]
            idr.rectangle((x0 + 5 + off[0], y0 + 5 + off[1], x1 - 5 + off[2], y1 - 5 + off[3]),
                          outline=255, width=9)
    ink = np.asarray(ink_layer.filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32) / 255.0
    ink *= (0.55 + 0.45 * fbm(res, 40, 3, RNG))  # dry-brush breakup
    base = base * (1.0 - ink[..., None] * 0.85) + (np.array(PAL["ink"]) / 255.0) * ink[..., None] * 0.85

    out = np.clip(base, 0, 1)
    Image.fromarray((out * 255).astype(np.uint8)).save(
        os.path.join(OUT, "cubeguy_basecolor_2k.png"), optimize=True)
    return weave


def build_normal(weave_src):
    res = NORMAL_RES
    h = canvas_weave(res, thread_px=3.6, rng=np.random.default_rng(7))
    h = h * 0.75 + fbm(res, 60, 3, np.random.default_rng(8)) * 0.25
    gy, gx = np.gradient(h.astype(np.float32))
    strength = 2.6
    nx, ny, nz = -gx * strength, gy * strength, np.ones_like(h)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    rgb = np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5
    Image.fromarray((rgb * 255).astype(np.uint8)).save(
        os.path.join(OUT, "cubeguy_normal_1k.png"), optimize=True)


def build_mask():
    res = MASK_RES
    s = res / ATLAS
    ao = np.ones((res, res), np.float32)
    fx = np.zeros((res, res), np.float32)
    aoi = Image.new("L", (res, res), 255)
    adr = ImageDraw.Draw(aoi)
    fxi = Image.new("L", (res, res), 0)
    fdr = ImageDraw.Draw(fxi)
    for name, (x0, y0, x1, y1) in BOXES.items():
        b = (x0 * s, y0 * s, x1 * s, y1 * s)
        adr.rectangle(b, outline=90, width=int(14 * s) or 1)   # contact darkening at seams
        if name in FX_MASK_BOXES:
            fdr.rectangle(b, fill=255)
    ao = np.asarray(aoi.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255.0
    fx = np.asarray(fxi).astype(np.float32) / 255.0
    rough = 0.86 - 0.12 * canvas_weave(res, thread_px=3.6, rng=np.random.default_rng(9))
    rgb = np.stack([ao, np.clip(rough, 0, 1), fx], -1)
    Image.fromarray((rgb * 255).astype(np.uint8)).save(
        os.path.join(OUT, "cubeguy_mask_1k.png"), optimize=True)


if __name__ == "__main__":
    w = build_basecolor()
    build_normal(w)
    build_mask()
    for f in sorted(os.listdir(OUT)):
        print(f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")
