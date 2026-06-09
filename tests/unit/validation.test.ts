import { describe, expect, it } from "vitest";
import { footprintInputSchema, userProfileSchema } from "@/lib/validation/schemas";

const validProfile = {
  id: "demo-user",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "save_money",
};

const validFootprint = {
  transport: {
    twoWheelerKmPerWeek: 80,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 4,
    cabAutoTripsPerWeek: 2,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 100,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 2,
    renewableEnergy: false,
  },
  food: {
    dietType: "vegetarian",
    meatMealsPerWeek: 0,
    dairyFrequency: "medium",
    foodDeliveryPerWeek: 2,
    foodWasteLevel: "low",
  },
  shopping: {
    clothesPerMonth: 1,
    onlineOrdersPerMonth: 4,
    electronicsPerYear: 0,
  },
  waste: {
    recycles: true,
    composts: false,
    plasticUsage: "medium",
  },
};

describe("validation schemas", () => {
  it("accepts valid profile and footprint data", () => {
    expect(userProfileSchema.safeParse(validProfile).success).toBe(true);
    expect(footprintInputSchema.safeParse(validFootprint).success).toBe(true);
  });

  it("rejects empty city and household size below 1", () => {
    const result = userProfileSchema.safeParse({
      ...validProfile,
      city: "",
      householdSize: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative kilometers", () => {
    const result = footprintInputSchema.safeParse({
      ...validFootprint,
      transport: {
        ...validFootprint.transport,
        twoWheelerKmPerWeek: -1,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid enum values", () => {
    const result = footprintInputSchema.safeParse({
      ...validFootprint,
      food: {
        ...validFootprint.food,
        dietType: "sometimes",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects unrealistic values", () => {
    const result = footprintInputSchema.safeParse({
      ...validFootprint,
      energy: {
        ...validFootprint.energy,
        acHoursPerDay: 25,
      },
    });

    expect(result.success).toBe(false);
  });
});
