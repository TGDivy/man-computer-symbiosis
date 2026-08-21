const { test, expect } = require("@playwright/test");

async function loadDeck(page, path = "./") {
  await page.goto(path);
  await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
}

test.describe("Man-Computer Symbiosis presentation", () => {
  test.beforeEach(async ({ page }) => {
    await loadDeck(page);
  });

  test("loads the complete 32-scene presentation and all local images", async ({ page }) => {
    await expect(page.locator(".scene")).toHaveCount(32);
    await expect(page.locator(".speaker-notes")).toHaveCount(32);
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-00");
    await expect(page.locator("#scene-indicator")).toHaveText("00 / 31");
    await expect(page.locator("body")).toHaveClass(/opening-wonder/);

    const incompleteImages = await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
    );
    expect(incompleteImages).toEqual([]);
  });

  test("shows the wide-screen gate on narrow or portrait devices", async ({ page }) => {
    const viewport = page.viewportSize();
    const shouldGate = viewport.width < 900 || viewport.height < 540 || viewport.height > viewport.width;
    if (shouldGate) await expect(page.locator(".device-gate")).toBeVisible();
    else await expect(page.locator(".device-gate")).toBeHidden();
    await expect(page.locator(".device-gate")).toContainText("DESKTOP");
  });

  test("uses Wonder Cut by default and keeps the Mystery Cut selectable", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(1, { silent: true }));
    await expect(page.locator("#scene-01 .fig-image--wonder")).toBeVisible();
    await expect(page.locator("#scene-01")).not.toContainText("A FIG");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(2, { build: 2, silent: true }));
    await expect(page.locator("#scene-02 .specimen-window--scientific")).toBeVisible();
    await expect(page.locator("#scene-02 .specimen-label")).toContainText("BLASTOPHAGA PSENES");

    await loadDeck(page, "./?opening=mystery");
    await expect(page.locator("body")).toHaveClass(/opening-mystery/);
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(1, { silent: true }));
    await expect(page.locator("#scene-01 .fig-image--mystery")).toBeVisible();
  });

  test("replays the leader without a reload", async ({ page }) => {
    await page.keyboard.press("Space");
    await expect(page.locator("body")).toHaveClass(/projector-started/);
    expect(await page.evaluate(() => window.__symbiosisDeck.state.started)).toBe(true);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(3, { silent: true }));
    await page.evaluate(() => window.__symbiosisDeck.replayLeader());

    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-00");
    await expect(page.locator("body")).toHaveClass(/projector-started/);
    expect(await page.evaluate(() => window.__symbiosisDeck.state.leaderComplete)).toBe(false);
  });

  test("cuts to the human-computer symbiosis question before revealing the paper title", async ({ page }) => {
    const openingText = await page.locator("#scene-00, #scene-01, #scene-02, #scene-03").allTextContents();
    expect(openingText.join(" ")).not.toContain("MAN–COMPUTER SYMBIOSIS");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(3, { build: 2, silent: true }));
    await expect(page.locator("#scene-03 .type-line--definition")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-03 .symbiosis-question")).not.toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-03 .symbiosis-question")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-03 .symbiosis-question span")).toHaveCount(3);
    await expect(page.locator("#scene-03 .symbiosis-question span").nth(0)).toHaveText("WHAT WOULD SYMBIOSIS");
    await expect(page.locator("#scene-03 .symbiosis-question span").nth(1)).toHaveText("BETWEEN A HUMAN AND A COMPUTER");
    await expect(page.locator("#scene-03 .symbiosis-question span").nth(2)).toHaveText("REQUIRE?");
    await expect(page.locator("#scene-03 .symbiosis-question")).toHaveCSS("background-color", "rgb(3, 3, 2)");
    await expect(page.locator("#scene-03 .partner-turn, #scene-03 .partner-replacement, #scene-03 .coupling-line")).toHaveCount(0);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(4, { build: 1, silent: true }));
    await expect(page.locator("#scene-04 h1")).toContainText("MAN–COMPUTER");
    await expect(page.locator("#scene-04")).toContainText("J. C. R. LICKLIDER");
  });

  test("stages the graph sequence from six measures through clerical work", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(11, { build: 2, silent: true }));
    await expect(page.locator("#scene-11 .measure-card")).toHaveCount(6);
    await expect(page.locator("#scene-11 .same-question")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-11 .different-measures")).toHaveClass(/is-visible/);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(12, { silent: true }));
    await page.keyboard.press("Space");
    await expect(page.locator("#scene-12 [data-build='5']")).toHaveClass(/is-visible/, { timeout: 2_000 });
    await expect(page.locator("#clerical-counter")).toHaveText("0862", { timeout: 2_000 });

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(13, { silent: true }));
    await expect(page.locator("#scene-13 .insight-series > path")).toBeVisible();
  });

  test("moves work in both directions in the Scene 16 exchange", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(16, { build: 5, silent: true }));
    await expect(page.locator("#scene-16 .capability-panel--human")).toContainText("GOAL");
    await expect(page.locator("#scene-16 .capability-panel--human")).toContainText("CRITERION");
    await expect(page.locator("#scene-16 .capability-panel--machine")).toContainText("NORMALIZE");
    await expect(page.locator("#scene-16 .transfer-card--outgoing")).toContainText("TEST THIS RELATION");
    await expect(page.locator("#scene-16 .transfer-card--return")).toContainText("EVIDENCE · ANOMALY · ALTERNATIVE");
    await expect(page.locator("#scene-16 .human-evaluation")).toContainText("BETTER NEXT QUESTION");
  });

  test("keeps the audience prompt temporary and limited to three cards", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(18, { silent: true }));
    const input = page.locator("#thinking-action");
    for (const response of ["Search", "Format", "Compare", "Translate representations"]) {
      await input.fill(response);
      await page.locator("#file-thinking-action").click();
    }

    await expect(page.locator("#thinking-responses li")).toHaveCount(3);
    await expect(page.locator("#thinking-responses")).not.toContainText("Search");
    await expect(page.locator("#thinking-responses")).toContainText("Translate representations");
    await expect(page.locator("[data-response-action]")).toHaveCount(0);

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(18, { silent: true }));
    await expect(page.locator("#thinking-responses li")).toHaveCount(0);
  });

  test("builds a causal prerequisite chain into the relationship question", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(20, { build: 3, silent: true }));
    await expect(page.locator("#scene-20 .thinking-center-copy strong")).toContainText(/AT THE MOMENT\s*OF THOUGHT/);
    await expect(page.locator("#scene-20")).toContainText("LIBRARY · RETRIEVAL · COMPUTATION");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(21, { build: 4, silent: true }));
    await expect(page.locator("#scene-21 .memory-index-card--query strong")).toContainText(/MATRIX\s*MULTIPLICATION/);
    await expect(page.locator("#scene-21 .memory-index-card--return strong")).toContainText(/THE ENTIRE PROGRAM/);
    await expect(page.locator("#scene-21 .memory-nearby-trail")).toContainText("NEARBY NAMES");
    await expect(page.locator("#scene-21 .memory-designation")).toContainText("BY NAMING OR POINTING");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(23, { build: 4, silent: true }));
    await expect(page.locator("#scene-23")).toContainText("THE SAME WORK SURFACE");
    await expect(page.locator("#scene-23 .team-surface")).toContainText("COMMON SITUATION · DIFFERENT RESPONSIBILITIES");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(25, { build: 4, silent: true }));
    await expect(page.locator("#scene-25 .relation-question")).toContainText("WHAT KIND OF RELATION");
  });

  test("uses the honest speech fallback when recognition is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
      } catch {
        // Assignment below covers browsers that retain either property.
      }
      window.SpeechRecognition = undefined;
      window.webkitSpeechRecognition = undefined;
    });
    await loadDeck(page);
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(24, { silent: true }));
    await expect(page.locator("#speech-fallback")).toBeVisible();
    await expect(page.locator("#speech-record")).toBeDisabled();
    await page.locator("#speech-fallback-input").fill("A spoken hypothesis");
    await expect(page.locator("#speech-transcript")).toHaveText("A spoken hypothesis");
  });

  test("turns the relationship cards into discussion without recording a tally", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(27, { silent: true }));
    await page.locator(".relationship-card--partner").click();

    await expect(page.locator(".relationship-card--partner")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#scene-27 .relationship-followup")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-27 .relationship-followup")).toContainText("WHAT WOULD HAVE TO BE TRUE");
    await expect(page.locator("#relationship-status")).toContainText("The selection is not recorded");
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
  });

  test("grounds the optimistic ending in an actual exchange and attributed text", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(28, { build: 4, silent: true }));
    await expect(page.locator("#scene-28 .storyboard-direction h3")).toContainText(/STORYBOARD\s*BEFORE BUILD/);
    await expect(page.locator("#scene-28 .storyboard-direction")).toContainText("ART DIRECTION");
    await expect(page.locator("#scene-28 .storyboard-iteration h3")).toContainText(/VARIATIONS\s*BECOME VISIBLE/);
    await expect(page.locator("#scene-28 .critique-passes")).toContainText("POSSIBLE PERSPECTIVES · SUGGESTED EDITS · NOT DECISIONS");
    await expect(page.locator("#scene-28 .storyboard-return")).toContainText("COMPARE · CHOOSE · REJECT · REDIRECT · RE-STORYBOARD");
    await expect(page.locator("#scene-28 .blended-quote")).toContainText("DIFFICULT TO SEPARATE THEM NEATLY");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(29, { build: 2, silent: true }));
    await expect(page.locator("#scene-29 .interim-quote")).toContainText("MOST CREATIVE AND EXCITING");
    await expect(page.locator("#scene-29 .interim-quote cite")).toContainText("J. C. R. LICKLIDER · §1.2");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(30, { build: 2, silent: true }));
    await expect(page.locator("#scene-30 .coda-film-step--one")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-30 .coda-film-step--two")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-30 .coda-film-frame img")).toHaveCount(3);
    await expect(page.locator("#scene-30 .coda-film-frame--wasp img")).toBeVisible();
    await expect(page.locator("#scene-30 .film-coda-conclusion")).toContainText("THRIVING PARTNERSHIP");
    await expect(page.locator("#scene-30 .film-coda-conclusion cite")).toContainText("J. C. R. LICKLIDER · §1.1");
  });

  test("arms Web Audio and changes the score with the narrative arc", async ({ page }) => {
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.keyboard.press("Space");
    await expect.poll(() => page.evaluate(() => window.__symbiosisDeck.state.sound.contextState)).toBe("running");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(3, { build: 3, silent: true }));
    let score = await page.evaluate(() => window.__symbiosisDeck.state.sound);
    expect(score.levels.organic).toBe(0);
    expect(score.projector).toBeLessThan(0.001);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(12, { build: 5, silent: true }));
    score = await page.evaluate(() => window.__symbiosisDeck.state.sound);
    expect(score.levels.clerical).toBeGreaterThan(0.9);
    expect(score.pulse.level).toBeGreaterThan(0.7);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(20, { silent: true }));
    score = await page.evaluate(() => window.__symbiosisDeck.state.sound);
    expect(score.prerequisiteLayers).toBe(1);
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(25, { build: 3, silent: true }));
    score = await page.evaluate(() => window.__symbiosisDeck.state.sound);
    expect(score.prerequisiteLayers).toBe(5);
    expect(score.levels.prerequisites).toBeGreaterThan(0.8);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(29, { build: 2, silent: true }));
    score = await page.evaluate(() => window.__symbiosisDeck.state.sound);
    expect(score.levels.coda).toBeGreaterThan(0.6);
    expect(score.pulse.level).toBe(0);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(30, { silent: true }));
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    score = await page.evaluate(() => window.__symbiosisDeck.state.sound);
    expect(score.buildIndex).toBe(2);
    expect(score.levels.organic).toBeGreaterThan(0.4);
    expect(score.levels.coda).toBeGreaterThan(0.7);
    expect(score.levels.product).toBeGreaterThan(0);
    expect(score.contextState).toBe("running");
    expect(runtimeErrors).toEqual([]);
  });

  test("keeps panels, direct navigation, and every scene within the viewport", async ({ page }) => {
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.keyboard.press("n");
    await expect(page.locator("#notes-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#notes-content h2")).toContainText("Scene 00");
    await page.keyboard.press("Escape");
    await page.keyboard.press("r");
    await expect(page.locator("#reference-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#reference-panel a[href*='Licklider.html']")).toBeVisible();
    await page.keyboard.press("Escape");

    for (let index = 0; index < 32; index += 1) {
      await page.evaluate((sceneIndex) => {
        window.__symbiosisDeck.goToSlide(sceneIndex, { build: 99, silent: true });
      }, index);
      const bounds = await page.locator(".scene.is-active").boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds.x).toBeGreaterThanOrEqual(-1);
      expect(bounds.y).toBeGreaterThanOrEqual(-1);
      expect(bounds.width).toBeLessThanOrEqual(page.viewportSize().width + 2);
      expect(bounds.height).toBeLessThanOrEqual(page.viewportSize().height + 2);
    }

    await expect(page).toHaveURL(/#scene-31$/);
    expect(runtimeErrors).toEqual([]);
  });
});

test("uses SpeechRecognition and speech synthesis when the browser provides them", async ({ page }) => {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      start() {
        this.onstart?.();
        this.onresult?.({
          resultIndex: 0,
          results: {
            length: 1,
            0: {
              0: { transcript: "Test the hypothesis against new evidence." },
            },
          },
        });
        this.onend?.();
      }

      stop() {
        this.onend?.();
      }
    }

    window.SpeechRecognition = MockSpeechRecognition;
    window.speechSynthesis = {
      cancel() {},
      speak(utterance) {
        utterance.onstart?.();
        utterance.onend?.();
      },
    };
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });

  await loadDeck(page);
  await page.evaluate(() => window.__symbiosisDeck.goToSlide(24, { silent: true }));
  await expect(page.locator("#speech-fallback")).toBeHidden();
  await expect(page.locator("#speech-record")).toBeEnabled();

  await page.locator("#speech-record").click();
  await expect(page.locator("#speech-transcript")).toHaveText("Test the hypothesis against new evidence.");
  await expect(page.locator("#speech-playback")).toBeEnabled();
  await page.locator("#speech-playback").click();
});
