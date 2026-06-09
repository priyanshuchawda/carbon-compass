import { z } from "zod";

const finiteNumber = z.number().finite();
const boundedNumber = (min: number, max: number) =>
  finiteNumber.min(min).max(max);

export const userProfileSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    city: z.string().trim().min(1).max(80),
    country: z.string().trim().min(1).max(80),
    householdSize: boundedNumber(1, 20),
    persona: z.enum(["student", "working", "family"]),
    mainGoal: z.enum([
      "save_money",
      "reduce_carbon",
      "learn",
      "habit_building",
    ]),
  })
  .strict();

export const footprintInputSchema = z
  .object({
    transport: z
      .object({
        twoWheelerKmPerWeek: boundedNumber(0, 1000),
        carKmPerWeek: boundedNumber(0, 1000),
        publicTransportTripsPerWeek: boundedNumber(0, 80),
        cabAutoTripsPerWeek: boundedNumber(0, 80),
        flightsPerYear: boundedNumber(0, 30),
      })
      .strict(),
    energy: z
      .object({
        monthlyElectricityKWh: boundedNumber(0, 2000),
        lpgCylindersPerMonth: boundedNumber(0, 8),
        acHoursPerDay: boundedNumber(0, 24),
        renewableEnergy: z.boolean(),
      })
      .strict(),
    food: z
      .object({
        dietType: z.enum(["vegan", "vegetarian", "mixed", "meat_heavy"]),
        meatMealsPerWeek: boundedNumber(0, 28),
        dairyFrequency: z.enum(["low", "medium", "high"]),
        foodDeliveryPerWeek: boundedNumber(0, 30),
        foodWasteLevel: z.enum(["low", "medium", "high"]),
      })
      .strict(),
    shopping: z
      .object({
        clothesPerMonth: boundedNumber(0, 50),
        onlineOrdersPerMonth: boundedNumber(0, 80),
        electronicsPerYear: boundedNumber(0, 20),
      })
      .strict(),
    waste: z
      .object({
        recycles: z.boolean(),
        composts: z.boolean(),
        plasticUsage: z.enum(["low", "medium", "high"]),
      })
      .strict(),
  })
  .strict();

export const footprintRequestSchema = z
  .object({
    profile: userProfileSchema,
    footprint: footprintInputSchema,
  })
  .strict();

export const categoryBreakdownSchema = z
  .object({
    category: z.enum(["transport", "energy", "food", "shopping", "waste"]),
    label: z.string().trim().min(1).max(80),
    kgCO2e: z.number().finite().nonnegative(),
    percentage: z.number().finite().min(0).max(100),
  })
  .strict();

export const footprintResultSchema = z
  .object({
    monthlyTotalKgCO2e: z.number().finite().nonnegative(),
    annualTotalKgCO2e: z.number().finite().nonnegative(),
    breakdown: z.array(categoryBreakdownSchema),
    topCategory: z.enum(["transport", "energy", "food", "shopping", "waste"]),
    ecoScore: z.number().finite().min(0).max(100),
    potentialMonthlySavingKgCO2e: z.number().finite().nonnegative(),
    assumptions: z.array(z.string().trim()),
  })
  .strict();

export const recommendationSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    category: z.enum(["transport", "energy", "food", "shopping", "waste"]),
    title: z.string().trim().min(1).max(120),
    reason: z.string().trim().min(1).max(500),
    action: z.string().trim().min(1).max(500),
    estimatedSavingKgCO2ePerMonth: z.number().finite().nonnegative(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    impact: z.enum(["low", "medium", "high"]),
    moneySavingPotential: z.enum(["none", "low", "medium", "high"]),
    weeklyChallenge: z.string().trim().min(1).max(500),
  })
  .strict();

export const assistantRequestSchema = z
  .object({
    profile: userProfileSchema,
    result: footprintResultSchema,
    recommendations: z.array(recommendationSchema),
    footprint: footprintInputSchema,
  })
  .strict();

export const chatMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(2000),
  })
  .strict();

export const assistantChatRequestSchema = z
  .object({
    profile: userProfileSchema,
    result: footprintResultSchema,
    footprint: footprintInputSchema,
    messages: z.array(chatMessageSchema).min(1).max(12),
  })
  .strict();

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type FootprintInputPayload = z.infer<typeof footprintInputSchema>;
export type FootprintRequestPayload = z.infer<typeof footprintRequestSchema>;
export type AssistantRequestPayload = z.infer<typeof assistantRequestSchema>;
export type AssistantChatRequestPayload = z.infer<typeof assistantChatRequestSchema>;
export type ChatMessagePayload = z.infer<typeof chatMessageSchema>;

