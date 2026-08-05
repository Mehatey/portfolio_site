(() => {
  "use strict";

  const cards = [
    {
      roman: "00",
      name: "The Fool",
      glyph: "✺",
      element: "Air",
      colors: ["#ed7b69", "#62aeb4", "#392849"],
      hue: "-8deg",
      root: 196,
      intervals: [0, 7, 12, 16, 19],
      wave: "sine",
      essence: "The first step, taken before certainty.",
      upright: "A beginning is asking for trust. You do not need the whole map; you need enough openness to take the first honest step.",
      reversed: "Freedom has become avoidance. The leap is not wrong, but it needs one clear intention before you leave the ground.",
      invitation: "take one imperfect step before asking for certainty",
    },
    {
      roman: "I",
      name: "The Magician",
      glyph: "✦",
      element: "Fire",
      colors: ["#c84362", "#294d8d", "#34172f"],
      hue: "18deg",
      root: 220,
      intervals: [0, 4, 7, 12, 16],
      wave: "triangle",
      essence: "Will becoming form.",
      upright: "Your attention is powerful enough to change the material in front of you. Gather what you already have and direct it deliberately.",
      reversed: "Your energy is scattered across too many possible selves. Power returns when performance ends and intention becomes specific.",
      invitation: "name the one thing you are ready to make real",
    },
    {
      roman: "II",
      name: "The High Priestess",
      glyph: "☾",
      element: "Water",
      colors: ["#4e568d", "#89b8bd", "#282440"],
      hue: "82deg",
      root: 174.61,
      intervals: [0, 5, 7, 12, 14],
      wave: "sine",
      essence: "Knowledge that arrives before language.",
      upright: "Something in you already knows. Give the quiet signal more authority than the explanation you are trying to force around it.",
      reversed: "Intuition is being drowned out by projection. Wait until the feeling becomes quieter, cleaner, and less invested in one outcome.",
      invitation: "listen for the answer that does not need to persuade you",
    },
    {
      roman: "III",
      name: "The Empress",
      glyph: "❀",
      element: "Earth",
      colors: ["#d65f79", "#5e967d", "#4a2742"],
      hue: "-28deg",
      root: 164.81,
      intervals: [0, 4, 7, 11, 16],
      wave: "sine",
      essence: "Creation through care and abundance.",
      upright: "What you nourish will answer. Make the conditions generous enough for the next version of you to grow without being rushed.",
      reversed: "Care has become depletion. Restore your own ground before asking yourself to keep producing beauty for everyone else.",
      invitation: "offer your energy only where it can take root",
    },
    {
      roman: "IV",
      name: "The Emperor",
      glyph: "△",
      element: "Fire",
      colors: ["#c64f3c", "#d59b45", "#55251f"],
      hue: "2deg",
      root: 146.83,
      intervals: [0, 7, 12, 15, 19],
      wave: "triangle",
      essence: "A structure strong enough to hold life.",
      upright: "Clarity needs a boundary. Decide what you are responsible for, what you are not, and what must remain steady.",
      reversed: "Control is tightening around something that needs movement. A useful structure protects life; it does not replace it.",
      invitation: "create one boundary that makes your freedom possible",
    },
    {
      roman: "V",
      name: "The Hierophant",
      glyph: "⌘",
      element: "Earth",
      colors: ["#9f7653", "#6f9279", "#49362e"],
      hue: "42deg",
      root: 185,
      intervals: [0, 5, 10, 12, 17],
      wave: "sine",
      essence: "Tradition examined, inherited wisdom chosen.",
      upright: "There is wisdom in a path walked before you. Learn its language fully, then decide what deserves to be carried forward.",
      reversed: "A borrowed rule is asking to be questioned. Respect does not require obedience to a form that no longer holds truth.",
      invitation: "keep the wisdom and release the rule",
    },
    {
      roman: "VI",
      name: "The Lovers",
      glyph: "♡",
      element: "Air",
      colors: ["#dc6880", "#7699be", "#4a2947"],
      hue: "-14deg",
      root: 207.65,
      intervals: [0, 4, 7, 11, 12],
      wave: "sine",
      essence: "A choice that reveals your values.",
      upright: "Connection is asking for congruence. Choose the relationship, promise, or path that lets you remain whole inside it.",
      reversed:
        "Harmony is being purchased through self-abandonment. The real choice is not between two people or paths, but between alignment and approval.",
      invitation: "choose what allows truth and tenderness to coexist",
    },
    {
      roman: "VII",
      name: "The Chariot",
      glyph: "◇",
      element: "Water",
      colors: ["#2d6f91", "#66b4a8", "#1e3855"],
      hue: "112deg",
      root: 155.56,
      intervals: [0, 2, 7, 12, 14],
      wave: "triangle",
      essence: "Feeling given direction.",
      upright: "Contradictory forces can move together when your deeper intention holds the reins. Choose a direction and inhabit it.",
      reversed: "Momentum is masking inner conflict. Slow down long enough to notice which part of you is refusing the destination.",
      invitation: "move from inner agreement, not urgency",
    },
    {
      roman: "VIII",
      name: "Strength",
      glyph: "∞",
      element: "Fire",
      colors: ["#e98b45", "#d45d6c", "#5b302d"],
      hue: "-5deg",
      root: 233.08,
      intervals: [0, 4, 9, 12, 16],
      wave: "sine",
      essence: "Power that does not need violence.",
      upright:
        "Meet the wild part with presence rather than force. Your gentleness is not the opposite of courage; it is how courage becomes sustainable.",
      reversed: "Self-doubt is consuming energy that belongs to the moment. Stop demanding fearlessness and practice staying present while afraid.",
      invitation: "approach the difficult thing without becoming hard",
    },
    {
      roman: "IX",
      name: "The Hermit",
      glyph: "⌁",
      element: "Earth",
      colors: ["#395879", "#d4a653", "#302d42"],
      hue: "65deg",
      root: 138.59,
      intervals: [0, 5, 7, 10, 12],
      wave: "sine",
      essence: "A lamp lit by solitude.",
      upright: "Step far enough from the noise to hear your own measure. Solitude is useful when it returns you to the world more truthful.",
      reversed: "Retreat has stopped restoring you. Bring the small light you found back into relationship before it becomes a hiding place.",
      invitation: "protect quiet, then return with what it taught you",
    },
    {
      roman: "X",
      name: "Wheel of Fortune",
      glyph: "☸",
      element: "Fire",
      colors: ["#cb6c55", "#d1aa45", "#47344f"],
      hue: "24deg",
      root: 246.94,
      intervals: [0, 3, 7, 10, 15],
      wave: "triangle",
      essence: "The turning no one controls.",
      upright: "The pattern is changing. Participate where you have agency, and let movement carry away what effort alone could not shift.",
      reversed: "Resistance is making a temporary turn feel permanent. The cycle is still moving, even if you cannot yet feel the ground change.",
      invitation: "work with the turn instead of bargaining for the past",
    },
    {
      roman: "XI",
      name: "Justice",
      glyph: "⚖",
      element: "Air",
      colors: ["#8f536f", "#5b7ea3", "#39293f"],
      hue: "145deg",
      root: 176,
      intervals: [0, 6, 7, 12, 18],
      wave: "sine",
      essence: "Truth with consequence.",
      upright: "Look at the whole pattern without editing out your part in it. A fair decision may be tender, but it must also be clear.",
      reversed: "The scale is being asked to confirm what you already want. Return to the evidence you have been minimizing.",
      invitation: "make the choice you can stand beside in full light",
    },
    {
      roman: "XII",
      name: "The Hanged One",
      glyph: "⟡",
      element: "Water",
      colors: ["#56769c", "#68a89a", "#30374e"],
      hue: "96deg",
      root: 130.81,
      intervals: [0, 5, 8, 12, 17],
      wave: "sine",
      essence: "A pause that changes the view.",
      upright: "Do not mistake stillness for failure. The situation is rearranging itself around a perspective you could not reach while pushing.",
      reversed: "Suspension has become delay. If the insight has arrived, sacrifice the comfort of waiting and let it change your behavior.",
      invitation: "release the need to solve what first needs to be seen differently",
    },
    {
      roman: "XIII",
      name: "Death",
      glyph: "✣",
      element: "Water",
      colors: ["#5f3f67", "#397d75", "#251e32"],
      hue: "120deg",
      root: 123.47,
      intervals: [0, 3, 7, 12, 15],
      wave: "triangle",
      essence: "The honest ending that makes space.",
      upright: "A form has completed its work. Grief and liberation may arrive together; let the ending be real enough to clear the ground.",
      reversed: "You are negotiating with what has already ended. The energy trapped in holding on is the energy the new life needs.",
      invitation: "honor the ending without asking it to become a beginning again",
    },
    {
      roman: "XIV",
      name: "Temperance",
      glyph: "⚗",
      element: "Fire",
      colors: ["#e09a4c", "#58a8a1", "#50354d"],
      hue: "34deg",
      root: 192,
      intervals: [0, 4, 7, 9, 14],
      wave: "sine",
      essence: "A third way made from opposites.",
      upright: "The answer is being mixed slowly. Let desire and patience, instinct and reason, grief and hope share the same vessel.",
      reversed: "One force is flooding the whole system. Balance will not come from suppression, but from restoring the missing ingredient.",
      invitation: "combine what you thought had to remain separate",
    },
    {
      roman: "XV",
      name: "The Devil",
      glyph: "♄",
      element: "Earth",
      colors: ["#934751", "#9e7640", "#3e2632"],
      hue: "-44deg",
      root: 116.54,
      intervals: [0, 3, 6, 10, 12],
      wave: "triangle",
      essence: "The attachment that gains power in darkness.",
      upright: "Name the bargain without shame. What feels inevitable may be a pattern maintained by secrecy, appetite, or fear.",
      reversed: "The chain has loosened because you can finally see it. Freedom begins as a small refusal repeated until it becomes a life.",
      invitation: "bring the hidden bargain into language",
    },
    {
      roman: "XVI",
      name: "The Tower",
      glyph: "ϟ",
      element: "Fire",
      colors: ["#d34e43", "#596ca0", "#472337"],
      hue: "172deg",
      root: 110,
      intervals: [0, 1, 6, 11, 13],
      wave: "sawtooth",
      essence: "Truth arriving faster than the structure can adapt.",
      upright: "What falls was already unable to hold the truth. Protect what is alive, then let the false architecture come down.",
      reversed: "You feel the crack and keep decorating around it. A chosen disruption now may prevent a harsher one later.",
      invitation: "stop rebuilding the part that truth has already left",
    },
    {
      roman: "XVII",
      name: "The Star",
      glyph: "✶",
      element: "Air",
      colors: ["#4c78b6", "#63b6ac", "#342e58"],
      hue: "102deg",
      root: 261.63,
      intervals: [0, 4, 7, 14, 19],
      wave: "sine",
      essence: "Hope after the old certainty breaks.",
      upright:
        "Let hope become practical. Follow the small clear signal, restore your energy, and trust the horizon without demanding proof from it.",
      reversed: "The light has not vanished; exhaustion has narrowed your field of view. Tend to the body before judging the future.",
      invitation: "act as if renewal deserves one small place to begin",
    },
    {
      roman: "XVIII",
      name: "The Moon",
      glyph: "☽",
      element: "Water",
      colors: ["#5c5790", "#7da5b0", "#302946"],
      hue: "78deg",
      root: 146,
      intervals: [0, 2, 5, 9, 14],
      wave: "sine",
      essence: "The path through uncertainty and dream.",
      upright: "Not everything unclear is dangerous. Move by felt sense, verify what you can, and allow mystery to remain mystery.",
      reversed: "The fog is beginning to lift. Do not rush to replace one illusion with another explanation that only feels cleaner.",
      invitation: "walk slowly enough to separate intuition from fear",
    },
    {
      roman: "XIX",
      name: "The Sun",
      glyph: "☼",
      element: "Fire",
      colors: ["#eda53d", "#e46e59", "#623b2d"],
      hue: "-20deg",
      root: 277.18,
      intervals: [0, 4, 7, 12, 19],
      wave: "triangle",
      essence: "Life becoming visible to itself.",
      upright: "Let joy be information. What feels warm, open, and uncomplicated is not naive; it may be the clearest truth in the room.",
      reversed: "You are postponing joy until it can be justified. A smaller sun is still a sun; receive what is already good.",
      invitation: "move toward what makes you more alive and more honest",
    },
    {
      roman: "XX",
      name: "Judgement",
      glyph: "♩",
      element: "Fire",
      colors: ["#c86a6f", "#6d82ae", "#4e2a49"],
      hue: "155deg",
      root: 208,
      intervals: [0, 5, 7, 12, 17],
      wave: "sine",
      essence: "The call to become who your life prepared.",
      upright:
        "The past is not asking for punishment; it is asking to be integrated. Answer the call that becomes audible when self-judgment quiets.",
      reversed: "You are waiting for an external verdict on a life only you can inhabit. The permission you need is already yours to give.",
      invitation: "respond to the call instead of rehearsing why you cannot",
    },
    {
      roman: "XXI",
      name: "The World",
      glyph: "◎",
      element: "Earth",
      colors: ["#a45d7d", "#4b9285", "#3b354e"],
      hue: "132deg",
      root: 164,
      intervals: [0, 4, 7, 11, 14, 19],
      wave: "sine",
      essence: "Completion that includes every version of the journey.",
      upright: "The pieces belong to one life. Let yourself arrive, receive what the cycle made possible, and step across the threshold whole.",
      reversed: "You keep withholding completion for one final proof. The circle closes when you stop treating arrival as something to earn.",
      invitation: "name what is complete and let yourself receive it",
    },
  ];

  const signs = [
    {
      name: "Capricorn",
      symbol: "♑",
      element: "Earth",
      start: [12, 22],
      end: [1, 19],
      instinct: "building what can endure",
      colors: ["#9b6e62", "#607d72"],
    },
    {
      name: "Aquarius",
      symbol: "♒",
      element: "Air",
      start: [1, 20],
      end: [2, 18],
      instinct: "seeing the pattern from outside it",
      colors: ["#587eb8", "#67aaa7"],
    },
    {
      name: "Pisces",
      symbol: "♓",
      element: "Water",
      start: [2, 19],
      end: [3, 20],
      instinct: "feeling what has not yet been spoken",
      colors: ["#6b63a3", "#6da9a8"],
    },
    {
      name: "Aries",
      symbol: "♈",
      element: "Fire",
      start: [3, 21],
      end: [4, 19],
      instinct: "meeting life through motion",
      colors: ["#d4524e", "#e79643"],
    },
    {
      name: "Taurus",
      symbol: "♉",
      element: "Earth",
      start: [4, 20],
      end: [5, 20],
      instinct: "trusting what the body can verify",
      colors: ["#af6b70", "#6e9479"],
    },
    {
      name: "Gemini",
      symbol: "♊",
      element: "Air",
      start: [5, 21],
      end: [6, 20],
      instinct: "finding the language that makes movement possible",
      colors: ["#d59d3f", "#648da7"],
    },
    {
      name: "Cancer",
      symbol: "♋",
      element: "Water",
      start: [6, 21],
      end: [7, 22],
      instinct: "protecting what carries emotional truth",
      colors: ["#5f7ca5", "#8da9ad"],
    },
    {
      name: "Leo",
      symbol: "♌",
      element: "Fire",
      start: [7, 23],
      end: [8, 22],
      instinct: "bringing the heart fully into view",
      colors: ["#e39a39", "#d45c5e"],
    },
    {
      name: "Virgo",
      symbol: "♍",
      element: "Earth",
      start: [8, 23],
      end: [9, 22],
      instinct: "making care precise and useful",
      colors: ["#9b8059", "#708b70"],
    },
    {
      name: "Libra",
      symbol: "♎",
      element: "Air",
      start: [9, 23],
      end: [10, 22],
      instinct: "seeking the shape where truth and harmony meet",
      colors: ["#c76d8b", "#6f8fac"],
    },
    {
      name: "Scorpio",
      symbol: "♏",
      element: "Water",
      start: [10, 23],
      end: [11, 21],
      instinct: "following the feeling to its hidden root",
      colors: ["#8c4c70", "#486e72"],
    },
    {
      name: "Sagittarius",
      symbol: "♐",
      element: "Fire",
      start: [11, 22],
      end: [12, 21],
      instinct: "moving toward the meaning beyond the moment",
      colors: ["#a45c88", "#d27f43"],
    },
  ];

  const positions = [
    { label: "01 · Root", prompt: "What is underneath this moment" },
    { label: "02 · Mirror", prompt: "What wants to be seen clearly" },
    { label: "03 · Becoming", prompt: "What you are being invited toward" },
  ];

  const els = {
    welcome: document.querySelector("#welcome"),
    birthForm: document.querySelector("#birth-form"),
    birthDate: document.querySelector("#birth-date"),
    seekerName: document.querySelector("#seeker-name"),
    question: document.querySelector("#question"),
    questionCount: document.querySelector("#question-count"),
    formError: document.querySelector("#form-error"),
    todayLabel: document.querySelector("#today-label"),
    moonLabel: document.querySelector("#moon-label"),
    ritual: document.querySelector("#ritual"),
    signSeal: document.querySelector("#sign-seal"),
    signSymbol: document.querySelector("#sign-symbol"),
    profileHeading: document.querySelector("#profile-heading"),
    profileCopy: document.querySelector("#profile-copy"),
    profileSign: document.querySelector("#profile-sign"),
    profileSeason: document.querySelector("#profile-season"),
    profileMoon: document.querySelector("#profile-moon"),
    ritualQuestion: document.querySelector("#ritual-question"),
    shuffleStack: document.querySelector("#shuffle-stack"),
    shuffleOrbit: document.querySelector("#shuffle-orbit"),
    shuffleButton: document.querySelector("#shuffle-button"),
    shuffleStatus: document.querySelector("#shuffle-status"),
    reading: document.querySelector("#reading"),
    readingPersonalization: document.querySelector("#reading-personalization"),
    spread: document.querySelector("#spread"),
    oracleResponse: document.querySelector("#oracle-response"),
    oracleText: document.querySelector("#oracle-text"),
    reflectionPrompt: document.querySelector("#reflection-prompt"),
    copyReading: document.querySelector("#copy-reading"),
    newReading: document.querySelector("#new-reading"),
    soundControl: document.querySelector("#sound-control"),
    footerSound: document.querySelector("#footer-sound"),
    stageWash: document.querySelector("#stage-wash"),
    announcer: document.querySelector("#announcer"),
    deckDialog: document.querySelector("#deck-dialog"),
    deckGrid: document.querySelector("#deck-grid"),
    deckDetailArt: document.querySelector("#deck-detail-art"),
    deckDetailGlyph: document.querySelector("#deck-detail-glyph"),
    deckDetailNumber: document.querySelector("#deck-detail-number"),
    deckDetailName: document.querySelector("#deck-detail-name"),
    deckDetailMeaning: document.querySelector("#deck-detail-meaning"),
    deckDetailListen: document.querySelector("#deck-detail-listen"),
    closeDeck: document.querySelector("#close-deck"),
    starCanvas: document.querySelector("#star-canvas"),
  };

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  let seeker = null;
  let currentReading = null;
  let selectedDeckCard = cards[0];
  let soundEnabled = false;
  let audioContext = null;
  let activeAudio = [];
  let lastDeckTrigger = null;
  let isShuffling = false;

  const asTextSymbol = (symbol) => `${symbol}\uFE0E`;

  const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const seededRandom = (seed) => {
    let state = seed || 1;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  };

  const dateKey = (month, day) => month * 100 + day;

  const getSunSign = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = dateKey(month, day);
    return signs.find((sign) => {
      const start = dateKey(...sign.start);
      const end = dateKey(...sign.end);
      return start <= end ? key >= start && key <= end : key >= start || key <= end;
    });
  };

  const getMoonPhase = (date) => {
    const synodicMonth = 29.53058867;
    const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
    const days = (date.getTime() - knownNewMoon) / 86400000;
    const age = ((days % synodicMonth) + synodicMonth) % synodicMonth;
    const index = Math.floor(((age / synodicMonth) * 8 + 0.5) % 8);
    return [
      { name: "New Moon", symbol: "●", energy: "beginnings, listening, and quiet intention" },
      { name: "Waxing Crescent", symbol: "◔", energy: "first movement, commitment, and tender momentum" },
      { name: "First Quarter", symbol: "◐", energy: "decision, friction, and courageous adjustment" },
      { name: "Waxing Gibbous", symbol: "◕", energy: "refinement, patience, and gathering power" },
      { name: "Full Moon", symbol: "○", energy: "illumination, feeling, and honest culmination" },
      { name: "Waning Gibbous", symbol: "◕", energy: "integration, gratitude, and shared wisdom" },
      { name: "Last Quarter", symbol: "◑", energy: "release, reorientation, and clean endings" },
      { name: "Waning Crescent", symbol: "◔", energy: "rest, forgiveness, and return to stillness" },
    ][index];
  };

  const moon = getMoonPhase(now);
  const season = getSunSign(now);

  const setAtmosphere = (first, second) => {
    document.documentElement.style.setProperty("--atmosphere-a", first);
    document.documentElement.style.setProperty("--atmosphere-b", second);
  };

  const localDateLabel = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const stageTransition = (callback) => {
    els.stageWash.classList.add("is-active");
    window.setTimeout(callback, 520);
    window.setTimeout(() => els.stageWash.classList.remove("is-active"), 1450);
  };

  const ensureAudio = () => {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  };

  const stopActiveAudio = () => {
    activeAudio.forEach((node) => {
      try {
        node.stop?.();
        node.disconnect?.();
      } catch {
        // Node may already have completed naturally.
      }
    });
    activeAudio = [];
  };

  const playWelcomeChime = () => {
    if (!soundEnabled) return;
    const context = ensureAudio();
    [0, 0.13, 0.3].forEach((delay, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime([261.63, 329.63, 392][index], context.currentTime + delay);
      gain.gain.setValueAtTime(0.0001, context.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + delay + 1.5);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + delay);
      oscillator.stop(context.currentTime + delay + 1.6);
      activeAudio.push(oscillator, gain);
    });
  };

  const playShuffleSound = () => {
    if (!soundEnabled) return;
    const context = ensureAudio();
    const length = Math.floor(context.sampleRate * 2.2);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    const random = seededRandom(hashString(`${todayKey}:shuffle`));
    for (let index = 0; index < length; index += 1) {
      const envelope = Math.sin((index / length) * Math.PI);
      channel[index] = (random() * 2 - 1) * envelope * 0.25;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    filter.Q.value = 0.8;
    gain.gain.value = 0.08;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    activeAudio.push(source, filter, gain);
  };

  const playCardMusic = (card, variation = 0) => {
    if (!soundEnabled) setSound(true);
    stopActiveAudio();
    const context = ensureAudio();
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.075, context.currentTime + 0.3);
    master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 7.2);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600 + variation * 180, context.currentTime);
    master.connect(filter).connect(context.destination);
    activeAudio.push(master, filter);

    const sequence = [...card.intervals, ...card.intervals.slice(1).reverse()];
    sequence.forEach((semitone, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.52;
      const frequency = card.root * 2 ** (semitone / 12);
      oscillator.type = card.wave;
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.detune.setValueAtTime((variation - 1) * 3, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(index % 3 === 0 ? 0.11 : 0.065, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.35);
      oscillator.connect(gain).connect(master);
      oscillator.start(start);
      oscillator.stop(start + 1.5);
      activeAudio.push(oscillator, gain);
    });

    const drone = context.createOscillator();
    const droneGain = context.createGain();
    drone.type = "sine";
    drone.frequency.value = card.root / 2;
    droneGain.gain.setValueAtTime(0.0001, context.currentTime);
    droneGain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.7);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 7);
    drone.connect(droneGain).connect(master);
    drone.start();
    drone.stop(context.currentTime + 7.2);
    activeAudio.push(drone, droneGain);
  };

  const setSound = (enabled) => {
    soundEnabled = enabled;
    els.soundControl.setAttribute("aria-pressed", String(enabled));
    els.soundControl.querySelector(".sound-label").textContent = enabled ? "Music on" : "Music off";
    els.footerSound.textContent = enabled ? "Turn the music off" : "Turn the music on";
    if (enabled) {
      ensureAudio();
      playWelcomeChime();
    } else {
      stopActiveAudio();
    }
  };

  const buildShuffleStack = () => {
    els.shuffleStack.innerHTML = Array.from({ length: 18 }, (_, index) => {
      const angle = ((index % 2 ? 1 : -1) * (34 + (index % 5) * 7)).toFixed(1);
      const x = ((index % 2 ? 1 : -1) * (95 + (index % 4) * 28)).toFixed(1);
      const y = ((index % 3) * 14 - 24).toFixed(1);
      return `<span class="shuffle-card" style="--i:${index};--delay:${index * 28}ms;--shuffle-x:${x}px;--shuffle-y:${y}px;--shuffle-r:${angle}deg"></span>`;
    }).join("");
  };

  const beginRitual = (event) => {
    event.preventDefault();
    els.formError.textContent = "";
    const birthValue = els.birthDate.value;
    if (!birthValue) {
      els.formError.textContent = "Your birth date opens the reading.";
      els.birthDate.focus();
      return;
    }

    const birth = new Date(`${birthValue}T12:00:00`);
    const earliest = new Date();
    earliest.setFullYear(now.getFullYear() - 120);
    if (Number.isNaN(birth.getTime()) || birth > now || birth < earliest) {
      els.formError.textContent = "Enter a valid birth date from the last 120 years.";
      els.birthDate.focus();
      return;
    }

    const sign = getSunSign(birth);
    const name = els.seekerName.value.trim();
    const question = els.question.value.trim() || "What energy should I move with today?";
    seeker = { name, birthValue, sign, question };
    setAtmosphere(sign.colors[0], sign.colors[1]);
    els.signSymbol.textContent = asTextSymbol(sign.symbol);
    els.signSeal.style.color = sign.colors[0];
    els.profileHeading.textContent = `${name ? `${name}, your` : "Your"} ${sign.name} sun meets ${season.name} season.`;
    els.profileCopy.textContent = `${sign.name} moves through life by ${sign.instinct}. Today, a ${moon.name.toLowerCase()} emphasizes ${moon.energy}. This is the atmosphere around your question, not a verdict on it.`;
    els.profileSign.textContent = `${asTextSymbol(sign.symbol)} ${sign.name}`;
    els.profileSeason.textContent = `${asTextSymbol(season.symbol)} ${season.name}`;
    els.profileMoon.textContent = `${asTextSymbol(moon.symbol)} ${moon.name}`;
    els.ritualQuestion.textContent = `“${question}”`;
    els.shuffleStatus.textContent = "The deck is waiting.";
    buildShuffleStack();

    stageTransition(() => {
      els.welcome.hidden = true;
      els.reading.hidden = true;
      els.ritual.hidden = false;
      els.ritual.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      els.shuffleButton.focus({ preventScroll: true });
    });
  };

  const createReading = () => {
    const seed = hashString(`${seeker.birthValue}:${todayKey}:${seeker.question.toLowerCase()}:astraea`);
    const random = seededRandom(seed);
    const pool = [...cards];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [pool[index], pool[target]] = [pool[target], pool[index]];
    }
    return {
      seed,
      code: seed.toString(16).padStart(8, "0").toUpperCase(),
      draws: pool.slice(0, 3).map((card, index) => ({
        card,
        position: positions[index],
        reversed: random() < 0.28,
        revealed: false,
      })),
    };
  };

  const cardMarkup = (draw, index) => {
    const card = draw.card;
    const meaning = draw.reversed ? card.reversed : card.upright;
    const orientation = draw.reversed ? "Reversed · an inward lesson" : "Upright · an open current";
    return `
      <article
        class="reading-card${draw.reversed ? " is-reversed" : ""}"
        style="--card-a:${card.colors[0]};--card-b:${card.colors[1]};--card-ink:${card.colors[2]};--card-hue:${card.hue}"
      >
        <p class="position-label">${draw.position.label}</p>
        <button
          class="tarot-button"
          type="button"
          data-card-index="${index}"
          ${index === 0 ? "" : "disabled"}
          aria-label="Reveal ${draw.position.label} card"
          aria-expanded="false"
        >
          <span class="card-inner">
            <span class="card-back"></span>
            <span class="card-front" aria-hidden="true">
              <span class="card-art"></span>
              <span class="card-top"><span>${card.roman}</span><span>${card.element}</span></span>
              <span class="card-glyph-wrap"><span class="card-glyph">${asTextSymbol(card.glyph)}</span></span>
              <span class="card-bottom"><h3>${card.name}</h3><p>Major Arcana · ${orientation}</p></span>
            </span>
          </span>
        </button>
        <div class="card-insight" aria-hidden="true">
          <span class="orientation">${orientation}</span>
          <h3>${draw.position.prompt}</h3>
          <p>${meaning}</p>
          <button class="listen-card" type="button" data-listen-index="${index}"><span aria-hidden="true">♪</span> Hear ${card.name}</button>
        </div>
      </article>
    `;
  };

  const shuffleDeck = () => {
    if (isShuffling || !seeker) return;
    isShuffling = true;
    els.shuffleButton.disabled = true;
    els.shuffleOrbit.classList.add("is-shuffling");
    playShuffleSound();
    const messages = [
      "Listening to your question…",
      `Finding ${seeker.sign.name} in today’s sky…`,
      "Cutting the Major Arcana…",
      "Three cards are turning toward you…",
    ];
    messages.forEach((message, index) => {
      window.setTimeout(() => {
        els.shuffleStatus.textContent = message;
      }, index * 580);
    });

    window.setTimeout(() => {
      currentReading = createReading();
      els.spread.innerHTML = currentReading.draws.map(cardMarkup).join("");
      els.readingPersonalization.textContent = `${seeker.name ? `${seeker.name}, this` : "This"} reading belongs to ${localDateLabel}, your ${seeker.sign.name} sun, and the question you brought into the circle. Reveal the cards from left to right.`;
      els.oracleResponse.hidden = true;
      els.spread.querySelectorAll(".tarot-button").forEach((button) => {
        button.addEventListener("click", () => revealCard(button));
      });
      els.spread.querySelectorAll(".listen-card").forEach((button) => {
        button.addEventListener("click", () => {
          const draw = currentReading.draws[Number(button.dataset.listenIndex)];
          playCardMusic(draw.card, Number(button.dataset.listenIndex));
        });
      });

      stageTransition(() => {
        els.ritual.hidden = true;
        els.reading.hidden = false;
        els.reading.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        els.spread.querySelector(".tarot-button")?.focus({ preventScroll: true });
        isShuffling = false;
        els.shuffleButton.disabled = false;
        els.shuffleOrbit.classList.remove("is-shuffling");
      });
    }, 2600);
  };

  const revealCard = (button) => {
    if (!currentReading || button.disabled || button.classList.contains("is-revealed")) return;
    const index = Number(button.dataset.cardIndex);
    const draw = currentReading.draws[index];
    draw.revealed = true;
    button.classList.add("is-revealed");
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-label", `${draw.card.name}, ${draw.reversed ? "reversed" : "upright"}. Revealed.`);
    button.closest(".reading-card").querySelector(".card-insight").setAttribute("aria-hidden", "false");
    button.disabled = true;
    setAtmosphere(draw.card.colors[0], draw.card.colors[1]);
    playCardMusic(draw.card, index);
    els.announcer.textContent = `${draw.position.label}: ${draw.card.name}, ${draw.reversed ? "reversed" : "upright"}.`;

    const next = els.spread.querySelector(`[data-card-index="${index + 1}"]`);
    if (next) {
      window.setTimeout(() => {
        next.disabled = false;
        next.focus({ preventScroll: true });
      }, 900);
      return;
    }
    window.setTimeout(completeReading, 1150);
  };

  const elementResonance = (card, sign) => {
    if (card.element === sign.element) {
      return `Its ${card.element.toLowerCase()} energy speaks in a language your ${sign.name} sun already understands.`;
    }
    const opposites = { Fire: "Water", Water: "Fire", Air: "Earth", Earth: "Air" };
    if (opposites[card.element] === sign.element) {
      return `Its ${card.element.toLowerCase()} asks your ${sign.element.toLowerCase()} nature to try a rhythm that may not feel automatic.`;
    }
    return `Its ${card.element.toLowerCase()} energy gives your ${sign.element.toLowerCase()} nature another element to work with.`;
  };

  const buildSynthesis = () => {
    const [root, mirror, becoming] = currentReading.draws;
    const rootMeaning = root.reversed ? root.card.reversed : root.card.upright;
    const mirrorMeaning = mirror.reversed ? mirror.card.reversed : mirror.card.upright;
    const becomingMeaning = becoming.reversed ? becoming.card.reversed : becoming.card.upright;
    const salutation = seeker.name ? `${seeker.name}, your` : "Your";
    return [
      `${salutation} ${seeker.sign.name} sun usually moves by ${seeker.sign.instinct}. Under today’s ${moon.name.toLowerCase()}, ${root.card.name} sits at the root of the reading. ${rootMeaning} ${elementResonance(root.card, seeker.sign)}`,
      `${mirror.card.name} becomes the mirror. ${mirrorMeaning} Together, these first two cards suggest that the visible situation and the deeper need are moving at different speeds. One is asking to be understood; the other is asking to be lived.`,
      `${becoming.card.name} opens the path forward. ${becomingMeaning} In relation to “${seeker.question},” the cards are not promising an outcome. They are asking you to ${becoming.card.invitation}.`,
    ];
  };

  const typeSynthesis = async (paragraphs) => {
    els.oracleText.innerHTML = "";
    els.oracleText.setAttribute("aria-live", "off");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const paragraph of paragraphs) {
      const node = document.createElement("p");
      els.oracleText.append(node);
      if (reducedMotion) {
        node.textContent = paragraph;
        continue;
      }
      node.classList.add("typing-cursor");
      const words = paragraph.split(" ");
      for (let index = 0; index < words.length; index += 1) {
        node.textContent += `${index ? " " : ""}${words[index]}`;
        await new Promise((resolve) => window.setTimeout(resolve, 23));
      }
      node.classList.remove("typing-cursor");
    }
    els.oracleText.setAttribute("aria-live", "polite");
    els.announcer.textContent = "Your reading is complete. Astraea’s synthesis is ready.";
  };

  const completeReading = () => {
    const paragraphs = buildSynthesis();
    els.reflectionPrompt.textContent = `What would change if I chose to ${currentReading.draws[2].card.invitation}?`;
    els.oracleResponse.hidden = false;
    els.oracleResponse.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
    typeSynthesis(paragraphs);
  };

  const readingAsText = () => {
    const lines = ["ASTRAEA · DAILY TAROT", localDateLabel, `${seeker.sign.name} sun · ${moon.name}`, `Question: ${seeker.question}`, ""];
    currentReading.draws.forEach((draw) => {
      lines.push(
        `${draw.position.label}: ${draw.card.name} · ${draw.reversed ? "reversed" : "upright"}`,
        draw.reversed ? draw.card.reversed : draw.card.upright,
        ""
      );
    });
    lines.push("Astraea’s synthesis", ...buildSynthesis(), "", `Reflection: ${els.reflectionPrompt.textContent}`);
    return lines.join("\n");
  };

  const copyReading = async () => {
    if (!currentReading) return;
    try {
      await navigator.clipboard.writeText(readingAsText());
      els.copyReading.textContent = "Reading copied";
      els.announcer.textContent = "Reading copied to clipboard.";
      window.setTimeout(() => {
        els.copyReading.textContent = "Copy my reading";
      }, 1800);
    } catch {
      const area = document.createElement("textarea");
      area.value = readingAsText();
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      els.copyReading.textContent = "Reading copied";
    }
  };

  const resetExperience = () => {
    stopActiveAudio();
    seeker = null;
    currentReading = null;
    els.birthForm.reset();
    els.questionCount.textContent = "0 / 220";
    els.oracleResponse.hidden = true;
    setAtmosphere("#d85b78", "#4aa8a0");
    stageTransition(() => {
      els.ritual.hidden = true;
      els.reading.hidden = true;
      els.welcome.hidden = false;
      els.welcome.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      els.birthDate.focus({ preventScroll: true });
    });
  };

  const deckTileMarkup = (card, index) => `
    <button
      class="deck-tile"
      type="button"
      data-deck-index="${index}"
      aria-pressed="${index === 0 ? "true" : "false"}"
      style="--card-a:${card.colors[0]};--card-b:${card.colors[1]};--card-hue:${card.hue}"
      aria-label="${card.name}. ${card.element}. ${card.essence}"
    >
      <span class="deck-tile-top"><span>${card.roman}</span><span>${card.element}</span></span>
      <span class="deck-tile-glyph">${asTextSymbol(card.glyph)}</span>
      <span class="deck-tile-bottom"><h3>${card.name}</h3><p>${card.essence}</p></span>
    </button>
  `;

  const selectDeckCard = (index, play = false) => {
    selectedDeckCard = cards[index];
    els.deckGrid.querySelectorAll(".deck-tile").forEach((tile) => {
      tile.setAttribute("aria-pressed", String(Number(tile.dataset.deckIndex) === index));
    });
    els.deckDetailArt.style.setProperty("--card-a", selectedDeckCard.colors[0]);
    els.deckDetailArt.style.setProperty("--card-b", selectedDeckCard.colors[1]);
    els.deckDetailGlyph.textContent = asTextSymbol(selectedDeckCard.glyph);
    els.deckDetailNumber.textContent = `${selectedDeckCard.roman} · ${selectedDeckCard.element}`;
    els.deckDetailName.textContent = selectedDeckCard.name;
    els.deckDetailMeaning.textContent = `${selectedDeckCard.essence} ${selectedDeckCard.upright}`;
    els.deckDetailListen.innerHTML = `<span aria-hidden="true">♪</span> Hear ${selectedDeckCard.name}`;
    if (play) playCardMusic(selectedDeckCard, index % 3);
  };

  const openDeck = (trigger) => {
    lastDeckTrigger = trigger;
    if (!els.deckDialog.open) els.deckDialog.showModal();
    document.body.style.overflow = "hidden";
    selectDeckCard(cards.indexOf(selectedDeckCard));
  };

  const closeDeck = () => {
    els.deckDialog.close();
    document.body.style.overflow = "";
    stopActiveAudio();
    lastDeckTrigger?.focus();
  };

  const drawStars = () => {
    const context = els.starCanvas.getContext("2d");
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    els.starCanvas.width = width * ratio;
    els.starCanvas.height = height * ratio;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    const random = seededRandom(hashString("astraea-watercolor-stars"));
    for (let index = 0; index < 72; index += 1) {
      const x = random() * width;
      const y = random() * height;
      const radius = random() < 0.12 ? 1.6 : 0.7;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = random() < 0.5 ? "rgba(255,248,221,.72)" : "rgba(66,38,76,.34)";
      context.fill();
    }
  };

  const initialize = () => {
    els.todayLabel.textContent = localDateLabel;
    els.moonLabel.textContent = `${moon.symbol} ${moon.name}`;
    els.birthDate.max = todayKey;
    els.deckGrid.innerHTML = cards.map(deckTileMarkup).join("");
    buildShuffleStack();
    drawStars();

    els.birthForm.addEventListener("submit", beginRitual);
    els.question.addEventListener("input", () => {
      els.questionCount.textContent = `${els.question.value.length} / 220`;
    });
    els.shuffleButton.addEventListener("click", shuffleDeck);
    els.soundControl.addEventListener("click", () => setSound(!soundEnabled));
    els.footerSound.addEventListener("click", () => setSound(!soundEnabled));
    els.copyReading.addEventListener("click", copyReading);
    els.newReading.addEventListener("click", resetExperience);

    document.querySelector("#open-deck").addEventListener("click", (event) => openDeck(event.currentTarget));
    document.querySelector("#open-deck-bottom").addEventListener("click", (event) => openDeck(event.currentTarget));
    els.closeDeck.addEventListener("click", closeDeck);
    els.deckDialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDeck();
    });
    els.deckDialog.addEventListener("click", (event) => {
      if (event.target === els.deckDialog) closeDeck();
    });
    els.deckGrid.querySelectorAll(".deck-tile").forEach((tile) => {
      tile.addEventListener("click", () => selectDeckCard(Number(tile.dataset.deckIndex), true));
    });
    els.deckDetailListen.addEventListener("click", () => playCardMusic(selectedDeckCard, cards.indexOf(selectedDeckCard) % 3));

    let resizeFrame = null;
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(drawStars);
    });
  };

  initialize();
})();
