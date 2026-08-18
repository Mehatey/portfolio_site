(() => {
  "use strict";

  const VERTEX_SHADER = `
    attribute vec2 aPosition;
    attribute vec2 aUv;
    uniform vec3 uCenter;
    uniform vec2 uScale;
    uniform float uYaw;
    uniform float uAspect;
    varying vec2 vUv;
    varying float vDepth;

    void main() {
      vec3 point = vec3(aPosition * uScale, 0.0);
      float c = cos(uYaw);
      float s = sin(uYaw);
      point = vec3(point.x * c + point.z * s, point.y, -point.x * s + point.z * c);
      vec3 world = point + uCenter;
      vec3 view = world - vec3(0.0, 0.0, 8.2);
      float near = 0.1;
      float far = 30.0;
      float f = 2.05;
      gl_Position = vec4(
        view.x * f / uAspect,
        view.y * f,
        ((far + near) / (near - far)) * view.z + ((2.0 * far * near) / (near - far)),
        -view.z
      );
      vUv = aUv;
      vDepth = clamp((world.z + 4.0) / 8.0, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform float uReady;
    uniform float uFocus;
    uniform float uFailed;
    uniform float uOffset;
    uniform float uMotion;
    varying vec2 vUv;
    varying float vDepth;

    float roundedMask(vec2 uv, float radius) {
      vec2 point = abs(uv - 0.5) - vec2(0.5 - radius);
      float distance = length(max(point, 0.0)) + min(max(point.x, point.y), 0.0) - radius;
      return 1.0 - smoothstep(-0.006, 0.012, distance);
    }

    void main() {
      float side = 1.0 - uFocus;
      float lens = pow(abs(vUv.y - 0.5) * 2.0, 2.0);
      float drift = sin(vUv.y * 7.0 + uTime * 0.36) * 0.0018 * uMotion;
      vec2 uv = vec2(vUv.x + uOffset * lens * 0.012 * side + drift, vUv.y);
      vec3 color;
      if (uReady > 0.5) {
        vec2 blur = vec2(0.0035 * side + 0.0012 * uMotion);
        vec3 softened = texture2D(uTexture, uv).rgb * 0.52;
        softened += texture2D(uTexture, uv + vec2(blur.x, 0.0)).rgb * 0.12;
        softened += texture2D(uTexture, uv - vec2(blur.x, 0.0)).rgb * 0.12;
        softened += texture2D(uTexture, uv + vec2(0.0, blur.y)).rgb * 0.12;
        softened += texture2D(uTexture, uv - vec2(0.0, blur.y)).rgb * 0.12;
        float gray = dot(softened, vec3(0.299, 0.587, 0.114));
        vec3 peripheral = mix(vec3(gray), softened, 0.82) * 0.86;
        float split = 0.0007 + 0.0012 * uMotion;
        vec3 refracted;
        refracted.r = texture2D(uTexture, uv + vec2(split, 0.0)).r;
        refracted.g = texture2D(uTexture, uv).g;
        refracted.b = texture2D(uTexture, uv - vec2(split, 0.0)).b;
        color = mix(peripheral, refracted, uFocus);
      } else {
        vec2 blur = vec2(0.006);
        vec3 source = texture2D(uTexture, uv).rgb * 0.36;
        source += texture2D(uTexture, uv + vec2(blur.x, 0.0)).rgb * 0.16;
        source += texture2D(uTexture, uv - vec2(blur.x, 0.0)).rgb * 0.16;
        source += texture2D(uTexture, uv + vec2(0.0, blur.y)).rgb * 0.16;
        source += texture2D(uTexture, uv - vec2(0.0, blur.y)).rgb * 0.16;
        float gray = dot(source, vec3(0.299, 0.587, 0.114));
        float grain = fract(sin(dot(gl_FragCoord.xy + uTime, vec2(12.9898, 78.233))) * 43758.5453);
        float silver = smoothstep(0.08, 0.92, gray);
        float sweep = pow(max(0.0, 1.0 - abs(fract(vUv.y - uTime * 0.075) - 0.5) * 16.0), 3.0);
        color = mix(vec3(0.025, 0.026, 0.028), vec3(0.34, 0.35, 0.35), silver);
        color += (grain - 0.5) * 0.035 + sweep * vec3(0.16, 0.17, 0.17);
      }
      if (uFailed > 0.5) {
        color = mix(color, vec3(0.18, 0.07, 0.06), 0.72);
      }
      float edge = 1.0 - smoothstep(0.0, 0.012, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
      color += edge * (0.025 + uFocus * 0.09);
      color *= 0.74 + vDepth * 0.3;
      float alpha = roundedMask(vUv, 0.025) * mix(0.86, 1.0, uFocus) * (0.78 + vDepth * 0.22);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || "shader compilation failed");
    }
    return shader;
  }

  function createProgram(gl) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "shader link failed");
    }
    return program;
  }

  function wrapOffset(value, length) {
    if (!length) return 0;
    let offset = value % length;
    if (offset > length / 2) offset -= length;
    if (offset < -length / 2) offset += length;
    return offset;
  }

  function createFallback(labels, onSelect) {
    document.body.classList.add("orbit-fallback");
    let items = [];
    let selectedId = null;

    function renderLabels() {
      labels.replaceChildren();
      items.forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "orbit-tag";
        button.dataset.id = item.id;
        button.innerHTML = `<span class="orbit-tag-name"></span><span class="orbit-tag-state"></span>`;
        button.querySelector(".orbit-tag-name").textContent = item.label;
        button.querySelector(".orbit-tag-state").textContent = item.state || "waiting";
        if (item.url) button.style.backgroundImage = `url("${item.url}")`;
        button.classList.toggle("selected", item.id === selectedId);
        button.addEventListener("click", () => select(item.id, true));
        labels.appendChild(button);
      });
    }

    function select(id, announce = false) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      selectedId = id;
      renderLabels();
      if (announce) onSelect(item);
    }

    function step(direction) {
      if (!items.length) return;
      const index = items.findIndex((item) => item.id === selectedId);
      const next = (index + direction + items.length) % items.length;
      select(items[next].id, true);
    }

    return {
      available: false,
      activate(source, nextItems) {
        items = nextItems.map((item) => ({ ...item, source }));
        selectedId = items[0]?.id || null;
        renderLabels();
      },
      add(item) {
        items.push(item);
        renderLabels();
      },
      update(id, changes) {
        const item = items.find((entry) => entry.id === id);
        if (item) Object.assign(item, changes);
        renderLabels();
      },
      select,
      step,
      reset() {
        items = [];
        selectedId = null;
        labels.replaceChildren();
      },
    };
  }

  function create({ canvas, labels, onSelect }) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return createFallback(labels, onSelect);

    let program;
    try {
      program = createProgram(gl);
    } catch (error) {
      console.warn("GUISE orbit unavailable:", error);
      return createFallback(labels, onSelect);
    }

    const locations = {
      position: gl.getAttribLocation(program, "aPosition"),
      uv: gl.getAttribLocation(program, "aUv"),
      center: gl.getUniformLocation(program, "uCenter"),
      scale: gl.getUniformLocation(program, "uScale"),
      yaw: gl.getUniformLocation(program, "uYaw"),
      aspect: gl.getUniformLocation(program, "uAspect"),
      texture: gl.getUniformLocation(program, "uTexture"),
      time: gl.getUniformLocation(program, "uTime"),
      ready: gl.getUniformLocation(program, "uReady"),
      focus: gl.getUniformLocation(program, "uFocus"),
      failed: gl.getUniformLocation(program, "uFailed"),
      offset: gl.getUniformLocation(program, "uOffset"),
      motion: gl.getUniformLocation(program, "uMotion"),
    };

    const vertices = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    let items = [];
    let sourceTexture = null;
    let selectedIndex = 0;
    let targetPosition = 0;
    let position = 0;
    let velocity = 0;
    let lastFrameTime = 0;
    let pointerStart = null;
    let pointerPosition = 0;
    let wheelTimer = null;
    let running = false;
    let frame = 0;
    let lastAnnouncedId = null;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function makeTexture(url, callback) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 22, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        callback?.(texture);
      };
      image.onerror = () => callback?.(texture);
      image.src = url;
      return texture;
    }

    function buildLabel(item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "orbit-tag";
      button.dataset.id = item.id;
      button.innerHTML = `<span class="orbit-tag-name"></span><span class="orbit-tag-state"></span>`;
      button.querySelector(".orbit-tag-name").textContent = item.label;
      button.querySelector(".orbit-tag-state").textContent = item.state || "waiting";
      button.setAttribute("aria-label", `${item.label}, ${item.state || "waiting"}`);
      button.addEventListener("click", () => select(item.id, true));
      labels.appendChild(button);
      item.labelElement = button;
    }

    function updateLabel(item) {
      if (!item.labelElement) return;
      const state = item.state === "ready" ? "ready" : item.state === "failed" ? "retry" : item.state || "waiting";
      item.labelElement.querySelector(".orbit-tag-state").textContent = state;
      item.labelElement.setAttribute("aria-label", `${item.label}, ${state}`);
      item.labelElement.classList.toggle("ready", item.state === "ready");
      item.labelElement.classList.toggle("failed", item.state === "failed");
      item.labelElement.classList.toggle("selected", items[selectedIndex]?.id === item.id);
    }

    function select(id, announce = false) {
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) return;
      selectedIndex = index;
      targetPosition = position + wrapOffset(index - position, items.length);
      items.forEach(updateLabel);
      if (announce || lastAnnouncedId !== id) {
        lastAnnouncedId = id;
        onSelect(items[index]);
      }
    }

    function step(direction) {
      if (!items.length) return;
      const index = (selectedIndex + direction + items.length) % items.length;
      select(items[index].id, true);
    }

    function nearestIndex() {
      if (!items.length) return 0;
      return ((Math.round(position) % items.length) + items.length) % items.length;
    }

    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    }

    function render(now) {
      if (!running) return;
      resize();
      const deltaTime = Math.min(0.032, Math.max(0.001, (now - (lastFrameTime || now)) / 1000));
      lastFrameTime = now;
      if (reducedMotion) {
        position = targetPosition;
        velocity = 0;
      } else if (pointerStart === null) {
        const stiffness = 190;
        const damping = 28;
        velocity += ((targetPosition - position) * stiffness - velocity * damping) * deltaTime;
        position += velocity * deltaTime;
        if (Math.abs(targetPosition - position) < 0.0005 && Math.abs(velocity) < 0.004) {
          position = targetPosition;
          velocity = 0;
        }
      }

      gl.clearColor(0.035, 0.035, 0.043, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(locations.position);
      gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(locations.uv);
      gl.vertexAttribPointer(locations.uv, 2, gl.FLOAT, false, 16, 8);
      gl.uniform1f(locations.aspect, canvas.width / canvas.height);
      gl.uniform1f(locations.time, now * 0.001);
      gl.uniform1i(locations.texture, 0);

      const aspect = canvas.width / canvas.height;
      const compact = aspect < 0.82;
      const cardGap = compact ? 1.9 : 3.9;
      const mainScale = compact ? 1.18 : 1.9;
      const sideScale = compact ? 0.72 : 1.24;
      const motion = Math.min(1, Math.abs(velocity) * 0.14);
      const positioned = items
        .map((item, index) => {
          const offset = wrapOffset(index - position, items.length);
          const distance = Math.abs(offset);
          if (distance > 1.7) return null;
          const focus = 1 - Math.min(1, distance);
          const center = {
            x: offset * cardGap,
            y: -distance * 0.08,
            z: 2.35 - distance * 1.7,
          };
          return { item, index, offset, focus, center };
        })
        .filter(Boolean);
      positioned.sort((a, b) => a.center.z - b.center.z);

      positioned.forEach(({ item, offset, focus, center }) => {
        const scale = sideScale + (mainScale - sideScale) * focus;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, item.texture || sourceTexture);
        gl.uniform3f(locations.center, center.x, center.y, center.z);
        gl.uniform2f(locations.scale, scale, scale);
        gl.uniform1f(locations.yaw, -offset * (compact ? 0.16 : 0.27));
        gl.uniform1f(locations.ready, item.state === "ready" ? 1 : 0);
        gl.uniform1f(locations.failed, item.state === "failed" ? 1 : 0);
        gl.uniform1f(locations.focus, focus);
        gl.uniform1f(locations.offset, Math.max(-1, Math.min(1, offset)));
        gl.uniform1f(locations.motion, motion);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      });

      frame = requestAnimationFrame(render);
    }

    function activate(source, nextItems) {
      reset();
      sourceTexture = makeTexture(source);
      items = nextItems.map((item) => ({ ...item, texture: null, labelElement: null }));
      labels.replaceChildren();
      items.forEach(buildLabel);
      selectedIndex = 0;
      targetPosition = 0;
      position = 0;
      velocity = 0;
      lastFrameTime = 0;
      lastAnnouncedId = null;
      running = true;
      canvas.classList.add("on");
      labels.classList.add("on");
      frame = requestAnimationFrame(render);
      if (items[0]) select(items[0].id, true);
    }

    function add(item) {
      const next = { ...item, texture: null, labelElement: null };
      items.push(next);
      buildLabel(next);
      updateLabel(next);
    }

    function update(id, changes) {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      Object.assign(item, changes);
      if (changes.url) {
        item.texture = makeTexture(changes.url);
      }
      updateLabel(item);
    }

    function reset() {
      cancelAnimationFrame(frame);
      running = false;
      items.forEach((item) => item.texture && gl.deleteTexture(item.texture));
      if (sourceTexture) gl.deleteTexture(sourceTexture);
      sourceTexture = null;
      items = [];
      selectedIndex = 0;
      targetPosition = 0;
      position = 0;
      velocity = 0;
      lastFrameTime = 0;
      clearTimeout(wheelTimer);
      canvas.classList.remove("on");
      labels.classList.remove("on");
      labels.replaceChildren();
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (!running) return;
      pointerStart = event.clientX;
      pointerPosition = position;
      velocity = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add("dragging");
    });
    canvas.addEventListener("pointermove", (event) => {
      if (pointerStart === null) return;
      const sensitivity = canvas.clientWidth < 640 ? 0.0065 : 0.0034;
      position = pointerPosition - (event.clientX - pointerStart) * sensitivity;
      targetPosition = position;
    });
    canvas.addEventListener("pointerup", (event) => {
      if (pointerStart === null) return;
      canvas.releasePointerCapture(event.pointerId);
      pointerStart = null;
      canvas.classList.remove("dragging");
      const index = nearestIndex();
      select(items[index]?.id, true);
    });
    canvas.addEventListener("pointercancel", () => {
      pointerStart = null;
      canvas.classList.remove("dragging");
      const index = nearestIndex();
      select(items[index]?.id, true);
    });
    canvas.addEventListener(
      "wheel",
      (event) => {
        if (!running) return;
        event.preventDefault();
        const delta = event.deltaY || event.deltaX;
        targetPosition += Math.max(-0.28, Math.min(0.28, delta * 0.0022));
        clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
          const index = ((Math.round(targetPosition) % items.length) + items.length) % items.length;
          select(items[index]?.id, true);
        }, 90);
      },
      { passive: false }
    );
    canvas.addEventListener("keydown", (event) => {
      if (!running || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const index = (selectedIndex + direction + items.length) % items.length;
      select(items[index].id, true);
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(frame);
      document.body.classList.add("orbit-fallback");
    });

    return {
      available: true,
      activate,
      add,
      update,
      select,
      step,
      reset,
    };
  }

  window.GuiseOrbit = { create };
})();
