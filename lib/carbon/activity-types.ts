import type { CarbonCategory } from "@/lib/carbon/types";

export type ActivityTypeDefinition = {
  id: string;
  category: CarbonCategory;
  label: string;
  unit: string;
  helperText: string;
};

export type ActivityCategoryMeta = {
  label: string;
  badgeClass: string;
};

export const ACTIVITY_CATEGORY_META: Record<CarbonCategory, ActivityCategoryMeta> = {
  transport: {
    label: "Transport",
    badgeClass: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
  energy: {
    label: "Home Energy",
    badgeClass: "bg-teal-50 text-teal-800 border border-teal-200",
  },
  food: {
    label: "Food",
    badgeClass: "bg-blue-50 text-blue-800 border border-blue-200",
  },
  shopping: {
    label: "Shopping",
    badgeClass: "bg-violet-50 text-violet-800 border border-violet-200",
  },
  waste: {
    label: "Waste",
    badgeClass: "bg-slate-50 text-slate-800 border border-slate-200",
  },
};

export const ACTIVITY_TYPES: readonly ActivityTypeDefinition[] = [
  {
    id: "two_wheeler",
    category: "transport",
    label: "Two-wheeler travel",
    unit: "km",
    helperText: "Scooter or motorbike distance.",
  },
  {
    id: "car",
    category: "transport",
    label: "Car travel",
    unit: "km",
    helperText: "Personal car distance.",
  },
  {
    id: "public_transport",
    category: "transport",
    label: "Public transport",
    unit: "trips",
    helperText: "Bus, metro, or local train trips.",
  },
  {
    id: "cab_auto",
    category: "transport",
    label: "Cab or auto ride",
    unit: "trips",
    helperText: "Taxi, ride-hailing, or auto-rickshaw trips.",
  },
  {
    id: "flight",
    category: "transport",
    label: "Domestic flight",
    unit: "flights",
    helperText: "One-way domestic flights.",
  },
  {
    id: "electricity",
    category: "energy",
    label: "Grid electricity",
    unit: "kWh",
    helperText: "Electricity consumed from the bill or meter.",
  },
  {
    id: "lpg",
    category: "energy",
    label: "LPG cylinders",
    unit: "cylinders",
    helperText: "Cooking gas cylinders used.",
  },
  {
    id: "ac",
    category: "energy",
    label: "Air conditioning",
    unit: "hours",
    helperText: "Approximate AC operating hours.",
  },
  {
    id: "meat_meal",
    category: "food",
    label: "Meals with meat",
    unit: "meals",
    helperText: "Meals containing meat, fish, or poultry.",
  },
  {
    id: "delivery",
    category: "food",
    label: "Food delivery orders",
    unit: "orders",
    helperText: "Swiggy, Zomato, or similar orders.",
  },
  {
    id: "clothes",
    category: "shopping",
    label: "Clothing items bought",
    unit: "items",
    helperText: "New garments, shoes, or accessories.",
  },
  {
    id: "online",
    category: "shopping",
    label: "Online orders placed",
    unit: "orders",
    helperText: "E-commerce deliveries.",
  },
  {
    id: "electronics",
    category: "shopping",
    label: "Electronics purchased",
    unit: "devices",
    helperText: "Phones, laptops, appliances, or similar devices.",
  },
  {
    id: "recycling",
    category: "waste",
    label: "Recycled dry waste",
    unit: "actions",
    helperText: "Dry-waste recycling actions.",
  },
  {
    id: "composting",
    category: "waste",
    label: "Composted food scraps",
    unit: "actions",
    helperText: "Food-scrap composting actions.",
  },
] as const;

export const ACTIVITY_CATEGORIES: readonly CarbonCategory[] = [
  "transport",
  "energy",
  "food",
  "shopping",
  "waste",
] as const;

export function getActivityTypesForCategory(
  category: CarbonCategory,
): ActivityTypeDefinition[] {
  return ACTIVITY_TYPES.filter((activity) => activity.category === category);
}

export function getActivityType(
  category: CarbonCategory,
  id: string,
): ActivityTypeDefinition | null {
  return (
    ACTIVITY_TYPES.find(
      (activity) => activity.category === category && activity.id === id,
    ) ?? null
  );
}
