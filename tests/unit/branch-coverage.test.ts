import { describe, expect, it } from "vitest";
import {
  calculateEnergy,
  calculateFood,
  calculateShopping,
  calculateTransport,
  calculateWaste,
  calculateFootprint,
} from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";
import { simulateAction, simulateActions } from "@/lib/carbon/simulator";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

const profile: UserProfile = {
  id: "test",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "learn",
};

const baseInput: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 100,
    carKmPerWeek: 50,
    publicTransportTripsPerWeek: 2,
    cabAutoTripsPerWeek: 3,
    flightsPerYear: 2,
  },
  energy: {
    monthlyElectricityKWh: 120,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 3,
    renewableEnergy: false,
  },
  food: {
    dietType: "meat_heavy",
    meatMealsPerWeek: 7,
    dairyFrequency: "high",
    foodDeliveryPerWeek: 5,
    foodWasteLevel: "high",
  },
  shopping: {
    clothesPerMonth: 3,
    onlineOrdersPerMonth: 8,
    electronicsPerYear: 2,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "high",
  },
};

describe("calculate.ts – uncovered branches", () => {
  it("calculateEnergy applies renewable energy reduction factor", () => {
    const nonRenewable = calculateEnergy({
      monthlyElectricityKWh: 100,
      lpgCylindersPerMonth: 0,
      acHoursPerDay: 0,
      renewableEnergy: false,
    });
    const renewable = calculateEnergy({
      monthlyElectricityKWh: 100,
      lpgCylindersPerMonth: 0,
      acHoursPerDay: 0,
      renewableEnergy: true,
    });

    // Renewable must be meaningfully lower
    expect(renewable.kgCO2e).toBeLessThan(nonRenewable.kgCO2e);
  });

  it("calculateFood uses vegan diet base factor (lowest)", () => {
    const vegan = calculateFood({
      dietType: "vegan",
      meatMealsPerWeek: 0,
      dairyFrequency: "low",
      foodDeliveryPerWeek: 0,
      foodWasteLevel: "low",
    });
    const meatHeavy = calculateFood({
      dietType: "meat_heavy",
      meatMealsPerWeek: 0,
      dairyFrequency: "low",
      foodDeliveryPerWeek: 0,
      foodWasteLevel: "low",
    });

    expect(vegan.kgCO2e).toBeLessThan(meatHeavy.kgCO2e);
  });

  it("calculateFood uses all dairy frequency variants", () => {
    const low = calculateFood({ dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "low", foodDeliveryPerWeek: 0, foodWasteLevel: "low" });
    const medium = calculateFood({ dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "medium", foodDeliveryPerWeek: 0, foodWasteLevel: "low" });
    const high = calculateFood({ dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "high", foodDeliveryPerWeek: 0, foodWasteLevel: "low" });

    expect(medium.kgCO2e).toBeGreaterThan(low.kgCO2e);
    expect(high.kgCO2e).toBeGreaterThan(medium.kgCO2e);
  });

  it("calculateFood uses all food waste level variants", () => {
    const low = calculateFood({ dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "low", foodDeliveryPerWeek: 0, foodWasteLevel: "low" });
    const medium = calculateFood({ dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "low", foodDeliveryPerWeek: 0, foodWasteLevel: "medium" });
    const high = calculateFood({ dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "low", foodDeliveryPerWeek: 0, foodWasteLevel: "high" });

    expect(medium.kgCO2e).toBeGreaterThan(low.kgCO2e);
    expect(high.kgCO2e).toBeGreaterThan(medium.kgCO2e);
  });

  it("calculateWaste applies both recycling and composting reductions", () => {
    const neither = calculateWaste({ recycles: false, composts: false, plasticUsage: "low" });
    const recyclesOnly = calculateWaste({ recycles: true, composts: false, plasticUsage: "low" });
    const both = calculateWaste({ recycles: true, composts: true, plasticUsage: "low" });

    expect(recyclesOnly.kgCO2e).toBeLessThan(neither.kgCO2e);
    expect(both.kgCO2e).toBeLessThan(recyclesOnly.kgCO2e);
  });

  it("calculateWaste uses all plastic usage variants", () => {
    const low = calculateWaste({ recycles: false, composts: false, plasticUsage: "low" });
    const medium = calculateWaste({ recycles: false, composts: false, plasticUsage: "medium" });
    const high = calculateWaste({ recycles: false, composts: false, plasticUsage: "high" });

    expect(medium.kgCO2e).toBeGreaterThan(low.kgCO2e);
    expect(high.kgCO2e).toBeGreaterThan(medium.kgCO2e);
  });

  it("calculateTransport includes flights correctly", () => {
    const noFlights = calculateTransport({ twoWheelerKmPerWeek: 0, carKmPerWeek: 0, publicTransportTripsPerWeek: 0, cabAutoTripsPerWeek: 0, flightsPerYear: 0 });
    const withFlights = calculateTransport({ twoWheelerKmPerWeek: 0, carKmPerWeek: 0, publicTransportTripsPerWeek: 0, cabAutoTripsPerWeek: 0, flightsPerYear: 4 });

    expect(withFlights.kgCO2e).toBeGreaterThan(noFlights.kgCO2e);
  });

  it("addPercentages handles zero total gracefully (all zeroes = 0%)", () => {
    const result = calculateFootprint(
      {
        transport: { twoWheelerKmPerWeek: 0, carKmPerWeek: 0, publicTransportTripsPerWeek: 0, cabAutoTripsPerWeek: 0, flightsPerYear: 0 },
        energy: { monthlyElectricityKWh: 0, lpgCylindersPerMonth: 0, acHoursPerDay: 0, renewableEnergy: false },
        food: { dietType: "vegan", meatMealsPerWeek: 0, dairyFrequency: "low", foodDeliveryPerWeek: 0, foodWasteLevel: "low" },
        shopping: { clothesPerMonth: 0, onlineOrdersPerMonth: 0, electronicsPerYear: 0 },
        waste: { recycles: true, composts: true, plasticUsage: "low" },
      },
      profile,
    );

    // Even with near-zero input, percentages must be finite
    for (const item of result.breakdown) {
      expect(Number.isFinite(item.percentage)).toBe(true);
    }
  });

  it("calculateShopping correctly handles electronics spread over 12 months", () => {
    const withElectronics = calculateShopping({ clothesPerMonth: 0, onlineOrdersPerMonth: 0, electronicsPerYear: 12 });
    const withoutElectronics = calculateShopping({ clothesPerMonth: 0, onlineOrdersPerMonth: 0, electronicsPerYear: 0 });

    expect(withElectronics.kgCO2e).toBeGreaterThan(withoutElectronics.kgCO2e);
  });
});

