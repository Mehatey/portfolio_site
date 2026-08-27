/* ─────────────────────────────────────────────────────────────────────────
   THE CUBE GUY, AS A DEPTH MAP

   Sid: "what if we have him in the centre in depth map and controllable
   interactive when u hover on him to slowly with a cool shader do something
   to it."

   The source is cube_guy_blender.glb, 27MB — 335k skinned vertices with
   normals, UVs, joints and weights, and a 1.8MB texture. None of that can go
   on a homepage, and a depth map wants none of it either: it is positions and
   a camera. So the model is sampled offline to 55,843 points, normalised into
   a unit box and quantised to int16, which is 336KB — about 1.2% of the GLB,
   and less than the two hero videos that were already there.

   Everything below is raw WebGL for the same reason home-field.js is: this
   page has no bundler, and a 600KB three.js to draw gl.POINTS with one
   attribute would be the largest thing on the site by a wide margin.

   Three states, and they are meant to be read in this order:

     · at rest      he turns slowly, shaded by distance from the camera —
                    near points bright and large, far ones dim and small. The
                    depth IS the image; there is no lighting model.
     · under the hand  drag to turn him, with inertia. This is the "controllable"
                    part, and it takes over from the idle spin rather than
                    fighting it.
     · on hover     over ~1.4s the cloud comes apart: every point drifts along
                    its own axis, a band sweeps him top to bottom pushing
                    points out along their normal from centre, and the palette
                    splits toward the near colour. Let go and it reassembles
                    over the same 1.4s. Slow on purpose — Sid asked for slow,
                    and a fast version of this reads as a glitch rather than
                    as something being taken apart.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var canvas = document.getElementById("cg-gl");
  if (!canvas) return;
  var host = canvas.parentNode;

  /* How much of him is surfaced before anyone touches him. */
  var SOLID_FLOOR = 0.55;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
  } catch (e) {
    gl = null;
  }
  /* No context: the canvas stays empty and the hero is what it was before
     him. Nothing else on the page depends on this running. */
  if (!gl) return;

  /* ── ONE BUFFER, TWO PASSES ──────────────────────────────────────────────
     Sid: "i was mentioning hover on the cube, and then it shows only that
     area in a cool, flowy brush shader type shit. It reveals the actual
     model below it."

     So the hover is no longer something that happens to the whole figure. A
     brush follows the pointer across him, and inside it the cloud closes into
     the model itself — lit, solid, opaque — while everything outside stays
     the sparse depth map. Wiping the pointer across his chest paints the
     surface in and lets it fade out behind you.

     That needs the two halves composited differently, and no single draw call
     can do both: a surface wants alpha over the nearest fragment, a point
     cloud wants additive accumulation, and a cloud drawn additively over a
     surface is a fog. So the same buffer is drawn twice.

       PASS 1  the solid. Alpha blended, depth written, alpha faded to zero
               outside the brush so the rest of the figure never enters the
               depth buffer at all.
       PASS 2  the cloud. Additive, depth TESTED but not written, so particles
               behind the revealed surface are correctly hidden by it, and
               faded out inside the brush where the solid has taken over.

     Which is also why the context now asks for a depth buffer and why
     gl_Position.z carries real view depth rather than 0.

     The brush edge is warped by the point's own hash and by a slow sine, so
     it is a wet edge that crawls rather than a circle — the "flowy" part. */
  var VS = [
    "precision highp float;",
    "attribute vec3 p;",
    "attribute vec3 cubeP;",
    "attribute vec3 nrm;",
    "attribute vec2 uv;",
    "attribute vec3 bp;",
    "attribute vec3 bn;",
    "uniform mat3 u_rot;",
    "uniform float u_time, u_hov, u_size, u_aspect, u_dpr, u_scan, u_pass, u_brushR, u_scroll, u_grow, u_break, u_melt, u_fit, u_morph, u_solid;",
    "uniform sampler2D u_paint;",
    "uniform float u_hasPaint, u_paintOnly, u_paintSize;",
    "uniform float u_form;",
    "uniform vec2 u_ptr;",
    "varying float v_depth;",
    "varying float v_rand;",
    "varying float v_brush;",
    "varying float v_live;",
    "varying float v_lit;",
    "varying float v_melt;",
    "varying vec2 v_scr;",
    "varying vec2 v_uv;",
    "varying vec3 v_nrm;",

    /* One hash per point, off its own position, so the scatter is stable
       between frames — a per-frame random would boil rather than drift. */
    "float hash(vec3 q) {",
    "  return fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);",
    "}",

    "void main() {",
    /* Blender is Z-up and WebGL is Y-up. Swapping here rather than in the
       exported data keeps the .bin in the model's own frame, so a re-export
       does not need this file changed. */
    /* ── THE GENIE ────────────────────────────────────────────────────────
       Sid: "i want the cube guy to actually animate and maybe sort of slide
       and twirl and come towards the right and increase in size, like the
       genie-in-the-bottle type thing ... have you not looked at professional
       paid scroll transitions and such, where you scroll and that enables it
       to be linked by the scroll?"

       The old version rode one number into a grow, a spin and a squaring-off,
       all at once, over the length of the hero — which is why it read as
       "gets a little bigger" and nothing else. This is a timeline. u_scroll
       runs 0 → 1 across a pinned range (see the JS), and each move owns a
       slice of it, so they happen in an order you can watch:

         .00–.18  he stands. The hero is still the hero.
         .18–.52  he lifts off the floor, starts turning, and travels RIGHT
                  while the camera pushes in. This is the "slide and twirl".
         .45–.85  the funnel. Every point spirals about the axis — harder the
                  lower it sits, which is what makes a tail rather than a
                  spin — and is drawn down toward a single point beneath him,
                  the way a genie goes into a bottle. The cube section is
                  arriving underneath exactly here.
         .78–1.0  gone.

       The overlap between the slices is deliberate: he is still travelling
       when the funnel starts, so the two read as one move. */
    "  vec3 pos = vec3(p.x, p.z, p.y);",
    /* ── TWO FORMS, ONE CLOUD ─────────────────────────────────────────────
       Sid: "when broken let it reassemble into this [buddha-web.glb] ... and
       then when you click it again it breaks in a new well animated smooth
       break and then reforms into cube guy."

       buddha-points.bin is the same 55,843 points, sampled from the Buddha at
       exactly the cube guy's count and normalised into the same unit box, so
       point i of one figure has a partner at point i of the other and the two
       occupy the same space. That is the whole trick: with matched counts the
       change of form is a lerp per point rather than a crossfade between two
       clouds, so nothing is born and nothing dies — the same dust rearranges.

       The per-point delay is what stops it reading as one rubber sheet being
       pulled between two shapes. Each point starts its journey up to a third
       of the way into the transition, keyed off its own stable hash, so the
       silhouette dissolves and re-gathers rather than stretching.

       UV stays with the cube guy's point either way, so whatever has been
       painted travels onto the Buddha and back. */
    "  if (u_form > 0.0001) {",
    "    float nn = hash(p);",
    "    float fp = clamp((u_form - nn * 0.34) / 0.66, 0.0, 1.0);",
    "    fp = fp * fp * (3.0 - 2.0 * fp);",
    "    vec3 bpos = vec3(bp.x, bp.z, bp.y);",
    /* A bow outward through the middle of the change, so the two forms are
       joined by a swell rather than by the shortest line between them. */
    "    float bow = sin(fp * 3.14159265);",
    "    vec3 side = normalize(vec3(sin(nn * 61.7), cos(nn * 23.9) * 0.5, sin(nn * 91.3)) + 0.0001);",
    "    pos = mix(pos, bpos, fp) + side * bow * (0.06 + nn * 0.16);",
    "  }",

    /* ── HE IS NO LONGER IN THE TRANSITION ────────────────────────────────
       Sid: "don't make the cube guy come down and increase in size, that
       parallax doesn't work... instead try another scroll transition without
       the cube guy involved."

       The timeline described above — lift, travel right, funnel, gone — is
       what he is asking to lose. It is left in the file and simply not fed:
       `lift` and `funnel` are pinned to 0, so every move below evaluates to
       identity and he stands still through the whole hero. He is a thing you
       turn with your hand and break with a click, and that is all he is now.
       Deleting the maths would make bringing any of it back an archaeology
       exercise; holding it at zero keeps it readable and costs two lines.

       What replaces it does not touch him: see .hero-veil in sid_home.html,
       a light passing over the whole hero as the section leaves. */
    "  float lift = 0.0;",
    "  float funnel = 0.0;",

    /* THE TWIST. Angle grows toward the feet, so he wrings out from the
       bottom like something being poured. */
    "  float hgt = clamp(pos.y * 0.5 + 0.5, 0.0, 1.0);",
    "  float tw = funnel * (1.35 - hgt) * 7.5;",
    "  float cw = cos(tw), sw = sin(tw);",
    "  pos.xz = mat2(cw, -sw, sw, cw) * pos.xz;",

    /* THE DRAW-DOWN. Toward a point below and slightly right of him — the
       neck of the bottle. Squared before it is applied so nothing moves for
       the first half of the funnel and then it goes quickly. */
    "  float f2 = funnel * funnel;",
    "  vec3 spout = vec3(0.34, -1.55, 0.0);",
    "  pos = mix(pos, spout, f2 * 0.92);",
    "  pos.xz *= mix(1.0, 0.14, f2);",

    /* THE LIFT AND THE TRAVEL. Rises as he goes, so the arc is not flat. */
    "  pos.y += lift * 0.30;",

    /* ── THE SHATTER ──────────────────────────────────────────────────────
       Sid: "when i click on the cube, i thought there was going to be some
       sort of shattering animation or something cool happened to it."

       u_break is a one-shot 0 → 1 → 0 fired by a click. It is not a scatter:
       a cloud that simply flies apart reads as an explosion of dust, and he
       is a solid. So the cloud is broken into SHARDS first — points are
       grouped by a coarse hash of their position, about 90 cells, and every
       point in a cell moves as one piece. Each shard takes its own direction
       out from the body, its own tumble about its own centre, and its own
       amount of gravity, so what comes apart is a figure made of plates
       rather than a fog.

       The reassembly is the same curve run backwards and it is slower than
       the break: 0.9s out, 1.6s back. Things fall apart faster than they go
       together, and a shatter that snaps back at the same rate reads as a
       loop rather than as a recovery. */
    "  if (u_break > 0.0001) {",
    /* ── HOW MANY PIECES ──────────────────────────────────────────────────
       Sid: "a lot more shrapnel and realistic physics."

       This divisor is the shard count. At 4.5 the body was cut into about
       ninety cells, which at his on-screen size is a plate the width of his
       forearm — the break read as a statue coming apart in slabs. At 9.5 it is
       roughly seven hundred, small enough to read as shrapnel and still large
       enough that each piece holds a recognisable scrap of surface. Costs
       nothing: it is a divisor inside the vertex shader, not a number of
       anything, and the same 55,843 points are drawn either way. */
    "    vec3 cell = floor(pos * 9.5);",
    "    float cs = fract(sin(dot(cell, vec3(41.3, 289.1, 77.7))) * 24571.13);",
    "    vec3 cc = (cell + 0.5) / 9.5;",
    /* ── WHY IT DID NOT FEEL ORGANIC ──────────────────────────────────────
       Sid: "the breaking on click doesn't feel too good, it doesn't feel
       organic."

       Everything above was already per-shard — direction, tumble, gravity —
       but every shard was reading the SAME u_break, so all ninety left at
       the same instant and all ninety came home at the same instant. Ninety
       different trajectories starting and ending on one clock still reads as
       one event, because what the eye tracks in a break is not the paths, it
       is the onset.

       So each shard now gets its own onset and its own return. `bs` remaps
       u_break through a per-shard delay of up to a fifth of the animation:
       the ones nearest the click go first and the rest let go a beat later,
       which is a crack propagating rather than a detonation.

       And on the way back, each shard overshoots its own seat slightly and
       settles — a damped wobble scaled by how far it travelled. That is the
       part that reads as weight. A piece that arrives exactly on its mark
       and stops dead is a piece with no mass. */
    "    float dly = cs * 0.20;",
    "    float bs = clamp((u_break - dly) / max(0.001, 1.0 - dly), 0.0, 1.0);",
    /* Settle only applies while coming home, and dies out as it arrives. */
    "    float st = sin(bs * 26.0 + cs * 6.28318) * bs * (1.0 - bs) * 0.16;",
    /* direction: away from the body's axis, biased outward and up */
    /* A direction per shard on a full sphere, biased upward — NOT the cell's
       offset from the origin. The first pass used the latter and the figure
       is a tall thin thing, so cc.y dominated, every piece went almost
       straight up, and the gravity term below cancelled it: measured mid
       break at 0.8 the silhouette was still intact. */
    "    float a1 = cs * 6.28318;",
    "    float a2 = fract(cs * 71.7) * 3.14159;",
    "    vec3 dirS = vec3(sin(a2) * cos(a1), cos(a2) * 0.55 + 0.42, sin(a2) * sin(a1));",
    /* Spread of launch speeds widened from 0.55-1.45 to 0.4-2.3. Real debris
       does not leave at one speed; a narrow spread is what made the old break
       read as a single expanding shell rather than as a scatter. */
    "    float k = (bs + st) * (0.4 + 1.9 * cs);",
    /* the piece tumbles about its own centre */
    "    float ang = bs * (cs - 0.5) * 7.0;",
    "    float cbk = cos(ang), sbk = sin(ang);",
    "    vec3 rel = pos - cc;",
    "    rel.xy = mat2(cbk, -sbk, sbk, cbk) * rel.xy;",
    "    rel.yz = mat2(cbk, -sbk, sbk, cbk) * rel.yz;",
    "    pos = cc + rel;",
    /* thrown out, then pulled down — gravity on the way, so the pieces arc */
    "    pos += dirS * k * 1.15;",
    /* Gravity, squared in time so the arc accelerates downward the way a
       thrown thing does. Raised with the launch speed so the pieces that go
       furthest also fall furthest, which is what gives the scatter depth. */
    "    pos.y -= bs * bs * (0.55 + 0.9 * cs);",
    "  }",
    "  vec3 nor = normalize(vec3(nrm.x, nrm.z, nrm.y) + 0.0001);",
    "  if (u_form > 0.0001) {",
    "    nor = normalize(mix(nor, vec3(bn.x, bn.z, bn.y), u_form) + 0.0001);",
    "  }",
    "  float n = hash(p);",
    "  v_rand = n;",

    /* The idle loosening. Small, and now only OUTSIDE the brush — it is what
       the revealed surface is being revealed out of. */
    "  vec3 dir = normalize(vec3(sin(n * 41.3), cos(n * 27.7), sin(n * 13.1)) + 0.0001);",
    "  float breathe = 0.55 + 0.45 * sin(u_time * 0.7 + n * 24.0);",
    "  float band = smoothstep(0.10, 0.0, abs(pos.y - u_scan));",

    "  vec3 r = u_rot * pos;",
    "  vec3 rn = u_rot * nor;",
    /* Travel is applied after the rotation so it is a move across the SCREEN
       rather than a translation he then spins around. */
    "  r.x += lift * 0.62;",
    "  float z = r.z + 3.1 - lift * 0.55;",
    /* 2.28 rather than 2.62: the figure sits inside its own canvas with air
       under the feet, so the hero's overflow:hidden has nothing of him to
       cut. */
    /* u_fit shrinks the projection so a full-hero canvas still draws a
       figure of --cg-w. Applied to the focal length rather than to the point
       positions, so the perspective is unchanged and only the framing moves. */
    "  float f = 2.28 * u_grow * u_fit;",
    "  vec2 ndc = vec2((r.x * f / z) / u_aspect, r.y * f / z);",

    /* ── THE BRUSH ────────────────────────────────────────────────────────
       Distance from the pointer in screen space, warped per point so the
       boundary is a wet edge rather than a circle. u_hov eases the radius
       from nothing, so it opens under the hand instead of snapping on. */
    "  float bd = length((ndc - u_ptr) * vec2(u_aspect, 1.0));",
    "  bd += (n - 0.5) * 0.17 + sin(pos.y * 9.0 + u_time * 0.9) * 0.055 + sin(pos.x * 13.0 - u_time * 0.7) * 0.045 + sin(pos.z * 7.0 + u_time * 0.5) * 0.03;",
    "  float R = u_brushR * u_hov;",
    "  float live = R > 0.001 ? smoothstep(R, R * 0.35, bd) : 0.0;",
    /* ── PAINT STAYS ──────────────────────────────────────────────────────
       Sid: "hover should paint that area of the cube guy in and keep it
       painted so people can paint the whole one."

       The brush was pure state: a distance to the pointer, recomputed every
       frame, gone the instant the cursor moved on. Nothing accumulated, so
       there was nothing to fill in.

       What accumulates now is a texture in the model's OWN uv space. Once a
       frame the whole cloud is drawn a second time with gl_Position taken
       from `uv` instead of from the camera — every point lands on its own
       texel — and the live brush value is blended in additively. The result
       is a map of everywhere the pointer has ever been on his surface, which
       survives him turning, because uv turns with him.

       512x512 for 55,843 points is about five texels each: coarse enough to
       be cheap, fine enough that a brush stroke has an edge. `max` rather
       than `+` on the read, so the live brush is always at least as bright as
       the memory of it and the leading edge of a stroke still reads. */
    "  float painted = u_hasPaint > 0.5 ? texture2D(u_paint, uv).r : 0.0;",
    /* ── HE IS MADE OF SOMETHING BEFORE YOU TOUCH HIM ────────────────────
       Sid: "give him actual material and texture ... this looks boring and
       bland af."

       The solid pass -- his own painted skin, lit, with the room reflected in
       it -- was gated entirely behind the brush, so on arrival every visitor
       met a grey point cloud and the material only existed for people who
       thought to drag across him. The best thing in the file was invisible by
       default.

       A floor under the brush fixes it without losing the mechanic: he is
       already substantially surfaced when you arrive, and the cursor still
       fills in the rest. Painting goes from "reveal a hidden thing" to
       "finish an unfinished one", which is a better gesture anyway -- you can
       see what your dragging is doing to something you can already read. */
    "  float brush = max(u_solid, max(live, painted));",
    "  v_live = live;",
    "  v_brush = brush;",

    /* Loosen only what the brush has not claimed. */
    "  float loose = (1.0 - brush) * u_hov;",
    "  pos += dir * loose * (0.018 + 0.085 * n) * breathe;",
    "  pos += normalize(pos + 0.0001) * band * loose * 0.07;",

    /* ── THE DISSOLVE ──────────────────────────────────────────
       Sid: "at certain times, we can have the cube guy's particles kind of
       drift away slowly and then be replaced in a nice WebGL shader-type
       way."

       Deliberately NOT u_break. The shatter above groups points into about
       ninety shards and throws them, because a click is an impact and a
       figure that pops into dust under your finger reads as a bug. This is
       the opposite gesture: nothing struck him, he is being carried off,
       so the unit is the single point and the motion is a drift.

       Three things make it read as dust rather than as a fade:

         · every point leaves on its own clock. `ms` remaps u_melt through
           a per-point delay of up to 42% of the animation, keyed off the
           same stable hash the idle loosening uses, so the cloud thins from
           the inside out over the whole beat instead of all going at once.
         · the direction is the point's own scatter axis bent by a slow
           swirl on u_time, so neighbouring points diverge as they travel
           and the silhouette comes apart rather than expanding.
         · it lifts. pos.y takes a squared term, so the drift starts
           sideways and turns upward — the shape of something leaving on
           air, not of something exploding.

       Point size and alpha both fall away with it (see gl_PointSize below
       and v_melt in the fragment shader), so what is left at u_melt = 1 is
       nothing at all and the film behind him has the frame to itself. */
    "  float ms = 0.0;",
    "  if (u_melt > 0.0001) {",
    "    ms = clamp((u_melt - n * 0.42) / 0.58, 0.0, 1.0);",
    "    ms = ms * ms * (3.0 - 2.0 * ms);",
    "    float sw2 = u_time * 0.5 + n * 31.0;",
    "    vec3 away = normalize(vec3(dir.x + sin(sw2) * 0.7, dir.y * 0.4 + 0.45, dir.z + cos(sw2 * 0.83) * 0.7) + 0.0001);",
    "    pos += away * ms * (0.26 + 0.9 * n);",
    "    pos.y += ms * ms * 0.32;",
    "  }",
    "  v_melt = ms;",

    /* One substance, two forms. Each point keeps its UV and therefore its
       colour while its position retargets from the figure to a cube face.
       A stable per-point delay prevents the silhouette collapsing as one
       rubber sheet; the sine envelope gives the journey volume without
       leaving any residual displacement at either endpoint. */
    "  float mp = clamp((u_morph - n * 0.16) / 0.84, 0.0, 1.0);",
    "  mp = mp * mp * (3.0 - 2.0 * mp);",
    "  float arc = sin(mp * 3.14159265);",
    "  vec3 stream = normalize(vec3(sin(n * 53.1), cos(n * 31.7) * 0.42, sin(n * 79.3)) + 0.0001);",
    "  pos = mix(pos, cubeP, mp) + stream * arc * (0.10 + n * 0.24);",
    "  float faceAxis = max(max(abs(cubeP.x), abs(cubeP.y)), abs(cubeP.z));",
    "  vec3 cubeNor = normalize(step(vec3(faceAxis - 0.001), abs(cubeP)) * sign(cubeP) + 0.0001);",
    "  nor = normalize(mix(nor, cubeNor, mp));",
    "  r = u_rot * pos;",
    "  z = r.z + 3.1;",
    "  ndc = vec2((r.x * f / z) / u_aspect, r.y * f / z);",

    /* One key light, fixed in view space so turning him turns the shading
       rather than dragging the light around with him. */
    "  v_lit = 0.16 + 0.84 * max(0.0, dot(rn, normalize(vec3(-0.52, 0.55, 0.66))));",
    /* The normal itself goes out too. v_lit is one dot product against a fixed
       key and cannot be used to look anything up -- a reflection needs the
       direction the surface actually faces, not how much it happens to catch
       one lamp. */
    "  v_nrm = rn;",

    /* Depth is written by the solid pass and tested by the cloud, so it has
       to be a real number, not 0. Mapped to roughly the volume the figure
       occupies. */
    /* ── THE PAINT PASS ───────────────────────────────────────────────────
       u_paintOnly redirects the whole cloud into uv space so the accumulation
       texture can be drawn with the same buffer and the same brush maths as
       the visible pass. Written last, so everything above — rotation, brush
       distance, melt — has already been computed exactly as it will be on
       screen, and only the destination differs. */
    "  if (u_paintOnly > 0.5) {",
    "    gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);",
    "    gl_PointSize = max(2.0, u_paintSize);",
    "    v_depth = 0.0;",
    "    return;",
    "  }",
    "  gl_Position = vec4(ndc, clamp((z - 1.8) / 2.6, -0.99, 0.99), 1.0);",
    /* Screen-space uv for the reveal's texture. Sampling the plate where the
       point LANDS rather than by any model uv means the footage sits still in
       the frame while he turns through it — the surface reads as a window cut
       into the film, which is the effect Sid is after, and it costs one
       varying. */
    "  v_scr = ndc * 0.5 + 0.5;",
    "  v_uv = uv;",

    /* Inside the brush the points grow until they overlap into a surface.
       That is the whole trick: no mesh is shipped, the solid is 55,843 points
       drawn large enough to close. */
    /* ── GROWTH IS NOT THE SAME THING AS COVERAGE ────────────────────────
       This read `1.0 + 3.6 * brush`, and brush now carries a base floor so
       that he HAS a material before anyone touches him. Those two facts
       together inflated every one of 55,843 points by 2.8x at rest, and at
       58vw on a large display the discs merged into one lump. Sid, with a
       screenshot: "the character still sucks."

       The two jobs were never the same. Coverage decides whether a point
       shows its material; growth decides whether neighbouring points overlap
       into a surface. Painting still needs the full growth, because that is
       the gesture -- points swelling until they close. The resting floor needs
       only enough overlap to read as skin, so it gets its own, much smaller
       term. */
    "  float grow = 1.0 + 3.6 * max(live, painted) + 1.05 * u_solid;",
    "  gl_PointSize = u_size * u_dpr * (2.15 / z) * (0.72 + 0.56 * n) * grow * (1.0 - 0.66 * ms);",
    "  v_depth = clamp((4.1 - z) / 2.0, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "precision highp float;",
    "uniform vec3 u_near, u_far;",
    "uniform float u_hov, u_fade, u_light, u_pass, u_scroll, u_texMode, u_hasTex, u_hasSkin, u_time, u_break, u_paintOnly;",
    "uniform sampler2D u_tex, u_skin, u_env;",
    "uniform float u_hasEnv, u_envAmt;",
    "uniform vec2 u_texCover;",
    "varying float v_depth;",
    "varying float v_rand;",
    "varying float v_brush;",
    "varying float v_live;",
    "varying float v_lit;",
    "varying float v_melt;",
    "varying vec2 v_scr;",
    "varying vec2 v_uv;",
    "varying vec3 v_nrm;",
    /* ── THE ROOM HE IS STANDING IN ──────────────────────────────────────
       Sid: "give him actual material and texture and put an inverted skybox
       or a shader so there is some modern liquid glass ... this looks boring
       and bland af."

       He was lit by a single hard-coded direction and nothing else, which is
       why he read as grey: one lamp in a void gives a surface exactly one
       piece of information about where it is, and a material with nothing to
       reflect cannot look like a material. The environment is the fix, and it
       was already in the repo -- workshop-1k.hdr, his own, the one the footer
       Buddha has been standing in this whole time. Tone-mapped to a 21KB
       equirect and blurred, because what is wanted from it is light and
       colour, not a photograph of a wall.

       Equirectangular lookup from the reflected view vector. The camera here
       is effectively down -Z, so the view direction is constant and the whole
       reflection comes off the surface normal -- which is the one thing a
       point cloud has in abundance. */
    "vec2 equirect(vec3 d){",
    "  return vec2(atan(d.z, d.x) * 0.15915494 + 0.5, acos(clamp(d.y, -1.0, 1.0)) * 0.31830989);",
    "}",
    "void main() {",
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float d = dot(c, c);",
    /* The accumulation target. Soft-edged so strokes overlap into a wash
       rather than tiling as visible squares, and scaled down so a single
       frame under the pointer adds a little rather than everything — paint
       builds with dwell, which is what makes it feel like painting. */
    "  if (u_paintOnly > 0.5) {",
    "    if (d > 0.25) discard;",
    "    float soft = smoothstep(0.25, 0.0, d);",
    /* 0.055, not 0.16. At the higher rate a single two-second drag
       flooded the entire body — the brush is 0.46 of the frame wide, so one
       stroke touches most of him and at 0.16 a touch was enough. Painting
       should take dwell: about a second of the pointer held over one area to
       bring it fully in, so filling him is something you do rather than
       something that happens to you. */
    "    gl_FragColor = vec4(vec3(v_live * soft * 0.055), 1.0);",
    "    return;",
    "  }",
    "  if (d > 0.25) discard;",

    "  float t = pow(v_depth, 1.35);",

    "  if (u_pass > 0.5) {",
    /* THE SOLID. A hard-edged disc, because a soft one leaves the surface
       looking like felt; the overlap between neighbours does the smoothing.
       Lit by the normal, with the depth map still tinting it so the revealed
       figure belongs to the same picture as the cloud around it. */
    "    if (v_brush < 0.02) discard;",
    "    vec3 lit = mix(u_far * 0.9, u_near, clamp(t * 0.24 + v_lit * 0.86 - 0.06, 0.0, 1.0));",
    "    lit *= 0.66 + 0.52 * v_lit;",

    /* ── FIVE MATERIALS, NOT FIVE FILTERS ────────────────────────────────
       Sid: "doesnt the cube have some material of its own. also all the
       materials other than the gray one kind of just look like glass and
       reflect my video ... i told u no chromatic aberration ... every hover
       once i leave and back should be a vividly different cube texture and
       material."

       Every one of them was the SAME operation — his footage sampled in
       screen space and tinted — which is exactly why they all read as glass:
       a surface that shows you what is behind it is glass, whatever you do to
       the pixels afterwards. Four filters over one reflection is not four
       materials.

       So the first thing that had to exist is the model's own skin. The GLB
       ships a 4096 base-colour texture and the extractor was throwing it away
       along with the UVs; both are here now (1024 JPEG, 157KB, and 4 bytes of
       uv a point), so his actual painted surface is material 0 and the
       default.

       The other four are lit surfaces with their own optical behaviour, not
       screen-space samples:

         0 SKIN     the model's own texture, lit. What he is actually made of.
         1 CHALK    matte, unlit-looking, dusty. No specular at all.
         2 METAL    hard fresnel rim, dark body, no texture — a cast object.
         3 IRIDESCENT  hue rotates with the viewing angle, like oil or beetle
                    shell. Reads as coloured without sampling anything.
         4 FILM     the one that DOES take his footage, kept because it is a
                    good idea once rather than five times.

       Chromatic aberration is gone. */
    "    vec3 mat;",
    "    float m = u_texMode;",
    "    float fres = pow(1.0 - clamp(v_lit, 0.0, 1.0), 2.2);",
    /* One environment sample, shared by every material below. The camera looks
       down -Z here, so the view vector is constant and the reflection is
       entirely a function of the normal -- which a point cloud has one of per
       point, already rotated. */
    "    vec3 N = normalize(v_nrm);",
    "    vec3 R = reflect(vec3(0.0, 0.0, -1.0), N);",
    "    vec3 env = u_hasEnv > 0.5 ? texture2D(u_env, equirect(R)).rgb : vec3(0.0);",
    /* A grazing-angle fresnel, which is the whole difference between a
       surface with an environment and a surface with a picture on it: metal
       and glass throw the room back hardest at the edges, and it is that
       bright rim following the silhouette that the eye reads as material. */
    "    float rim = pow(1.0 - abs(N.z), 3.0);",
    /* ── MATERIAL 0 IS GLASS, NOT PAINT ──────────────────────────────────
       The plan was to show "his own painted surface". There is no painted
       surface: cube-guy-albedo.jpg is a 2048 greyscale UV atlas with a mean of
       (171,172,174). The model carries no colour at all, so every version of
       "light his texture and show it" could only ever produce a white cut-out
       on a black page -- which is exactly the bland Sid is describing, and
       lighting it harder or reflecting more room into it made it whiter.

       So the atlas stops being colour and becomes what it actually is: a
       detail map. Its luminance drives where the surface is polished and where
       it is scuffed, and the colour comes from the room and from the angle.

       The result is a dark body that is mostly its own reflection at grazing
       angles -- glass, not plastic. Dark matters twice: it is the only reading
       that survives against a black page with white type on both sides, and a
       transparent-looking thing needs somewhere dark to be transparent
       against. */
    "    if (m < 0.5 && u_hasSkin > 0.5) {",
    "      float det = texture2D(u_skin, vec2(v_uv.x, 1.0 - v_uv.y)).r;",
    /* Polish varies over him rather than being uniform, so the reflection
       breaks up the way it does on something handled. */
    "      float polish = 0.35 + 0.65 * smoothstep(0.35, 0.85, det);",
    "      vec3 body = mix(vec3(0.055, 0.070, 0.105), vec3(0.20, 0.25, 0.34), det);",
    /* The morph. A slow hue walk along his own height and around the normal,
       so the colour travels over the surface instead of the whole figure
       changing tint at once. */
    "      float hue = v_uv.y * 2.2 + N.x * 1.5 + u_time * 0.09;",
    "      vec3 sheen = 0.5 + 0.5 * cos(vec3(hue, hue + 2.09, hue + 4.19));",
    "      sheen = mix(vec3(0.55, 0.75, 0.95), sheen, 0.55);",
    "      mat = body;",
    "      mat += env * polish * (0.42 + 2.30 * rim) * u_envAmt;",
    "      mat += sheen * rim * rim * (0.75 + 0.85 * polish) * u_envAmt;",
    "      mat += vec3(0.70, 0.84, 1.0) * pow(max(0.0, v_lit), 14.0) * polish * 1.7;",
    "    } else if (m < 1.5) {",
    /* chalk: heavy ambient, no highlight, a little grain off the point hash */
    "      float ch = 0.62 + 0.38 * v_lit;",
    "      mat = vec3(0.82, 0.80, 0.76) * ch * (0.9 + 0.2 * v_rand);",
    "    } else if (m < 2.5) {",
    /* metal: dark body, bright rim, tight highlight */
    "      float spec = pow(clamp(v_lit, 0.0, 1.0), 9.0);",
    "      mat = mix(vec3(0.06, 0.07, 0.09), vec3(0.62, 0.68, 0.78), fres * 0.9) + spec * 0.85;",
    /* Metal is the material that is almost entirely its reflection. */
    "      mat += env * (0.30 + 1.15 * rim) * u_envAmt;",
    "    } else if (m < 3.5) {",
    /* iridescent: angle-driven hue, no sampling at all */
    "      float a2 = fres * 3.4 + v_lit * 1.6;",
    "      mat = 0.5 + 0.5 * cos(vec3(a2, a2 + 2.09, a2 + 4.19));",
    "      mat *= 0.42 + 0.72 * v_lit;",
    "      mat += env * (0.10 + 0.85 * rim) * u_envAmt;",
    "    } else if (u_hasTex > 0.5) {",
    "      vec2 tuv = (v_scr - 0.5) * u_texCover + 0.5;",
    "      vec3 tex = texture2D(u_tex, vec2(tuv.x, 1.0 - tuv.y)).rgb;",
    "      mat = clamp((pow(tex, vec3(0.8)) - 0.5) * 1.2 + 0.5, 0.0, 1.0) * (0.5 + 0.85 * v_lit);",
    "    } else {",
    "      mat = vec3(0.74, 0.78, 0.86) * (0.4 + 0.9 * v_lit);",
    "    }",
    "    lit = mix(lit, mat, 0.9);",
    /* Hard-edged disc — the overlap between neighbours does the smoothing;
       a soft one leaves the surface looking like felt. Faded out by the
       brush at its edge and by the scroll handoff at the end. */
    "    float a = smoothstep(0.25, 0.19, d) * smoothstep(0.01, 0.16, v_brush) * u_fade * (1.0 - smoothstep(0.70, 0.95, u_scroll)) * (1.0 - v_melt);",
    "    gl_FragColor = vec4(lit, a);",
    "    return;",
    "  }",

    /* THE CLOUD. As before, minus whatever the brush has taken. */
    "  float soft = smoothstep(0.25, 0.02, d);",
    "  vec3 col = mix(u_far, u_near, t);",
    "  col = mix(col, mix(col, u_near, 0.75), u_hov * v_rand * (1.0 - v_brush));",
    "  float a = soft * u_fade * mix(0.50 + 0.50 * t, 0.66 + 0.34 * t, u_light);",
    "  a *= mix(1.0, 0.86, u_hov) * (1.0 - v_brush);",
    /* Gone by the time the real cube is on screen, so the two are never both
       claiming to be the object. */
    "  a *= 1.0 - smoothstep(0.78, 1.0, u_scroll);",
    /* The break lights the cloud from inside — brightest at the instant of
       impact, gone as the pieces settle back. */
    "  col += u_near * u_break * (0.35 + 0.5 * v_rand);",
    "  a *= 1.0 + u_break * 0.5;",
    /* Whatever has drifted is gone; what has not is still solid. Fading the
       whole cloud on one number would be a dip to black with a figure
       still in it. */
    "  a *= 1.0 - v_melt;",
    "  gl_FragColor = vec4(col, a);",
    "}",
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = sh(gl.VERTEX_SHADER, VS);
  var fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var U = {};
  [
    "u_rot",
    "u_time",
    "u_hov",
    "u_size",
    "u_aspect",
    "u_dpr",
    "u_scan",
    "u_near",
    "u_far",
    "u_fade",
    "u_light",
    "u_pass",
    "u_paintSize",
    "u_paintOnly",
    "u_hasPaint",
    "u_paint",
    "u_ptr",
    "u_brushR",
    "u_scroll",
    "u_grow",
    "u_fit",
    "u_break",
    "u_melt",
    "u_tex",
    "u_texMode",
    "u_hasTex",
    "u_texCover",
    "u_skin",
    "u_env",
    "u_solid",
    "u_hasEnv",
    "u_envAmt",
    "u_hasSkin",
    "u_morph",
    "u_form",
  ].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });
  var aP = gl.getAttribLocation(prog, "p");
  var aCube = gl.getAttribLocation(prog, "cubeP");
  var aN = gl.getAttribLocation(prog, "nrm");
  var aUV = gl.getAttribLocation(prog, "uv");
  var aBP = gl.getAttribLocation(prog, "bp");
  var aBN = gl.getAttribLocation(prog, "bn");

  var buf = gl.createBuffer();
  var cubeBuf = gl.createBuffer();
  var count = 0;
  var bBuf = null,
    hasForm = 0,
    loadForm = null,
    uploadForm = null,
    formCount = 3;
  /* 0 = cube guy, 1 = Buddha. `formT` is what the click asks for, `form` is
     what the cloud is actually showing. */
  var form = 0,
    formT = 0;
  var ready = false;

  gl.enable(gl.BLEND);

  /* ── theme ────────────────────────────────────────────────────────────
     Two palettes, and the blend mode changes with them. Additive is what
     makes a point cloud glow on a dark ground, and it is also what turns a
     cream page into a white rectangle, so the light theme composites
     normally and paints dark points instead. */
  var light = false;
  /* The cloud's blend mode, pulled out of readTheme because the solid pass
     sets its own and the cloud has to be able to put this one back every
     frame. */
  function setBlend() {
    if (light) gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  }
  function readTheme() {
    light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) {
      gl.uniform3f(U.u_near, 0.05, 0.06, 0.09);
      gl.uniform3f(U.u_far, 0.62, 0.64, 0.68);
      gl.uniform1f(U.u_light, 1);
    } else {
      gl.uniform3f(U.u_near, 0.72, 0.83, 1.0);
      gl.uniform3f(U.u_far, 0.11, 0.17, 0.32);
      gl.uniform1f(U.u_light, 0);
    }
    setBlend();
  }
  /* ── THE PLATE, BORROWED ────────────────────────────────────────────────
     home-field already has his footage decoding in a <video> for the hero
     background. Reusing that element rather than mounting a second one means
     the reveal costs a texture upload and not another 2.2MB decode — two
     contexts can read the same video element, they just cannot share the
     texture object. If the field is not running (no WebGL there, or the
     element has not appeared yet) the reveal falls back to the clay render,
     which is what it was before. */
  var plate = null;
  var plateTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, plateTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 24, 32, 255]));

  function findPlate() {
    if (plate && plate.readyState >= 2) return plate;
    var vids = document.querySelectorAll("#field-stage video");
    for (var i = 0; i < vids.length; i++) {
      if (vids[i].readyState >= 2 && vids[i].videoWidth) {
        plate = vids[i];
        return plate;
      }
    }
    return null;
  }

  /* The model's own base colour, downscaled from the GLB's 4096 to 1024. */
  var skinTex = gl.createTexture();
  var hasSkin = 0;
  gl.bindTexture(gl.TEXTURE_2D, skinTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([120, 120, 124, 255]));
  /* ── FETCHED UP FRONT, DESPITE THE NAME ─────────────────────────────────
     The skin is the model's own 4096 base colour, shipped at 2048 so the
     revealed surface holds up on a retina display — 867KB measured.

     This block used to say it was fetched on first touch, and it is not: see
     the call beside the point fetch below, and the note there for why the
     deferral had to be undone. Material 0 is his DEFAULT, not a hover state,
     so deferring it meant everyone who never hovered saw flat chalk. The
     guard below still exists and still works; it is simply reached from load
     rather than from pointerenter. Left as a function so a future change of
     mind is one call site, not a rewrite. */
  /* ── THE ENVIRONMENT ────────────────────────────────────────────────────
     workshop-1k.hdr tone-mapped to a 21KB equirect and blurred hard. The
     footer Buddha has been standing in this room since it was built; the
     figure on the hero was standing in nothing, lit by one hard-coded
     direction, which is exactly why he read as grey plastic. A material needs
     something to reflect before it can look like a material.

     Blurred on purpose. What is wanted from it is the room's light and colour
     and the shape of its windows, not a legible photograph of a wall bent
     around him -- at full sharpness the graffiti reads as graffiti and he
     turns into a mirror ball. */
  var envTex = gl.createTexture();
  var hasEnv = 0;
  gl.bindTexture(gl.TEXTURE_2D, envTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([26, 28, 36, 255]));
  (function loadEnv() {
    var img = new Image();
    img.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, envTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        hasEnv = 1;
      } catch (e) {}
    };
    img.src = (canvas.getAttribute("data-base") || "") + "/assets/models/cube-guy-env.jpg";
  })();

  var skinAsked = false;
  function loadSkin() {
    if (skinAsked) return;
    skinAsked = true;
    var img = new Image();
    img.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, skinTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      hasSkin = 1;
    };
    img.src = (canvas.getAttribute("data-base") || "") + "/assets/models/cube-guy-albedo.jpg";
  }

  /* Material 0 is his own skin, and it is where he starts. After that every
     arrival steps to a different one — never the same twice running, which
     is what "vividly different" needs more than any amount of contrast. */
  /* ── THE PAINT BUFFER ───────────────────────────────────────────────────
     One 512x512 target holding everywhere the pointer has been on his
     surface, in the model's own uv space so it turns when he turns. Drawn to
     once a frame with the same vertex buffer (see the u_paintOnly branch in
     the shader) and read back by the visible pass.

     RGBA/UNSIGNED_BYTE rather than a float target, because a float colour
     buffer needs an extension that a good number of machines still do not
     advertise and eight bits of paint is eight bits more than none. Additive
     blending saturates at 1.0 on its own, which is exactly the ceiling
     wanted: a surface can be fully painted and no more. */
  var PAINT_N = 512;
  var paintTex = null,
    paintFbo = null,
    hasPaint = 0;
  (function () {
    paintTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, paintTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PAINT_N, PAINT_N, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    paintFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, paintFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, paintTex, 0);
    hasPaint = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE ? 1 : 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    /* No paint support is not an error — the brush falls back to the live
       distance it always was, which is the behaviour this replaces. */
  })();

  function clearPaint() {
    if (!hasPaint) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, paintFbo);
    gl.viewport(0, 0, PAINT_N, PAINT_N);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    /* ── PUT THE VIEWPORT BACK ────────────────────────────────────────────
       The one line that made every form look broken. The GL viewport is
       global state, not something a framebuffer owns, so setting it to
       512x512 for the paint target leaves it at 512x512 for the canvas too.

       The per-frame paint pass restores it on the way out and is therefore
       fine. This function is called from strike(), OUTSIDE the frame loop,
       and the paint pass only runs while the brush is open — so with no
       pointer on the page the viewport simply stayed at 512x512 from the
       moment of the first click. Everything after a break drew into the
       bottom-left third of the canvas at a third of the size, which is
       exactly what it looked like: the Buddha, the tree and the brain all
       rendering small, low and to the left, while loading a form WITHOUT
       breaking rendered perfectly. The forms were never wrong. */
    gl.viewport(0, 0, W, H);
  }
  clearPaint();

  var texMode = 0;

  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ── size ─────────────────────────────────────────────────────────────
     DPR capped at 2. 55k points at 3x on a 5K display is four million
     fragments a frame to draw something the size of a postcard. */
  var dpr = 1;
  var W = 1;
  var H = 1;
  /* ── THE IMAGINARY BOX ────────────────────────────────────────────────────
     Sid: "when I click, break on the cube guy — a lot more shrapnel and
     realistic physics, and it doesn't go across the whole page, it gets cut
     off by this imaginary box."

     The box was this canvas. The stage used to be exactly the figure's own
     width — 560px, later --cg-w — so every shard that left his silhouette hit
     the edge of the drawing surface a few dozen pixels later and vanished
     mid-flight. Nothing was clipping it in CSS; there was simply no canvas
     out there to draw on.

     So the stage is the whole hero now (see .cg-stage in sid_home.html) and
     the FIGURE is scaled down inside it to the size he was before. --cg-w
     stays the number that decides how big he looks; it is just applied to the
     projection instead of to the element. The shards get the entire frame to
     travel through, which is what "across the whole page" needs, and they
     leave by fading rather than by being cut.

     u_fit is that ratio. At a 1440 hero with --cg-w at 576, the canvas is
     1440 wide and the figure is drawn at 0.4 of it. */
  var FIG_W = 560;
  function figureWidth() {
    /* ── A CUSTOM PROPERTY IS NOT A RESOLVED LENGTH ────────────────────────
       getPropertyValue on a custom property hands back the SPECIFIED value,
       not the used one — for --cg-w that is the literal string
       "clamp(480px, 46vw, 880px)", which parseFloat reads as NaN. So this had
       been silently falling through to the 560 default since the day it was
       written: measured at a 1440 viewport the figure was drawn at 560/1440
       when it should have been 662/1440, about 15% small, and it never
       responded to the viewport at all.

       The stage element IS that width, so its own box is the resolved answer.
       Reading the rect rather than the property also means the two can never
       disagree. */
    var w = host.getBoundingClientRect().width;
    return w > 8 ? w : FIG_W;
  }
  function resize() {
    /* The canvas, not the stage. They are different boxes now: the stage
       stayed the figure's own size so that drag, click and hover keep the hit
       area they have always had, and the canvas is stretched to the whole
       viewport underneath it so a shard has somewhere to fly to. Measuring the
       stage here would size the drawing surface to the hit area again and put
       the imaginary box straight back. */
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.uniform1f(U.u_aspect, r.width / Math.max(1, r.height));
    gl.uniform1f(U.u_dpr, dpr);
    /* Point size follows the figure's drawn width, not the canvas width, or
       he would be rendered with dots sized for a 1440px object. */
    var fw = figureWidth();
    gl.uniform1f(U.u_fit, fw / Math.max(1, r.width));
    /* Capped at 3.2, not 4.0. The cap is in POINT pixels, so on a wide
       display it is reached long before the figure stops growing -- past that
       the points only get fatter relative to him, which is the blob. */
    gl.uniform1f(U.u_size, Math.max(1.8, Math.min(3.2, fw / 300)));
  }
  window.addEventListener("resize", resize);

  /* ── the data ─────────────────────────────────────────────────────────── */
  var base = canvas.getAttribute("data-base") || "";
  /* His own skin is the DEFAULT material, not a hover state, so it has to be
     on its way before the first frame rather than on first pointerenter. The
     old deferral was reasoned as "only ever visible once someone hovers him",
     and that reasoning was simply wrong: material 0 is what he starts on.
     Deferring it meant every visitor who never hovered saw chalk and nothing
     else, which is the entire "i still see only gray" report.

     Requested after the point fetch is issued so it queues behind the
     geometry — the model is useless without points and merely untextured
     without this. */
  loadSkin();
  fetch(base + "/assets/models/cube-guy-points.bin")
    .then(function (r) {
      if (!r.ok) throw new Error("cube guy: " + r.status);
      return r.arrayBuffer();
    })
    .then(function (ab) {
      /* The file is positions then normals: N*3 int16, then N*3 int8. Nine
         bytes a point against twenty-four for two float32 triples, which is
         the difference between 503KB and 1.3MB. */
      var n = (ab.byteLength / 13) | 0;
      count = n;
      var pos = new Int16Array(ab, 0, n * 3);
      var nor = new Int8Array(ab, n * 6, n * 3);
      /* sliced rather than viewed: a Uint16Array cannot start at an odd byte
         offset, and positions+normals come to n*9 bytes, which is odd for any
         odd n. The copy is 223KB once, at load. */
      var tex = new Uint16Array(ab.slice(n * 9, n * 9 + n * 4));

      /* Interleaved, so both attributes come off one buffer and one bind.
         Expanded to float once here rather than per frame — WebGL1 has no
         integer attribute to normalise from. */
      var f = new Float32Array(n * 8);
      for (var i = 0; i < n; i++) {
        f[i * 8] = pos[i * 3] / 32767;
        f[i * 8 + 1] = pos[i * 3 + 1] / 32767;
        f[i * 8 + 2] = pos[i * 3 + 2] / 32767;
        f[i * 8 + 3] = nor[i * 3] / 127;
        f[i * 8 + 4] = nor[i * 3 + 1] / 127;
        f[i * 8 + 5] = nor[i * 3 + 2] / 127;
        f[i * 8 + 6] = tex[i * 2] / 65535;
        f[i * 8 + 7] = tex[i * 2 + 1] / 65535;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(aN);
      gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 32, 12);
      if (aUV >= 0) {
        gl.enableVertexAttribArray(aUV);
        gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 32, 24);
      }

      /* ── THE OTHER FORMS ───────────────────────────────────────────────
         Sid: "see if anything from this folder is interesting to use."

         Three, and each one is a thing his work is actually about rather than
         a shape that looked good: the Buddha head that already opens the site,
         the tree that is the centrepiece of Bloom, and the brain that is the
         whole of Mind Your Feelings. Sampled from his own point-cloud library
         through _scripts/extract_form_points.mjs to exactly the cube guy's
         55,843 points, which is the only way a per-point lerp between them
         means anything.

         THE CYCLE GOES THROUGH HIM. Click and he becomes the Buddha; click
         again and he comes back; click again and he becomes the tree. He is
         never skipped, and that is the point — the substance is HIS, and each
         artifact is something he turns into and returns from, not a carousel
         of objects that happen to share a buffer.

         Fetched on demand, one at a time, and never twice. The page opens
         carrying none of them: 500KB each is not a cost anyone should pay for
         a state they may never reach, and by the time the first break is over
         the second form has had a second and a half to arrive. */
      var FORMS = [
        { name: "buddha", url: "/assets/models/buddha-points.bin" },
        { name: "tree", url: "/assets/models/form-tree.bin" },
        { name: "brain", url: "/assets/models/form-brain.bin" },
      ];
      var formIdx = -1,
        formLoading = 0;

      loadForm = function (i, then) {
        if (formLoading) return;
        var F = FORMS[i];
        if (!F) return;
        if (F.data) {
          uploadForm(F.data);
          if (then) then();
          return;
        }
        formLoading = 1;
        fetch(base + F.url)
          .then(function (r) {
            if (!r.ok) throw new Error(F.name + ": " + r.status);
            return r.arrayBuffer();
          })
          .then(function (bb) {
            var bn2 = (bb.byteLength / 9) | 0;
            if (bn2 !== n) {
              /* Matched counts are the entire premise. Rather than lerp
                 against garbage, refuse this form and leave the cycle on the
                 ones that do line up. */
              throw new Error(F.name + " has " + bn2 + " points, need " + n);
            }
            var bpos = new Int16Array(bb, 0, n * 3);
            var bnor = new Int8Array(bb, n * 6, n * 3);
            var bf = new Float32Array(n * 6);
            for (var k = 0; k < n; k++) {
              bf[k * 6] = bpos[k * 3] / 32767;
              bf[k * 6 + 1] = bpos[k * 3 + 1] / 32767;
              bf[k * 6 + 2] = bpos[k * 3 + 2] / 32767;
              bf[k * 6 + 3] = bnor[k * 3] / 127;
              bf[k * 6 + 4] = bnor[k * 3 + 1] / 127;
              bf[k * 6 + 5] = bnor[k * 3 + 2] / 127;
            }
            F.data = bf;
            uploadForm(bf);
            formLoading = 0;
            if (then) then();
          })
          .catch(function (e) {
            formLoading = 0;
            console.warn(e);
          });
      };

      uploadForm = function (bf) {
        if (!bBuf) bBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bBuf);
        gl.bufferData(gl.ARRAY_BUFFER, bf, gl.STATIC_DRAW);
        if (aBP >= 0) {
          gl.enableVertexAttribArray(aBP);
          gl.vertexAttribPointer(aBP, 3, gl.FLOAT, false, 24, 0);
        }
        if (aBN >= 0) {
          gl.enableVertexAttribArray(aBN);
          gl.vertexAttribPointer(aBN, 3, gl.FLOAT, false, 24, 12);
        }
        hasForm = 1;
      };

      /* The first one is warmed as soon as the figure itself is up, so the
         very first click has something to become without a wait. */
      setTimeout(function () {
        formIdx = 0;
        loadForm(0);
      }, 2500);

      /* Low-discrepancy sampling across six faces. Same count as the figure,
         so there is no particle birth, death or quality reduction during the
         handoff. The original UV remains attached to every point, carrying
         Cube Guy's painted colour onto the assembled object. */
      var cubeTargets = new Float32Array(n * 3);
      var side = 0.72;
      for (var j = 0; j < n; j++) {
        var face = j % 6;
        var u = ((j * 0.7548776662466927) % 1) * 2 - 1;
        var vv = ((j * 0.5698402909980532) % 1) * 2 - 1;
        var x = u * side;
        var y = vv * side;
        var z = side;
        if (face === 1) z = -side;
        else if (face === 2) {
          x = side;
          z = u * side;
        } else if (face === 3) {
          x = -side;
          z = u * side;
        } else if (face === 4) {
          x = u * side;
          y = side;
          z = vv * side;
        } else if (face === 5) {
          x = u * side;
          y = -side;
          z = vv * side;
        }
        cubeTargets[j * 3] = x;
        cubeTargets[j * 3 + 1] = y;
        cubeTargets[j * 3 + 2] = z;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuf);
      gl.bufferData(gl.ARRAY_BUFFER, cubeTargets, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aCube);
      gl.vertexAttribPointer(aCube, 3, gl.FLOAT, false, 12, 0);
      ready = true;
      host.classList.add("is-live");
      if (cubeObject && !REDUCED) {
        cubeObject.style.opacity = "0";
        cubeObject.style.pointerEvents = "none";
      }
      resize();
    })
    .catch(function (e) {
      console.error(e);
    });

  /* ── control ──────────────────────────────────────────────────────────── */
  var yaw = 0.5;
  var pitch = 0.05;
  var velY = 0;
  var velX = 0;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var hov = 0;
  var hovTarget = 0;
  var scrollP = 0;
  var pinned = false;
  var lastPub = -1;
  var hero = host.closest("section") || host.parentElement;
  var cubeSection = document.getElementById("hs-object");
  var cubeObject = document.getElementById("obj-cube");
  var morph = 0;

  /* ── THE MORPH IS OFF ───────────────────────────────────────────────────
     Sid: "i dont want the scroll animation from the cube guy to the cube, it
     looks horrible and shaky and all sides dont form properly."

     He is right on both counts and they are the same fault. The cube target
     is 55,843 points distributed across six faces by a low-discrepancy
     sequence, which spreads them EVENLY over the whole surface — so every
     face is a grey haze at the same density, and none of them resolves into a
     face with an edge. A real cube is defined by its edges and this had none.

     The shake is the driver: progress is read from getBoundingClientRect on
     every frame of a scroll, and the figure is simultaneously being pinned,
     unpinned and re-measured across the same range, so the two fight for a
     few frames at each boundary.

     Both are fixable and neither is worth fixing, because the effect it buys
     is a figure turning into a grey box. Held at 0, which makes every
     morph-driven term in the shader evaluate to identity — he stands, and the
     hero hands off to the cube section by scrolling like a normal page.

     The maths stays rather than being deleted: it is the same shape the
     Buddha and tree forms use, and it is one return statement away if a
     better cube target ever exists. */
  function readMorph() {
    return 0;
  }

  /* The brush needs the pointer in the same clip space the vertex shader
     projects into, so it is normalised against the stage's own box: -1..1
     across, +1 at the top. */
  var ptrX = 0;
  var ptrY = 0;
  /* 0 when nobody is here, 1 when the pointer is in the hero. Eased, so he
     takes up and puts down the habit of watching rather than switching. */
  var attend = 0,
    attendT = 0;

  host.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "touch") return;
    hovTarget = 1;
    loadSkin();
    /* ── WHY THIS NO LONGER LEAVES 0 ────────────────────────────────────────
       Sid: "i still see only gray."

       He was right and the skin had in fact never once been drawn. This line
       used to advance by `1 + random(0..3)`, so entering ALWAYS moved off
       material 0 — and 0 is his own painted surface. The only moment 0 was
       ever selected was the initial page load, and at that moment loadSkin()
       had not been called yet, so u_hasSkin was 0 and the shader's
       `if (m < 0.5 && u_hasSkin > 0.5)` fell through to the next branch:
       chalk. Flat grey, every time, on the one material that is actually his.

       Two changes. The skin is fetched up front now (see loadSkin's call
       beside the point data) so material 0 has something to draw, and the
       step below is allowed to land on 0 — it just may not repeat whatever
       was showing, which is what "vividly different each time" actually
       asked for. */
    texMode = (texMode + 1 + Math.floor(Math.random() * 4)) % 5;
  });
  /* ── THE POINTER IS MEASURED AGAINST THE CANVAS ─────────────────────────
     Not against the stage. They used to be the same box and are not any more:
     the stage stayed the figure's size so it can be dragged and clicked, and
     the canvas was stretched to the viewport so the break has somewhere to
     fly. The brush compares this value against `ndc`, which is computed in
     CANVAS space — so measuring it against the stage put the painted spot a
     long way from the cursor as soon as the two boxes diverged. Same rect the
     projection uses, so they cannot drift apart again.

     Bound to the HERO rather than to the stage, because he tracks the cursor
     across the whole frame now; the stage keeps the drag and the click, which
     should stay on him. */
  var trackEl = hero || host;
  trackEl.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType === "touch") return;
      var b = canvas.getBoundingClientRect();
      ptrX = ((e.clientX - b.left) / Math.max(1, b.width)) * 2 - 1;
      ptrY = 1 - ((e.clientY - b.top) / Math.max(1, b.height)) * 2;
      attendT = 1;
    },
    { passive: true }
  );
  trackEl.addEventListener(
    "pointerleave",
    function () {
      /* He goes back to his own drift rather than freezing mid-glance. */
      attendT = 0;
    },
    { passive: true }
  );
  host.addEventListener("pointerleave", function () {
    hovTarget = 0;
  });

  /* ── THE CLICK ──────────────────────────────────────────────────────────
     A click that is not a drag shatters him. The distinction matters: he is
     also grabbable, and a drag that ends in a click would blow him apart
     every time you turned him. So the shatter fires on pointerup, only if
     the pointer travelled less than 6px and was down for under 400ms.

     0.9s out, 1.6s back, on curves that are not each other's mirror. */
  var breakV = 0;
  var breakAt = 0;
  var downAt = 0;
  var downX = 0;
  var downY = 0;

  /* ── THE GESTURE ────────────────────────────────────────────────────────
     Sid: "when broken let it reassemble into [the Buddha] ... and then when
     you click it again it breaks in a new smooth break and then reforms into
     cube guy."

     So a click is not "shatter and come back" any more, it is "shatter and
     come back as the other one". The swap is scheduled for the moment the
     cloud is at its most scattered — about 1.05s in, just before the pieces
     turn around — because that is the only instant at which neither
     silhouette is legible and the change of form is therefore invisible. Flip
     it earlier and you watch a Buddha's arm grow out of a cube guy's; flip it
     later and the reassembly visibly corrects itself.

     If the second form never loaded, formT stays 0 and this is the break it
     always was. */
  function strike() {
    breakAt = performance.now();
    clearPaint();
    if (formTimer) clearTimeout(formTimer);
    formTimer = setTimeout(function () {
      if (formT > 0.5) {
        /* Coming home. The next artifact is fetched now rather than on the
           click that needs it, so the wait happens while he is standing
           there rather than in the middle of a break. */
        formT = 0;
        if (loadForm) {
          var nxt = (window.__cgFormIdx = ((window.__cgFormIdx || 0) + 1) % formCount);
          setTimeout(function () {
            loadForm(nxt);
          }, 900);
        }
      } else if (hasForm) {
        formT = 1;
      }
    }, 1050);
  }
  var formTimer = 0;

  host.addEventListener("pointerup", function (e) {
    var moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
    if (moved < 6 && performance.now() - downAt < 400) strike();
  });

  host.addEventListener("pointerdown", function (e) {
    downAt = performance.now();
    downX = e.clientX;
    downY = e.clientY;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velY = 0;
    velX = 0;
    host.classList.add("is-turning");
    if (host.setPointerCapture) {
      try {
        host.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  });
  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    velY = dx * 0.006;
    velX = dy * 0.004;
    yaw += velY;
    pitch = Math.max(-0.55, Math.min(0.55, pitch + velX));
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    host.classList.remove("is-turning");
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /* ── frame ────────────────────────────────────────────────────────────── */
  var t0 = performance.now();
  var fade = 0;
  /* The dissolve, eased here rather than in CSS because it drives a shader.
     `meltT` is what the conductor asks for; `melt` is what the cloud is
     actually doing, and the two rates differ on purpose — see below. */
  var melt = 0,
    meltT = 0;
  var visible = true;
  var onScreen = true;

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        onScreen = es[0].isIntersecting;
      },
      { threshold: 0 }
    ).observe(host);
  }
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
  });

  var rot = new Float32Array(9);
  function setRot(y, x) {
    var cy = Math.cos(y),
      sy = Math.sin(y),
      cx = Math.cos(x),
      sx = Math.sin(x);
    /* Yaw about up, then pitch about the camera's right. Written out rather
       than multiplied at runtime — it is the same nine numbers every frame. */
    rot[0] = cy;
    rot[1] = sy * sx;
    rot[2] = -sy * cx;
    rot[3] = 0;
    rot[4] = cx;
    rot[5] = sx;
    rot[6] = sy;
    rot[7] = -cy * sx;
    rot[8] = cy * cx;
  }

  resize();

  /* Cached element, classList read. Cheap enough to ask every frame, and
     it has to be asked every frame rather than once at boot: hero-scene
     gains .is-live only after its 1.4MB of points has landed, and it can
     remove itself entirely at any point before that. */
  var _hs = null,
    _hsQueried = false;
  function heroSceneLive() {
    if (!_hsQueried) {
      _hs = document.getElementById("hero-scene");
      _hsQueried = true;
    }
    if (_hs && !_hs.isConnected) {
      _hs = null;
    }
    return !!(_hs && _hs.classList.contains("is-live"));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    var morphTarget = readMorph();
    if (!ready || !visible || (!onScreen && morphTarget <= 0.001)) return;

    var t = (now - t0) / 1000;

    if (!dragging) {
      /* Inertia first, then the idle turn takes back over once it has
         decayed — so a flick spins him and then hands him back rather than
         stopping dead. */
      if (Math.abs(velY) > 0.0002) {
        yaw += velY;
        velY *= 0.955;
      } else if (!REDUCED) {
        /* ── HE WATCHES THE CURSOR ────────────────────────────────────────
           Sid: "the rotation could follow the cursor."

           The idle spin does not stop — a figure that only ever faces you is
           a mannequin, and the slow turn is what makes him read as alive when
           nobody is doing anything. What the pointer buys is a BIAS on top of
           it: the further your cursor sits from centre, the harder he is
           pulled toward facing it, and the drift continues underneath.

           ptrX is the pointer in NDC across the canvas, which is the whole
           viewport, so this is his heading relative to the actual screen
           rather than to his own little box. 0.85 radians is about fifty
           degrees at the edges: enough that he is unmistakably tracking you,
           not so much that he ever turns his back on the frame.

           The lerp is what keeps it from being a puppet on a stick. He leans
           into the new heading over about half a second and lags behind a
           fast sweep, which is the difference between watching and snapping. */
        var lookTarget = -ptrX * 0.85;
        var lookPull = attend * 0.06;
        yaw += (lookTarget - yaw) * lookPull;
        yaw += (0.0016 + 0.026 * scrollP * scrollP) * (1 - attend * 0.55);
      }
      /* Pitch follows the pointer's height by a smaller amount, so looking
         down at him tips his head down. Half the yaw's reach: a figure that
         pitches as freely as it yaws reads as a floating object rather than
         as something standing on a floor. */
      var pitchTarget = 0.05 + (REDUCED ? 0 : ptrY * 0.22 * attend);
      pitch += (pitchTarget - pitch) * 0.03;
    }

    /* 1.4s each way. The easing is on the value rather than on a CSS
       transition because it drives a shader, and Sid asked for slow. */
    var target = REDUCED ? 0 : hovTarget;
    hov += (target - hov) * 0.018;

    /* Out slower than back. Leaving is the beat the eye is meant to watch —
       it is the handoff into the film — so it gets about 2.4s; coming home
       is the recovery and takes about 1.7s, which lands him back on his mark
       before the copy has finished re-settling. Reduced motion never melts:
       the figure simply stays, and the film cross-fades over him instead. */
    /* Eased at different rates in each direction: he notices you quickly and
       loses interest slowly, which is the right way round for something that
       is supposed to seem curious rather than twitchy. */
    attend += (attendT - attend) * (attendT > attend ? 0.05 : 0.018);
    if (REDUCED) {
      attend = 0;
      meltT = 0;
    }
    melt += (meltT - melt) * (meltT > melt ? 0.022 : 0.032);
    if (melt < 0.0005 && meltT === 0) melt = 0;
    /* ── HE ARRIVES FIRST NOW ─────────────────────────────────────────────
       He used to wait: the field opened on the pixelated plate with the frame
       to itself, then the clear take, and only at about twenty seconds did
       the figure fade up behind them. Sid: "maybe in the beginning we don't
       show my background videos ... and we start with the cube guy."

       So the gate is gone and he simply fades in, which makes him the first
       thing on the page. What decides when the FILM is allowed is
       home-hero.js, and it reaches the figure through u_melt rather than
       through this fade — the difference matters: a fade is the figure being
       hidden, and the dissolve is the figure leaving. */
    fade += (1 - fade) * 0.03;

    morph += (morphTarget - morph) * 0.14;
    if (Math.abs(morphTarget - morph) < 0.0005) morph = morphTarget;
    var morphing = morph > 0.001 && morph < 0.999;
    host.classList.toggle("is-cube-morphing", morphing);
    if (hero) hero.classList.toggle("is-cube-morphing", morphing);
    /* ── THE CUBE SECTION COMES BACK ──────────────────────────────────────
       This read `(morph - 0.78) / 0.22`, which was right while the figure
       actually morphed into the cube: the CSS cube was the thing the morph
       handed off TO, so it appeared as the morph completed.

       `readMorph()` now returns a hard 0 -- see the note above, the morph was
       switched off because it looked shaky and never resolved into faces. But
       the cube's reveal was left keyed to it, so `morph` is 0 forever, the
       expression is negative forever, and `#obj-cube` has been sitting at
       opacity 0 with pointer events off ever since. The whole `#hs-object`
       section -- 720px of page, six project faces, a cube you are supposed to
       be able to grab and spin -- rendered as an empty screen between the hero
       and the work. Everything in it was loading correctly and painting
       nothing.

       Since the hero now hands off by scrolling like a normal page, the cube
       reveals on the only thing that still means anything: whether you are
       looking at it. Fades up as the section enters, holds while it is on
       screen, fades as it leaves. The morph path is kept for the day a better
       cube target exists -- if morph is ever non-zero again it wins, so this
       is additive rather than a replacement. */
    if (cubeObject) {
      var cubeReveal;
      if (morph > 0.001) {
        cubeReveal = Math.max(0, Math.min(1, (morph - 0.78) / 0.22));
      } else if (cubeSection) {
        var cr = cubeSection.getBoundingClientRect();
        var cvh = window.innerHeight || 1;
        cubeReveal = Math.min(cvh - cr.top, cr.bottom) / (cvh * 0.5);
        cubeReveal = Math.max(0, Math.min(1, cubeReveal));
      } else {
        cubeReveal = 1;
      }
      cubeReveal = cubeReveal * cubeReveal * (3 - 2 * cubeReveal);
      cubeObject.style.opacity = cubeReveal.toFixed(3);
      cubeObject.style.pointerEvents = cubeReveal > 0.94 ? "auto" : "none";
    }

    var targetYaw = 0.62;
    var targetPitch = -0.31;
    setRot(yaw * (1 - morph) + targetYaw * morph, pitch * (1 - morph) + targetPitch * morph);
    gl.uniformMatrix3fv(U.u_rot, false, rot);
    gl.uniform1f(U.u_time, t);
    gl.uniform1f(U.u_hov, hov);
    gl.uniform2f(U.u_ptr, ptrX, ptrY);
    gl.uniform1f(U.u_brushR, 0.46);

    /* Uploaded only while the reveal is actually open — at rest this is a
       point cloud and there is nothing to texture. */
    var v = hov > 0.01 ? findPlate() : null;
    if (v) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
        gl.uniform1i(U.u_tex, 0);
        gl.uniform1f(U.u_hasTex, 1);
      } catch (e) {
        gl.uniform1f(U.u_hasTex, 0);
      }
      /* cover, so the plate is not stretched across a tall stage */
      var va = v.videoWidth / Math.max(1, v.videoHeight);
      var sa = canvas.width / Math.max(1, canvas.height);
      if (va > sa) gl.uniform2f(U.u_texCover, sa / va, 1);
      else gl.uniform2f(U.u_texCover, 1, va / sa);
    } else {
      gl.uniform1f(U.u_hasTex, 0);
    }
    /* ── ACCUMULATE ───────────────────────────────────────────────────────
       Before anything is drawn for the eye. Additive, depth off, and only
       while the brush is actually open — at hov 0 there is nothing to add and
       the pass is skipped entirely, so an untouched figure costs nothing. */
    if (hasPaint && hov > 0.004 && !breakAt && melt < 0.02) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, paintFbo);
      gl.viewport(0, 0, PAINT_N, PAINT_N);
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.uniform1f(U.u_paintOnly, 1);
      /* Big enough that neighbouring points overlap into a continuous wash;
         at 55,843 points over 512x512 a single texel per point would leave a
         stipple you can see. */
      gl.uniform1f(U.u_paintSize, 4.0);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.uniform1f(U.u_paintOnly, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.enable(gl.DEPTH_TEST);
    }
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, paintTex);
    gl.uniform1i(U.u_paint, 3);
    gl.uniform1f(U.u_hasPaint, hasPaint);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, skinTex);
    gl.uniform1i(U.u_skin, 1);
    gl.uniform1f(U.u_hasSkin, hasSkin);

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.uniform1i(U.u_env, 4);
    gl.uniform1f(U.u_hasEnv, hasEnv);
    gl.uniform1f(U.u_envAmt, 1.0);
    /* How much of him is surfaced before anyone touches him. */
    gl.uniform1f(U.u_solid, SOLID_FLOOR);
    /* Out fast on a curve that leaves quickly, back slow on one that eases
       in — so the pieces leap and then drift home. */
    if (breakAt) {
      var el = (now - breakAt) / 1000;
      /* 1.1s out and 2.4s back, up from 0.9 and 1.6. The pieces have the whole
         frame to cross now rather than the width of his own stage, so the same
         envelope was throwing them off screen and hauling them back before the
         eye had followed any of them. */
      if (el < 1.1) {
        var o = el / 1.1;
        breakV = 1 - (1 - o) * (1 - o);
      } else if (el < 3.5) {
        var i2 = (el - 1.1) / 2.4;
        breakV = 1 - i2 * i2 * (3 - 2 * i2);
      } else {
        breakV = 0;
        breakAt = 0;
      }
    }
    gl.uniform1f(U.u_break, breakV);
    /* Eased rather than snapped, so that even if the swap lands a frame off
       the peak of the break the change still arrives as a transition. Slow
       enough that the reassembly and the change of form are one move: the
       pieces come home to somewhere slightly different than they left. */
    form += (formT - form) * Math.min(1, 0.055);
    if (Math.abs(form - formT) < 0.0015) form = formT;
    gl.uniform1f(U.u_form, hasForm ? form : 0);
    var morphMeltRelease = Math.max(0, Math.min(1, morph / 0.12));
    gl.uniform1f(U.u_melt, melt * (1 - morphMeltRelease));
    gl.uniform1f(U.u_morph, morph);
    gl.uniform1f(U.u_texMode, texMode);

    /* ── PINNED, SO THE TIMELINE HAS SOMEWHERE TO PLAY ─────────────────────
       An absolutely-positioned stage scrolls away with the hero, which gives
       the choreography about half a second of screen before it is gone —
       which is why the old version could only ever be "he gets a bit bigger".

       So the stage pins. From the moment the hero's top passes the viewport
       top until one further viewport-height of scroll, .cg-stage goes fixed
       at the exact box it already occupied, the page keeps moving underneath
       it, and u_scroll runs 0 → 1 across that distance. That is the whole
       mechanism behind the scroll transitions he is describing: the element
       stops moving and its STATE is what the scroll drives.

       Released at both ends — above, so he sits in the hero normally; below,
       so he does not hang over the rest of the page. */
    var heroH = Math.max(1, hero ? hero.offsetHeight : window.innerHeight);
    var y = window.scrollY || 0;
    var runway = heroH * 0.92;
    var prog = Math.max(0, Math.min(1, y / runway));

    /* ── HE DOES NOT TRAVEL, AND HE DOES NOT PIN ──────────────────────────
       Sid, twice: "don't make the cube guy come down and increase in size,
       that parallax doesn't work" and then "that cube guy is still coming on
       the right. i don't want that. the cube guy should stay where he is."

       The first pass only zeroed `lift` and `funnel` inside the shader, which
       stopped the genie move. It did not stop the two things actually
       carrying him across the screen:

         · THE PIN. .cg-stage went position:fixed for a whole viewport of
           scroll, so he stayed on screen and hung over the section arriving
           underneath. That is what "still coming" describes — he was not
           travelling, the page was, and he was standing still on top of it.
         · THE GROW. u_grow ran 1 → 1.55 off the same scroll, which is the
           "increase in size" he had already rejected once.

       Both are gone. He is an absolutely-positioned element in the hero that
       scrolls away with it like anything else, and what is left is what he
       asked to keep: turn him with the pointer, break him with a click. */
    var wantPin = false;
    if (wantPin !== pinned) {
      pinned = wantPin;
      host.classList.toggle("is-pinned", pinned);
      if (pinned) {
        /* The box it already had, frozen. Read once on the way in so the
           fixed element lands exactly where the absolute one was — no jump
           at the moment of pinning, which is the tell that gives these away. */
        var r = host.getBoundingClientRect();
        host.style.top = Math.round(r.top) + "px";
        host.style.left = Math.round(r.left) + "px";
        host.style.width = Math.round(r.width) + "px";
        host.style.height = Math.round(r.height) + "px";
      } else {
        host.style.top = "";
        host.style.left = "";
        host.style.width = "";
        host.style.height = "";
      }
    }

    /* Lightly smoothed. Enough to take the stutter out of a trackpad without
       the figure lagging behind the scroll, which would break the link. */
    scrollP += (prog - scrollP) * 0.16;
    /* --hero-p is no longer published here. It moved to
       assets/js/scroll-velocity.js, because it was never a fact about this
       renderer and being inside this loop meant it stopped the moment this
       figure stopped being the visible one. See the note in that file. */
    /* ── HE IS NOT THE ONE ON SCREEN ANY MORE ──────────────────────────
       hero-scene.js draws the figure now, and .hero-scene.is-live hides this
       stage with display:none. display:none stops the browser COMPOSITING
       the canvas; it does not stop this loop from filling it, so until now
       55,843 points were being drawn every frame into a surface nobody could
       see -- the exact waste that rule's own comment says it exists to
       prevent, just one level further down.

       The scroll publish above stays, because --hero-p drives the hero copy
       and the sections below it and this is still the only place it is
       written. Everything after this line is the draw, and the draw is what
       is skipped. */
    if (heroSceneLive()) return;
    /* Zero, so every scroll-driven term in the shader evaluates to identity.
       `prog` is still computed above because --hero-p drives the hero COPY's
       breakaway, which is not him and which Sid has not asked to change. */
    gl.uniform1f(U.u_scroll, 0);
    var cubeSize = cubeObject ? cubeObject.getBoundingClientRect().width : figureWidth();
    gl.uniform1f(U.u_grow, 1 + (cubeSize / Math.max(1, figureWidth()) - 1) * morph);
    var morphFade = 1 - Math.max(0, Math.min(1, (morph - 0.84) / 0.16));
    gl.uniform1f(U.u_fade, fade * morphFade);
    /* The band travels the height of the figure and wraps, a shade slower
       than the drift so the two never lock into a rhythm. */
    gl.uniform1f(U.u_scan, ((t * 0.24) % 2.4) - 1.2);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* PASS 1 — the solid. Alpha over, depth written, so the nearest surface
       wins and the cloud behind it cannot shine through.

       This used to read `if (hov > 0.004)`, and that single condition is why
       the figure has always looked like grey confetti: the pass that draws his
       MATERIAL only ran while a pointer was inside his box. Everyone who
       arrived and read the headline -- which is everyone -- met an unlit point
       cloud and never learned there was a surface underneath. Adding a floor
       to the brush did nothing on its own, because the brush is read inside a
       pass that was not running.

       It runs whenever there is anything to draw. That is a second 55k-point
       call per frame on the hero and nowhere else, which is the correct place
       to spend it: this figure is the composition. */
    if (hov > 0.004 || SOLID_FLOOR > 0.001) {
      gl.uniform1f(U.u_pass, 1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, count);
    }

    /* PASS 2 — the cloud. Depth TESTED against what the solid just wrote but
       not written to, so particles behind the revealed surface are hidden by
       it while particles in front still accumulate. Blend mode is the
       theme's: additive glows on the dark page, normal composites on cream. */
    gl.uniform1f(U.u_pass, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false);
    setBlend();
    gl.drawArrays(gl.POINTS, 0, count);
    gl.depthMask(true);
  }
  /* A verification hook, not a feature. Nothing calls it and nothing renders
     because of it; it lets a headless run hold each material still and
     screenshot it, which is the only way to check that five materials look
     like five materials rather than trusting the code. */
  /* Verification hooks. Nothing on the page calls these. */
  window.__cgBreak = function () {
    strike();
  };
  window.__cgForm = function () {
    return { form: form, formT: formT, hasForm: hasForm };
  };
  /* Verification hook. Nothing on the page calls it; it lets a headless run
     hold either form still and screenshot it, which is the only way to check
     that the second figure lands in the same space as the first. */
  window.__cgDump = function () {
    return {
      form: form,
      formT: formT,
      melt: melt,
      breakV: breakV,
      morph: morph,
      scrollP: scrollP,
      hov: hov,
      yaw: yaw,
      pitch: pitch,
      grow: 1,
      fit: figureWidth(),
    };
  };
  window.__cgLoadForm = function (i) {
    if (loadForm) loadForm(i);
  };
  window.__cgSetForm = function (v) {
    form = formT = Math.max(0, Math.min(1, +v || 0));
  };
  window.__cgClearPaint = clearPaint;
  window.__cgState = function () {
    return { breakV: breakV, breakAt: breakAt, hov: hov, scrollP: scrollP, melt: melt, meltT: meltT };
  };

  /* ── THE ONE CONTROL THE CONDUCTOR HAS ──────────────────────────────────
     home-hero.js owns the sequence; this file owns the figure. The seam
     between them is one number. Nothing else about the cube's behaviour —
     the idle turn, the drag, the brush, the shatter — is reachable from
     outside, so the conductor cannot accidentally take over the parts of
     him that answer to the hand. */
  window.__cgSetMelt = function (v) {
    meltT = Math.max(0, Math.min(1, +v || 0));
  };
  window.__cgReady = true;

  window.__cgSetMat = function (m) {
    texMode = (((m | 0) % 5) + 5) % 5;
  };

  requestAnimationFrame(frame);
})();
