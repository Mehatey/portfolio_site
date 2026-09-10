/* ════════════════════════════════════════════════════════════════════════════
   watercolour.js — an animated watercolour field on a real fluid simulation.

   No dependencies, no build step, WebGL2. Drop it on a page, point it at a
   canvas, and it runs. Pigment is carried by a divergence-free velocity field,
   spreads by capillary action weighted by how wet the paper still is, dries
   over time, and darkens at the edges of a wash the way a real one does.

     const wc = Watercolour(canvas, { palette:[...], ambient:0.5 });
     wc.drop(0.5, 0.5);           // x, y in 0..1, y up
     wc.push(0.5, 0.5, 2, 0);     // shove the water
     wc.destroy();

   MIT — do what you like with it.
   ════════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Watercolour = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ── inks are ABSORPTION, not light. Each triple says how much red, green
      and blue that pigment removes from the paper. Keeping the triples well
      separated is what stops mixed washes turning olive. ─────────────── */
  const PALETTES = {
    indigo: [
      [0.78, 0.58, 0.16],
      [0.92, 0.2, 0.04],
      [0.08, 0.74, 0.44],
      [0.06, 0.26, 0.86],
    ],
    ink: [
      [0.72, 0.66, 0.58],
      [0.4, 0.44, 0.52],
      [0.16, 0.2, 0.3],
    ],
    bloom: [
      [0.1, 0.72, 0.52],
      [0.2, 0.34, 0.8],
      [0.86, 0.3, 0.1],
    ],
    forest: [
      [0.3, 0.1, 0.6],
      [0.62, 0.22, 0.52],
      [0.14, 0.46, 0.72],
    ],
  };

  const DEFAULTS = {
    palette: "indigo" /* name above, or an array of [r,g,b] absorptions   */,
    paper: [0.973, 0.965, 0.948],
    scale: 0.5 /* sim resolution vs canvas. 0.35 on weak hardware  */,
    dpr: 1.75 /* cap on devicePixelRatio                          */,
    ambient: 0.55 /* 0 = still until touched, 1 = always drifting     */,
    drops: 0.55 /* how often pigment falls on its own. 0 = never    */,
    dry: 0.9955 /* <1. lower dries faster, so washes stop spreading */,
    settle: 0.9975 /* <1. lower makes pigment fade as it locks in      */,
    diffuse: 0.34 /* capillary spread                                 */,
    edge: 1.15 /* edge darkening. the signature of a real wash     */,
    granulate: 0.62 /* pigment settling into the tooth of the paper     */,
    grain: 0.014,
    vignette: 0.22,
    bloom: 0.85,
    density: 1.65 /* how dark a given amount of pigment reads         */,
    pointer: true /* drag to push the water, click to drop pigment    */,
    preserve: false /* let code outside this file read the canvas later */,
    iterations: 9 /* pressure solve. 5 is fine, 12 is smoother        */,
  };

  const VS = `#version 300 es
precision highp float;
in vec2 aP; out vec2 vU;
void main(){ vU=aP*0.5+0.5; gl_Position=vec4(aP,0.,1.); }`;

  const NOISE = `
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.03+3.7; a*=.5; } return s; }
vec2 curl(vec2 p,float t){ float e=.06;
  return vec2(fbm(p+vec2(0,e)+t)-fbm(p-vec2(0,e)+t),
             -(fbm(p+vec2(e,0)-t)-fbm(p-vec2(e,0)-t)))/(2.*e); }`;

  const F_ADVV = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o;
uniform sampler2D uVel; uniform vec2 uTexel; uniform float uDt,uTime,uDrift,uDamp;
${NOISE}
void main(){ vec2 v=texture(uVel,vU).xy;
  vec2 nv=texture(uVel, vU-v*uDt*uTexel*60.).xy;
  nv+=curl(vU*3.4,uTime*.045)*uDrift*.02; o=vec4(nv*uDamp,0.,1.); }`;

  const F_FORCE = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o;
uniform sampler2D uVel; uniform vec2 uP,uD,uAspect; uniform float uR,uAmt;
void main(){ vec2 v=texture(uVel,vU).xy; vec2 d=(vU-uP)*uAspect;
  o=vec4(v+uD*exp(-dot(d,d)/(uR*uR))*uAmt,0.,1.); }`;

  const F_DIV = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o; uniform sampler2D uVel; uniform vec2 uTexel;
