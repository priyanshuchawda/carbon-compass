import { simulateAction } from "@/lib/carbon/simulator";
import type { FootprintInput, UserProfile, FootprintResult } from "@/lib/carbon/types";
import { z } from "zod";

export interface ToolContext {
  profile: UserProfile;
  footprintInput: FootprintInput;
  result: FootprintResult;
}

const getEmissionBreakdownSchema = z.object({
  category: z.enum(["transport", "energy", "food", "shopping", "waste"], {
    message: "category must be one of: transport, energy, food, shopping, waste"
  }),
});

const compareToIndiaAverageSchema = z.object({
  monthlyKg: z.number({
    message: "monthlyKg must be a finite number"
  }).finite(),
});

const simulateActionSchema = z.object({
  actionId: z.enum([
    "metro_bus_substitution",
    "reduce_ac_one_hour_daily",
    "low_carbon_meal_day",
    "reduce_delivery",
    "start_recycling",
    "start_composting"
  ], {
    message: "actionId must be a valid simulation action"
  }),
});

export const ASSISTANT_TOOLS = [
  {
    name: "get_emission_breakdown",
    description: "Retrieve detailed emission metrics and input values for a specific category (transport, energy, food, shopping, waste). Use this to understand specific drivers.",
    parameters: {
      type: "OBJECT",
      properties: {
        category: {
          type: "STRING",
          description: "The category to query.",
          enum: ["transport", "energy", "food", "shopping", "waste"]
        }
      },
      required: ["category"]
    }
  },
  {
    name: "compare_to_india_average",
    description: "Compare the user's monthly carbon emissions against the national Indian average (both per-capita and household adjusted).",
    parameters: {
      type: "OBJECT",
      properties: {
        monthlyKg: {
          type: "NUMBER",
          description: "The user's monthly emissions in kg CO2e to compare."
        }
      },
      required: ["monthlyKg"]
    }
  },
  {
    name: "simulate_action",
    description: "Simulate the carbon emissions impact (savings in kg CO2e/month) of taking a specific action.",
    parameters: {
      type: "OBJECT",
      properties: {
        actionId: {
          type: "STRING",
          description: "The action to simulate.",
          enum: ["metro_bus_substitution", "reduce_ac_one_hour_daily", "low_carbon_meal_day", "reduce_delivery", "start_recycling", "start_composting"]
        }
      },
      required: ["actionId"]
    }
  }
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  context: ToolContext
): Promise<unknown> {
  switch (name) {
    case "get_emission_breakdown": {
      const parsed = getEmissionBreakdownSchema.safeParse(args);
      if (!parsed.success) {
        return { error: `Invalid parameters: ${parsed.error.issues.map(i => i.message).join(", ")}` };
      }
      const category = parsed.data.category;
      const detail = context.result.breakdown.find(b => b.category === category);
      let inputs: Record<string, unknown> | undefined = {};
      if (category === "transport") {
        inputs = context.footprintInput.transport;
      } else if (category === "energy") {
        inputs = context.footprintInput.energy;
      } else if (category === "food") {
        inputs = context.footprintInput.food;
      } else if (category === "shopping") {
        inputs = context.footprintInput.shopping;
      } else if (category === "waste") {
        inputs = context.footprintInput.waste;
      }
      return {
        category,
        label: detail?.label ?? category,
        kgCO2e: detail?.kgCO2e ?? 0,
        percentage: detail?.percentage ?? 0,
        inputs
      };
    }
    case "compare_to_india_average": {
      const parsed = compareToIndiaAverageSchema.safeParse(args);
      if (!parsed.success) {
        return { error: `Invalid parameters: ${parsed.error.issues.map(i => i.message).join(", ")}` };
      }
      const monthlyKg = parsed.data.monthlyKg;
      const householdSize = Math.max(context.profile.householdSize, 1);
      const perCapitaKg = monthlyKg / householdSize;
      
      // Indian national average is ~158 kg CO2e/month per capita
      const nationalPerCapitaMonthlyAvg = 158;
      const nationalHouseholdMonthlyAvg = nationalPerCapitaMonthlyAvg * householdSize;
      
      const ratio = perCapitaKg / nationalPerCapitaMonthlyAvg;
      let status = "average";
      if (ratio < 0.8) {
        status = "below_average (eco-friendly)";
      } else if (ratio > 1.2) {
        status = "above_average (high impact)";
      }
      
      return {
        userMonthlyKg: monthlyKg,
        userPerCapitaMonthlyKg: Math.round(perCapitaKg),
        householdSize,
        nationalPerCapitaMonthlyAvg,
        nationalHouseholdMonthlyAvg: Math.round(nationalHouseholdMonthlyAvg),
        comparisonStatus: status,
        percentDifference: Math.round((ratio - 1) * 100)
      };
    }
    case "simulate_action": {
      const parsed = simulateActionSchema.safeParse(args);
      if (!parsed.success) {
        return { error: `Invalid parameters: ${parsed.error.issues.map(i => i.message).join(", ")}` };
      }
      const actionId = parsed.data.actionId;
      const simulation = simulateAction(context.footprintInput, context.profile, actionId);
      return {
        actionId,
        title: simulation.appliedActions[0]?.title ?? "",
        description: simulation.appliedActions[0]?.description ?? "",
        savingKgCO2ePerMonth: simulation.savingKgCO2e,
        categorySavings: simulation.categorySavings
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
