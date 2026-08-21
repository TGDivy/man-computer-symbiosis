const { defineConfig, devices } = require("@playwright/test");

const localBaseURL = "http://127.0.0.1:4173";
const liveBaseURL = process.env.PLAYWRIGHT_BASE_URL;

module.exports = defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    baseURL: liveBaseURL || localBaseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1600, height: 900 },
      },
    },
    {
      name: "laptop-chromium",
      use: {
        ...devices["Desktop Chrome HiDPI"],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: liveBaseURL
    ? undefined
    : {
        command: "python3 -m http.server 4173 --bind 127.0.0.1",
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 20_000,
      },
});
