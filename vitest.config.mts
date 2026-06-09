import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Explicit include list keeps coverage reporting honest: only production
      // source files count toward thresholds, not test helpers or type stubs.
      include: ["app/**", "components/**", "lib/**"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.*",
        "**/*.spec.*",
        "**/node_modules/**",
        "tests/**",
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
      },
    },
  },
});
