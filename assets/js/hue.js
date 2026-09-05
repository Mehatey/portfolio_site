/* ─────────────────────────────────────────────────────────────────────────
   WHAT COLOUR IS THAT PICTURE

   Sid: "live squares that animate with colours of the image or model or
   thing the cursor is hovering on is a good and creative way to use the
   cursor as an intelligent being."

   That idea needs one honest answer to "what colour is this", callable from
   three places at once — the chips beside the mark, the chips that follow
   the cursor, and the field behind the photo strip. This is that answer, and
   it exists as its own file for a plain reason: it was written inside
   cube_says.html first, and the moment a second caller wanted it the choice
   was to copy forty lines of colour science or to move them. Three copies of
   a palette function drift, and then two parts of the same page disagree
   about what colour a photograph is, which is worse than either answer.

   ── WHY NOT JUST TAKE THE COMMONEST COLOURS ─────────────────────────────
   Because the commonest colour in a photograph is its shadow. The first
   version of this sorted bins by population and returned, for a cover that
   reads as deep indigo and cyan, a dark navy and two browns. Every cover on
   this site is either a UI screenshot on a dark ground or a photograph with
   a dark ground, so population puts the ground first every single time and
   all sixteen projects come back the same.

   What the strip is for is the difference between one project and the next,
   and that lives in the chroma. So a bin's score is its population weighted
   by saturation and by how far its lightness sits from either end: a large
   dull region and a small vivid one compete on even terms, which is the
   judgement a person makes when they say what colour something is.

   ── AND THE CHIPS ARE A READING, NOT AN AVERAGE ─────────────────────────
   A mean over a bin of photograph pixels always drifts toward mud. Each chip
   keeps the HUE it was sampled at and is brought up to a floor of saturation
   and into a usable band of lightness, which is exactly what a person does
   pulling a palette off an image by eye. A genuinely neutral sample stays
   neutral, because a hueless colour has no hue to bring up.

   ── COST ────────────────────────────────────────────────────────────────
   One 40x40 canvas reused for every read, so the browser's own scaler does
   the quantising and the whole thing is 1600 pixels of arithmetic. Results
   are cached by source URL, so hovering a grid of sixteen covers samples
   sixteen times and never again.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var S = 40;
  var cache = Object.create(null);
  var canvas = null;

  function ctx2d() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = S;
    }
    return canvas.getContext("2d", { willReadFrequently: true });
  }

  /* rgb -> the chip. Hue preserved, saturation floored, lightness banded. */
  function chip(r, g, b) {
    var rr = r / 255,
      gg = g / 255,
      bb = b / 255;
    var mx = Math.max(rr, gg, bb),
      mn = Math.min(rr, gg, bb);
    var l = (mx + mn) / 2,
      d = mx - mn,
      h = 0,
      sat = 0;
    if (d) {
      sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
      else if (mx === gg) h = ((bb - rr) / d + 2) / 6;
      else h = ((rr - gg) / d + 4) / 6;
    }
    if (sat > 0.08) sat = Math.min(0.82, Math.max(0.42, sat * 1.35));
    l = Math.min(0.72, Math.max(0.44, l * 1.25));
    return "hsl(" + (h * 360).toFixed(0) + " " + (sat * 100).toFixed(0) + "% " + (l * 100).toFixed(0) + "%)";
  }

  /* How far apart two samples have to be before they count as two colours.
     Four chips that are four shades of one blue is a gradient, not a
     palette. The threshold falls as more chips are asked for: a strip of
     twelve is allowed to carry the near-misses a strip of four cannot. */
  function spread(n) {
    return n <= 5 ? 70 : n <= 9 ? 48 : 32;
  }

  /* Reads `img` and returns up to `want` CSS colours, most characteristic
     first. Returns null when there is nothing to read: not decoded yet, a
     tainted canvas, or a picture with no colour in it at all. */
  function palette(img, want) {
    want = want || 4;
    if (!img) return null;
    var key = (img.currentSrc || img.src || img.getAttribute("poster") || "") + "@" + want;
    if (key in cache) return cache[key];
    if (!img.complete || !img.naturalWidth) return null;

    var c = ctx2d();
    if (!c) return null;
    var data;
    try {
      c.clearRect(0, 0, S, S);
      c.drawImage(img, 0, 0, S, S);
      data = c.getImageData(0, 0, S, S).data;
    } catch (err) {
      /* A cross-origin picture taints the canvas. Cached as null so it is
         not attempted again on every pointer move. */
      cache[key] = null;
      return null;
    }

    var bins = Object.create(null);
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 200) continue;
      var r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      var mx = Math.max(r, g, b),
        mn = Math.min(r, g, b);
      if (mx < 52 || mn > 236) continue;
      if (mx - mn < 16) continue;
      var k = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      var bin = bins[k] || (bins[k] = { n: 0, r: 0, g: 0, b: 0 });
      bin.n++;
      bin.r += r;
      bin.g += g;
      bin.b += b;
    }

    var list = [];
    for (var k2 in bins) {
      var q = bins[k2];
      if (q.n < 3) continue;
      q.r = Math.round(q.r / q.n);
      q.g = Math.round(q.g / q.n);
      q.b = Math.round(q.b / q.n);
      var qmx = Math.max(q.r, q.g, q.b),
        qmn = Math.min(q.r, q.g, q.b);
      var sat = qmx ? (qmx - qmn) / qmx : 0;
      var lum = (qmx + qmn) / 510;
      var lit = 1 - Math.abs(lum - 0.56) * 1.7;
      q.score = q.n * (0.25 + sat * 1.9) * Math.max(0.15, lit);
      list.push(q);
    }
    list.sort(function (a, z) {
      return z.score - a.score;
    });

    var gap = spread(want);
    var out = [];
    function tryPush(q, minGap) {
      for (var m = 0; m < out.length; m++) {
        if (Math.abs(out[m][0] - q.r) + Math.abs(out[m][1] - q.g) + Math.abs(out[m][2] - q.b) < minGap) return false;
      }
      out.push([q.r, q.g, q.b]);
      return true;
    }
    for (var j = 0; j < list.length && out.length < want; j++) tryPush(list[j], gap);

    /* ── AND IF THE PICTURE IS SIMPLY DARK ────────────────────────────────
       A dashboard on near-black returns one chip. Rather than show a lonely
       square the shortfall is filled from the same bins with the chroma test
       dropped, and then with the distinctness relaxed — a neutral strip is
       the honest answer for a neutral picture, and it still differs from the
       next project's. */
    if (out.length < Math.min(3, want)) {
      var all = [];
      for (var k3 in bins) all.push(bins[k3]);
      all.sort(function (a, z) {
        return z.n - a.n;
      });
      for (var n2 = 0; n2 < all.length && out.length < want; n2++) tryPush(all[n2], gap);
    }
    if (out.length < want) {
      for (var j2 = 0; j2 < list.length && out.length < want; j2++) tryPush(list[j2], Math.round(gap / 2.4));
    }

    /* ── AND A LAST PASS IN THE SPACE THE EYE SEES ────────────────────────
       Distinctness up to here is measured in raw RGB, before the chips are
       normalised. That is the wrong space to judge it in: normalising floors
       the saturation and bands the lightness, so two samples that were 50
       apart in RGB can come out as the same chip. A warm film still returned
       six squares at hue 19 through 24 -- six shades of one orange, which is
       exactly the gradient the distinctness test exists to prevent, produced
       BY the test passing.

       So the chips are compared again as chips, on hue and lightness, and
       the near-duplicates are dropped. This can return fewer than asked for,
       and it should: a monochrome picture honestly has three colours in it,
       and padding it out to ten is a lie told in squares. */
    var chips = out.map(function (o) {
      return chip(o[0], o[1], o[2]);
    });
    var seen = [];
    var res = [];
    for (var c2 = 0; c2 < chips.length; c2++) {
      var mm = /hsl\((\d+) (\d+)% (\d+)%\)/.exec(chips[c2]);
      if (!mm) {
        res.push(chips[c2]);
        continue;
      }
      var hh = +mm[1],
        ll = +mm[3];
      var dupe = false;
      for (var s2 = 0; s2 < seen.length; s2++) {
        /* Hue is circular, so 358 and 2 are four apart, not 356. */
        var dh = Math.abs(seen[s2][0] - hh);
        if (dh > 180) dh = 360 - dh;
        if (dh < 12 && Math.abs(seen[s2][1] - ll) < 9) {
          dupe = true;
          break;
        }
      }
      if (dupe) continue;
      seen.push([hh, ll]);
      res.push(chips[c2]);
    }

    res = res.length ? res : null;
    cache[key] = res;
    return res;
  }

  /* The picture inside an arbitrary element — a card, a figure, a tile. The
     ladder matters: on this site videos are lazy and carry their file on a
     child <source>, so a video's own `src` is usually empty and its poster
     is the only thing that has actually decoded. */
  function pictureIn(el) {
    if (!el) return null;
    if (el.tagName === "IMG") return el;
    var img = el.querySelector && el.querySelector("img");
    if (img && img.complete && img.naturalWidth) return img;
    var vid = el.querySelector && el.querySelector("video[poster]");
    if (vid) {
      var key = vid.getAttribute("poster");
      if (key) {
        /* A poster is a URL, not an element, so it needs a decoded <img> of
           its own before it can be read. One per poster, kept for the life
           of the page. */
        var ghost = pictureIn.ghosts || (pictureIn.ghosts = Object.create(null));
        if (!ghost[key]) {
          var g = new Image();
          g.decoding = "async";
          g.src = key;
          ghost[key] = g;
        }
        /* Returned even when it has not decoded yet. The caller needs the
           element in order to wait on it -- returning null here is what made
           the photo strip silent: its first tile is a video, the poster ghost
           was created on the first hover and could not possibly be ready on
           that same frame, and nothing ever asked a second time. */
        return ghost[key];
      }
    }
    return img || null;
  }

  window.SidHue = { palette: palette, pictureIn: pictureIn, chip: chip };
})();
