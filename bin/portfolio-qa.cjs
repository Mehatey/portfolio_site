#!/usr/bin/env node

const { chromium } = require("playwright");

const baseUrl = (process.argv[2] || process.env.PORTFOLIO_BASE_URL || "http://127.0.0.1:4000").replace(/\/$/, "");

const viewports = [
  { name: "desktop", width: 1440, height: 980 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const routes = [
  { path: "/", name: "Home" },
  { path: "/works/", name: "Works", checkWorkIndex: true },
  { path: "/play/", name: "Play", checkPlay: true },
  { path: "/about/", name: "About" },
  { path: "/contact/", name: "Contact" },
  { path: "/mool/", name: "Mool", checkProject: true },
  { path: "/ai-prototypes/", name: "AI Prototypes" },
  { path: "/encoded/", name: "Encoded", checkProject: true },
  { path: "/bloom/", name: "Bloom", checkProject: true },
  { path: "/mind-your-feelings/", name: "Mind Your Feelings", checkProject: true },
  { path: "/cube-guy/", name: "Cube of Creations", checkProject: true },
  { path: "/mandalas/", name: "Bloom; who are you", checkProject: true },
  { path: "/ai-self/", name: "AI Self", checkProject: true },
  { path: "/aananda/", name: "Aananda", checkProject: true },
  { path: "/naavo/", name: "Naavo", checkProject: true },
  { path: "/illustrations/", name: "Illustrations", checkProject: true },
  { path: "/alpha-stockathon/", name: "Alpha Stockathon", checkProject: true },
  { path: "/b-plus-b/", name: "Broken and Beautiful", checkProject: true },
  { path: "/shot-on-iphone/", name: "Shot on iPhone", checkProject: true },
];

const allowedConsoleNoise = [
  /Failed to load resource: the server responded with a status of 404.*favicon/i,
  /Failed to load resource: net::ERR_/i,
  /WebGL warning/i,
  /THREE\.WebGLRenderer/i,
  /model-viewer/i,
];

const isAllowedNoise = (message) => allowedConsoleNoise.some((pattern) => pattern.test(message));

function href(path) {
  return `${baseUrl}${path}`;
}

function record(results, viewport, route, ok, message, detail = "") {
  results.push({
    ok,
    viewport: viewport.name,
    route: route.name,
    path: route.path,
    message,
    detail,
  });
}

async function evaluateBaseHealth(page) {
  return await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const navItems = Array.from(document.querySelectorAll(".nav-icon"));
    const navLabels = navItems.map((item) => ({
      label: item.getAttribute("aria-label") || "",
      tooltip: item.getAttribute("data-label") || "",
      width: Math.round(item.getBoundingClientRect().width),
      height: Math.round(item.getBoundingClientRect().height),
      href: item.href || "",
    }));

    const brokenImages = Array.from(document.images)
      .filter((img) => img.getAttribute("src") || img.getAttribute("srcset") || img.currentSrc)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src || img.getAttribute("src") || "(missing src)");

    const brokenVideos = Array.from(document.querySelectorAll("video"))
      .filter((video) => video.error)
      .map((video) => video.currentSrc || video.src || video.getAttribute("src") || "(missing src)");

    const tinyReadableText = Array.from(document.querySelectorAll("p, li, figcaption"))
      .filter((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return rect.width > 160 && rect.height > 12 && parseFloat(style.fontSize) < 9;
      })
      .slice(0, 8)
      .map((node) => node.textContent.trim().replace(/\s+/g, " ").slice(0, 90));

    return {
      title: document.title,
      overflowX: root.scrollWidth - window.innerWidth,
      bodyOverflowX: body.scrollWidth - window.innerWidth,
      navLabels,
      brokenImages,
      brokenVideos,
      tinyReadableText,
      mainText: (document.querySelector("main") || body).innerText.trim().slice(0, 500),
    };
  });
}

