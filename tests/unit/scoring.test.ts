import { describe, expect, it } from "vitest";
import { calculateEcoScore } from "@/lib/carbon/scoring";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

const profile: UserProfile = {
  id: "score-demo",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "working",
  mainGoal: "habit_building",
};

const baseInput: FootprintInput = {
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
    recycles: false,
    composts: false,
    plasticUsage: "low",
  },
};

describe("eco scoring", () => {
  it("keeps scores between 0 and 100", () => {
    expect(calculateEcoScore(0, baseInput, profile)).toBe(100);
    expect(calculateEcoScore(800, baseInput, profile)).toBe(0);
  });

  it("lowers the score as monthly footprint increases", () => {
    const lowerFootprint = calculateEcoScore(120, baseInput, profile);
    const higherFootprint = calculateEcoScore(320, baseInput, profile);

    expect(lowerFootprint).toBeGreaterThan(higherFootprint);
  });

  it("rewards positive low-carbon habits", () => {
    const habitsInput: FootprintInput = {
      ...baseInput,
      energy: {
        ...baseInput.energy,
        renewableEnergy: true,
      },
      waste: {
        ...baseInput.waste,
        recycles: true,
        composts: true,
      },
    };

    expect(calculateEcoScore(180, habitsInput, profile)).toBeGreaterThan(
      calculateEcoScore(180, baseInput, profile),
    );
  });
});
