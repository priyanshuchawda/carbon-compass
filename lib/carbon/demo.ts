import { calculateFootprint } from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

export const demoProfile = {
  id: "demo-pune-student",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "save_money",
} satisfies UserProfile;

export const demoFootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 120,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 6,
    cabAutoTripsPerWeek: 3,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 100,
    lpgCylindersPerMonth: 0.3,
    acHoursPerDay: 1,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed",
    meatMealsPerWeek: 2,
    dairyFrequency: "medium",
    foodDeliveryPerWeek: 2,
    foodWasteLevel: "medium",
  },
  shopping: {
    clothesPerMonth: 2,
    onlineOrdersPerMonth: 5,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: true,
    composts: false,
    plasticUsage: "medium",
  },
} satisfies FootprintInput;

export const demoFootprintResult = calculateFootprint(demoFootprintInput, demoProfile);

export const demoRecommendations = getRecommendations(
  demoFootprintInput,
  demoFootprintResult,
  demoProfile
);
