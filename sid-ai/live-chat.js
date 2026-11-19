/* ══ THE LIVE PART ════════════════════════════════════════════════════════
   Sid: "make it live instead of just saying a prerecorded clip with pills."

   tv-head-viewer.js owns the cube, the two voices, and the thirteen
   scripted answers it ships with. This file owns everything that lets a
   visitor actually talk to it: a typed question, a small model answering
   it live in the browser, and the customize panel for voice and character.

   The model is Llama-3.2-1B-Instruct, the same one this site's other
   browser-AI pieces (Mirror, Amnesiac) already use, run entirely on-device
   through WebGPU via web-llm. No account, no key, no server. A device with
   no WebGPU gets a keyword match over the same thirteen answers instead of
   a live one; it is told so, rather than left to guess why its answers are
   suddenly less specific. */
(function () {
  "use strict";

  function ready(fn) {
    if (window.sidCube) return fn();
    var tries = 0;
    (function poll() {
      if (window.sidCube || ++tries > 200) return fn();
      requestAnimationFrame(poll);
    })();
  }

  ready(function () {
    var sidCube = window.sidCube;
    var form = document.getElementById("cube-ask");
    var input = document.getElementById("cube-ask-input");
    var suggestRow = document.getElementById("cube-ask-suggest");
    var statusEl = document.getElementById("cube-ask-status");
    var tune = document.getElementById("cube-tune");
    var tuneToggle = document.getElementById("cube-tune-toggle");
    var tunePanel = document.getElementById("cube-tune-panel");
    var modeRow = document.getElementById("cube-tune-mode");
    var personaRow = document.getElementById("cube-tune-persona");
    var sceneRow = document.getElementById("cube-tune-scene");
    var tuneNote = document.getElementById("cube-tune-note");
    if (!form || !input) return;

    /* ── SUGGESTED OPENERS ─────────────────────────────────────────────
       Plain text, not pills. An underline on hover is the whole affordance. */
    var STARTERS = ["who", "best", "reach"];
    STARTERS.forEach(function (id) {
      var node = sidCube.cubeScript[id];
      if (!node) return;
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = sidCube.chipLabels[id] || node.q;
      button.addEventListener("click", function () {
        input.value = node.q;
        form.requestSubmit();
      });
      suggestRow.appendChild(button);
    });

    /* ── CUSTOMIZE: VOICE MODE + CHARACTER ─────────────────────────────── */
    var voiceMode = sidCube.getVoiceMode();
    var personaIndex = -1;

    function renderModeRow() {
      modeRow.replaceChildren();
      [
        { id: "ai", label: "AI voice" },
        { id: "sid", label: "Sid’s voice" },
      ].forEach(function (opt) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = opt.label;
        b.className = voiceMode === opt.id ? "is-active" : "";
        b.addEventListener("click", function () {
          voiceMode = opt.id;
          sidCube.setVoiceMode(voiceMode);
          renderModeRow();
          renderNote();
        });
        modeRow.appendChild(b);
      });
    }
    function renderPersonaRow() {
      personaRow.replaceChildren();
      var autoBtn = document.createElement("button");
      autoBtn.type = "button";
      autoBtn.textContent = "Auto";
      autoBtn.className = personaIndex < 0 ? "is-active" : "";
      autoBtn.addEventListener("click", function () {
        personaIndex = -1;
        sidCube.setPersona(personaIndex);
        renderPersonaRow();
      });
      personaRow.appendChild(autoBtn);
      sidCube.voiceVariants.forEach(function (voice, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = voice.name;
        b.className = personaIndex === i ? "is-active" : "";
        b.addEventListener("click", function () {
          personaIndex = i;
          sidCube.setPersona(personaIndex);
          renderPersonaRow();
        });
        personaRow.appendChild(b);
      });
    }
    function renderNote() {
      tuneNote.textContent =
        voiceMode === "sid"
          ? "Plays a real recording where one exists. Falls back to AI voice on anything that hasn’t been recorded yet."
          : "Spoken live by the browser, so it can say anything, not just the thirteen answers Sid wrote out.";
    }
    /* The room the cube sits in. The vinyl player in the corner already does
       the actual playing; this is just a second, discoverable way to reach
       the same three controls, for a visitor who wants the cube "chilling,
       playing music" without hunting for the small disc. */
    function renderSceneRow() {
      sceneRow.replaceChildren();
      var playBtn = document.createElement("button");
      var sync = function () {
        var on = window.sidVinyl && window.sidVinyl.state().playing;
        playBtn.textContent = on ? "Pause music" : "Play music";
        playBtn.className = on ? "is-active" : "";
      };
      playBtn.type = "button";
      playBtn.addEventListener("click", function () {
        if (!window.sidVinyl) return;
        var on = window.sidVinyl.state().playing;
        if (on) window.sidVinyl.pause();
        else window.sidVinyl.play();
        sync();
      });
      sceneRow.appendChild(playBtn);
      var nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.textContent = "Next track";
      nextBtn.addEventListener("click", function () {
        if (window.sidVinyl) window.sidVinyl.next();
        sync();
      });
      sceneRow.appendChild(nextBtn);
      sync();
    }

    renderModeRow();
    renderPersonaRow();
    renderSceneRow();
    renderNote();

    tuneToggle.addEventListener("click", function () {
      var open = tune.classList.toggle("is-open");
      tuneToggle.setAttribute("aria-expanded", String(open));
      if (open) renderSceneRow();
    });
    document.addEventListener("click", function (e) {
      if (tune.classList.contains("is-open") && !tune.contains(e.target)) {
        tune.classList.remove("is-open");
        tuneToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && tune.classList.contains("is-open")) {
        tune.classList.remove("is-open");
        tuneToggle.setAttribute("aria-expanded", "false");
        tuneToggle.focus();
      }
    });

    /* ── THE MODEL ──────────────────────────────────────────────────────
       Built lazily, on the first real question, so a visitor who never
       types anything never triggers a multi-hundred-megabyte download. */
    var MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
    var enginePromise = null;
    var gpuChecked = false;
    var gpuOk = false;

    async function checkGpu() {
      if (gpuChecked) return gpuOk;
      gpuChecked = true;
      if (!navigator.gpu) return (gpuOk = false);
      try {
        var adapter = await navigator.gpu.requestAdapter();
        gpuOk = !!adapter;
      } catch (_) {
        gpuOk = false;
      }
      return gpuOk;
    }

    async function getEngine() {
      if (enginePromise) return enginePromise;
      enginePromise = (async function () {
        var webllm = await import("https://esm.run/@mlc-ai/web-llm");
        return webllm.CreateMLCEngine(MODEL_ID, {
          initProgressCallback: function (report) {
            statusEl.textContent = report.text && report.progress < 1 ? "Warming up the model, " + Math.round(report.progress * 100) + "%" : "";
          },
        });
      })();
      enginePromise.catch(function () {
        enginePromise = null;
      });
      return enginePromise;
    }

    function buildSystemPrompt() {
      var facts = Object.values(sidCube.cubeScript)
        .map(function (n) {
          return "Q: " + n.q + " A: " + n.a;
        })
        .join("\n");
      return [
        "You are the voice of a small glass cube on Sid Mehta's portfolio website, speaking as Sid in first person: casual, direct, a little dry.",
        "Only use the facts below. If something is not covered, say you do not have that on hand and suggest reaching him by email instead of inventing an answer.",
        "Answer in one to three short sentences meant to be spoken aloud. No markdown, no lists, no emoji, no stage directions.",
        "Never use an em dash or en dash. Use a comma or a period instead.",
        "Facts:",
        facts,
      ].join("\n");
    }

    function sanitize(text) {
      return String(text || "")
        .replace(/[–—]/g, ", ")
        .replace(/\s*,\s*,/g, ",")
        .replace(/\s{2,}/g, " ")
        .trim();
    }

    async function askLive(question) {
      var engine = await getEngine();
      var completion = await engine.chat.completions.create({
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: question },
        ],
        temperature: 0.65,
        max_tokens: 140,
      });
      var text = completion.choices && completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
      text = sanitize(text);
      if (!text) throw new Error("empty-reply");
      return text;
    }

    /* ── THE FALLBACK ────────────────────────────────────────────────────
       No WebGPU, or the model failed to load: match the question against
       the thirteen written answers by shared words, rather than failing
       silently. Because this reuses a real scripted node, it is also the
       one path where "Sid's voice" can still play an actual recording. */
    function fallbackMatch(question) {
      var q = question.toLowerCase();
      var words = q.split(/[^a-z0-9]+/).filter(function (w) {
        return w.length > 2;
      });
      var bestId = null,
        bestScore = 0;
      Object.keys(sidCube.cubeScript).forEach(function (id) {
        var node = sidCube.cubeScript[id];
        var hay = (id + " " + node.q).toLowerCase();
        var score = 0;
        words.forEach(function (w) {
          if (hay.indexOf(w) >= 0) score++;
        });
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      });
      var id = bestId || "who";
      return { id: id, text: sidCube.cubeScript[id].a };
    }

    var busy = false;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (busy) return;
      var question = input.value.trim();
      if (!question) return;
      input.value = "";
      input.blur();
      busy = true;
      statusEl.textContent = "Thinking";
      try {
        var canLive = await checkGpu();
        if (!canLive) throw new Error("no-webgpu");
        var text = await askLive(question);
        statusEl.textContent = "";
        sidCube.ask(text, null, null);
      } catch (err) {
        var match = fallbackMatch(question);
        statusEl.textContent = gpuChecked && !gpuOk ? "This device has no WebGPU, so these are the quick answers." : "";
        sidCube.ask(match.text, match.id, null);
      } finally {
        busy = false;
      }
    });
  });
})();
