const { test, expect } = require("@playwright/test");

test.describe("Man–Computer Symbiosis presentation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("./");
    await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
  });

  test("loads all scenes, notes, and archival assets", async ({ page }) => {
    await expect(page.locator(".slide")).toHaveCount(22);
    await expect(page.locator(".speaker-notes")).toHaveCount(22);
    await expect(page.locator(".slide.is-active")).toHaveAttribute("id", "scene-01");

    const incompleteImages = await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
    );
    expect(incompleteImages).toEqual([]);

    const underspecifiedNotes = await page.locator(".speaker-notes").evaluateAll((notes) =>
      notes
        .map((note, index) => ({ index, text: note.textContent || "" }))
        .filter(({ text }) => text.length < 300 || !text.includes("Source"))
        .map(({ index }) => index + 1),
    );
    expect(underspecifiedNotes).toEqual([]);
  });

  test("keyboard navigation respects progressive builds", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-01")).toHaveClass(/is-active/);
    await expect(page.locator("#scene-01 [data-build='1']")).toHaveClass(/is-visible/);

    await page.keyboard.press("Space");
    await expect(page.locator("#scene-01 [data-build='2']")).toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".slide.is-active")).toHaveAttribute("id", "scene-02");
    await expect(page).toHaveURL(/#scene-02$/);

    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(".slide.is-active")).toHaveAttribute("id", "scene-01");
    await expect(page.locator("#scene-01 [data-build='2']")).toHaveClass(/is-visible/);
  });

  test("speaker notes and references are available from the keyboard", async ({ page }) => {
    await page.keyboard.press("n");
    await expect(page.locator("#notes-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#notes-content h2")).toContainText("Scene 01");

    await page.keyboard.press("Escape");
    await expect(page.locator("#notes-panel")).toHaveAttribute("aria-hidden", "true");

    await page.keyboard.press("r");
    await expect(page.locator("#reference-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#reference-panel")).toContainText("Quote Register");
    await expect(page.locator("#reference-panel a[href*='Licklider.html']")).toBeVisible();
  });

  test("audience checkpoints and illustrative interactions work locally", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(6));
    await page.locator("#thinking-estimate").fill("65");
    await expect(page.locator("#estimate-output")).toHaveText("65%");
    await page.locator("#lock-estimate").click();
    await expect(page.locator("#estimate-status")).toContainText("65%");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(15));
    await page.locator("#clean-sketch").click();
    await expect(page.locator("#sketch-surface")).toHaveClass(/is-cleaned/);
    await expect(page.locator("#sketch-status")).toContainText("READY TO INSPECT");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(20));
    await page.locator("#friction-word").fill("reproducing results");
    await page.locator("#word-entry button[type='submit']").click();
    await expect(page.locator("#word-field")).toContainText("REPRODUCING RESULTS");
  });

  test("final post-credit appears after the projector stops", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(21, { build: 3 }));
    await expect(page.locator("#scene-22 .projector-end")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-22 .post-credit")).toHaveCSS("opacity", "1", { timeout: 5_000 });
    await expect(page.locator("#scene-22 .post-credit")).toContainText("NEXT REEL?");
  });

  test("all scenes remain bounded and free of runtime errors", async ({ page }) => {
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.emulateMedia({ reducedMotion: "reduce" });

    for (let index = 0; index < 22; index += 1) {
      await page.evaluate((slideIndex) => window.__symbiosisDeck.goToSlide(slideIndex), index);
      await page.locator(".slide.is-active").evaluate((activeSlide) => {
        activeSlide.getAnimations().forEach((animation) => animation.finish());
      });
      const activeBounds = await page.locator(".slide.is-active").boundingBox();
      expect(activeBounds).not.toBeNull();
      expect(activeBounds.x).toBeGreaterThanOrEqual(0);
      expect(activeBounds.y).toBeGreaterThanOrEqual(0);
      expect(activeBounds.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
      expect(activeBounds.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
    }

    expect(runtimeErrors).toEqual([]);
  });
});
