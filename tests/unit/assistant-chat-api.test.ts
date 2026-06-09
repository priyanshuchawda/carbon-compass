import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../app/api/assistant/chat/route";
import type { FootprintInput, FootprintResult, UserProfile } from "../../lib/carbon/types";

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

const mockResult: FootprintResult = {
  monthlyTotalKgCO2e: 100,
  annualTotalKgCO2e: 1200,
  potentialMonthlySavingKgCO2e: 18,
  ecoScore: 65,
  topCategory: "transport",
  breakdown: [
    { category: "transport", label: "Transport", kgCO2e: 60, percentage: 60 },
    { category: "energy", label: "Home energy", kgCO2e: 10, percentage: 10 },
    { category: "food", label: "Food", kgCO2e: 10, percentage: 10 },
    { category: "shopping", label: "Shopping", kgCO2e: 10, percentage: 10 },
    { category: "waste", label: "Waste", kgCO2e: 10, percentage: 10 },
  ],
  assumptions: [],
};

describe("Assistant Chat API Route", () => {
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

    const request = new Request("http://localhost/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: mockProfile,
        result: mockResult,
        footprint: mockFootprint,
        messages: [{ role: "user", content: "What is my biggest driver?" }]
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.isDemo).toBe(true);
    expect(json.content).toContain("detailed breakdown on the Dashboard");
    expect(json.costUSD).toBe(0);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-Request-ID")).toMatch(/^req_/);
  });

  it("fails with 400 Bad Request on invalid request body schema", async () => {
    const request = new Request("http://localhost/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: mockProfile,
        result: mockResult,
        footprint: mockFootprint,
        messages: [{ role: "invalid-role", content: "" }] // Invalid role/empty content
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Validation failed");
  });

  it("calls Gemini API and handles responses when GEMINI_API_KEY is defined", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyTestApiKeyVal";

    const mockResponseJSON = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "Your biggest carbon footprint driver is transport. Try walking or biking.",
              },
            ],
          },
        },
      ],
      usageMetadata: {
        promptTokenCount: 150,
        candidatesTokenCount: 20,
      },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponseJSON,
    } as Response);

    const request = new Request("http://localhost/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: mockProfile,
        result: mockResult,
        footprint: mockFootprint,
        messages: [{ role: "user", content: "What is my biggest driver?" }]
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.isDemo).toBe(false);
    expect(json.content).toContain("biggest carbon footprint driver is transport");
    expect(json.costUSD).toBeGreaterThan(0);
  });
});
