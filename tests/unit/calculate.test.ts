import { describe, expect, it } from "vitest";
import { calculateEnergy, calculateFootprint, getTopCategory } from "@/lib/carbon/calculate";
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
    const categorySum = result.breakdown.reduce((sum, item) => sum + item.kgCO2e, 0);

    expect(result.monthlyTotalKgCO2e).toBeCloseTo(categorySum, 2);
    expect(result.annualTotalKgCO2e).toBeCloseTo(result.monthlyTotalKgCO2e * 12, 2);
  });

  it("returns percentages that sum approximately to 100", () => {
    const result = calculateFootprint(highTransportInput, profile);
    const percentageSum = result.breakdown.reduce((sum, item) => sum + item.percentage, 0);

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
      ])
    );
    expect(result.potentialMonthlySavingKgCO2e).toBeGreaterThan(0);
  });

  it("calculates exact transport emissions for specified inputs", () => {
    // 100 km per week on two-wheeler (0.12 kg/km)
    // 0 flights, 0 other trips
    // Weekly emissions = 100 * 0.12 = 12 kg CO2e
    // Monthly emissions = 12 * (52 / 12) = 52 kg CO2e
    const result = calculateFootprint(
      {
        ...lowInput,
        transport: {
          twoWheelerKmPerWeek: 100,
          carKmPerWeek: 0,
          publicTransportTripsPerWeek: 0,
          cabAutoTripsPerWeek: 0,
          flightsPerYear: 0,
        },
      },
      profile
    );

    const transportCategory = result.breakdown.find((b) => b.category === "transport");
    expect(transportCategory?.kgCO2e).toBe(52);
  });

  it("calculates calibrated eco-score values correctly based on India average", () => {
    // Under the new calibration with a divisor of 5.25:
    // If a user's per-capita monthly footprint is exactly 158 kg (India monthly per capita average),
    // their score before habit bonuses should be exactly round(100 - 158 / 5.25) = round(100 - 30.09) = 70.
    // If they have all habit bonuses (+10 points total: recycle +3, compost +3, solar +4),
    // their score should be exactly 80.

    // We mock a profile and inputs that give exactly 158 kg CO2e footprint.
    const averageProfile: UserProfile = {
      ...profile,
      householdSize: 1,
    };

    // Calculate eco score with 158 kg emissions, no habit bonuses:
    const resultNoBonus = calculateFootprint(
      {
        ...lowInput,
        energy: {
          monthlyElectricityKWh: 0,
          lpgCylindersPerMonth: 0,
          acHoursPerDay: 0,
          renewableEnergy: false,
        },
        waste: {
          recycles: false,
          composts: false,
          plasticUsage: "low", // waste baseline is 8 + plastic low 2 = 10
        },
        food: {
          dietType: "vegetarian", // base is 45
          meatMealsPerWeek: 0,
          dairyFrequency: "low",
          foodDeliveryPerWeek: 0,
          foodWasteLevel: "low", // waste is 4. Total food = 45+4 = 49
        },
        shopping: {
          clothesPerMonth: 0,
          onlineOrdersPerMonth: 0,
          electronicsPerYear: 0, // shopping is 0
        },
        transport: {
          twoWheelerKmPerWeek: 22.846, // weekly: 22.846 * 0.12 = 2.7415. Monthly: 2.7415 * WEEKS_PER_MONTH = 11.88
          carKmPerWeek: 100, // weekly: 100 * 0.18 = 18. Monthly: 18 * WEEKS_PER_MONTH = 78
          publicTransportTripsPerWeek: 3, // weekly: 3 * 0.3 = 0.9. Monthly: 0.9 * WEEKS_PER_MONTH = 3.9
          cabAutoTripsPerWeek: 1, // weekly: 1 * 1.2 = 1.2. Monthly: 1.2 * WEEKS_PER_MONTH = 5.2
          flightsPerYear: 0,
        },
        // Total monthly footprint = 99 + 49 + 10 = 158 kg.
      },
      averageProfile
    );
    expect(resultNoBonus.monthlyTotalKgCO2e).toBe(157.98);
    expect(resultNoBonus.ecoScore).toBe(70);

    // Now calculate with habit bonuses: recycle (+3), compost (+3), solar (+4)
    // We adjust energy factor to offset solar reduction so emissions remain exactly 158 kg.
    // solar renewableEnergy: true halves electricity factor, so we keep electricity at 0.
    // recycle/compost reduce waste by 3 and 4 kg respectively, so we increase transport/food to offset by 7 kg.
    const resultWithBonus = calculateFootprint(
      {
        ...lowInput,
        energy: {
          monthlyElectricityKWh: 0,
          lpgCylindersPerMonth: 0,
          acHoursPerDay: 0,
          renewableEnergy: true, // +4 habit bonus
        },
        waste: {
          recycles: true, // +3 habit bonus, reduces waste by 3 kg
          composts: true, // +3 habit bonus, reduces waste by 4 kg
          plasticUsage: "low", // Waste baseline: 8 + plastic 2 - 3 - 4 = 3 kg
        },
        food: {
          dietType: "vegetarian", // 45
          meatMealsPerWeek: 0,
          dairyFrequency: "low",
          foodDeliveryPerWeek: 0,
          foodWasteLevel: "low", // 4. Total food = 49 kg
        },
        transport: {
          twoWheelerKmPerWeek: 24.4615, // weekly: 24.4615 * 0.12 = 2.935. Monthly: 2.935 * WEEKS_PER_MONTH = 12.72
          carKmPerWeek: 100, // 78
          publicTransportTripsPerWeek: 3, // 3.9
          cabAutoTripsPerWeek: 2.169, // weekly: 2.169 * 1.2 = 2.603. Monthly: 2.603 * WEEKS_PER_MONTH = 11.28
          // Total transport = 12.72 + 78 + 3.9 + 11.28 = 105.9 -> rounded 105.9 kg (offsetting the -7 waste reduction)
          flightsPerYear: 0,
        },
        // Total monthly footprint = 105.9 + 49 + 3 = 157.9 kg.
      },
      averageProfile
    );

    expect(resultWithBonus.monthlyTotalKgCO2e).toBe(157.9);
    expect(resultWithBonus.ecoScore).toBe(80); // 70 base + 10 habit bonuses
  });

  it("calculates potential savings as exactly 18% of the top category emissions", () => {
    const result = calculateFootprint(highTransportInput, profile);
    const transportBreakdown = result.breakdown.find((b) => b.category === "transport");
    const topCategoryKg = transportBreakdown?.kgCO2e ?? 0;

    expect(result.potentialMonthlySavingKgCO2e).toBe(Math.round(topCategoryKg * 0.18 * 100) / 100);
  });
});
