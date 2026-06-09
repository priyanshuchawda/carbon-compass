import { calculateFootprint } from "@/lib/carbon/calculate";
import { EMISSION_FACTORS } from "@/lib/carbon/factors";
import { round } from "@/lib/carbon/utils";
import type {
  CarbonCategory,
  FootprintInput,
  FootprintResult,
  UserProfile,
} from "@/lib/carbon/types";

export type SimulationActionId =
  | "metro_bus_substitution"
  | "reduce_ac_one_hour_daily"
  | "low_carbon_meal_day"
  | "reduce_delivery"
  | "start_recycling"
  | "start_composting";

export type SimulationAction = {
  id: SimulationActionId;
  title: string;
  category: CarbonCategory;
  description: string;
  factorNote: string;
};

export type SimulationResult = {
  beforeInput: FootprintInput;
  afterInput: FootprintInput;
  beforeResult: FootprintResult;
  afterResult: FootprintResult;
  savingKgCO2e: number;
  categorySavings: Record<CarbonCategory, number>;
  appliedActions: SimulationAction[];
};

const CATEGORY_KEYS: CarbonCategory[] = [
  "transport",
  "energy",
  "food",
  "shopping",
  "waste",
];

export const SIMULATION_ACTIONS: SimulationAction[] = [
  {
    id: "metro_bus_substitution",
    title: "Swap short fuel trips for metro or bus",
    category: "transport",
    description:
      "Move up to 40 weekly fuel-travel km and two cab or auto trips to public transport.",
    factorNote: `Uses ${EMISSION_FACTORS.transport.twoWheelerKgPerKm} kg CO2e/km for two-wheelers, ${EMISSION_FACTORS.transport.carKgPerKm} kg CO2e/km for cars, and ${EMISSION_FACTORS.transport.publicTransportKgPerTrip} kg CO2e per public transport trip.`,
  },
  {
    id: "reduce_ac_one_hour_daily",
    title: "Reduce AC by 1 hour per day",
    category: "energy",
    description:
      "Reduce daily AC time and monthly electricity use by a deterministic 30 kWh.",
    factorNote: `Uses ${EMISSION_FACTORS.energy.acKWhPerHour} kWh per AC hour and ${EMISSION_FACTORS.energy.electricityKgPerKWh} kg CO2/kWh.`,
  },
  {
    id: "low_carbon_meal_day",
    title: "Try one low-carbon meal day",
    category: "food",
    description: "Replace two meat meals per week with lower-carbon meals.",
    factorNote: `Uses ${EMISSION_FACTORS.food.meatMealKg} kg CO2e per meat meal.`,
  },
  {
    id: "reduce_delivery",
    title: "Reduce food delivery by 2 orders",
    category: "food",
    description: "Cook, dine in, or batch pickup for two weekly delivery orders.",
    factorNote: `Uses ${EMISSION_FACTORS.food.deliveryKg} kg CO2e per delivery.`,
  },
  {
    id: "start_recycling",
    title: "Start recycling dry waste",
    category: "waste",
    description: "Turn on dry-waste recycling for the monthly estimate.",
    factorNote: `Uses ${EMISSION_FACTORS.waste.recyclingReductionKg} kg CO2e/month recycling reduction.`,
  },
  {
    id: "start_composting",
    title: "Start composting food scraps",
    category: "waste",
    description: "Turn on composting for the monthly estimate.",
    factorNote: `Uses ${EMISSION_FACTORS.waste.compostingReductionKg} kg CO2e/month composting reduction.`,
  },
];

const ACTION_BY_ID = new Map(
  SIMULATION_ACTIONS.map((action) => [action.id, action]),
);

// round() is provided by @/lib/carbon/utils

function cloneInput(input: FootprintInput): FootprintInput {
  return {
    transport: { ...input.transport },
    energy: { ...input.energy },
    food: { ...input.food },
    shopping: { ...input.shopping },
    waste: { ...input.waste },
  };
}

function categorySavings(
  beforeResult: FootprintResult,
  afterResult: FootprintResult,
): Record<CarbonCategory, number> {
  return CATEGORY_KEYS.reduce(
    (savings, category) => {
      const before =
        beforeResult.breakdown.find((item) => item.category === category)
          ?.kgCO2e ?? 0;
      const after =
        afterResult.breakdown.find((item) => item.category === category)
          ?.kgCO2e ?? 0;

      return {
        ...savings,
        [category]: round(Math.max(before - after, 0)),
      };
    },
    {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
      waste: 0,
    } satisfies Record<CarbonCategory, number>,
  );
}

function applyAction(input: FootprintInput, actionId: SimulationActionId): void {
  if (actionId === "metro_bus_substitution") {
    let remainingFuelKm = 40;
    const twoWheelerReduction = Math.min(
      input.transport.twoWheelerKmPerWeek,
      remainingFuelKm,
    );
    input.transport.twoWheelerKmPerWeek -= twoWheelerReduction;
    remainingFuelKm -= twoWheelerReduction;

    const carReduction = Math.min(input.transport.carKmPerWeek, remainingFuelKm);
    input.transport.carKmPerWeek -= carReduction;

    const cabAutoReduction = Math.min(input.transport.cabAutoTripsPerWeek, 2);
    input.transport.cabAutoTripsPerWeek -= cabAutoReduction;
    input.transport.publicTransportTripsPerWeek +=
      Math.ceil((twoWheelerReduction + carReduction) / 10) + cabAutoReduction;
    return;
  }

  if (actionId === "reduce_ac_one_hour_daily") {
    const dailyReduction = Math.min(input.energy.acHoursPerDay, 1);
    input.energy.acHoursPerDay -= dailyReduction;
    input.energy.monthlyElectricityKWh = Math.max(
      input.energy.monthlyElectricityKWh -
        dailyReduction * 30 * EMISSION_FACTORS.energy.acKWhPerHour,
      0,
    );
    return;
  }

  if (actionId === "low_carbon_meal_day") {
    input.food.meatMealsPerWeek = Math.max(input.food.meatMealsPerWeek - 2, 0);
    if (input.food.dietType === "meat_heavy") {
      input.food.dietType = "mixed";
    }
    return;
  }

  if (actionId === "reduce_delivery") {
    input.food.foodDeliveryPerWeek = Math.max(
      input.food.foodDeliveryPerWeek - 2,
      0,
    );
    return;
  }

  if (actionId === "start_recycling") {
    input.waste.recycles = true;
    return;
  }

  input.waste.composts = true;
}

export function simulateActions(
  input: FootprintInput,
  profile: UserProfile,
  actionIds: SimulationActionId[],
): SimulationResult {
  const beforeInput = cloneInput(input);
  const afterInput = cloneInput(input);
  const appliedActions = actionIds.map((actionId) => {
    const action = ACTION_BY_ID.get(actionId);

    if (!action) {
      throw new Error(`Unknown simulation action: ${actionId}`);
    }

    applyAction(afterInput, actionId);
    return action;
  });
  const beforeResult = calculateFootprint(beforeInput, profile);
  const afterResult = calculateFootprint(afterInput, profile);

  return {
    beforeInput,
    afterInput,
    beforeResult,
    afterResult,
    savingKgCO2e: round(
      Math.max(
        beforeResult.monthlyTotalKgCO2e - afterResult.monthlyTotalKgCO2e,
        0,
      ),
    ),
    categorySavings: categorySavings(beforeResult, afterResult),
    appliedActions,
  };
}

export function simulateAction(
  input: FootprintInput,
  profile: UserProfile,
  actionId: SimulationActionId,
): SimulationResult {
  return simulateActions(input, profile, [actionId]);
}
