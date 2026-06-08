import { describe, expect, it } from "vitest";
import { calculateFootprint } from "@/lib/carbon/calculate";
import {
  SIMULATION_ACTIONS,
  simulateAction,
  simulateActions,
} from "@/lib/carbon/simulator";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

const profile: UserProfile = {
  id: "sim-user",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "working",
  mainGoal: "reduce_carbon",
};

const input: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 100,
    carKmPerWeek: 40,
    publicTransportTripsPerWeek: 2,
    cabAutoTripsPerWeek: 4,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 120,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 2,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed",
    meatMealsPerWeek: 4,
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

describe("what-if simulator", () => {
  it("exposes the required common actions", () => {
    expect(SIMULATION_ACTIONS.map((action) => action.id)).toEqual([
      "metro_bus_substitution",
      "reduce_ac_one_hour_daily",
      "low_carbon_meal_day",
      "reduce_delivery",
      "start_recycling",
      "start_composting",
    ]);
  });

  it("simulates metro or bus substitution without mutating the original input", () => {
    const original = structuredClone(input);
    const simulation = simulateAction(input, profile, "metro_bus_substitution");

    expect(input).toEqual(original);
    expect(simulation.afterInput.transport.twoWheelerKmPerWeek).toBeLessThan(
      input.transport.twoWheelerKmPerWeek,
    );
    expect(simulation.afterInput.transport.publicTransportTripsPerWeek)
      .toBeGreaterThan(input.transport.publicTransportTripsPerWeek);
    expect(simulation.savingKgCO2e).toBeGreaterThan(0);
    expect(simulation.categorySavings.transport).toBeGreaterThan(0);
  });

  it("reduces emissions for every supported action", () => {
    for (const action of SIMULATION_ACTIONS) {
      const simulation = simulateAction(input, profile, action.id);

      expect(simulation.savingKgCO2e).toBeGreaterThan(0);
      expect(simulation.afterResult.monthlyTotalKgCO2e)
        .toBeLessThan(simulation.beforeResult.monthlyTotalKgCO2e);
    }
  });

  it("combines multiple actions deterministically", () => {
    const before = calculateFootprint(input, profile);
    const simulation = simulateActions(input, profile, [
      "metro_bus_substitution",
      "reduce_ac_one_hour_daily",
      "low_carbon_meal_day",
      "reduce_delivery",
      "start_recycling",
      "start_composting",
    ]);

    expect(simulation.beforeResult.monthlyTotalKgCO2e)
      .toBe(before.monthlyTotalKgCO2e);
    expect(simulation.afterResult.monthlyTotalKgCO2e)
      .toBeLessThan(before.monthlyTotalKgCO2e);
    expect(simulation.savingKgCO2e).toBeCloseTo(
      before.monthlyTotalKgCO2e - simulation.afterResult.monthlyTotalKgCO2e,
      2,
    );
    expect(simulation.appliedActions).toHaveLength(6);
  });
});
