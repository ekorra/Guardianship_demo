import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
})
