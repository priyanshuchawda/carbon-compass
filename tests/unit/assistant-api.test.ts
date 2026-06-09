import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../app/api/assistant/narrate/route";
import type { FootprintInput, FootprintResult, Recommendation, UserProfile } from "../../lib/carbon/types";

const mockProfile: UserProfile = {
  id: "user-1",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "save_money",
};

const mockFootprint: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 100,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 2,
    cabAutoTripsPerWeek: 0,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 80,
    lpgCylindersPerMonth: 0,
    acHoursPerDay: 0,
    renewableEnergy: false,
  },
  food: {
    dietType: "vegetarian",
    meatMealsPerWeek: 0,
    dairyFrequency: "low",
    foodDeliveryPerWeek: 1,
    foodWasteLevel: "low",
  },
  shopping: {
    clothesPerMonth: 1,
    onlineOrdersPerMonth: 2,
    electronicsPerYear: 0,
  },
  waste: {
    recycles: true,
    composts: false,
    plasticUsage: "low",
  },
};

const mockResult = (topCategory: "transport" | "energy" | "food" | "shopping" | "waste" = "transport"): FootprintResult => ({
  monthlyTotalKgCO2e: 100,
  annualTotalKgCO2e: 1200,
  potentialMonthlySavingKgCO2e: 18,
  ecoScore: 65,
  topCategory,
  breakdown: [
    { category: "transport", label: "Transport", kgCO2e: topCategory === "transport" ? 60 : 10, percentage: topCategory === "transport" ? 60 : 10 },
    { category: "energy", label: "Home energy", kgCO2e: topCategory === "energy" ? 60 : 10, percentage: topCategory === "energy" ? 60 : 10 },
    { category: "food", label: "Food", kgCO2e: topCategory === "food" ? 60 : 10, percentage: topCategory === "food" ? 60 : 10 },
    { category: "shopping", label: "Shopping", kgCO2e: topCategory === "shopping" ? 60 : 10, percentage: topCategory === "shopping" ? 60 : 10 },
    { category: "waste", label: "Waste", kgCO2e: topCategory === "waste" ? 60 : 10, percentage: topCategory === "waste" ? 60 : 10 },
  ],
  assumptions: [],
});

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
        result: mockResult("transport"),
        recommendations: mockRecs,
        footprint: mockFootprint,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.isDemo).toBe(true);
    expect(json.narrative).toContain("transport is your largest emission source");
    expect(json.weeklyChallenge).toContain("Swap 2 private scooter/car trips");
    expect(json.costUSD).toBe(0);
  });

  it("uses appropriate category specific fallback details when offline", async () => {
    delete process.env.GEMINI_API_KEY;

    // Test energy category fallback
    const requestEnergy = new Request("http://localhost/api/assistant/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: mockProfile,
        result: mockResult("energy"),
        recommendations: mockRecs,
        footprint: mockFootprint,
      }),
    });

    const responseEnergy = await POST(requestEnergy);
    const jsonEnergy = await responseEnergy.json();
    expect(jsonEnergy.narrative).toContain("Home energy usage represents your primary carbon footprint opportunity");
    expect(jsonEnergy.weeklyChallenge).toContain("Reduce daily AC usage by 1 hour");
  });

  it("fails with 400 Bad Request on invalid Zod request body", async () => {
    const request = new Request("http://localhost/api/assistant/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: { ...mockProfile, mainGoal: "invalid_goal" }, // Invalid enum
        result: mockResult("transport"),
        recommendations: mockRecs,
        footprint: mockFootprint,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Validation failed");
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
        result: mockResult("transport"),
        recommendations: mockRecs,
        footprint: mockFootprint,
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