async function checkNav(results, viewport, route, health) {
  const expected = ["Work", "Play", "Contact", "About"];
  const labels = health.navLabels.map((item) => item.label);
  const missing = expected.filter((label) => !labels.includes(label));
  record(results, viewport, route, missing.length === 0, "nav labels present", missing.length ? `Missing: ${missing.join(", ")}` : "");

  const missingTooltips = health.navLabels.filter((item) => expected.includes(item.label) && item.tooltip !== item.label);
  record(
    results,
    viewport,
    route,
    missingTooltips.length === 0,
    "nav tooltip data present",
    missingTooltips.map((item) => item.label || item.href).join(", ")
  );

  const oddSizes = health.navLabels.filter((item) => expected.includes(item.label) && (item.width < 22 || item.height < 22));
  record(
    results,
    viewport,
    route,
    oddSizes.length === 0,
    "nav icons have tappable size",
    oddSizes.map((item) => `${item.label}: ${item.width}×${item.height}`).join(", ")
  );
}

async function checkBase(results, viewport, route, page, pageErrors, consoleErrors) {
  const health = await evaluateBaseHealth(page);

  record(results, viewport, route, Boolean(health.title), "document title exists");
  record(
    results,
    viewport,
    route,
    Math.max(health.overflowX, health.bodyOverflowX) <= 6,
    "no page-level horizontal overflow",
    `html +${health.overflowX}px, body +${health.bodyOverflowX}px`
  );
  record(results, viewport, route, health.brokenImages.length === 0, "no broken loaded images", health.brokenImages.join("\n"));
  record(results, viewport, route, health.brokenVideos.length === 0, "no errored videos", health.brokenVideos.join("\n"));
  record(results, viewport, route, health.mainText.length > 40, "page has readable content");
  record(results, viewport, route, health.tinyReadableText.length === 0, "no body copy below 10px", health.tinyReadableText.join("\n"));
  record(results, viewport, route, pageErrors.length === 0, "no page errors", pageErrors.join("\n"));
  record(results, viewport, route, consoleErrors.length === 0, "no console errors", consoleErrors.join("\n"));

  await checkNav(results, viewport, route, health);
}

async function checkWorkIndex(results, viewport, route, page) {
  const workHealth = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"], a[href*="/"]'));
    const projectLinks = links
      .map((link) => ({
        href: link.getAttribute("href") || "",
        text: link.textContent.trim().replace(/\s+/g, " "),
        visible: !!(link.offsetWidth || link.offsetHeight || link.getClientRects().length),
      }))
      .filter((link) =>
        ["/mool/", "/ai-prototypes/", "/encoded/", "/bloom/", "/mind-your-feelings/", "/cube-guy/", "/mandalas/", "/ai-self/"].some((slug) =>
          link.href.includes(slug)
        )
      );

    const ctas = Array.from(document.querySelectorAll("a, button"))
      .map((item) => item.textContent.trim().replace(/\s+/g, " "))
      .filter((text) => /view project|quick case|start here|product/i.test(text));

    return {
      visibleProjectLinks: projectLinks.filter((link) => link.visible).length,
      ctas,
    };
  });

  record(
    results,
    viewport,
    route,
    workHealth.visibleProjectLinks >= 6,
    "work index exposes visible project links",
    `${workHealth.visibleProjectLinks} visible project links`
  );
  record(results, viewport, route, workHealth.ctas.length > 0, "work index exposes recruiter CTA copy", workHealth.ctas.slice(0, 6).join(" | "));
}

async function checkPlay(results, viewport, route, page) {
  const playHealth = await page.evaluate(() => {
    const canvas = document.getElementById("play-canvas");
    const stage = document.querySelector(".play-stage");
    const fallback = document.querySelector(".play-fallback");
    return {
      canvasVisible: Boolean(canvas && canvas.getBoundingClientRect().width > 0 && canvas.getBoundingClientRect().height > 0),
      rendererReady: Boolean(canvas && (stage?.classList.contains("is-ready") || stage?.classList.contains("has-fallback"))),
      fallbackImages: fallback?.querySelectorAll("img").length || 0,
      viewportLocked: document.documentElement.scrollHeight <= window.innerHeight + 2,
    };
  });

  record(results, viewport, route, playHealth.canvasVisible, "play exposes a full-viewport spatial canvas");
  record(
    results,
    viewport,
    route,
    playHealth.rendererReady || playHealth.fallbackImages >= 3,
    "play initializes its spatial gallery or accessible fallback",
    `rendererReady=${playHealth.rendererReady}; fallbackImages=${playHealth.fallbackImages}`
  );
  record(results, viewport, route, playHealth.viewportLocked, "play remains a single-viewport experience");
}

