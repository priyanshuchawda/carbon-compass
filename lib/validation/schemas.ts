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

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type FootprintInputPayload = z.infer<typeof footprintInputSchema>;
export type FootprintRequestPayload = z.infer<typeof footprintRequestSchema>;
