import { defineConfig } from "@playwright/test";

const SYSTEM_CHROMIUM = "/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium";

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 45000,
  retries: 0,
  use: {
    baseURL: "http://localhost:80",
    headless: true,
    locale: "ar-SA",
    viewport: { width: 390, height: 844 },
    screenshot: "only-on-failure",
    video: "off",
    launchOptions: {
      executablePath: SYSTEM_CHROMIUM,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-extensions",
        "--headless=new",
        "--remote-debugging-port=0",
      ],
    },
  },
  projects: [
    { name: "chromium" },
  ],
  outputDir: "test-results/",
});
