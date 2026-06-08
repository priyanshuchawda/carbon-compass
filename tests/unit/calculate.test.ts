import { describe, expect, it } from "vitest";
import {
  calculateEnergy,
  calculateFootprint,
  getTopCategory,
} from "@/lib/carbon/calculate";
import { INDIA_GRID_ELECTRICITY_FACTOR } from "@/lib/carbon/factors";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

const profile: UserProfile = {
  id: "demo-user",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

const lowInput: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 0,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 0,
    cabAutoTripsPerWeek: 0,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 0,
    lpgCylindersPerMonth: 0,
    acHoursPerDay: 0,
    renewableEnergy: false,
  },
  food: {
    dietType: "vegetarian",
    meatMealsPerWeek: 0,
    dairyFrequency: "low",
    foodDeliveryPerWeek: 0,
    foodWasteLevel: "low",
  },
  shopping: {
    clothesPerMonth: 0,
    onlineOrdersPerMonth: 0,
    electronicsPerYear: 0,
  },
  waste: {
    recycles: true,
    composts: true,
    plasticUsage: "low",
  },
};

const highTransportInput: FootprintInput = {
  ...lowInput,
  transport: {
    twoWheelerKmPerWeek: 140,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 2,
    cabAutoTripsPerWeek: 6,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 100,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 2,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed",
    meatMealsPerWeek: 3,
    dairyFrequency: "medium",
    foodDeliveryPerWeek: 4,
    foodWasteLevel: "medium",
  },
  shopping: {
    clothesPerMonth: 2,
    onlineOrdersPerMonth: 6,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "medium",
  },
};

describe("carbon calculation engine", () => {
  it("uses the India electricity factor of 0.710 kg CO2 per kWh", () => {
    expect(INDIA_GRID_ELECTRICITY_FACTOR.value).toBe(0.71);

    const result = calculateEnergy({
      monthlyElectricityKWh: 100,
      lpgCylindersPerMonth: 0,
      acHoursPerDay: 0,
      renewableEnergy: false,
    });

    expect(result.kgCO2e).toBeCloseTo(71, 2);
  });

  it("calculates monthly and annual totals from category totals", () => {
    const result = calculateFootprint(highTransportInput, profile);
    const categorySum = result.breakdown.reduce(
      (sum, item) => sum + item.kgCO2e,
      0,
    );

    expect(result.monthlyTotalKgCO2e).toBeCloseTo(categorySum, 2);
    expect(result.annualTotalKgCO2e).toBeCloseTo(
      result.monthlyTotalKgCO2e * 12,
      2,
    );
  });

  it("returns percentages that sum approximately to 100", () => {
    const result = calculateFootprint(highTransportInput, profile);
    const percentageSum = result.breakdown.reduce(
      (sum, item) => sum + item.percentage,
      0,
    );

    expect(percentageSum).toBeCloseTo(100, 1);
  });

  it("handles low input without crashing or producing invalid numbers", () => {
    const result = calculateFootprint(lowInput, profile);

    expect(result.monthlyTotalKgCO2e).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.monthlyTotalKgCO2e)).toBe(true);
    expect(Number.isFinite(result.ecoScore)).toBe(true);
    expect(result.ecoScore).toBeGreaterThanOrEqual(0);
    expect(result.ecoScore).toBeLessThanOrEqual(100);
  });

  it("identifies the top category from the largest footprint", () => {
    const result = calculateFootprint(highTransportInput, profile);

    expect(getTopCategory(result.breakdown)).toBe("transport");
    expect(result.topCategory).toBe("transport");
  });

  it("includes transparent assumptions and a positive saving estimate", () => {
    const result = calculateFootprint(highTransportInput, profile);

    expect(result.assumptions).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/educational estimate/i),
        expect.stringMatching(/0.710 kg CO2\/kWh/i),
      ]),
    );
    expect(result.potentialMonthlySavingKgCO2e).toBeGreaterThan(0);
  });
});
