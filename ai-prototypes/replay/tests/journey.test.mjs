import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
let server;
let browser;
let baseUrl;

before(async () => {
  server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, "http://local").pathname;
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
      const file = join(root, relative);
      const body = await readFile(file);
      response.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
});

async function runJourney(mode) {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/fixtures/checkout.html?mode=${mode}`);
  await page.getByRole("button", { name: "Change delivery method" }).click();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const result = await page.getByRole("dialog", { name: "Choose delivery method" }).evaluate((dialog) => ({
    contained: dialog.contains(document.activeElement),
    activeName: document.activeElement.textContent.trim().replace(/\s+/g, " "),
  }));
  await page.close();
  return result;
}

test("the captured journey proves the bug and the repair", async () => {
  const broken = await runJourney("broken");
  const fixed = await runJourney("fixed");
  assert.equal(broken.contained, false, `broken fixture unexpectedly kept focus on ${broken.activeName}`);
  assert.equal(fixed.contained, true, `fixed fixture lost focus to ${fixed.activeName}`);
});