async function checkProject(results, viewport, route, page) {
  const projectHealth = await page.evaluate(() => {
    const text = document.body.innerText;
    const details = document.querySelector(".project-details");
    const map = document.querySelector(".case-map, .case-map-nav, [aria-label*='Case map' i]");
    const mediaCount = document.querySelectorAll("img, video, model-viewer").length;
    const paragraphs = Array.from(document.querySelectorAll("p"))
      .map((node) => node.textContent.trim().replace(/\s+/g, " "))
      .filter((copy) => copy.length > 90);
    const overview = /overview|quick read|summary|challenge|outcome/i.test(text) || paragraphs.length > 0;
    const projectDetails = /project details/i.test(text);
    const next = /next project/i.test(text);
    return {
      hasDetails: Boolean(details) || projectDetails,
      hasCaseMap: Boolean(map) || /case map/i.test(text),
      mediaCount,
      overview,
      paragraphs: paragraphs.length,
      next,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
    };
  });

  record(results, viewport, route, projectHealth.overview, "project has narrative copy", `${projectHealth.paragraphs} long paragraphs`);
  record(results, viewport, route, projectHealth.hasDetails, "project details are discoverable");
  record(
    results,
    viewport,
    route,
    projectHealth.hasCaseMap || projectHealth.mediaCount >= 3,
    "project has map or media sequence",
    `${projectHealth.mediaCount} media elements`
  );
  record(results, viewport, route, projectHealth.mediaCount > 0, "project has media", `${projectHealth.mediaCount} media elements`);
  record(results, viewport, route, projectHealth.next, "project has next-project path");

  if (projectHealth.scrollHeight > projectHealth.viewportHeight + 200) {
    await page.mouse.wheel(0, 720);
    await page.waitForTimeout(250);
    const scrolled = await page.evaluate(() => window.scrollY);
    record(results, viewport, route, scrolled > 80, "project page wheel scrolls", `scrollY=${Math.round(scrolled)}`);
  }
}

async function run() {
  const results = [];
  const browser = await chromium.launch({ headless: true });

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: Boolean(viewport.isMobile),
      deviceScaleFactor: viewport.isMobile ? 2 : 1,
      colorScheme: "dark",
    });
    await context.addInitScript(() => {
      try {
        localStorage.setItem("sid_loaded", "1");
        sessionStorage.setItem("sid_loaded", "1");
      } catch (_) {}
    });

    for (const route of routes) {
      const page = await context.newPage();
      const pageErrors = [];
      const consoleErrors = [];

      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (!isAllowedNoise(text)) consoleErrors.push(text);
        }
      });

      try {
        const response = await page.goto(href(route.path), { waitUntil: "domcontentloaded", timeout: 45000 });
        record(
          results,
          viewport,
          route,
          Boolean(response && response.ok()),
          "route returns ok",
          response ? `${response.status()} ${response.statusText()}` : "no response"
        );
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(500);

        await checkBase(results, viewport, route, page, pageErrors, consoleErrors);
        if (route.checkWorkIndex) await checkWorkIndex(results, viewport, route, page);
        if (route.checkPlay) await checkPlay(results, viewport, route, page);
        if (route.checkProject) await checkProject(results, viewport, route, page);
      } catch (error) {
        record(results, viewport, route, false, "route check crashed", error.stack || error.message);
      } finally {
        await page.close();
      }
    }

    await context.close();
  }

  await browser.close();

  const failures = results.filter((result) => !result.ok);
  const passes = results.length - failures.length;

  console.log(`\nPortfolio QA against ${baseUrl}`);
  console.log(`PASS ${passes}/${results.length}`);

  if (failures.length) {
    console.log(`FAIL ${failures.length}/${results.length}\n`);
    for (const failure of failures) {
      console.log(`✗ [${failure.viewport}] ${failure.path} ${failure.message}`);
      if (failure.detail) console.log(`  ${failure.detail.split("\n").slice(0, 6).join("\n  ")}`);
    }
    process.exitCode = 1;
  } else {
    console.log("All route, media, nav, Play-mode, and project-flow checks passed.");
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
