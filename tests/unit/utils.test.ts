/**
 * Tests for lib/carbon/utils.ts — shared numeric utilities.
 * Ensures extraction from calculate.ts / scoring.ts / simulator.ts
 * did not change behaviour.
 */
import { describe, expect, it } from "vitest";
import { clamp, round } from "@/lib/carbon/utils";

describe("round()", () => {
  it("rounds to 2 decimal places by default", () => {
    expect(round(1.005)).toBe(1.01);
    expect(round(1.004)).toBe(1.0);
    expect(round(123.456)).toBe(123.46);
  });

  it("rounds to 0 decimal places when digits = 0", () => {
    expect(round(42.5, 0)).toBe(43);
    expect(round(42.4, 0)).toBe(42);
  });

  it("handles negative values", () => {
    expect(round(-1.005)).toBe(-1.0);
  });

  it("handles zero", () => {
    expect(round(0)).toBe(0);
  });
});

describe("clamp()", () => {
  it("returns value unchanged when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("clamps to min when value is below range", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps to max when value is above range", () => {
    expect(clamp(110, 0, 100)).toBe(100);
  });

  it("handles boundary values", () => {
    expect(clamp(0, 0, 100)).toBe(0);
    expect(clamp(100, 0, 100)).toBe(100);
  });
});