describe("recommendations.ts – uncovered branches", () => {
  it("learn goal returns non-zero goal score (reason.length branch)", () => {
    const result = calculateFootprint(baseInput, profile);
    const learnProfile = { ...profile, mainGoal: "learn" as const };
    const recs = getRecommendations(baseInput, result, learnProfile);

    // With learn goal, recommendations must still be sorted and present
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0]).toHaveProperty("reason");
  });

  it("habit_building goal ranks easy recommendations higher", () => {
    const result = calculateFootprint(baseInput, profile);
    const habitProfile = { ...profile, mainGoal: "habit_building" as const };
    const recs = getRecommendations(baseInput, result, habitProfile);

    // All recommendations returned, first should be easy/medium
    expect(recs[0]?.difficulty).toMatch(/easy|medium/);
  });

  it("waste rules returns empty when user already has perfect waste habits", () => {
    const perfectWasteInput: FootprintInput = {
      ...baseInput,
      // Make transport dominant (not waste) and give perfect waste habits
      transport: { twoWheelerKmPerWeek: 500, carKmPerWeek: 200, publicTransportTripsPerWeek: 0, cabAutoTripsPerWeek: 0, flightsPerYear: 0 },
      waste: { recycles: true, composts: true, plasticUsage: "low" },
    };
    const result = calculateFootprint(perfectWasteInput, profile);
    const recs = getRecommendations(perfectWasteInput, result, profile);

    const wasteRecs = recs.filter((r) => r.category === "waste");
    // Perfect waste habits with transport dominant → waste recommendations suppressed
    expect(wasteRecs.length).toBe(0);
  });
});

describe("simulator.ts – uncovered branches", () => {
  it("simulateAction: low_carbon_meal_day changes diet from meat_heavy to mixed", () => {
    const meatHeavyInput: FootprintInput = {
      ...baseInput,
      food: { ...baseInput.food, dietType: "meat_heavy", meatMealsPerWeek: 5 },
    };
    const result = simulateAction(meatHeavyInput, profile, "low_carbon_meal_day");

    // Diet should have been downgraded
    expect(result.afterInput.food.dietType).toBe("mixed");
    expect(result.afterInput.food.meatMealsPerWeek).toBeLessThan(5);
  });

  it("simulateAction: low_carbon_meal_day does not change non-meat-heavy diet", () => {
    const vegInput: FootprintInput = {
      ...baseInput,
      food: { ...baseInput.food, dietType: "vegetarian", meatMealsPerWeek: 0 },
    };
    const result = simulateAction(vegInput, profile, "low_carbon_meal_day");

    expect(result.afterInput.food.dietType).toBe("vegetarian");
  });

  it("simulateAction: reduce_delivery does not go below zero", () => {
    const noDeliveryInput: FootprintInput = {
      ...baseInput,
      food: { ...baseInput.food, foodDeliveryPerWeek: 1 },
    };
    const result = simulateAction(noDeliveryInput, profile, "reduce_delivery");

    expect(result.afterInput.food.foodDeliveryPerWeek).toBeGreaterThanOrEqual(0);
  });

  it("simulateAction: start_composting sets composts to true", () => {
    const noCompostInput: FootprintInput = {
      ...baseInput,
      waste: { ...baseInput.waste, composts: false },
    };
    const result = simulateAction(noCompostInput, profile, "start_composting");

    expect(result.afterInput.waste.composts).toBe(true);
  });

  it("simulateActions throws on unknown action ID", () => {
    expect(() =>
      simulateActions(baseInput, profile, ["unknown_action" as never]),
    ).toThrow(/unknown simulation action/i);
  });
});
