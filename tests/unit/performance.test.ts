import { describe, expect, it } from "vitest";
import { calculateFootprint } from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";

const profile = {
  id: "perf-test",
  city: "Pune",
  country: "India",
  householdSize: 2,
  persona: "student" as const,
  mainGoal: "reduce_carbon" as const,
};

const footprint = {
  transport: {
    twoWheelerKmPerWeek: 120,
    carKmPerWeek: 50,
    publicTransportTripsPerWeek: 4,
    cabAutoTripsPerWeek: 2,
    flightsPerYear: 1,
  },
  energy: {
    monthlyElectricityKWh: 150,
    lpgCylindersPerMonth: 1,
    acHoursPerDay: 4,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed" as const,
    meatMealsPerWeek: 3,
    dairyFrequency: "medium" as const,
    foodDeliveryPerWeek: 2,
    foodWasteLevel: "medium" as const,
  },
  shopping: { clothesPerMonth: 2, onlineOrdersPerMonth: 4, electronicsPerYear: 1 },
  waste: { recycles: false, composts: false, plasticUsage: "medium" as const },
};

describe("Performance CPU Budgets", () => {
  it("executes calculateFootprint within budget limit (under 1ms)", () => {
    const start = performance.now();
    const iterations = 3000;
    for (let i = 0; i < iterations; i++) {
      calculateFootprint(footprint, profile);
    }
    const duration = performance.now() - start;
    const avgMs = duration / iterations;

    console.log(`calculateFootprint average execution duration: ${avgMs.toFixed(4)} ms`);
    expect(avgMs).toBeLessThan(1.0);
  });

  it("executes getRecommendations within budget limit (under 2ms)", () => {
    const result = calculateFootprint(footprint, profile);
    const start = performance.now();
    const iterations = 1000;
    for (let i = 0; i < iterations; i++) {
      getRecommendations(footprint, result, profile);
    }
    const duration = performance.now() - start;
    const avgMs = duration / iterations;

    console.log(`getRecommendations average execution duration: ${avgMs.toFixed(4)} ms`);
    expect(avgMs).toBeLessThan(2.0);
  });
});
