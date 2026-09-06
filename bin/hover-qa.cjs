/* Hover-state QA, driven by TRUSTED input events.
 *
 * Why this exists as its own harness. bin/portfolio-qa.cjs asserts that
 * things are PRESENT: 628 checks, all green, on a site whose entire hover
 * layer was dead. Playwright's page.hover() and mouse.move() do not reliably
 * deliver pointerover to delegated document listeners, so every check written
 * on top of them reported working features as broken and — worse — could not
 * have caught the real fault.
 *
 * The real fault, found on 6 Sep: #cur-dot lost `pointer-events: none` in a
 * rewrite. The cursor is fixed and sits exactly under the pointer, so at
 * pointer-events auto it became the topmost hit target for every mouseover
 * the page would ever see. elementFromPoint under the cursor returned the
 * cursor. Nothing threw, nothing looked wrong in a screenshot, and every
 * hover-driven feature on the site was quietly unreachable.
 *
 * CDP Input.dispatchMouseEvent produces events the page cannot tell from a
 * person's, including the pointerover/mouseover pair on target change. This
 * asserts on the OUTCOME of a real glide onto a real element, which is the
 * only thing that would have caught it.
 */
const { chromium } = require("playwright");
const B = process.env.QA_BASE || "http://127.0.0.1:4000";
const sys = process.env.PORTFOLIO_CHROME;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch(sys ? { executablePath: sys } : {});
  const c = await b.newContext({ viewport: { width: 1512, height: 950 } });
  const p = await c.newPage();
  const cdp = await c.newCDPSession(p);
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message.slice(0, 90)));
  const move = (x, y) => cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none", buttons: 0 });
  /* A glide, not a teleport: hover state depends on entering an element, and
     a single jump can land without ever crossing a boundary. */
  const glide = async (x, y) => {
    await move(160, 900);
    await sleep(120);
    for (let i = 0; i < 16; i++) (await move(160 + (x - 160) * (i / 15), 900 + (y - 900) * (i / 15)), await sleep(24));
    await sleep(900);
  };
  const centre = async (sel) => {
    const bx = await p.locator(sel).first().boundingBox();
    return [bx.x + bx.width / 2, bx.y + bx.height / 2];
  };

  const R = [];
  await p.goto(B + "/works/", { waitUntil: "load" });
  await sleep(2600);

  await glide(...(await centre(".wk-card")));
  R.push([
    "cursor is not the hit target",
    await p.evaluate(() => document.elementFromPoint(innerWidth / 2, innerHeight / 2) !== document.getElementById("cur-dot")),
  ]);
  R.push(["hover state engages", await p.evaluate(() => document.getElementById("cur-dot").classList.contains("is-hover"))]);
  R.push(["chips appear at the mark", await p.evaluate(() => document.querySelectorAll(".cube-says__hues i").length > 2)]);
  R.push([
    "chips are square",
    await p.evaluate(() => {
      const i = document.querySelector(".cube-says__hues i");
      return !!i && getComputedStyle(i).borderRadius === "0px";
    }),
  ]);
  R.push([
    "cursor bubble speaks",
    await p.evaluate(() => {
      const c2 = document.querySelector(".curhue");
      return !!c2 && c2.classList.contains("is-in") && c2.querySelector(".curhue__say").textContent.length > 4;
    }),
  ]);
  /* Checked away from any link. Over something pressable the lens correctly
     switches its refraction off so the target stays readable, so asserting it
     while hovering a card tests the opposite of what it means to. */
  /* Genuinely empty ground. 140,620 was tried and turns out to be inside the
     first card's image, which correctly engages the hover state -- so the
     assertion was measuring the wrong thing again. */
  await glide(1400, 210);
  R.push(["orb refracts at rest", await p.evaluate(() => getComputedStyle(document.getElementById("cur-dot")).backdropFilter.includes("cur-lens"))]);

  await glide(...(await centre(".wk-card")));
  R.push([
    "refraction off on hover",
    await p.evaluate(() => !getComputedStyle(document.getElementById("cur-dot")).backdropFilter.includes("cur-lens")),
  ]);

  const before = await p.evaluate(() => [...document.querySelectorAll(".studio-link")].map((a) => Math.round(a.getBoundingClientRect().x)));
  await glide(...(await centre(".studio-links .studio-link:nth-child(3)")));
  const after = await p.evaluate(() => [...document.querySelectorAll(".studio-link")].map((a) => Math.round(a.getBoundingClientRect().x)));
  R.push(["nav icons hold still on hover", JSON.stringify(before) === JSON.stringify(after)]);
  R.push([
    "outbound pair sits by the pill",
    await p.evaluate(() => {
      const o = document.querySelector(".studio-out"),
        l = document.querySelector(".studio-links");
      const g = l.getBoundingClientRect().left - o.getBoundingClientRect().right;
      return g >= 0 && g < 40;
    }),
  ]);

  console.log("");
  R.forEach(([n, ok]) => console.log((ok ? "  PASS  " : "  FAIL  ") + n));
  console.log("\nJS errors: " + (errs.length ? errs.slice(0, 3).join(" | ") : "none"));
  console.log("failures: " + R.filter((r) => !r[1]).length + "/" + R.length);
  await b.close();
  process.exit(R.some((r) => !r[1]) ? 1 : 0);
})();
