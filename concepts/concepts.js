const directions = [
  {
    id: "museum",
    label: "Museum OS",
    short: "Museum",
    description: "Calm, cinematic, recruiter-first",
  },
  {
    id: "archive",
    label: "Living Archive",
    short: "Archive",
    description: "Expressive, physical, art-directed",
  },
  {
    id: "signal",
    label: "Signal Room",
    short: "Signal",
    description: "Bold, systematic, product-forward",
  },
];

const pages = [
  { id: "home", label: "Home", initial: "H" },
  { id: "works", label: "Works", initial: "W" },
  { id: "play", label: "Play", initial: "P" },
  { id: "about", label: "About", initial: "A" },
  { id: "contact", label: "Contact", initial: "C" },
  { id: "case", label: "Case study", initial: "CS" },
];

const assets = {
  mool: "/assets/img/work-previews/mool/cover.webp",
  mool2: "/assets/img/work-previews/mool/02.webp",
  mool3: "/assets/img/work-previews/mool/03.webp",
  ai: "/assets/img/ai-proto-cover.jpg",
  encoded: "/assets/img/entry/encoded.webp",
  bloom: "/15.bloom-vp/cover.jpg",
  mind: "/6.mindu/cover2.webp",
  cube: "/assets/img/entry/cube-of-creations.webp",
  portrait: "/assets/img/sid_about.jpg",
  portrait2: "/assets/img/sid_about3.jpg",
  portrait3: "/assets/img/sid_about.jpg",
  desk: "/assets/img/table_new.png",
  play1: "/play/assets/tube/p141.webp",
  play2: "/play/assets/tube/p142.webp",
  play3: "/play/assets/tube/p155.webp",
  play4: "/play/assets/tube/p169.webp",
  play5: "/play/assets/tube/p180.webp",
  play6: "/play/assets/tube/p197.webp",
};

const nav = (active) => `
  <div class="concept-meta"><span>Sid Mehta</span><strong>Product designer + creative technologist</strong></div>
  <nav class="concept-nav" aria-label="Concept navigation">
    ${["works", "play", "about", "contact"].map((item) => `<span class="${active === item ? "is-active" : ""}">${item}</span>`).join("")}
  </nav>`;

const media = (src, alt = "") => `<img src="${src}" alt="${alt}" loading="eager" />`;

const orbit = (mode = "museum") => `
  <div class="${mode === "archive" ? "archive-play" : "museum-play"}">
    <div class="orbital-field">
      ${[assets.play1, assets.play2, assets.play3, assets.play4, assets.play5, assets.play6]
        .map((src, index) => `<figure class="orbit-card">${media(src, `Play archive experiment ${index + 1}`)}</figure>`)
        .join("")}
      <div class="glass-cube" aria-label="Glass cube character"></div>
      <div class="play-caption scene-copy">
        <span class="scene-kicker">Experiments in orbit</span>
        <h1>Play</h1>
        <p>Scroll to rotate · select to enter</p>
      </div>
    </div>
  </div>`;

