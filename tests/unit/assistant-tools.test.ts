import { describe, expect, it } from "vitest";
import { executeTool } from "../../lib/carbon/assistant-tools";
import type { ToolContext } from "../../lib/carbon/assistant-tools";

const mockContext: ToolContext = {
  profile: {
    id: "user-123",
    city: "Delhi",
    country: "India",
    householdSize: 2,
    persona: "working",
    mainGoal: "reduce_carbon",
  },
  footprintInput: {
    transport: {
      twoWheelerKmPerWeek: 50,
      carKmPerWeek: 150,
      publicTransportTripsPerWeek: 10,
      cabAutoTripsPerWeek: 2,
      flightsPerYear: 2,
    },
    energy: {
      monthlyElectricityKWh: 300,
      lpgCylindersPerMonth: 1,
      acHoursPerDay: 6,
      renewableEnergy: false,
    },
    food: {
      dietType: "meat_heavy",
      meatMealsPerWeek: 5,
      dairyFrequency: "high",
      foodDeliveryPerWeek: 4,
      foodWasteLevel: "medium",
    },
    shopping: {
      clothesPerMonth: 3,
      onlineOrdersPerMonth: 10,
      electronicsPerYear: 2,
    },
    waste: {
      recycles: true,
      composts: true,
      plasticUsage: "medium",
    },
  },
  result: {
    monthlyTotalKgCO2e: 450,
    annualTotalKgCO2e: 5400,
    potentialMonthlySavingKgCO2e: 80,
    ecoScore: 50,
    topCategory: "energy",
    breakdown: [
      { category: "transport", label: "Transport", kgCO2e: 150, percentage: 33 },
      { category: "energy", label: "Energy", kgCO2e: 200, percentage: 44 },
      { category: "food", label: "Food", kgCO2e: 50, percentage: 11 },
      { category: "shopping", label: "Shopping", kgCO2e: 30, percentage: 7 },
      { category: "waste", label: "Waste", kgCO2e: 20, percentage: 5 },
    ],
    assumptions: ["Delhi average factors used."],
  },
};

describe("Assistant Tools executeTool Validation", () => {
  it("successfully runs get_emission_breakdown with valid category", async () => {
    const result = await executeTool(
      "get_emission_breakdown",
      { category: "transport" },
      mockContext
    );
    expect(result).toHaveProperty("category", "transport");
    expect(result).toHaveProperty("kgCO2e", 150);
  });

  it("returns error message for get_emission_breakdown with invalid category", async () => {
    const result = await executeTool(
      "get_emission_breakdown",
      { category: "invalid-category" },
      mockContext
    );
    expect(result).toHaveProperty("error");
    expect((result as { error?: string }).error).toContain("Invalid parameters");
  });

  it("successfully runs compare_to_india_average with valid monthlyKg", async () => {
    const result = await executeTool("compare_to_india_average", { monthlyKg: 316 }, mockContext);
    expect(result).toHaveProperty("userMonthlyKg", 316);
    expect(result).toHaveProperty("userPerCapitaMonthlyKg", 158); // 316 / 2
    expect(result).toHaveProperty("nationalPerCapitaMonthlyAvg", 158);
    expect(result).toHaveProperty("comparisonStatus", "average");
  });

  it("returns error message for compare_to_india_average with invalid monthlyKg", async () => {
    const result = await executeTool(
      "compare_to_india_average",
      { monthlyKg: "not-a-number" as unknown as number },
      mockContext
    );
    expect(result).toHaveProperty("error");
    expect((result as { error?: string }).error).toContain("Invalid parameters");
  });

  it("successfully runs simulate_action with valid actionId", async () => {
    const result = await executeTool(
      "simulate_action",
      { actionId: "metro_bus_substitution" },
      mockContext
    );
    expect(result).toHaveProperty("actionId", "metro_bus_substitution");
    expect(result).toHaveProperty("savingKgCO2ePerMonth");
  });

  it("returns error message for simulate_action with invalid actionId", async () => {
    const result = await executeTool(
      "simulate_action",
      { actionId: "invalid-action" },
      mockContext
    );
    expect(result).toHaveProperty("error");
    expect((result as { error?: string }).error).toContain("Invalid parameters");
  });
});
