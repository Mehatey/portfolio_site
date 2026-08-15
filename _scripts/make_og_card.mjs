/* Render /og/ to assets/img/og-card.jpg — the image people see when they
   paste the site into Slack, iMessage, LinkedIn or a DM.

   The card it replaces was a title slide: a text block left, a portrait in a
   rounded rectangle right, over a blue gradient. It was also drifting out of
   date, because it was made somewhere else — it still carried a tagline the
   site had stopped using and a discipline list that The Range replaced.

   This screenshots the site's own /og/ route instead, so the card is a frame
   of the thing it links to and there is nothing to keep in sync by hand.
   Shot at 2x and downscaled, because these get resampled again by every
   platform that shows them and a soft card looks cheap.

     node _scripts/make_og_card.mjs                 # against localhost:4123
     node _scripts/make_og_card.mjs http://host     # against another origin

   Needs the dev server running, and ImageMagick for the downscale.
*/
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "/Users/siddharthmehta/Desktop/cowork_obin_t2/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "http://localhost:4123";
const CHROME =
  process.env.PORTFOLIO_CHROME ||
  "/Users/siddharthmehta/.cache/puppeteer/chrome/mac_arm-149.0.7827.22/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const OUT = resolve(ROOT, "assets/img/og-card.jpg");
const TMP = resolve(ROOT, ".og-tmp.png");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  // The figure is a WebGL point cloud; without a GL backend the card renders
  // with a hole where he should be, which is worse than the slide it replaces.
  args: ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));

await page.goto(BASE + "/og/", { waitUntil: "networkidle2", timeout: 60000 });

/* Wait for the point cloud to have actually uploaded and drawn, rather than
   sleeping and hoping. is-live is set by cube-guy.js after the buffer is on
   the GPU; the extra beat is the fade. */
await page
  .waitForFunction(() => document.querySelector(".cg-stage.is-live") !== null, { timeout: 30000 })
  .catch(() => errors.push("point cloud never went live"));
await new Promise((r) => setTimeout(r, 2500));

await page.screenshot({ path: TMP, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

execFileSync("magick", [TMP, "-resize", "1200x630", "-quality", "88", "-strip", OUT]);
rmSync(TMP, { force: true });

const size = execFileSync("magick", ["identify", "-format", "%wx%h %b", OUT]).toString();
console.log("wrote assets/img/og-card.jpg —", size);
if (errors.length) console.log("page errors:", errors.slice(0, 4));