const renderers = {
  museum: {
    home: () => `
      ${nav("home")}
      <div class="museum-home">
        <div class="scene-copy">
          <span class="scene-kicker">New York · Product design</span>
          <h1>Complex systems, made human.</h1>
          <p class="lead">I design products and spatial experiences that turn emerging technology into clear, useful interactions.</p>
          <div class="proof-strip"><span>2× Webby</span><span>The Met</span><span>Deloitte Digital</span><span>11 live AI prototypes</span></div>
          <a class="scene-cta" href="#">View selected work</a>
        </div>
        <div class="museum-desk">
          ${media(assets.desk, "Sid Mehta's pixelated digital desk")}
          <figure class="portal portal--one">${media(assets.encoded, "Encoded project preview")}</figure>
          <figure class="portal portal--two">${media(assets.mool, "Mool product design preview")}</figure>
        </div>
      </div>`,
    works: () => `
      ${nav("works")}
      <div class="museum-works">
        <div class="museum-works-grid">
          <div class="museum-project-list">
            <button><span>01</span><b>Mool</b><small>Fintech</small></button>
            <button class="is-active"><span>02</span><b>AI Prototypes</b><small>Browser AI</small></button>
            <button><span>03</span><b>Encoded</b><small>AR · The Met</small></button>
            <button><span>04</span><b>Bloom</b><small>visionOS</small></button>
            <button><span>05</span><b>Mind Your Feelings</b><small>Installation</small></button>
          </div>
          <figure class="museum-work-media museum-glass">${media(assets.ai, "AI Prototypes project preview")}</figure>
          <div class="museum-work-copy scene-copy">
            <span class="scene-kicker">WebGPU · In-browser AI</span>
            <h1>AI Prototypes</h1>
            <p>Eleven local AI experiments that make model behavior visible, controllable, and useful.</p>
            <a class="scene-cta" href="#">View project</a>
          </div>
        </div>
      </div>`,
    play: () => `${nav("play")}${orbit("museum")}`,
    about: () => `
      ${nav("about")}
      <div class="museum-about">
        <div class="scene-copy">
          <span class="scene-kicker">About · New York</span>
          <h1>Sid Mehta</h1>
          <p class="lead">Product designer and creative technologist. I move between enterprise systems, browser AI, and spatial computing, with a bias toward prototypes people can actually use.</p>
          <div class="proof-strip"><span>Deloitte</span><span>EyeJack</span><span>Philips</span><span>Parsons D+T</span></div>
          <a class="scene-cta" href="#">Resume PDF</a>
        </div>
        <article class="identity-artifact museum-glass">
          ${media(assets.portrait, "Portrait of Sid Mehta")}
          <footer><strong>Sid Mehta</strong><span class="mini-label">NYC · 2026</span><p>Designing useful systems, strange interfaces, and coded prototypes.</p></footer>
        </article>
      </div>`,
    contact: () => `
      ${nav("contact")}
      <div class="museum-contact">
        <div class="scene-copy">
          <span class="scene-kicker">Open to product design roles</span>
          <h1>Let’s make something useful.</h1>
          <p class="lead">For product teams navigating complexity, new interfaces, or emerging technology. Email is best.</p>
          <a class="scene-cta" href="#">sidmehtadesign@gmail.com</a>
        </div>
        <div class="contact-ledger museum-glass">
          <a href="#"><span>Email</span>sidmehtadesign@gmail.com</a>
          <a href="#"><span>LinkedIn</span>siddharth-mehta ↗</a>
          <a href="#"><span>Resume</span>View PDF ↗</a>
          <a href="#"><span>Based</span>New York, NY</a>
        </div>
      </div>`,
    case: () => `
      ${nav("works")}
      <div class="museum-case">
        <div class="case-hero-grid">
          <div class="scene-copy">
            <span class="scene-kicker">Product design · Fintech</span>
            <h1>Mool</h1>
            <p class="lead">A financial planning experience that turns long-term goals into understandable actions for families in India.</p>
            <a class="scene-cta" href="#">Skim the 3-minute case</a>
          </div>
          <figure class="case-hero-media museum-glass">${media(assets.mool, "Mool project overview")}</figure>
        </div>
        <div class="case-facts">
          <div><span class="mini-label">Contribution</span><strong>Product design + research</strong></div>
          <div><span class="mini-label">Scope</span><strong>0→1 mobile experience</strong></div>
          <div><span class="mini-label">Proof</span><strong>Shipped financial journeys</strong></div>
        </div>
        <div class="case-map"><b>Case map</b><span class="is-active">01 Challenge</span><span>02 Decisions</span><span>03 System</span><span>04 Outcome</span><span>Full visual archive ↗</span></div>
      </div>`,
  },
  archive: {
    home: () => `
      ${nav("home")}
      <div class="archive-home">
        <div class="scene-copy">
          <span class="scene-kicker">Product designer · Creative technologist</span>
          <h1>Ideas that refuse the rectangle.</h1>
          <p class="lead">Products, spatial interfaces, and coded experiments built between rigor and play.</p>
          <a class="scene-cta" href="#">Enter the archive</a>
        </div>
        <div class="flying-spread">
          <figure>${media(assets.mool, "Mool product design")}</figure>
          <figure>${media(assets.encoded, "Encoded AR project")}</figure>
          <figure>${media(assets.bloom, "Bloom spatial computing")}</figure>
          <figure>${media(assets.cube, "Cube of Creations")}</figure>
        </div>
      </div>`,
    works: () => `
      ${nav("works")}
      <div class="archive-works scene-copy">
        <span class="scene-kicker">Selected work · drag the reel</span>
        <h1>Work bends.</h1>
        <div class="archive-work-reel">
          <figure class="archive-work-card">${media(assets.mool, "Mool")}<figcaption><h2>Mool</h2><p>Financial planning made understandable.</p></figcaption></figure>
          <figure class="archive-work-card">${media(assets.ai, "AI Prototypes")}<figcaption><h2>AI Prototypes</h2><p>Eleven experiments, local in the browser.</p></figcaption></figure>
          <figure class="archive-work-card">${media(assets.encoded, "Encoded")}<figcaption><h2>Encoded</h2><p>Twenty-five artworks activated at The Met.</p></figcaption></figure>
          <figure class="archive-work-card">${media(assets.bloom, "Bloom")}<figcaption><h2>Bloom</h2><p>A spatial AI that practices presence.</p></figcaption></figure>
        </div>
      </div>`,
    play: () => `${nav("play")}${orbit("archive")}`,
    about: () => `
      ${nav("about")}
      <div class="archive-about">
        <div class="portrait-stack">
          ${media(assets.portrait2, "Sid Mehta smiling")}
          ${media(assets.portrait, "Sid Mehta portrait")}
        </div>
        <div class="scene-copy">
          <span class="scene-kicker">Part designer, part prototyper</span>
          <h1>Sid, in layers.</h1>
          <p class="lead">I like systems with stakes, interfaces with character, and prototypes that reveal the actual question. Previously Deloitte Digital, EyeJack, and Philips. Currently New York.</p>
          <a class="scene-cta" href="#">Read the field notes</a>
        </div>
      </div>`,
    contact: () => `
      ${nav("contact")}
      <div class="archive-contact">
        <div class="scene-copy">
          <span class="scene-kicker">New York · Available</span>
          <h1>Have a hard problem?</h1>
          <p class="lead">Good. Those are usually the interesting ones.</p>
          <div class="contact-line"><strong>sidmehtadesign@gmail.com</strong><span>Copy email ↗</span></div>
        </div>
      </div>`,
    case: () => `
      ${nav("works")}
      <div class="archive-case">
        <div class="archive-case-grid">
          <div class="archive-case-copy scene-copy">
            <span class="scene-kicker">Spatial computing · MFA thesis</span>
            <h1>Bloom</h1>
            <p class="lead">A Vision Pro experience where a bodhi tree uses gaze, voice, and deliberate pacing to make attention the interface.</p>
            <div class="proof-strip"><span>5 months</span><span>Solo</span><span>visionOS</span></div>
            <a class="scene-cta" href="#">Read the decisions</a>
          </div>
          <div class="archive-case-strip">
            ${media(assets.bloom, "Bloom spatial experience")}
            ${media("/15.bloom-vp/altar.jpg", "Bloom altar scene")}
            ${media("/15.bloom-vp/plate-bloom.jpg", "Bloom visual interface")}
          </div>
        </div>
      </div>`,
  },
  signal: {
    home: () => `
      ${nav("home")}
      <div class="signal-home">
        <div class="scene-copy">
          <span class="scene-kicker">Product design · New York</span>
          <h1>I make complex technology usable.</h1>
          <p class="lead">From financial products to local AI and spatial computing, I design and build systems people can understand.</p>
          <a class="scene-cta" href="#">Start with product work</a>
        </div>
        <div class="signal-proof-board">
          <article><b>25</b><span>Artworks activated at The Met</span></article>
          <article><b>11</b><span>Live in-browser AI prototypes</span></article>
          <article><b>2×</b><span>Webby-recognized work</span></article>
        </div>
      </div>`,
    works: () => `
      ${nav("works")}
      <div class="signal-works">
        <div class="signal-works-layout">
          <div class="signal-work-index">
            <p>14 public · 2 confidential</p>
            <button class="is-active"><strong>Mool</strong><span>Product · Fintech</span></button>
            <button><strong>AI Prototypes</strong><span>Browser AI</span></button>
            <button><strong>Encoded</strong><span>AR · Culture</span></button>
            <button><strong>Bloom</strong><span>Spatial AI</span></button>
            <button><strong>Archive</strong><span>12 more ↗</span></button>
          </div>
          <div class="signal-work-stage">
            ${media(assets.mool, "Mool product design overview")}
            <div class="scene-copy">
              <span class="scene-kicker">0→1 financial planning</span>
              <h1>Mool</h1>
              <p>Making long-term money decisions understandable for families.</p>
              <a class="scene-cta" href="#">View case study</a>
            </div>
          </div>
        </div>
      </div>`,
    play: () => `
      ${nav("play")}
      <div class="signal-play scene-copy">
        <div class="signal-play-head"><h1>Play</h1><p>A changing field of creative technology studies, motion systems, photographs, and unfinished questions.</p></div>
        <div class="signal-play-grid">
          ${[assets.play1, assets.play2, assets.play3, assets.play4, assets.play5]
            .map((src, index) => `<figure>${media(src, `Play experiment ${index + 1}`)}</figure>`)
            .join("")}
        </div>
      </div>`,
    about: () => `
      ${nav("about")}
      <div class="signal-about">
        <figure class="signal-about-photo">${media(assets.portrait, "Portrait of Sid Mehta")}</figure>
        <div class="scene-copy">
          <span class="scene-kicker">Sid Mehta · Product designer</span>
          <h1>Clarity first. Curiosity always.</h1>
          <p class="lead">I lead ambiguous product problems from research through working prototypes, especially when the technology is new and the interface is not obvious yet.</p>
          <div class="credential-grid">
            <div><span>Experience</span><b>Deloitte · EyeJack · Philips</b></div>
            <div><span>Recognition</span><b>Webby · Kyoorius · MIT</b></div>
            <div><span>Practice</span><b>Products · AI · Spatial</b></div>
            <div><span>Education</span><b>Parsons Design + Technology</b></div>
          </div>
        </div>
      </div>`,
    contact: () => `
      ${nav("contact")}
      <div class="signal-contact">
        <div class="scene-copy">
          <span class="scene-kicker">Open to product design roles</span>
          <h1>Put me on the hard problem.</h1>
          <p class="lead">New York based. Available for full-time product design and selected creative technology collaborations.</p>
        </div>
        <a class="signal-email" href="#"><strong>sidmehtadesign@gmail.com</strong><span>Write to Sid ↗</span></a>
      </div>`,
    case: () => `
      ${nav("works")}
      <div class="signal-case">
        <div class="signal-case-board">
          <div class="signal-case-copy scene-copy">
            <span class="scene-kicker">Quick case · 3 min</span>
            <h1>AI Prototypes</h1>
            <p class="lead">A library of local, inspectable AI experiments built to study model behavior through interaction—not explanation.</p>
            <a class="scene-cta" href="#">Launch the live prototypes</a>
          </div>
          <div class="signal-case-proof">
            ${media(assets.ai, "AI Prototypes visual system")}
            <footer>
              <div><span>Contribution</span><b>Design · Build · Research</b></div>
              <div><span>System</span><b>WebGPU · Local models</b></div>
              <div><span>Proof</span><b>11 live experiments</b></div>
            </footer>
          </div>
        </div>
      </div>`,
  },
};

