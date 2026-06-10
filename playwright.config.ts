import { defineConfig, devices } from "@playwright/test";

const frontendRoot = __dirname;
const apiBaseUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:3000/api/v1";
const webBaseUrl = process.env.E2E_WEB_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: ".",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: webBaseUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "pnpm prisma:deploy && pnpm db:seed && pnpm build && pnpm exec next start -p 3000",
      cwd: frontendRoot,
      url: `${apiBaseUrl}/health`,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        DATABASE_REQUIRED: "false",
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
