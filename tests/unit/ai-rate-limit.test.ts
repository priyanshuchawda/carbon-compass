import { describe, expect, it, beforeEach } from "vitest";
import { rateLimit, resetRateLimits } from "../../lib/carbon/ai-rate-limit";

describe("rate limiter", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the limit", () => {
    const key = "test-ip";
    const now = 1000;
    const res1 = rateLimit(key, 2, 5000, now);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = rateLimit(key, 2, 5000, now + 100);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it("blocks requests over the limit", () => {
    const key = "test-ip";
    const now = 1000;
    rateLimit(key, 2, 5000, now);
    rateLimit(key, 2, 5000, now + 100);
    const res3 = rateLimit(key, 2, 5000, now + 200);
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
  });

  it("resets after the window expires", () => {
    const key = "test-ip";
    const now = 1000;
    rateLimit(key, 1, 5000, now);
    const res2 = rateLimit(key, 1, 5000, now + 100);
    expect(res2.allowed).toBe(false);

    // After window reset
    const res3 = rateLimit(key, 1, 5000, now + 5001);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });
});
