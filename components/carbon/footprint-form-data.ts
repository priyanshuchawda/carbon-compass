import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

export const EMPTY_FOOTPRINT_INPUT: FootprintInput = {
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

export const PUNE_STUDENT_DEMO: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 120,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 4,
    cabAutoTripsPerWeek: 3,
    flightsPerYear: 1,
  },
  energy: {
    monthlyElectricityKWh: 100,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 2,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed",
    meatMealsPerWeek: 2,
    dairyFrequency: "medium",
    foodDeliveryPerWeek: 3,
    foodWasteLevel: "medium",
  },
  shopping: {
    clothesPerMonth: 2,
    onlineOrdersPerMonth: 5,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "medium",
  },
};

export const PUNE_STUDENT_PROFILE: UserProfile = {
  id: "demo-pune-student",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "save_money",
};

export type TransportNumberKey = keyof FootprintInput["transport"];
export type EnergyNumberKey = "monthlyElectricityKWh" | "lpgCylindersPerMonth" | "acHoursPerDay";
export type FoodNumberKey = "meatMealsPerWeek" | "foodDeliveryPerWeek";
export type ShoppingNumberKey = keyof FootprintInput["shopping"];

export type NumberPath =
  | ["transport", TransportNumberKey]
  | ["energy", EnergyNumberKey]
  | ["food", FoodNumberKey]
  | ["shopping", ShoppingNumberKey];

const DIET_TYPES = ["vegan", "vegetarian", "mixed", "meat_heavy"] as const;
type DietType = (typeof DIET_TYPES)[number];

const DAIRY_FREQUENCIES = ["low", "medium", "high"] as const;
type DairyFrequency = (typeof DAIRY_FREQUENCIES)[number];

const WASTE_LEVELS = ["low", "medium", "high"] as const;
type WasteLevel = (typeof WASTE_LEVELS)[number];

const PLASTIC_USAGES = ["low", "medium", "high"] as const;
type PlasticUsage = (typeof PLASTIC_USAGES)[number];

function parseOption<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export function parseDietType(value: string): DietType {
  return parseOption(value, DIET_TYPES, "vegetarian");
}

export function parseDairyFrequency(value: string): DairyFrequency {
  return parseOption(value, DAIRY_FREQUENCIES, "medium");
}

export function parseWasteLevel(value: string): WasteLevel {
  return parseOption(value, WASTE_LEVELS, "medium");
}

export function parsePlasticUsage(value: string): PlasticUsage {
  return parseOption(value, PLASTIC_USAGES, "medium");
}
