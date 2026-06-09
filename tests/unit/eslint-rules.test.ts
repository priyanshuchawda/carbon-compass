import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ESLint configuration integrity", () => {
  const configPath = resolve(__dirname, "../../eslint.config.mjs");

  it("eslint.config.mjs should exist in root", () => {
    expect(existsSync(configPath)).toBe(true);
  });

  it("should enforce next-vitals rules", () => {
    const content = readFileSync(configPath, "utf-8");
    expect(content).toContain("eslint-config-next/core-web-vitals");
  });

  it("should configure custom ignores for dev artifacts and logs", () => {
    const content = readFileSync(configPath, "utf-8");
    expect(content).toContain(".agent/**");
    expect(content).toContain("*.log");
    expect(content).toContain("coverage/**");
  });
});