void main(){ float l=texture(uVel,vU-vec2(uTexel.x,0.)).x,r=texture(uVel,vU+vec2(uTexel.x,0.)).x,
  b=texture(uVel,vU-vec2(0.,uTexel.y)).y,t=texture(uVel,vU+vec2(0.,uTexel.y)).y;
  o=vec4(.5*(r-l+t-b),0.,0.,1.); }`;

  const F_JAC = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o; uniform sampler2D uP,uDiv; uniform vec2 uTexel;
void main(){ float l=texture(uP,vU-vec2(uTexel.x,0.)).x,r=texture(uP,vU+vec2(uTexel.x,0.)).x,
  b=texture(uP,vU-vec2(0.,uTexel.y)).x,t=texture(uP,vU+vec2(0.,uTexel.y)).x;
  o=vec4((l+r+b+t-texture(uDiv,vU).x)*.25,0.,0.,1.); }`;

  const F_GRAD = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o; uniform sampler2D uVel,uP; uniform vec2 uTexel;
void main(){ float l=texture(uP,vU-vec2(uTexel.x,0.)).x,r=texture(uP,vU+vec2(uTexel.x,0.)).x,
  b=texture(uP,vU-vec2(0.,uTexel.y)).x,t=texture(uP,vU+vec2(0.,uTexel.y)).x;
  o=vec4(texture(uVel,vU).xy-vec2(r-l,t-b)*.5,0.,1.); }`;

  const F_ADVP = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o; uniform sampler2D uPig,uVel; uniform vec2 uTexel;
uniform float uDt,uDiff,uDry,uSettle;
void main(){ vec2 v=texture(uVel,vU).xy;
  vec4 p=texture(uPig, vU-v*uDt*uTexel*60.);
  vec4 s=texture(uPig,vU+vec2(uTexel.x,0.))+texture(uPig,vU-vec2(uTexel.x,0.))
        +texture(uPig,vU+vec2(0.,uTexel.y))+texture(uPig,vU-vec2(0.,uTexel.y));
  /* capillary spread only happens where the paper is still wet */
  p=mix(p,s*.25,uDiff*clamp(p.a*1.6,0.,1.));
  p.rgb*=uSettle; p.a*=uDry;
  o=max(p,vec4(0.)); }`;

  const F_DROP = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o; uniform sampler2D uPig; uniform vec2 uP,uAspect;
uniform vec3 uInk; uniform float uR,uAmt,uWet;
${NOISE}
void main(){ vec4 p=texture(uPig,vU); vec2 d=(vU-uP)*uAspect; float r=length(d);
  /* a ragged edge, not a disc — this is most of why it reads as paint */
  float wob=1.+.38*(fbm(normalize(d+1e-5)*2.6+r*3.)-.5)*2.;
  float f=smoothstep(uR*wob,uR*wob*.15,r);
  p.rgb+=uInk*f*uAmt; p.a=max(p.a,f*uWet);
  o=min(p,vec4(2.6,2.6,2.6,1.2)); }`;

  const F_PAINT = `#version 300 es
