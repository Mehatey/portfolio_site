/* ══ THE LIVE PART ════════════════════════════════════════════════════════
   Sid: "make it live instead of just saying a prerecorded clip with pills."

   tv-head-viewer.js owns the cube and its visual reactions. This file owns
   everything that lets a
   visitor actually talk to it: typed or spoken input, a small model answering
   it live in the browser, and the customize panel for voice and scene.

   The model is Llama-3.2-1B-Instruct, the same one this site's other
   browser-AI pieces (Mirror, Amnesiac) already use, run entirely on-device
   through WebGPU via web-llm. No account, no key, no server. A device with
   no WebGPU gets a clear, honest fallback instead of fake scripted dialogue. */
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
    var micButton = document.getElementById("cube-ask-mic");
    var statusEl = document.getElementById("cube-ask-status");
    var tune = document.getElementById("cube-tune");
    var tuneToggle = document.getElementById("cube-tune-toggle");
    var tunePanel = document.getElementById("cube-tune-panel");
    var modeRow = document.getElementById("cube-tune-mode");
    var personaRow = document.getElementById("cube-tune-persona");
    var sceneRow = document.getElementById("cube-tune-scene");
    var tuneNote = document.getElementById("cube-tune-note");
    if (!form || !input) return;

    /* ── CUSTOMIZE: VOICE MODE + DELIVERY + SCENE ─────────────────────── */
    var voiceMode = sidCube.getVoiceMode();
    var personaIndex = -1;

    function renderModeRow() {
      modeRow.replaceChildren();
      [
        { id: "ai", label: "AI voice" },
        { id: "sid", label: "Sid voice, needs sample" },
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
      autoBtn.textContent = "Natural";
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
          ? "Sid voice activates after Sid supplies and approves a voice sample. AI voice stays on until then."
          : "AI voice speaks live replies in the browser. Your conversation is not a prerecorded clip.";
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

    function unavailableReply() {
      return "I can’t start my local brain on this device yet. Try a browser with WebGPU enabled, or come back when the live service is connected.";
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
        statusEl.textContent = "";
        sidCube.ask(unavailableReply(), null, null);
      } finally {
        busy = false;
      }
    });

    /* Browser speech recognition keeps the interaction conversational without
       pretending a recording exists. It is optional because Firefox and some
       privacy configurations do not expose it. */
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (micButton) {
        micButton.hidden = true;
        micButton.setAttribute("aria-hidden", "true");
      }
    } else if (micButton) {
      var recognition = new SpeechRecognition();
      recognition.lang = navigator.language || "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.addEventListener("start", function () {
        micButton.classList.add("is-listening");
        statusEl.textContent = "Listening";
      });
      recognition.addEventListener("result", function (event) {
        input.value = event.results[event.results.length - 1][0].transcript.trim();
        form.requestSubmit();
      });
      recognition.addEventListener("end", function () {
        micButton.classList.remove("is-listening");
        if (!busy) statusEl.textContent = "";
      });
      recognition.addEventListener("error", function () {
        micButton.classList.remove("is-listening");
        statusEl.textContent = "Microphone unavailable";
      });
      micButton.addEventListener("click", function () {
        try {
          recognition.start();
        } catch (_) {
          recognition.stop();
        }
      });
    }

    sidCube.focusConversation = function () {
      // The canvas itself is focusable (tabindex, for keyboard activation),
      // so a click's own default focus handling runs right after this and
      // would otherwise steal it straight back.
      setTimeout(function () {
        input.focus({ preventScroll: true });
      }, 0);
    };
  });
})();
