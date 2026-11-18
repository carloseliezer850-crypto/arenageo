import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  workers: 1,
  timeout: 90000,
  use: {
    // Match the dev server origin so Next can serve its client scripts.
    baseURL: "http://localhost:3100",
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
      args: ["--no-sandbox"],
    },
  },
});
