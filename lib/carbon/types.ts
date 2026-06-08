export type CarbonCategory =
  | "transport"
  | "energy"
  | "food"
  | "shopping"
  | "waste";

export type Persona = "student" | "working" | "family";

export type MainGoal =
  | "save_money"
  | "reduce_carbon"
  | "learn"
  | "habit_building";

export type Difficulty = "easy" | "medium" | "hard";

export type ImpactLevel = "low" | "medium" | "high";

export type UserProfile = {
  id: string;
  city: string;
  country: string;
  householdSize: number;
  persona: Persona;
  mainGoal: MainGoal;
};

export type TransportInput = {
  twoWheelerKmPerWeek: number;
  carKmPerWeek: number;
  publicTransportTripsPerWeek: number;
  cabAutoTripsPerWeek: number;
  flightsPerYear: number;
};

export type EnergyInput = {
  monthlyElectricityKWh: number;
  lpgCylindersPerMonth: number;
  acHoursPerDay: number;
  renewableEnergy: boolean;
};

export type FoodInput = {
  dietType: "vegan" | "vegetarian" | "mixed" | "meat_heavy";
  meatMealsPerWeek: number;
  dairyFrequency: "low" | "medium" | "high";
  foodDeliveryPerWeek: number;
  foodWasteLevel: "low" | "medium" | "high";
};

export type ShoppingInput = {
  clothesPerMonth: number;
  onlineOrdersPerMonth: number;
  electronicsPerYear: number;
};

export type WasteInput = {
  recycles: boolean;
  composts: boolean;
  plasticUsage: "low" | "medium" | "high";
};

export type FootprintInput = {
  transport: TransportInput;
  energy: EnergyInput;
  food: FoodInput;
  shopping: ShoppingInput;
  waste: WasteInput;
};

export type EmissionFactor = {
  id: string;
  label: string;
  value: number;
  unit: string;
  sourceName: string;
  sourceUrl?: string;
  note: string;
};

export type CategoryBreakdown = {
  category: CarbonCategory;
  label: string;
  kgCO2e: number;
  percentage: number;
};

export type CategoryResult = Omit<CategoryBreakdown, "percentage">;

export type FootprintResult = {
  monthlyTotalKgCO2e: number;
  annualTotalKgCO2e: number;
  breakdown: CategoryBreakdown[];
  topCategory: CarbonCategory;
  ecoScore: number;
  potentialMonthlySavingKgCO2e: number;
  assumptions: string[];
};
