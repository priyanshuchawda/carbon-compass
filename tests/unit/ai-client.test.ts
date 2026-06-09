import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { callGeminiWithFallback } from "../../lib/carbon/ai/client";
import type { GeminiContent } from "../../lib/carbon/ai/client";

describe("AI Client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GEMINI_API_KEY: "test-api-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("successfully calls primary model and computes token costs", async () => {
    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: JSON.stringify({ narrative: "hi" }) }],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 100_000,
        candidatesTokenCount: 50_000,
      },
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const contents: GeminiContent[] = [{ role: "user", parts: [{ text: "Hello" }] }];
    const result = await callGeminiWithFallback(contents, AbortSignal.timeout(1000));

    expect(result.modelUsed).toBe("gemini-2.5-flash");
    // Cost: (100k / 1M * 0.075) + (50k / 1M * 0.3) = 0.0075 + 0.015 = 0.0225
    expect(result.costUSD).toBeCloseTo(0.0225, 6);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to secondary model if primary model completely fails", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    
    // First model fails completely (client error or other)
    // Actually we handle 429/500 with retry, but other errors fail fast or retry.
    // If the server returns 400 Bad Request, it fails fast for that model.
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    } as Response);

    // Second model succeeds
    const mockSuccessResponse = {
      candidates: [{ content: { parts: [{ text: "success" }] } }],
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
    };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockSuccessResponse,
    } as Response);

    const contents: GeminiContent[] = [{ role: "user", parts: [{ text: "Hello" }] }];
    const result = await callGeminiWithFallback(contents, AbortSignal.timeout(1000));

    expect(result.modelUsed).toBe("gemini-2.5-flash-lite");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
