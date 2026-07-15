import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Force the container logging path so importing modules that pull in the
    // logger doesn't spawn a pino-pretty worker thread during tests.
    env: { ENV: "CONTAINER" },
  },
});
