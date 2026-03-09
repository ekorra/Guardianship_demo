import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000, // ID-porten redirects trenger god tid
  expect: { timeout: 10_000 },
  fullyParallel: false, // kjør sekvensielt — auth-flyt er stateful
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Desktop Chrome"],
    headless: true,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 60_000,
    // Lokalt: gjenbruk allerede kjørende server. CI: start alltid frisk.
    reuseExistingServer: !process.env.CI,
  },
})
