const { chromium } = require("@playwright/test");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");

const rootDirectory = path.resolve(__dirname, "..");
const artifactDirectory = path.join(rootDirectory, "artifacts");
const sceneDirectory = path.join(artifactDirectory, "scenes");
const port = 4174;
const sceneCount = 35;
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const statusCode = await new Promise((resolve, reject) => {
        const request = http.get(baseUrl, (response) => {
          response.resume();
          resolve(response.statusCode || 0);
        });
        request.on("error", reject);
        request.setTimeout(1_000, () => request.destroy(new Error("Server poll timed out.")));
      });
      if (statusCode >= 200 && statusCode < 400) return;
    } catch {
      // The local server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error("Timed out waiting for the local presentation server.");
}

async function makeContactSheet(page, variant) {
  const cards = Array.from({ length: sceneCount }, (_, index) => {
    const sceneNumber = String(index).padStart(2, "0");
    const filename = `scene-${sceneNumber}-${variant}.png`;
    return `<figure><img src="${baseUrl}/artifacts/scenes/${filename}" alt="Scene ${sceneNumber}"><figcaption>SCENE ${sceneNumber} · ${variant.toUpperCase()}</figcaption></figure>`;
  }).join("");

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.setContent(`
    <!doctype html>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 24px; color: #e7dcc0; background: #11120f; font-family: "Courier New", monospace; }
      main { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
      figure { margin: 0; padding: 7px; border: 1px solid #655d4d; background: #090a08; }
      img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
      figcaption { padding: 7px 2px 1px; font-size: 12px; letter-spacing: 0.12em; }
    </style>
    <main>${cards}</main>
  `);
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete));
  await page.screenshot({ path: path.join(artifactDirectory, `contact-sheet-${variant}.png`), fullPage: true });
}

async function capture() {
  await fs.rm(artifactDirectory, { recursive: true, force: true });
  await fs.mkdir(sceneDirectory, { recursive: true });

  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: rootDirectory,
    stdio: "ignore",
  });

  let browser;
  try {
    await waitForServer();
    browser = await chromium.launch();
    const browserContext = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await browserContext.newPage();
    await page.goto(baseUrl);
    await page.waitForFunction(() => Boolean(window.__symbiosisDeck));

    for (let index = 0; index < sceneCount; index += 1) {
      const sceneNumber = String(index).padStart(2, "0");
      await page.evaluate((slideIndex) => window.__symbiosisDeck.goToSlide(slideIndex, { build: 0, silent: true }), index);
      await page.waitForTimeout(750);
      await page.screenshot({ path: path.join(sceneDirectory, `scene-${sceneNumber}-initial.png`) });

      await page.evaluate((slideIndex) => window.__symbiosisDeck.goToSlide(slideIndex, { build: 99, silent: true }), index);
      await page.waitForTimeout(index === 33 ? 3_800 : 800);
      await page.screenshot({ path: path.join(sceneDirectory, `scene-${sceneNumber}-final.png`) });
    }

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(6, { build: 0, silent: true }));
    await page.waitForTimeout(620);
    await page.screenshot({ path: path.join(artifactDirectory, "scene-06-question.png") });

    await makeContactSheet(page, "initial");
    await makeContactSheet(page, "final");
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}

capture().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
