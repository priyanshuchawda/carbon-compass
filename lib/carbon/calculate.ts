import { CALCULATION_ASSUMPTIONS } from "@/lib/carbon/assumptions";
import { EMISSION_FACTORS, WEEKS_PER_MONTH, POTENTIAL_SAVINGS_TARGET_FACTOR } from "@/lib/carbon/factors";
import { calculateEcoScore } from "@/lib/carbon/scoring";
import { round } from "@/lib/carbon/utils";
import type {
  CarbonCategory,
  CategoryBreakdown,
  CategoryResult,
  EnergyInput,
  FoodInput,
  FootprintInput,
  FootprintResult,
  ShoppingInput,
  TransportInput,
  UserProfile,
  WasteInput,
} from "@/lib/carbon/types";

const CATEGORY_LABELS: Record<CarbonCategory, string> = {
  transport: "Transport",
  energy: "Home energy",
  food: "Food",
  shopping: "Shopping",
  waste: "Waste",
};

// round() is provided by @/lib/carbon/utils

function categoryResult(
  category: CarbonCategory,
  kgCO2e: number,
): CategoryResult {
  return {
    category,
    label: CATEGORY_LABELS[category],
    kgCO2e: round(Math.max(kgCO2e, 0)),
  };
}

export function calculateTransport(input: TransportInput): CategoryResult {
  const factors = EMISSION_FACTORS.transport;
  const weeklyFuelTravel =
    input.twoWheelerKmPerWeek * factors.twoWheelerKgPerKm +
    input.carKmPerWeek * factors.carKgPerKm +
    input.publicTransportTripsPerWeek * factors.publicTransportKgPerTrip +
    input.cabAutoTripsPerWeek * factors.cabAutoKgPerTrip;
  const monthlyFlights =
    (input.flightsPerYear * factors.domesticFlightKgPerYear) / 12;

  return categoryResult(
    "transport",
    weeklyFuelTravel * WEEKS_PER_MONTH + monthlyFlights,
  );
}

export function calculateEnergy(input: EnergyInput): CategoryResult {
  const factors = EMISSION_FACTORS.energy;
  const electricityFactor = input.renewableEnergy
    ? factors.electricityKgPerKWh * factors.renewableElectricityReduction
    : factors.electricityKgPerKWh;
  const electricity = input.monthlyElectricityKWh * electricityFactor;
  const lpg = input.lpgCylindersPerMonth * factors.lpgCylinderKg;

  return categoryResult("energy", electricity + lpg);
}

export function calculateFood(input: FoodInput): CategoryResult {
  const factors = EMISSION_FACTORS.food;
  const base = factors.dietBaseKgPerMonth[input.dietType];
  const meat = input.meatMealsPerWeek * factors.meatMealKg * WEEKS_PER_MONTH;
  const dairy = factors.dairyKgPerMonth[input.dairyFrequency];
  const delivery =
    input.foodDeliveryPerWeek * factors.deliveryKg * WEEKS_PER_MONTH;
  const waste = factors.wasteKgPerMonth[input.foodWasteLevel];

  return categoryResult("food", base + meat + dairy + delivery + waste);
}

export function calculateShopping(input: ShoppingInput): CategoryResult {
  const factors = EMISSION_FACTORS.shopping;
  const clothes = input.clothesPerMonth * factors.clothesKgPerItem;
  const orders = input.onlineOrdersPerMonth * factors.onlineOrderKg;
  const electronics = (input.electronicsPerYear * factors.electronicsKgPerYear) / 12;

  return categoryResult("shopping", clothes + orders + electronics);
}

export function calculateWaste(input: WasteInput): CategoryResult {
  const factors = EMISSION_FACTORS.waste;
  const reductions =
    (input.recycles ? factors.recyclingReductionKg : 0) +
    (input.composts ? factors.compostingReductionKg : 0);

  return categoryResult(
    "waste",
    factors.baselineKg + factors.plasticKgPerMonth[input.plasticUsage] - reductions,
  );
}

export function getTopCategory(
  breakdown: Pick<CategoryBreakdown, "category" | "kgCO2e">[],
): CarbonCategory {
  return breakdown.reduce((top, current) =>
    current.kgCO2e > top.kgCO2e ? current : top,
  ).category;
}

function addPercentages(results: CategoryResult[]): CategoryBreakdown[] {
  const total = results.reduce((sum, item) => sum + item.kgCO2e, 0);

  return results.map((item) => ({
    ...item,
    percentage: total === 0 ? 0 : round((item.kgCO2e / total) * 100, 2),
  }));
}

export function calculateFootprint(
  input: FootprintInput,
  profile: UserProfile,
): FootprintResult {
  const categoryResults = [
    calculateTransport(input.transport),
    calculateEnergy(input.energy),
    calculateFood(input.food),
    calculateShopping(input.shopping),
    calculateWaste(input.waste),
  ];
  const breakdown = addPercentages(categoryResults);
  const monthlyTotalKgCO2e = round(
    breakdown.reduce((sum, item) => sum + item.kgCO2e, 0),
  );
  const topCategory = getTopCategory(breakdown);
  const topCategoryKg =
    breakdown.find((item) => item.category === topCategory)?.kgCO2e ?? 0;

  return {
    monthlyTotalKgCO2e,
    annualTotalKgCO2e: round(monthlyTotalKgCO2e * 12),
    breakdown,
    topCategory,
    ecoScore: calculateEcoScore(monthlyTotalKgCO2e, input, profile),
    potentialMonthlySavingKgCO2e: round(Math.max(topCategoryKg * POTENTIAL_SAVINGS_TARGET_FACTOR, 0)),
    assumptions: [...CALCULATION_ASSUMPTIONS],
  };
}
