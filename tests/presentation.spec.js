const { test, expect } = require("@playwright/test");

async function loadDeck(page, path = "./") {
  await page.goto(path);
  await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
}

test.describe("Man-Computer Symbiosis presentation", () => {
  test.beforeEach(async ({ page }) => {
    await loadDeck(page);
  });

  test("loads the complete 35-scene presentation and all local images", async ({ page }) => {
    await expect(page.locator(".scene")).toHaveCount(35);
    await expect(page.locator(".speaker-notes")).toHaveCount(35);
    await expect(page.locator(".scene.is-active")).toHaveAttribute("id", "scene-00");
    await expect(page.locator("body")).toHaveClass(/opening-wonder/);

    const incompleteImages = await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
    );
    expect(incompleteImages).toEqual([]);
  });

  test("uses Wonder Cut by default and makes Mystery Cut selectable", async ({ page }) => {
    await expect(page.locator("body")).toHaveClass(/opening-wonder/);
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(1, { silent: true }));
    await expect(page.locator("#scene-01 .fig-image--wonder")).toBeVisible();

    await loadDeck(page, "./?opening=mystery");
    await expect(page.locator("body")).toHaveClass(/opening-mystery/);
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(1, { silent: true }));
    await expect(page.locator("#scene-01 .fig-image--mystery")).toBeVisible();
    await expect(page.locator("#scene-02 .specimen-window--mystery")).toHaveCount(1);
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

  test("withholds the title until the title card and preserves the fig-to-question builds", async ({ page }) => {
    const openingText = await page.locator("#scene-00, #scene-01, #scene-02, #scene-03").allTextContents();
    expect(openingText.join(" ")).not.toContain("MAN–COMPUTER SYMBIOSIS");

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(3, { build: 2, silent: true }));
    await expect(page.locator("#scene-03 .type-line")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-03 .coupling-line")).toHaveClass(/is-visible/);
    await expect(page.locator("#scene-03 .computer-question")).not.toHaveClass(/is-visible/);

    await page.keyboard.press("ArrowRight");
    await expect(page.locator("#scene-03 .computer-question")).toHaveClass(/is-visible/);

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

  test("shows the readable division of work and its closing coda", async ({ page }) => {
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(16, { build: 4, silent: true }));
    await expect(page.locator("#scene-16 .work-lane--human")).toContainText("GOALS");
    await expect(page.locator("#scene-16 .work-lane--machine")).toContainText("NORMALIZE");
    await expect(page.locator("#scene-16 .work-next-question")).toHaveClass(/is-visible/);

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(32, { build: 0, silent: true }));
    await expect(page.locator("#scene-32 .coda-column--human")).toContainText("EVALUATIONS");
    await expect(page.locator("#scene-32 .coda-column--machine")).toContainText("ROUTINIZABLE WORK");
    await expect(page.locator("#scene-32 .coda-column--machine")).toContainText("INSIGHT");
  });

  test("keeps audience responses local, persistent, copyable, and downloadable", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value) => {
            window.__copiedResponses = value;
          },
        },
      });
    });

    await page.evaluate(() => window.__symbiosisDeck.goToSlide(18, { silent: true }));
    await page.locator("#thinking-action").fill("Normalize the data before comparing it");
    await page.locator("#file-thinking-action").click();
    await expect(page.locator("#thinking-responses .response-log-item, #thinking-responses li")).toHaveCount(1);
    await expect(page.locator("#thinking-action-status")).toContainText("Recorded thinking response");

    await page.locator("[data-response-action='copy'][data-response-kind='thinking']").click();
    const copiedResponses = await page.evaluate(() => window.__copiedResponses);
    expect(copiedResponses).toContain("number,response,recorded_at\n");
    expect(copiedResponses).toContain("\"1\",\"Normalize the data before comparing it\"");
    expect(copiedResponses).not.toContain("\\n");

    const downloadPromise = page.waitForEvent("download");
    await page.locator("[data-response-action='download'][data-response-kind='thinking']").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("man-computer-symbiosis-thinking-responses.csv");

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__symbiosisDeck));
    await expect(page.locator("#thinking-responses li")).toHaveCount(1);
  });

  test("records the relationship discussion locally without inventing a tally", async ({ page }) => {
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(29, { silent: true }));
    await page.locator(".relationship-card--partner").click();

    await expect(page.locator(".relationship-card--partner")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#relationship-responses li")).toHaveCount(1);
    await expect(page.locator("#relationship-status")).toContainText("Recorded relationship selection: partner");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("symbiosis-relationship-responses-v2"))[0].text)).toBe("partner");
  });

  test("uses the honest speech fallback when recognition is unavailable", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        delete window.SpeechRecognition;
        delete window.webkitSpeechRecognition;
      } catch {
        // The test also assigns undefined below for browsers that retain the property.
      }
      window.SpeechRecognition = undefined;
      window.webkitSpeechRecognition = undefined;
    });
    await loadDeck(page);
    await page.evaluate(() => window.__symbiosisDeck.goToSlide(26, { silent: true }));
    await expect(page.locator("#speech-fallback")).toBeVisible();
    await expect(page.locator("#speech-record")).toBeDisabled();
    await page.locator("#speech-fallback-input").fill("A spoken hypothesis");
    await expect(page.locator("#speech-transcript")).toHaveText("A spoken hypothesis");
  });

  test("keeps panels, direct scene navigation, and all scene bounds available", async ({ page }) => {
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

    for (let index = 0; index < 35; index += 1) {
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

    await expect(page).toHaveURL(/#scene-34$/);
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
  await page.evaluate(() => window.__symbiosisDeck.goToSlide(26, { silent: true }));
  await expect(page.locator("#speech-fallback")).toBeHidden();
  await expect(page.locator("#speech-record")).toBeEnabled();

  await page.locator("#speech-record").click();
  await expect(page.locator("#speech-transcript")).toHaveText("Test the hypothesis against new evidence.");
  await expect(page.locator("#speech-playback")).toBeEnabled();
  await page.locator("#speech-playback").click();
});
