import "server-only";
import type { AssistantRequestPayload } from "../../validation/schemas";

/**
 * System prompt definition and context grounding for the Gemini Assistant.
 */

export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    narrative: {
      type: "STRING",
      description: "A short, encouraging 2-3 sentence summary explaining their top emissions driver, its percentage, and a dynamic local reference."
    },
    weeklyChallenge: {
      type: "STRING",
      description: "A practical weekly challenge customized to help reduce their highest impact category."
    },
    goalTip: {
      type: "STRING",
      description: "A personalized tip linking their carbon footprint reduction directly to their main goal."
    }
  },
  required: ["narrative", "weeklyChallenge", "goalTip"]
};

/**
 * Pure function to build the prompt for Gemini.
 */
export function buildAssistantPrompt(data: AssistantRequestPayload): string {
  const { profile, result, recommendations } = data;

  const topCategoryItem = result.breakdown.find(item => item.category === result.topCategory);
  const topCategoryLabel = topCategoryItem?.label ?? result.topCategory;
  const topCategoryPercentage = topCategoryItem ? Math.round((topCategoryItem.kgCO2e / result.monthlyTotalKgCO2e) * 100) : 0;
  const leadingRec = recommendations[0];
  const leadingRecTitle = leadingRec ? leadingRec.title : "Reduce travel or energy consumption";

  return `
      You are the Compass Assistant for Carbon Compass, a sustainability platform.
      Provide a personalized, encouraging analysis for a user.
      Refer to their city (${profile.city}) or persona (${profile.persona}) naturally.
      Do not preach or shame. Keep the tone practical, encouraging, and supportive.
      
      User Profile:
      - City: ${profile.city}
      - Persona: ${profile.persona}
      - Goal: ${profile.mainGoal} (values: save_money, reduce_carbon, learn, habit_building)
      
      Calculated Emissions:
      - Monthly footprint: ${result.monthlyTotalKgCO2e} kg CO2e
      - Annual footprint: ${result.annualTotalKgCO2e} kg CO2e
      - Eco score: ${result.ecoScore}/100
      - Highest impact category: ${topCategoryLabel} (contributes ${topCategoryPercentage}% of emissions)
      - Potential monthly saving: ${result.potentialMonthlySavingKgCO2e} kg CO2e
      - Recommended first step: ${leadingRecTitle}
      
      You MUST call the compare_to_india_average tool to ground your comparison, and get_emission_breakdown for the highest impact category to verify specific user inputs.
      You can also call simulate_action for simulated savings if relevant to the weekly challenge.
      
      Finally, return a JSON object with properties 'narrative', 'weeklyChallenge', and 'goalTip'.
    `;
}

/**
 * Pure function to generate a deterministic fallback when Gemini API key is missing or calls fail.
 */
