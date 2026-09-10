(() => {
  if (window.__motive?.active) {
    window.__motive.destroy();
    return;
  }

  const state = { active: true, target: null, x: innerWidth / 2, y: innerHeight / 2, open: false, selected: 0, session: null };
  const cursor = Object.assign(document.createElement("div"), { id: "motive-ext-cursor" });
  cursor.innerHTML = "<span>POINT AT AN INTERFACE OBJECT</span>";
  const bloom = Object.assign(document.createElement("div"), { id: "motive-ext-bloom" });
  ["Understand", "Trace", "Rewrite", "Plan"].forEach((label, index) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.dataset.intent = label.toLowerCase();
    button.dataset.selected = String(index === 0);
    bloom.append(button);
  });
  const lens = Object.assign(document.createElement("section"), { id: "motive-ext-lens", hidden: true });
  lens.innerHTML = '<header><span>SEMANTIC FALLBACK</span><button type="button" aria-label="Close Motive answer">×</button></header><h2></h2><p></p>';
  document.documentElement.append(cursor, bloom, lens);
  document.documentElement.classList.add("motive-on");

  const selectors = "button,a,input,textarea,select,[role],article,h1,h2,h3,p,li";
  const label = (element) =>
    element?.getAttribute("aria-label") || element?.textContent?.replace(/\s+/g, " ").trim().slice(0, 100) || element?.tagName.toLowerCase();
  const context = (element) => ({
    role: element?.getAttribute("role") || element?.tagName.toLowerCase(),
    label: label(element),
    nearby: element?.parentElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 280) || "",
  });

  async function ask(intent) {
    const data = context(state.target);
    lens.hidden = false;
    lens.style.left = `${Math.max(14, Math.min(innerWidth - 404, state.x + 26))}px`;
    lens.style.top = `${Math.max(70, Math.min(innerHeight - 230, state.y - 48))}px`;
    lens.querySelector("h2").textContent = `${intent[0].toUpperCase()}${intent.slice(1)} · ${data.label}`;
    const output = lens.querySelector("p");
    output.textContent = "Reading this object, not the whole page…";
    try {
      if (!state.session && "LanguageModel" in globalThis && (await LanguageModel.availability()) !== "unavailable") {
        state.session = await LanguageModel.create({
          initialPrompts: [
            {
              role: "system",
              content:
                "You are a spatial AI cursor. Use only supplied UI context. Answer in two concise sentences. Never claim an external action happened.",
            },
          ],
        });
      }
      if (state.session) {
        lens.querySelector("header span").textContent = "GEMINI NANO · ON DEVICE";
        let text = "";
        for await (const chunk of state.session.promptStreaming(`Intent: ${intent}. Interface context: ${JSON.stringify(data)}`)) {
          text += chunk;
          output.textContent = text;
        }
      } else {
        output.textContent = `${data.label} is a ${data.role}. Motive would send only this label and nearby context to the on-device model, then keep any proposed action behind confirmation.`;
      }
    } catch {
      output.textContent = "The on-device model is unavailable. This object remains selected, and no page data was sent elsewhere.";
    }
  }

  const onMove = (event) => {
    state.x = event.clientX;
    state.y = event.clientY;
    cursor.style.transform = `translate(${state.x - 14}px,${state.y - 14}px)`;
    if (state.open) {
      const angle = Math.atan2(state.y - state.originY, state.x - state.originX) * (180 / Math.PI);
      state.selected = angle >= -135 && angle < -45 ? 0 : angle >= -45 && angle < 45 ? 1 : angle >= 45 && angle < 135 ? 2 : 3;
      [...bloom.children].forEach((button, index) => (button.dataset.selected = String(index === state.selected)));
      return;
    }
    state.target = event.target.closest?.(selectors);
    cursor.dataset.target = String(Boolean(state.target));
    cursor.querySelector("span").textContent = state.target
      ? `${context(state.target).role.toUpperCase()} · ${label(state.target)}`
      : "POINT AT AN INTERFACE OBJECT";
  };

  const onDown = (event) => {
    if (event.key === "Escape") lens.hidden = true;
    if (event.key !== " " || event.repeat || !state.target || event.target.matches("input,textarea")) return;
    event.preventDefault();
    state.open = true;
    state.originX = state.x;
    state.originY = state.y;
    bloom.style.left = `${state.x}px`;
    bloom.style.top = `${state.y}px`;
    bloom.dataset.open = "true";
  };
  const onUp = (event) => {
    if (event.key !== " " || !state.open) return;
    event.preventDefault();
    state.open = false;
    bloom.dataset.open = "false";
    ask(bloom.children[state.selected].dataset.intent);
  };
  const close = () => (lens.hidden = true);
  lens.querySelector("button").addEventListener("click", close);
  document.addEventListener("pointermove", onMove, true);
  document.addEventListener("keydown", onDown, true);
  document.addEventListener("keyup", onUp, true);

  window.__motive = {
    active: true,
    destroy() {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("keydown", onDown, true);
      document.removeEventListener("keyup", onUp, true);
      document.documentElement.classList.remove("motive-on");
      cursor.remove();
      bloom.remove();
      lens.remove();
      window.__motive = null;
    },
  };
})();
