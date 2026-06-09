import { describe, expect, it } from "vitest";
import { buildAssistantPrompt, getFallbackResponse } from "../../lib/carbon/ai/prompt";
import type { AssistantRequestPayload } from "../../lib/validation/schemas";

const mockPayload: AssistantRequestPayload = {
  profile: {
    id: "user-123",
    city: "Delhi",
    country: "India",
    householdSize: 4,
    persona: "family",
    mainGoal: "save_money",
  },
  footprint: {
    transport: {
      twoWheelerKmPerWeek: 50,
      carKmPerWeek: 150,
      publicTransportTripsPerWeek: 5,
      cabAutoTripsPerWeek: 2,
      flightsPerYear: 1,
    },
    energy: {
      monthlyElectricityKWh: 350,
      lpgCylindersPerMonth: 1,
      acHoursPerDay: 4,
      renewableEnergy: false,
    },
    food: {
      dietType: "mixed",
      meatMealsPerWeek: 3,
      dairyFrequency: "medium",
      foodDeliveryPerWeek: 2,
      foodWasteLevel: "medium",
    },
    shopping: {
      clothesPerMonth: 2,
      onlineOrdersPerMonth: 4,
      electronicsPerYear: 1,
    },
    waste: {
      recycles: true,
      composts: false,
      plasticUsage: "medium",
    },
  },
  result: {
    monthlyTotalKgCO2e: 450,
    annualTotalKgCO2e: 5400,
    potentialMonthlySavingKgCO2e: 60,
    ecoScore: 55,
    topCategory: "energy",
    breakdown: [
      { category: "transport", label: "Transport", kgCO2e: 150, percentage: 33 },
      { category: "energy", label: "Home energy", kgCO2e: 200, percentage: 44 },
      { category: "food", label: "Food", kgCO2e: 70, percentage: 16 },
      { category: "shopping", label: "Shopping", kgCO2e: 25, percentage: 6 },
      { category: "waste", label: "Waste", kgCO2e: 5, percentage: 1 },
    ],
    assumptions: [],
  },
  recommendations: [
    {
      id: "rec-ac",
      category: "energy",
      title: "Reduce AC hours",
      reason: "AC hours contribute a high amount of emissions in energy.",
      action: "Reduce AC usage by 1 hour daily.",
      estimatedSavingKgCO2ePerMonth: 15,
      difficulty: "easy",
      impact: "medium",
      moneySavingPotential: "medium",
      weeklyChallenge: "Turn off AC 1 hour early each day.",
    },
  ],
};

describe("AI prompt builder", () => {
  it("generates a prompt containing user profile and result metrics", () => {
    const prompt = buildAssistantPrompt(mockPayload);
    expect(prompt).toContain("Delhi");
    expect(prompt).toContain("family");
    expect(prompt).toContain("save_money");
    expect(prompt).toContain("450 kg CO2e");
    expect(prompt).toContain("Reduce AC hours");
  });

  it("generates correct fallback response details", () => {
    const fallback = getFallbackResponse(mockPayload);
    expect(fallback.isDemo).toBe(true);
    expect(fallback.costUSD).toBe(0);
    expect(fallback.narrative).toContain("Home energy usage represents your primary carbon footprint opportunity");
    expect(fallback.weeklyChallenge).toBe("Reduce daily AC usage by 1 hour or switch off idle appliances.");
    expect(fallback.goalTip).toBe("Reducing electricity and gas consumption directly lowers your utility bill.");
  });
});