export function getFallbackResponse(data: AssistantRequestPayload): {
  narrative: string;
  weeklyChallenge: string;
  goalTip: string;
  costUSD: number;
  isDemo: boolean;
} {
  const { result, recommendations } = data;

  const topCategoryItem = result.breakdown.find(item => item.category === result.topCategory);
  const topCategoryLabel = topCategoryItem?.label ?? result.topCategory;
  const topCategoryPercentage = result.monthlyTotalKgCO2e > 0 && topCategoryItem
    ? Math.round((topCategoryItem.kgCO2e / result.monthlyTotalKgCO2e) * 100)
    : 0;
  const leadingRec = recommendations[0];
  const leadingRecTitle = leadingRec ? leadingRec.title : "Reduce travel or energy consumption";

  let narrative = `Your monthly carbon footprint is ${result.monthlyTotalKgCO2e} kg CO2e. ${topCategoryLabel} represents your primary emission driver at ${topCategoryPercentage}% of your total emissions.`;
  let weeklyChallenge = `Try implementing "${leadingRecTitle}" to start lowering your emissions this week.`;
  let goalTip = "Reducing emissions in your top category yields the highest overall footprint reduction and financial savings.";

  if (result.topCategory === "transport") {
    narrative = `Based on your profile, transport is your largest emission source (${topCategoryPercentage}% of your total). Switching transport modes will yield the highest impact.`;
    weeklyChallenge = "Swap 2 private scooter/car trips for metro, bus, or cycling this week.";
    goalTip = "Commute swaps save petrol cost directly, helping you stretch your monthly budget.";
  } else if (result.topCategory === "energy") {
    narrative = `Home energy usage represents your primary carbon footprint opportunity, contributing ${topCategoryPercentage}% of your emissions.`;
    weeklyChallenge = "Reduce daily AC usage by 1 hour or switch off idle appliances.";
    goalTip = "Reducing electricity and gas consumption directly lowers your utility bill.";
  } else if (result.topCategory === "food") {
    narrative = `Food choices and waste are your largest source of emissions, accounting for ${topCategoryPercentage}% of your footprint.`;
    weeklyChallenge = "Plan meals ahead to eliminate leftovers and food waste.";
    goalTip = "Reducing food waste saves money on groceries and minimizes landfill methane emissions.";
  } else if (result.topCategory === "shopping") {
    narrative = `Your consumption patterns are your largest carbon contributor, representing ${topCategoryPercentage}% of your footprint.`;
    weeklyChallenge = "Delay one non-essential purchase for a full week.";
    goalTip = "A no-buy week helps save money and reduces downstream manufacturing footprint.";
  } else if (result.topCategory === "waste") {
    narrative = `Waste management is your biggest focus area, contributing ${topCategoryPercentage}% of your monthly emissions.`;
    weeklyChallenge = "Sort your dry and wet waste for recycling and composting.";
    goalTip = "Sorting waste facilitates recycling, keeping organic material out of carbon-intensive dumps.";
  }

  return {
    narrative,
    weeklyChallenge,
    goalTip,
    costUSD: 0,
    isDemo: true
  };
}

export function buildChatPrompt(data: {
  profile: any;
  result: any;
  footprint: any;
}): string {
  const { profile, result } = data;
  return `
    You are the Compass Chat Assistant for Carbon Compass.
    Ground your answers strictly in the user's carbon footprint data:
    - City: ${profile.city}
    - Persona: ${profile.persona}
    - Monthly Footprint: ${result.monthlyTotalKgCO2e} kg CO2e
    - Eco Score: ${result.ecoScore}/100
    - Top Category: ${result.topCategory}
    
    Breakdown:
    ${result.breakdown.map((b: any) => `- ${b.label}: ${b.kgCO2e} kg CO2e (${b.percentage}%)`).join("\n")}
    
    Guiding Rules:
    1. Answer questions concisely and professionally in under 4 sentences.
    2. Do NOT invent or make up exact savings metrics. Keep it grounded in the calculations.
    3. Refuse to answer questions about medical, legal, or financial topics.
    4. If the user asks an unrelated or off-topic question, politely redirect them back to carbon tracking.
    5. When asked to compare, explain that the Indian average carbon footprint is about 158 kg CO2e per month per capita.
  `;
}

export function getFallbackChatResponse(userMessage: string): string {
  const lowercase = userMessage.toLowerCase();
  if (lowercase.includes("medical") || lowercase.includes("legal") || lowercase.includes("doctor") || lowercase.includes("lawyer")) {
    return "I am a carbon footprint assistant and cannot provide medical, legal, or professional advice. Please consult a qualified professional.";
  }
  if (lowercase.includes("hi") || lowercase.includes("hello") || lowercase.includes("hey")) {
    return "Hello! I am your Carbon Compass assistant. How can I help you understand or reduce your carbon footprint today?";
  }
  if (lowercase.includes("biggest") || lowercase.includes("highest") || lowercase.includes("driver") || lowercase.includes("source") || lowercase.includes("driving")) {
    return "Based on your inputs, your top emission category is estimated to be your transport or energy consumption. You can see a detailed breakdown on the Dashboard.";
  }
  if (lowercase.includes("reduce") || lowercase.includes("cut") || lowercase.includes("lower")) {
    return "To lower your footprint, focus on reducing private vehicle trips, conserving home energy (especially air conditioning), planning meals to minimize food waste, and recycling dry waste.";
  }
  return "I am here to help you understand your carbon footprint and suggest practical ways to reduce it. Feel free to ask about your emissions breakdown or ways to save energy and transportation footprint.";
}
