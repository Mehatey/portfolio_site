const { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a, { maxBuffer: 32 * 1024 * 1024 });
const bez = (p, c, q, t) => [0, 1].map((i) => (1 - t) ** 2 * p[i] + 2 * (1 - t) * t * c[i] + t * t * q[i]);
const der = (p, c, q, t) => [0, 1].map((i) => 2 * (1 - t) * (c[i] - p[i]) + 2 * t * (q[i] - c[i]));
function page(id, crop, w, h, top, bot) {
  const raw = m("layers/" + id + "-print.png", "-crop", crop, "+repage", "-depth", "8", "rgba:-");
  const out = Buffer.alloc(1536 * 1024 * 4);
  for (let y = 150; y < 860; y++)
    for (let x = 365; x < 1430; x++) {
      let u = 0.5,
        v = 0.5;
      for (let n = 0; n < 10; n++) {
        const a = bez(...top, u),
          b = bez(...bot, u),
          ad = der(...top, u),
          bd = der(...bot, u);
        const dx = a[0] * (1 - v) + b[0] * v - x,
          dy = a[1] * (1 - v) + b[1] * v - y;
        const xu = ad[0] * (1 - v) + bd[0] * v,
          yu = ad[1] * (1 - v) + bd[1] * v,
          xv = b[0] - a[0],
          yv = b[1] - a[1],
          det = xu * yv - xv * yu;
        u -= (dx * yv - dy * xv) / det;
        v -= (xu * dy - yu * dx) / det;
      }
      const at = bez(...top, u),
        bt = bez(...bot, u);
      if (
        !Number.isFinite(u) ||
        !Number.isFinite(v) ||
        u < 0 ||
        u > 1 ||
        v < 0 ||
        v > 1 ||
        Math.hypot(at[0] * (1 - v) + bt[0] * v - x, at[1] * (1 - v) + bt[1] * v - y) > 0.1
      )
        continue;
      const sx = u * (w - 1),
        sy = v * (h - 1),
        ix = Math.floor(sx),
        iy = Math.floor(sy),
        fx = sx - ix,
        fy = sy - iy,
        k = (y * 1536 + x) * 4;
      for (let c = 0; c < 3; c++) {
        out[k + c] =
          raw[(iy * w + ix) * 4 + c] * (1 - fx) * (1 - fy) +
          raw[(iy * w + Math.min(w - 1, ix + 1)) * 4 + c] * fx * (1 - fy) +
          raw[(Math.min(h - 1, iy + 1) * w + ix) * 4 + c] * (1 - fx) * fy +
          raw[(Math.min(h - 1, iy + 1) * w + Math.min(w - 1, ix + 1)) * 4 + c] * fx * fy;
      }
      out[k + 3] = Math.round(255 * Math.min(1, u * w, (1 - u) * w, v * h, (1 - v) * h));
    }
  r("magick", ["-size", "1536x1024", "-depth", "8", "rgba:-", "layers/" + id + "-mapped.png"], { input: out });
}
page(
  "book-left",
  "605x619+3+5",
  605,
  619,
  [
    [493, 157],
    [703, 193],
    [925, 267],
  ],
  [
    [375, 626],
    [591, 687],
    [807, 745],
  ]
);
page(
  "book-right",
  "592x612+3+9",
  592,
  612,
  [
    [925, 267],
    [1126, 250],
    [1417, 334],
  ],
  [
    [807, 745],
    [1057, 799],
    [1311, 852],
  ]
);
m(
  "book-blank.png",
  "layers/book-left-mapped.png",
  "-compose",
  "Multiply",
  "-composite",
  "layers/book-right-mapped.png",
  "-compose",
  "Multiply",
  "-composite",
  "layers/skin.png",
  "-compose",
  "over",
  "-composite",
  "aananda.png"
);
m("aananda.png", "-quality", "92", "aananda.webp");
