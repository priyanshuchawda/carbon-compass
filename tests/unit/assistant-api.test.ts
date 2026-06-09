import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../app/api/assistant/narrate/route";
import type { FootprintResult, Recommendation, UserProfile } from "../../lib/carbon/types";

const mockProfile: UserProfile = {
  id: "user-1",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "save_money",
};

const mockResult: FootprintResult = {
  monthlyTotalKgCO2e: 100,
  annualTotalKgCO2e: 1200,
  potentialMonthlySavingKgCO2e: 18,
  ecoScore: 65,
  topCategory: "transport",
  breakdown: [
    { category: "transport", label: "Transport", kgCO2e: 40, percentage: 40 },
    { category: "energy", label: "Home Energy", kgCO2e: 30, percentage: 30 },
  ],
  assumptions: [],
};

const mockRecs: Recommendation[] = [
  {
    id: "rec-1",
    title: "Walk short trips",
    category: "transport",
    difficulty: "easy",
    estimatedSavingKgCO2ePerMonth: 5,
    reason: "Transport is your top source.",
    weeklyChallenge: "Walk 2 short trips.",
    action: "Walk or cycle instead of driving private vehicles.",
    impact: "medium",
    moneySavingPotential: "medium",
  },
];

describe("Assistant Narration API Route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns offline fallback directly if GEMINI_API_KEY is not defined", async () => {
    delete process.env.GEMINI_API_KEY;

    const request = new Request("http://localhost/api/assistant/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: mockProfile,
        result: mockResult,
        recommendations: mockRecs,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.isDemo).toBe(true);
    expect(json.narrative).toContain("COMMUTE remains your primary leverage point");
    expect(json.costUSD).toBe(0);
  });

  it("calls Gemini API and calculates cost if GEMINI_API_KEY is defined", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyTestApiKeyVal";

    const mockResponseJSON = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  narrative: "Dynamic Gemini narrative for student in Pune.",
                  weeklyChallenge: "Dynamic walk challenge.",
                  goalTip: "Dynamic saving money tip.",
                }),
              },
            ],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 1000,
        candidatesTokenCount: 200,
      },
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseJSON,
    } as Response);

    const request = new Request("http://localhost/api/assistant/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: mockProfile,
        result: mockResult,
        recommendations: mockRecs,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.isDemo).toBe(false);
    expect(json.narrative).toBe("Dynamic Gemini narrative for student in Pune.");
    expect(json.weeklyChallenge).toBe("Dynamic walk challenge.");
    expect(json.goalTip).toBe("Dynamic saving money tip.");

    // Cost calc: (1000 / 1M * 0.075) + (200 / 1M * 0.30) = 0.000075 + 0.00006 = 0.000135
    expect(json.costUSD).toBeCloseTo(0.000135, 6);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
