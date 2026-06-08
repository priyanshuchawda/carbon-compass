import { describe, expect, it } from "vitest";
import { calculateFootprint } from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";
import type { FootprintInput, Recommendation, UserProfile } from "@/lib/carbon/types";

const baseProfile: UserProfile = {
  id: "recommendation-demo",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

const baseInput: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 0,
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

function recommendationsFor(
  input: FootprintInput,
  profile: UserProfile = baseProfile,
): Recommendation[] {
  return getRecommendations(input, calculateFootprint(input, profile), profile);
}

describe("Compass Assistant recommendations", () => {
  it("puts transport advice first when transport is the top category", () => {
    const input: FootprintInput = {
      ...baseInput,
      transport: {
        twoWheelerKmPerWeek: 180,
        carKmPerWeek: 0,
        publicTransportTripsPerWeek: 0,
        cabAutoTripsPerWeek: 6,
        flightsPerYear: 0,
      },
    };

    const recommendations = recommendationsFor(input);

    expect(recommendations[0]?.category).toBe("transport");
    expect(recommendations[0]?.title).toMatch(/fuel trips/i);
  });

  it("returns energy advice when home energy is the top category", () => {
    const input: FootprintInput = {
      ...baseInput,
      energy: {
        monthlyElectricityKWh: 280,
        lpgCylindersPerMonth: 1,
        acHoursPerDay: 5,
        renewableEnergy: false,
      },
    };

    const recommendations = recommendationsFor(input);

    expect(recommendations.some((item) => item.category === "energy")).toBe(true);
    expect(recommendations[0]?.category).toBe("energy");
  });

  it("adds a food waste recommendation for high food waste", () => {
    const input: FootprintInput = {
      ...baseInput,
      food: {
        dietType: "mixed",
        meatMealsPerWeek: 2,
        dairyFrequency: "medium",
        foodDeliveryPerWeek: 3,
        foodWasteLevel: "high",
      },
    };

    const recommendations = recommendationsFor(input);

    expect(
      recommendations.some((item) => /food waste/i.test(item.title)),
    ).toBe(true);
  });

  it("ranks money-saving actions higher when the goal is save_money", () => {
    const profile: UserProfile = {
      ...baseProfile,
      mainGoal: "save_money",
    };
    const input: FootprintInput = {
      ...baseInput,
      transport: {
        twoWheelerKmPerWeek: 120,
        carKmPerWeek: 30,
        publicTransportTripsPerWeek: 1,
        cabAutoTripsPerWeek: 5,
        flightsPerYear: 0,
      },
      shopping: {
        clothesPerMonth: 5,
        onlineOrdersPerMonth: 10,
        electronicsPerYear: 2,
      },
    };

    const recommendations = recommendationsFor(input, profile);

    expect(recommendations[0]?.moneySavingPotential).toBe("high");
  });

  it("returns complete recommendation records with positive savings", () => {
    const recommendations = recommendationsFor(baseInput);

    expect(recommendations.length).toBeGreaterThanOrEqual(3);
    for (const item of recommendations) {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.reason).toBeTruthy();
      expect(item.action).toBeTruthy();
      expect(item.weeklyChallenge).toBeTruthy();
      expect(item.estimatedSavingKgCO2ePerMonth).toBeGreaterThan(0);
      expect(["easy", "medium", "hard"]).toContain(item.difficulty);
      expect(["low", "medium", "high"]).toContain(item.impact);
    }
  });
});
