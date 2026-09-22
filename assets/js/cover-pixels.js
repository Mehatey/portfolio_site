/* ── THE COVER COMES APART INTO CELLS ON HOVER ──────────────────────────
   Sid: "when i hover let it convert to a bunch of interesting animated
   pixels with a great ease in ease out."

   One canvas per cover, created on first hover and kept. On enter, the
   picture is redrawn as coarse cells that shrink back into the photograph;
   on leave the cells grow again and the canvas fades. Cell size runs 28px
   down to 1px on an ease-in-out, so the picture is a mosaic for a beat and
   then resolves. The photograph underneath never moves. Same language as
   the About portrait and the cursor's media read: the site's images are
   made of squares.

   Draw: the image at 1/cell scale onto a tiny offscreen canvas with
   smoothing off, then that canvas back up to full size, also with
   smoothing off. Two draws, no per-pixel work, cheap enough for a whole
   grid. */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;

  var DUR = 700;
  var MAX = 28;
  var ease = function (t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  function attach(cover) {
    var img = cover.querySelector("img");
    if (!img) return;
    var canvas = null,
      ctx = null,
      off = null,
      octx = null,
      raf = 0,
      dir = 0,
      p = 0,
      last = 0;

    function ensure() {
      if (canvas) return true;
      if (!img.complete || !img.naturalWidth) return false;
      canvas = document.createElement("canvas");
      canvas.className = "wk-pixels";
      off = document.createElement("canvas");
      cover.appendChild(canvas);
      ctx = canvas.getContext("2d");
      octx = off.getContext("2d");
      return true;
    }

    function draw(cell) {
      var r = cover.getBoundingClientRect();
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = Math.max(1, Math.round(r.width * dpr)),
        h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      /* object-fit: cover, done by hand so the mosaic lines up with the
         photograph it is standing on. Sized by ratio and drawn by destination
         rectangle: an img with a srcset reports a density corrected
         naturalWidth, so a source crop in those units reads the top left
         corner of the real file. Mool's hover was a blue rectangle. */
      var iw = img.naturalWidth,
        ih = img.naturalHeight;
      var cw = Math.max(1, Math.round(w / (cell * dpr))),
        ch = Math.max(1, Math.round(h / (cell * dpr)));
      off.width = cw;
      off.height = ch;
      var s = Math.max(cw / iw, ch / ih);
      var dw = iw * s,
        dh = ih * s;
      octx.imageSmoothingEnabled = true;
      octx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(off, 0, 0, cw, ch, 0, 0, w, h);
    }

    /* p is how far into the mosaic we are: 0 the photograph, 1 fully
       cells. It climbs on enter and falls on leave, eased. Sid: "i want the
       image to keep pixelating as long as i am hovering on it." So at 1 the
       cell size does not settle: it swings on a slow clock between coarse
       and coarser, and the loop keeps running until the pointer leaves. */
    var hovering = false;
    function frame(now) {
      raf = 0;
      var dt = last ? now - last : 16;
      last = now;
      p += (dir * dt) / DUR;
      if (p <= 0) {
        p = 0;
        canvas.classList.remove("is-on");
        return;
      }
      if (p >= 1) p = 1;
      var e = ease(p);
      var live = hovering ? 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(now / 760)) : 1;
      var cell = 1 + (MAX - 1) * e * live;
      if (cell <= 1.5) {
        canvas.classList.remove("is-on");
      } else {
        canvas.classList.add("is-on");
        draw(cell);
      }
      if (hovering || (dir < 0 && p > 0)) raf = requestAnimationFrame(frame);
    }

    function go(d) {
      if (!ensure()) return;
      dir = d;
      hovering = d > 0;
      last = 0;
      if (d > 0 && p === 0) p = 0.001;
      if (d < 0 && p >= 1) p = 0.999;
      if (!raf) raf = requestAnimationFrame(frame);
    }

    cover.closest(".wk-card").addEventListener(
      "pointerenter",
      function () {
        go(1);
      },
      { passive: true }
    );
    cover.closest(".wk-card").addEventListener(
      "pointerleave",
      function () {
        go(-1);
      },
      { passive: true }
    );
  }

  function init() {
    var covers = document.querySelectorAll(".wk-card .wk-cover");
    for (var i = 0; i < covers.length; i++) attach(covers[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