precision highp float;
in vec2 vU; out vec4 o; uniform sampler2D uPig; uniform vec2 uRes,uTexel;
uniform float uTime,uGrain,uEdge,uGran,uVig,uBloom,uDens; uniform vec3 uPaper;
${NOISE}
void main(){ vec2 q=vU; vec3 d=texture(uPig,q).rgb;
  /* edge darkening: pigment piles at the rim of a drying wash */
  float lx=dot(texture(uPig,q+vec2(uTexel.x,0.)).rgb,vec3(.333))
          -dot(texture(uPig,q-vec2(uTexel.x,0.)).rgb,vec3(.333));
  float ly=dot(texture(uPig,q+vec2(0.,uTexel.y)).rgb,vec3(.333))
          -dot(texture(uPig,q-vec2(0.,uTexel.y)).rgb,vec3(.333));
  d*=1.+length(vec2(lx,ly))*26.*uEdge;
  /* granulation: heavy pigment settles into the paper's tooth */
  float tooth=fbm(q*uRes*.022)*.6+fbm(q*uRes*.006)*.4;
  d*=1.+(tooth-.5)*uGran*clamp(dot(d,vec3(.333)),0.,1.4);
  float fib=fbm(q*uRes*.35)*.5+fbm(q*uRes*.09)*.5;
  vec3 paper=uPaper*(.965+(fib-.5)*.055);
  /* pigment absorbs light; it does not paint over the sheet */
  vec3 c=paper*exp(-d*uDens);
  vec3 g=textureLod(uPig,q,3.).rgb;
  c+=vec3(.30,.62,.78)*max(g-.35,0.)*uBloom;
  c+=(h21(q*uRes+fract(uTime)*57.)-.5)*uGrain;
  c*=1.-smoothstep(.45,1.05,length((q-.5)*vec2(1.05,1.)))*uVig;
  o=vec4(max(c,0.),1.); }`;

  function Watercolour(canvas, opts) {
    const O = Object.assign({}, DEFAULTS, opts || {});
    const INKS = Array.isArray(O.palette) ? O.palette : PALETTES[O.palette] || PALETTES.indigo;
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      /* Off by default, as WebGL intends. Turn it on when something OUTSIDE
         this file needs to read the canvas in a LATER frame, via drawImage
         or getImageData from another rAF. With it off the drawing buffer is
         undefined once the frame ends and that read silently returns
         nothing: no error, just an effect that never appears. */
      preserveDrawingBuffer: !!O.preserve,
      powerPreference: "high-performance",
    });
    if (!gl) return null;
    const HF = gl.getExtension("EXT_color_buffer_half_float");
    gl.getExtension("OES_texture_float_linear");

    const sh = (t, s) => {
      const o = gl.createShader(t);
      gl.shaderSource(o, s);
      gl.compileShader(o);
      if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
      return o;
    };
    const prog = (f) => {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f));
      gl.linkProgram(p);
      const u = {},
        n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const nm = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, "");
        u[nm] = gl.getUniformLocation(p, nm);
      }
      return { p, u };
    };

    const P = {
      advv: prog(F_ADVV),
      force: prog(F_FORCE),
      div: prog(F_DIV),
      jac: prog(F_JAC),
      grad: prog(F_GRAD),
      advp: prog(F_ADVP),
      drop: prog(F_DROP),
      paint: prog(F_PAINT),
    };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(P.paint.p, "aP");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    let W = 0,
      H = 0,
      SW = 0,
      SH = 0,
      vel,
      velF,
      pig,
      pigF,
      prs,
      prsF,
      dvT,
      dvF,
      cur = 0,
      pc = 0,
      pg = 0,
      alive = true;
    function mk(w, h, i, f, t, filt) {
      const x = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, x);
      gl.texImage2D(gl.TEXTURE_2D, 0, i, w, h, 0, f, t, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return x;
    }
    function fb(t) {
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      return f;
    }
    function alloc() {
      const dpr = Math.min(O.dpr, window.devicePixelRatio || 1);
      W = Math.max(2, Math.floor(canvas.clientWidth * dpr));
      H = Math.max(2, Math.floor(canvas.clientHeight * dpr));
      canvas.width = W;
      canvas.height = H;
      SW = Math.max(48, Math.floor(W * O.scale));
      SH = Math.max(48, Math.floor(H * O.scale));
      const RG = HF ? gl.RG16F : gl.RGBA,
        T = HF ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        RGBA = HF ? gl.RGBA16F : gl.RGBA;
      vel = [mk(SW, SH, RG, gl.RG, T), mk(SW, SH, RG, gl.RG, T)];
      velF = vel.map(fb);
      pig = [mk(SW, SH, RGBA, gl.RGBA, T, gl.LINEAR_MIPMAP_LINEAR), mk(SW, SH, RGBA, gl.RGBA, T, gl.LINEAR_MIPMAP_LINEAR)];
      pigF = pig.map(fb);
      prs = [mk(SW, SH, RG, gl.RG, T), mk(SW, SH, RG, gl.RG, T)];
      prsF = prs.map(fb);
      dvT = mk(SW, SH, RG, gl.RG, T);
      dvF = fb(dvT);
      [].concat(velF, pigF, prsF).forEach((f) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    alloc();
    const ro = "ResizeObserver" in window ? new ResizeObserver(() => alloc()) : null;
    if (ro) ro.observe(canvas);
    else window.addEventListener("resize", alloc);

    const use = (f, w, h, pr) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.viewport(0, 0, w, h);
      gl.useProgram(pr.p);
      gl.bindVertexArray(vao);
    };
    const bind = (u, i, t) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(u, i);
    };
    const go = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

    const queue = [];
    function drop(x, y, ink, r, amt) {
      queue.push({ x, y, ink: ink || INKS[(Math.random() * INKS.length) | 0], r: r || 0.06 + Math.random() * 0.05, a: amt || 0.55, t: 0 });
    }
    const forces = [];
    function push(x, y, dx, dy, r, amt) {
      forces.push({ x, y, dx, dy, r: r || 0.1, a: amt || 1 });
    }

    /* pointer */
    let mx = 0.5,
      my = 0.5,
      px = 0.5,
      py = 0.5,
      down = false,
      lx = 0,
      ly = 0,
      moved = false;
    function rel(e) {
      const b = canvas.getBoundingClientRect();
      return [(e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height];
    }
    const onMove = (e) => {
      const p = rel(e);
      mx = p[0];
      my = p[1];
      if (down) {
        const dx = e.clientX - lx,
          dy = e.clientY - ly;
        if (!moved && Math.hypot(dx, dy) > 4) moved = true;
        lx = e.clientX;
        ly = e.clientY;
      }
    };
    const onDown = (e) => {
      down = true;
      moved = false;
      lx = e.clientX;
      ly = e.clientY;
    };
    const onUp = (e) => {
      const p = rel(e);
      if (down && !moved) drop(p[0], p[1]);
      down = false;
    };
    if (O.pointer) {
      window.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
    }

    let t0 = performance.now(),
      T = 0,
      nextDrop = 0.6,
      raf = 0;
    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.max(0.001, Math.min(0.05, (now - t0) / 1000));
      t0 = now;
      T = now * 0.001;
      const AR = [Math.max(1, W / H), Math.max(1, H / W)],
        tx = [1 / SW, 1 / SH];
      const mvx = mx - px,
        mvy = my - py;
      px = mx;
      py = my;

      /* advect velocity */
      use(velF[1 - cur], SW, SH, P.advv);
      bind(P.advv.u.uVel, 0, vel[cur]);
      gl.uniform2f(P.advv.u.uTexel, tx[0], tx[1]);
      gl.uniform1f(P.advv.u.uDt, dt);
      gl.uniform1f(P.advv.u.uTime, T);
      gl.uniform1f(P.advv.u.uDrift, O.ambient);
      gl.uniform1f(P.advv.u.uDamp, 0.985);
      go();
      cur = 1 - cur;

      /* pointer drag, plus anything push() queued */
      if (O.pointer && down && Math.hypot(mvx, mvy) > 0.0004) forces.push({ x: mx, y: my, dx: mvx * 38, dy: mvy * 38, r: 0.1, a: 1 });
      while (forces.length) {
        const f = forces.shift();
        use(velF[1 - cur], SW, SH, P.force);
        bind(P.force.u.uVel, 0, vel[cur]);
        gl.uniform2f(P.force.u.uP, f.x, f.y);
        gl.uniform2f(P.force.u.uD, f.dx, f.dy);
        gl.uniform2f(P.force.u.uAspect, AR[0], AR[1]);
        gl.uniform1f(P.force.u.uR, f.r);
        gl.uniform1f(P.force.u.uAmt, f.a);
        go();
        cur = 1 - cur;
      }

      /* project to divergence-free so pigment spreads instead of piling */
      use(dvF, SW, SH, P.div);
      bind(P.div.u.uVel, 0, vel[cur]);
      gl.uniform2f(P.div.u.uTexel, tx[0], tx[1]);
      go();
      gl.bindFramebuffer(gl.FRAMEBUFFER, prsF[0]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (let i = 0; i < O.iterations; i++) {
        use(prsF[1 - pc], SW, SH, P.jac);
        bind(P.jac.u.uP, 0, prs[pc]);
        bind(P.jac.u.uDiv, 1, dvT);
        gl.uniform2f(P.jac.u.uTexel, tx[0], tx[1]);
        go();
        pc = 1 - pc;
      }
      use(velF[1 - cur], SW, SH, P.grad);
      bind(P.grad.u.uVel, 0, vel[cur]);
      bind(P.grad.u.uP, 1, prs[pc]);
      gl.uniform2f(P.grad.u.uTexel, tx[0], tx[1]);
      go();
      cur = 1 - cur;

      /* carry the pigment */
      use(pigF[1 - pg], SW, SH, P.advp);
      bind(P.advp.u.uPig, 0, pig[pg]);
      bind(P.advp.u.uVel, 1, vel[cur]);
      gl.uniform2f(P.advp.u.uTexel, tx[0], tx[1]);
      gl.uniform1f(P.advp.u.uDt, dt);
      gl.uniform1f(P.advp.u.uDiff, O.diffuse);
      gl.uniform1f(P.advp.u.uDry, O.dry);
      gl.uniform1f(P.advp.u.uSettle, O.settle);
      go();
      pg = 1 - pg;

      /* pigment falling on its own, so it is alive with nobody touching it */
      if (O.drops > 0) {
        nextDrop -= dt * O.drops;
        if (nextDrop <= 0) {
          nextDrop = 1.4 + Math.random() * 3.4;
          drop(0.12 + Math.random() * 0.76, 0.12 + Math.random() * 0.76);
        }
      }

      for (let i = queue.length - 1; i >= 0; i--) {
        const d = queue[i];
        use(pigF[1 - pg], SW, SH, P.drop);
        bind(P.drop.u.uPig, 0, pig[pg]);
        gl.uniform2f(P.drop.u.uP, d.x, d.y);
        gl.uniform2f(P.drop.u.uAspect, AR[0], AR[1]);
        gl.uniform3fv(P.drop.u.uInk, d.ink);
        gl.uniform1f(P.drop.u.uR, d.r);
        gl.uniform1f(P.drop.u.uAmt, d.a * (1 - d.t));
        gl.uniform1f(P.drop.u.uWet, 1);
        go();
        pg = 1 - pg;
        d.t += dt * 3.4;
        if (d.t >= 1) queue.splice(i, 1);
      }

      /* the sheet */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pig[pg]);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.useProgram(P.paint.p);
      gl.bindVertexArray(vao);
      bind(P.paint.u.uPig, 0, pig[pg]);
      gl.uniform2f(P.paint.u.uRes, W, H);
      gl.uniform2f(P.paint.u.uTexel, 1 / W, 1 / H);
      gl.uniform1f(P.paint.u.uTime, T);
      gl.uniform3fv(P.paint.u.uPaper, O.paper);
      gl.uniform1f(P.paint.u.uGrain, O.grain);
      gl.uniform1f(P.paint.u.uEdge, O.edge);
      gl.uniform1f(P.paint.u.uGran, O.granulate);
      gl.uniform1f(P.paint.u.uVig, O.vignette);
      gl.uniform1f(P.paint.u.uBloom, O.bloom);
      gl.uniform1f(P.paint.u.uDens, O.density);
      go();
      gl.bindVertexArray(null);
    }
    raf = requestAnimationFrame(frame);

    return {
      drop,
      push,
      set(k, v) {
        O[k] = v;
      },
      get options() {
        return O;
      },
      palettes: PALETTES,
      destroy() {
        alive = false;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        else window.removeEventListener("resize", alloc);
        if (O.pointer) {
          window.removeEventListener("pointermove", onMove);
          canvas.removeEventListener("pointerdown", onDown);
          window.removeEventListener("pointerup", onUp);
        }
      },
    };
  }
  Watercolour.palettes = PALETTES;
  return Watercolour;
});
