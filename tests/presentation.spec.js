const { test, expect } = require("@playwright/test");

test.describe("Man–Computer Symbiosis found-film workprint", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
  });

  test("loads the complete 27-scene workprint and its local assets", async ({ page }) => {
    await expect(page.locator(".scene")).toHaveCount(27);
    await expect(page.locator(".speaker-notes")).toHaveCount(27);
    await expect(page.locator(".scene--workprint")).toHaveCount(13);
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-00");

    const incompleteImages = await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
    );
    expect(incompleteImages).toEqual([]);
  });

  test("starts as pure black and arms the projector on the first gesture", async ({ page }) => {
    await expect(page.locator("body")).not.toHaveClass(/projector-started/);
    await expect(page.locator("#scene-00")).toHaveClass(/is-active/);
    await expect(page.locator(".leader-cue--property")).toHaveCSS("opacity", "0");

    await page.keyboard.press("Space");

    await expect(page.locator("body")).toHaveClass(/projector-started/);
    expect(await page.evaluate(() => window.__symbiosisDeck.state.started)).toBe(true);
    await expect(page.locator("#scene-00")).toHaveClass(/is-active/);
  });

  test("withholds the subject until the title card", async ({ page }) => {
    const preTitleText = await page
      .locator("#scene-00 .scene-stage, #scene-01 .scene-stage, #scene-02 .scene-stage, #scene-03 .scene-stage")
      .allTextContents();
    expect(preTitleText.join(" ")).not.toContain("MAN–COMPUTER SYMBIOSIS");
    await expect(page.locator("#scene-04 h1")).toContainText("MAN–COMPUTER");
    await expect(page.locator("#scene-04 h1")).toContainText("SYMBIOSIS");
    await expect(page.locator("#scene-04")).toContainText("J. C. R. LICKLIDER");
  });

  test("advances through specimen and definition builds deterministically", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(2, { silent: true }));
    await expect(page.locator("#scene-02 .specimen-window")).not.toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-02 .specimen-window")).toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-02 .specimen-label")).toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-03");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-03 [data-build='1']")).toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("#scene-03 [data-build='1']")).not.toHaveClass(/is-visible/);
  });

  test("stages the 1960 batch process through the final experiment card", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(5, { silent: true }));
    for (let build = 1; build <= 6; build += 1) {
      await page.keyboard.press("Space");
      await expect(page.locator(`#scene-05 [data-build='${build}']`).first()).toHaveClass(/is-visible/);
    }

    await expect(page.locator("#scene-05 .paper-output")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-05 .another-experiment")).toContainText("ANOTHER EXPERIMENT");

    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-06");
    await expect(page.locator("#scene-06")).toContainText("WHAT IS THE QUESTION?");
  });

  test("records audience estimates without a network dependency", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(8, { silent: true }));
    await page.locator("#thinking-estimate").fill("65");
    await expect(page.locator("#estimate-output")).toHaveText("65%");
    await page.locator("#lock-estimate").click();
    await expect(page.locator("#estimate-status")).toContainText("Marked 65%");
    await expect(page.locator("#audience-marks .audience-mark")).toHaveCount(1);
    await expect(page.locator("#audience-marks .audience-mark")).toHaveAttribute("data-value", "65");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(9, { silent: true }));
    await expect(page.locator("#scene-09 .eighty-five-stage")).toHaveText("85%");
  });

  test("turns six incompatible datasets into a timed comparable plot", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(10, { silent: true }));
    await expect(page.locator("#scene-10 .data-slip")).toHaveCount(6);
    await page.evaluate(() => window.__symbiosisDeck.setBuild(3, { silent: true }));
    await expect(page.locator("#scene-10 .not-comparable")).toHaveClass(/is-visible/);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(11, { silent: true }));
    await page.keyboard.press("Space");
    await expect(page.locator("#scene-11 [data-build='5']")).toHaveClass(/is-visible/, { timeout: 2_000 });
    await expect(page.locator("#clerical-counter")).toHaveText("0862", { timeout: 2_000 });
  });

  test("cuts from the clean graph into the two-beat manifesto", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(12, { silent: true }));
    await expect(page.locator("#scene-12 .insight-series > path")).toBeVisible();
    await expect(page.locator("#scene-12")).not.toHaveClass(/scene--workprint/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-13");
    await expect(page.locator("#scene-13 .manifesto-two")).not.toHaveClass(/is-visible/);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-13 .manifesto-two")).toHaveClass(/is-visible/);
  });

  test("keeps notes, references, sound, and direct scene navigation available", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(4, { silent: true }));
    await page.keyboard.press("n");
    await expect(page.locator("#notes-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#notes-content h2")).toContainText("Scene 04");

    await page.keyboard.press("Escape");
    await page.keyboard.press("r");
    await expect(page.locator("#reference-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#reference-panel a[href*='Licklider.html']")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.keyboard.press("m");
    await expect(page.locator("body")).toHaveClass(/sound-muted/);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(26, { silent: true }));
    await expect(page).toHaveURL(/#scene-26$/);
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-26");
  });

  test("keeps every scene bounded and free of runtime errors", async ({ page }) => {
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (let index = 0; index < 27; index += 1) {
      await page.evaluate((sceneIndex) => {
        window.__symbiosisDeck.goToSlide(sceneIndex, { build: 99, silent: true });
      }, index);
      const activeScene = page.locator(".scene.is-active");
      const activeBounds = await activeScene.boundingBox();
      expect(activeBounds).not.toBeNull();
      expect(activeBounds.x).toBeGreaterThanOrEqual(-1);
      expect(activeBounds.y).toBeGreaterThanOrEqual(-1);
      expect(activeBounds.width).toBeLessThanOrEqual(page.viewportSize().width + 2);
      expect(activeBounds.height).toBeLessThanOrEqual(page.viewportSize().height + 2);
    }

    expect(runtimeErrors).toEqual([]);
  });
});
