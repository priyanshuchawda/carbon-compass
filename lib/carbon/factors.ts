import type { EmissionFactor } from "@/lib/carbon/types";

export const WEEKS_PER_MONTH = 52 / 12;

export const INDIA_GRID_ELECTRICITY_FACTOR: EmissionFactor = {
  id: "india-grid-electricity-fy-2024-25",
  label: "India grid electricity",
  value: 0.71,
  unit: "kg CO2/kWh",
  sourceName: "Central Electricity Authority baseline database",
  note: "Educational estimate using 0.710 kg CO2/kWh for India grid electricity.",
};

export const EMISSION_FACTORS = {
  transport: {
    twoWheelerKgPerKm: 0.12,
    carKgPerKm: 0.18,
    publicTransportKgPerTrip: 0.3,
    cabAutoKgPerTrip: 1.2,
    domesticFlightKgPerYear: 250,
  },
  energy: {
    electricityKgPerKWh: INDIA_GRID_ELECTRICITY_FACTOR.value,
    acKWhPerHour: 1,
    lpgCylinderKg: 42.5,
    renewableElectricityReduction: 0.5,
  },
  food: {
    dietBaseKgPerMonth: {
      vegan: 35,
      vegetarian: 45,
      mixed: 55,
      meat_heavy: 80,
    },
    meatMealKg: 0.7,
    dairyKgPerMonth: {
      low: 0,
      medium: 3,
      high: 6,
    },
    deliveryKg: 0.25,
    wasteKgPerMonth: {
      low: 4,
      medium: 8,
      high: 14,
    },
  },
  shopping: {
    clothesKgPerItem: 6,
    onlineOrderKg: 0.8,
    electronicsKgPerYear: 120,
  },
  waste: {
    plasticKgPerMonth: {
      low: 2,
      medium: 6,
      high: 12,
    },
    recyclingReductionKg: 3,
    compostingReductionKg: 4,
    baselineKg: 8,
  },
} as const;