const shell = document.querySelector("#concept-shell");
const comparison = document.querySelector("#comparison");
const comparisonGrid = document.querySelector("#comparison-grid");
const directionTabs = document.querySelector("#direction-tabs");
const pageTabs = document.querySelector("#page-tabs");
const compareButton = document.querySelector("#compare-button");
const mobileDirectionSelect = document.querySelector("#mobile-direction-select");
const mobilePageSelect = document.querySelector("#mobile-page-select");
const reviewIndex = document.querySelector("#review-index");
const reviewNote = document.querySelector("#review-note");

const params = new URLSearchParams(window.location.search);
let directionIndex = Math.max(
  0,
  directions.findIndex((item) => item.id === params.get("direction"))
);
let pageIndex = Math.max(
  0,
  pages.findIndex((item) => item.id === params.get("page"))
);
let comparing = params.get("view") === "all";

function buildTabs() {
  directionTabs.innerHTML = directions
    .map(
      (direction, index) =>
        `<button type="button" role="tab" data-direction="${index}" aria-selected="${index === directionIndex}">${direction.short}</button>`
    )
    .join("");

  pageTabs.innerHTML = pages
    .map((page, index) => `<button type="button" role="tab" data-page="${index}" aria-selected="${index === pageIndex}">${page.label}</button>`)
    .join("");

  mobileDirectionSelect.innerHTML = directions
    .map((direction, index) => `<option value="${index}" ${index === directionIndex ? "selected" : ""}>${direction.label}</option>`)
    .join("");

  mobilePageSelect.innerHTML = pages
    .map((page, index) => `<option value="${index}" ${index === pageIndex ? "selected" : ""}>${page.label}</option>`)
    .join("");
}

function updateUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("direction", directions[directionIndex].id);
  url.searchParams.set("page", pages[pageIndex].id);
  if (comparing) url.searchParams.set("view", "all");
  else url.searchParams.delete("view");
  window.history.replaceState({}, "", url);
}

function render() {
  buildTabs();
  compareButton.setAttribute("aria-pressed", String(comparing));
  shell.hidden = comparing;
  comparison.hidden = !comparing;

  if (!comparing) {
    const direction = directions[directionIndex];
    const page = pages[pageIndex];
    shell.innerHTML = `<article class="concept-frame direction-${direction.id} page-${page.id}" aria-label="${direction.label} ${page.label} concept">${renderers[direction.id][page.id]()}</article>`;
    reviewIndex.textContent = `${String(directionIndex * pages.length + pageIndex + 1).padStart(2, "0")} / 18`;
    reviewNote.textContent = `${direction.label} · ${page.label} — ${direction.description}`;
  } else {
    renderComparison();
    reviewIndex.textContent = "18 concepts";
    reviewNote.textContent = "Select any tile to open the full-screen direction.";
  }

  updateUrl();
}

function renderComparison() {
  if (comparisonGrid.childElementCount) return;
  comparisonGrid.innerHTML = directions
    .flatMap((direction, dIndex) =>
      pages.map(
        (page, pIndex) => `
          <button class="comparison-card" type="button" data-open-direction="${dIndex}" data-open-page="${pIndex}">
            <div class="comparison-thumb" data-initial="${page.initial}">${media(
              page.id === "about"
                ? assets.portrait
                : page.id === "play"
                  ? assets.play2
                  : page.id === "contact"
                    ? assets.portrait3
                    : page.id === "case"
                      ? assets.mool
                      : page.id === "works"
                        ? assets.ai
                        : assets.desk,
              ""
            )}</div>
            <footer><div><strong>${direction.label}</strong><small>${page.label} · ${direction.description}</small></div><span>↗</span></footer>
          </button>`
      )
    )
    .join("");
}

directionTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-direction]");
  if (!button) return;
  directionIndex = Number(button.dataset.direction);
  comparing = false;
  render();
});

pageTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button) return;
  pageIndex = Number(button.dataset.page);
  comparing = false;
  render();
});

mobileDirectionSelect.addEventListener("change", () => {
  directionIndex = Number(mobileDirectionSelect.value);
  comparing = false;
  render();
});

mobilePageSelect.addEventListener("change", () => {
  pageIndex = Number(mobilePageSelect.value);
  comparing = false;
  render();
});

compareButton.addEventListener("click", () => {
  comparing = !comparing;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

comparisonGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-open-direction]");
  if (!button) return;
  directionIndex = Number(button.dataset.openDirection);
  pageIndex = Number(button.dataset.openPage);
  comparing = false;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select")) return;
  if (event.key === "ArrowRight") pageIndex = (pageIndex + 1) % pages.length;
  else if (event.key === "ArrowLeft") pageIndex = (pageIndex - 1 + pages.length) % pages.length;
  else if (event.key === "ArrowDown") directionIndex = (directionIndex + 1) % directions.length;
  else if (event.key === "ArrowUp") directionIndex = (directionIndex - 1 + directions.length) % directions.length;
  else return;
  event.preventDefault();
  comparing = false;
  render();
});

render();
