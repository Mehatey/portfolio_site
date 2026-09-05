/* ─────────────────────────────────────────────────────────────────────────
   IT COMES APART INTO ITS OWN PIXELS, AND THEN PUTS ITSELF BACK

   Sid, about the phone: "let it explode into voxels or pixels and then reform
   into the phone, and let the pixels be the colours of the blocks that the
   phone screen has, the music cover pics of ... animate really well, good
   ease in and physics, should feel smooth not abrupt, should retain the same
   colours." And about the figure: "let the same pixel voxel click from the
   music one be applied to Buddha."

   One mechanism, two callers, which is the only reason this is its own file.

   ── THE COLOURS ARE NOT INVENTED ────────────────────────────────────────
   The whole point of the effect is that the pieces ARE the thing. So the
   source is rasterised once at the moment of the click and each cell takes
   the average colour of the region it covers. On the phone that means every
   voxel is literally a piece of an album cover that was on screen when you
   pressed it — press it at a different scroll position and it shatters into
   different music. Nothing is sampled from a palette or a theme.

   ── THE PHYSICS ─────────────────────────────────────────────────────────
   Each cell gets an impulse away from the point that was clicked, scaled by
   1/distance so the ones under your finger go hardest, plus spin and a
   little lateral noise. Then gravity. Position is closed form -- p + vt +
   ½gt² -- rather than an integrator, because the return has to land every
   cell exactly back on its origin and an integrator accumulates error until
   the reassembled picture is subtly wrong.

   ── WHY IT REFORMS ON AN EASE AND NOT ON THE SAME PHYSICS ───────────────
   Running the explosion backwards is the obvious idea and it looks like a
   video played in reverse, which reads as a rewind rather than as a thing
   pulling itself together. The return is instead an ease from wherever each
   cell had got to, back to its origin, on a per-cell delay -- so the picture
   reassembles in patches, the way it came apart. Cubic ease out on the
   position and a slight overshoot on the scale, which is the difference
   between arriving and snapping.

   ── COST ────────────────────────────────────────────────────────────────
   One canvas over the element, at device resolution, holding a few thousand
   filled rects a frame. It is created on the first burst, and removed
   entirely when the animation finishes -- an idle page carries nothing.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var EASE_OUT = function (t) {
    return 1 - Math.pow(1 - t, 3);
  };

  /* A stable pseudo-random. Cells must behave the same way for the whole
     life of one burst, and allocating a random per cell per frame is both
     slower and wrong. */
  function rand(i, salt) {
    var n = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  /* Reads the source into a grid of coloured cells. `src` may be a canvas,
     an image, or a video -- anything drawImage accepts. Returns null when
     there is nothing readable, which is the honest outcome for a tainted or
     undecoded source and lets the caller simply not run the effect. */
  function sample(src, w, h, cols, keepDark) {
    var rows = Math.max(1, Math.round((cols * h) / w));
    var c = document.createElement("canvas");
    c.width = cols;
    c.height = rows;
    var x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return null;
    var data;
    try {
      x.drawImage(src, 0, 0, cols, rows);
      data = x.getImageData(0, 0, cols, rows).data;
    } catch (e) {
      return null;
    }

    var cw = w / cols,
      ch = h / rows;
    var cells = [];
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var k = (j * cols + i) * 4;
        var a = data[k + 3];
        /* Transparent regions are not part of the object. On a cut-out this
           is what stops the burst throwing a cloud of invisible squares and
           makes the silhouette come apart rather than its bounding box. */
        if (a < 24) continue;
        var r = data[k],
          g = data[k + 1],
          b = data[k + 2];
        /* Near-black cells are the bezel and the letterboxing; keeping them
           costs fill rate and shows nothing. The threshold is low on purpose:
           at 26 a dark album cover lost most of its cells and the phone
           dissolved into a light sprinkle instead of coming apart. A caller
           whose object is genuinely dark can keep them all. */
        if (!keepDark && r + g + b < 12) continue;
        /* ── NOT ALL THE SAME SIZE ────────────────────────────────────
           Sid: "let the cubes be bigger, and some of the cube sizes should
           be bigger."

           A uniform grid of squares is a mosaic; real debris has a size
           distribution. Each cell keeps its position but takes a scale from
           its own hash, so about a fifth come out noticeably larger and a
           few are small chips. Stable per cell, so a cell is the same size
           for the whole flight. */
        var vary = 0.86 + Math.pow(Math.abs(Math.sin((j * 73.1 + i * 31.7) * 12.9898)), 3) * 1.5;
        cells.push({
          x: i * cw,
          y: j * ch,
          w: cw * vary,
          h: ch * vary,
          c: "rgb(" + r + "," + g + "," + b + ")",
          a: a / 255,
        });
      }
    }
    return cells.length ? cells : null;
  }

  /* host   the element the canvas is laid over. Usually NOT the object
            itself: Sid asked for the phone to "explode into particles across
            the scene", and a canvas sized to the phone clips the burst at the
            phone's own edges, which reads as a snow globe. Pass the section
            and let the pieces have somewhere to go.
     rect   the object's box, in host-local pixels. Where the picture is
            drawn and where every cell returns to.
     src    what to rasterise
     at     {x, y} in host-local pixels: where the impulse comes from
     cols   horizontal cell count. Bigger is finer and slower.
     out/back/hold  milliseconds
  */
  function burst(opts) {
    var host = opts.host;
    var src = opts.source;
    if (!host || !src) return false;
    if (host.__voxBusy) return false;

    var hr = host.getBoundingClientRect();
    var W = Math.round(hr.width),
      H = Math.round(hr.height);
    if (W < 40 || H < 40) return false;

    /* Where the object sits inside the host. Defaults to the whole host, so
       a caller that does want the two to be the same passes nothing. */
    var box = opts.rect || { x: 0, y: 0, w: W, h: H };
    if (box.w < 20 || box.h < 20) return false;

    var cols = opts.cols || 34;
    var cells = sample(src, box.w, box.h, cols, opts.keepDark);
    if (!cells) return false;
    /* Sampled in the object's own space, then moved into the host's. */
    for (var q = 0; q < cells.length; q++) {
      cells[q].x += box.x;
      cells[q].y += box.y;
    }

    var OUT = opts.out || 1500;
    var HOLD = opts.hold || 420;
    var BACK = opts.back || 1500;
    var TOTAL = OUT + HOLD + BACK;

    var ax = opts.at ? opts.at.x : W / 2;
    var ay = opts.at ? opts.at.y : H / 2;

    /* Give every cell its flight once, up front. Doing this per frame is
       the difference between a smooth burst and a stutter on the first
       thirty milliseconds, which is exactly when it is most visible. */
    var n = cells.length;
    for (var i = 0; i < n; i++) {
      var p = cells[i];
      var dx = p.x + p.w / 2 - ax;
      var dy = p.y + p.h / 2 - ay;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;
      /* Falls off with distance, so the click has a location. A uniform
         impulse makes the whole picture inflate, which is a zoom. */
      var force = (opts.force || 620) * (0.35 + 0.85 / (1 + d / 190));
      p.vx = (dx / d) * force + (rand(i, 1) - 0.5) * 210;
      p.vy = (dy / d) * force - 120 - rand(i, 2) * 240;
      p.spin = (rand(i, 3) - 0.5) * 9;
      /* Up to nearly half the way in, keyed off the cell, so the surface
         fails in patches rather than all at once. Sid: "should feel smooth,
         not abrupt." Widening this spread is what buys the onset: at 0.3
         nearly every cell was already moving inside a tenth of a second and
         the phone was simply gone, with no moment where you could see it
         breaking. At 0.45 the first patches let go while most of the picture
         is still standing. */
      p.delay = rand(i, 4) * 0.45;
      /* And it comes back in a different order than it left. */
      /* Tighter than the outward stagger. Coming apart in patches reads as
         a surface failing; coming BACK over a wide spread reads as stragglers,
         and the last few cells arriving long after the picture is otherwise
         whole is exactly what made the return feel unfinished. */
      p.rback = rand(i, 5) * 0.16;
    }

    var cv = document.createElement("canvas");
    cv.className = "voxburst";
    cv.setAttribute("aria-hidden", "true");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:40;" + (opts.canvasStyle || "");
    var ctx = cv.getContext("2d");
    if (!ctx) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* The host has to be a containing block for the overlay. Almost every
       caller already is; the ones that are not get it for the duration and
       have it taken away again. */
    var hadPos = getComputedStyle(host).position !== "static";
    if (!hadPos) host.style.position = "relative";
    host.appendChild(cv);
    host.__voxBusy = true;
    if (opts.onStart) opts.onStart();

    /* Lighter. At 900 the cloud was on the floor before the hold was over
       and the return had to haul everything back up, which is the other half
       of why the reform looked abrupt. */
    var G = opts.gravity || 520;
    var t0 = 0;

    function frame(now) {
      if (!t0) t0 = now;
      var el = now - t0;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < n; i++) {
        var p = cells[i];
        var px, py, sc, rot;

        if (el < OUT + HOLD) {
          /* ── OUT ──────────────────────────────────────────────────────
             Seconds, not milliseconds, because the physics constants are
             written in pixels per second and reading them back later is
             easier when the units are the ones you would say out loud. */
          var t = Math.max(0, (el / OUT - p.delay) / (1 - p.delay));
          t = Math.min(t, (OUT + HOLD) / OUT);
          /* Eased in. A real explosion is fastest at t=0 and looks abrupt
             on screen; a shallow quadratic gives the first fraction of each
             cell's flight to breaking away and the rest to travelling, which
             is what the eye reads as weight. */
          var s = t * t * 0.35 * (OUT / 1000) + t * 0.65 * (OUT / 1000);
          px = p.x + p.vx * s;
          py = p.y + p.vy * s + 0.5 * G * s * s;
          rot = p.spin * s;
          /* ── IT NO LONGER SHRINKS AWAY ─────────────────────────────
             Sid: "it feels like it breaks and vanishes for a bit."

             That was this: cells shrank to 60% on the way out and the return
             began from 0.6, so mid-flight the cloud thinned to the point
             where there was visibly nothing on screen for a beat, and then
             something reappeared. The pieces keep almost all of their size
             now; the thinning that was wanted comes from the spread, which
             is what actually produces it. */
          sc = 1 - 0.12 * Math.min(1, t);
        } else {
          /* ── BACK ─────────────────────────────────────────────────────
             From wherever it got to, home, on an ease. Not the physics in
             reverse: that reads as a rewind. */
          var bt = (el - OUT - HOLD) / BACK;
          var tb = Math.max(0, Math.min(1, (bt - p.rback) / (1 - p.rback)));
          /* Smoother than a cubic on the way home. Sid: "when it forms back
             together it needs to animate properly and be much smoother." A
             cubic ease-out is nearly at rest for the last third of its
             duration, which reads as the pieces hesitating just before they
             land; a quintic in-out leaves slowly, travels, and arrives, so
             the reassembly has a shape rather than a stall. */
          var e = tb < 0.5 ? 16 * tb * tb * tb * tb * tb : 1 - Math.pow(-2 * tb + 2, 5) / 2;
          var so = OUT / 1000;
          var fx = p.x + p.vx * so;
          var fy = p.y + p.vy * so + 0.5 * G * so * so;
          px = fx + (p.x - fx) * e;
          py = fy + (p.y - fy) * e;
          rot = p.spin * so * (1 - e);
          /* A whisper of overshoot on the way in, so cells arrive rather
             than stop. */
          sc = 0.88 + 0.12 * e + Math.sin(e * Math.PI) * 0.05;
        }

        if (px < -120 || px > W + 120 || py > H + 200) continue;

        ctx.save();
        ctx.translate(px + p.w / 2, py + p.h / 2);
        if (rot) ctx.rotate(rot);
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        var ww = p.w * sc,
          hh = p.h * sc;
        /* +0.6 closes the hairline seams between neighbouring cells while
           they are still packed, so frame one looks like the picture and
           not like a screen door over it. */
        ctx.fillRect(-ww / 2, -hh / 2, ww + 0.6, hh + 0.6);
        ctx.restore();
      }

      if (el < TOTAL) {
        requestAnimationFrame(frame);
      } else {
        cv.remove();
        if (!hadPos) host.style.position = "";
        host.__voxBusy = false;
        if (opts.onDone) opts.onDone();
      }
    }
    requestAnimationFrame(frame);
    return true;
  }

  window.SidVoxel = { burst: burst, sample: sample };
})();
