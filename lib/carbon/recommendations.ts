import type {
  CarbonCategory,
  Difficulty,
  FootprintInput,
  FootprintResult,
  ImpactLevel,
  MainGoal,
  Recommendation,
  UserProfile,
} from "@/lib/carbon/types";
import { POTENTIAL_SAVINGS_TARGET_FACTOR } from "@/lib/carbon/factors";

type RecommendationDraft = Omit<Recommendation, "estimatedSavingKgCO2ePerMonth"> & {
  baseSavingKgCO2ePerMonth: number;
};

const DIFFICULTY_SCORE: Record<Difficulty, number> = {
  easy: 3,
  medium: 2,
  hard: 1,
};

const IMPACT_SCORE: Record<ImpactLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const MONEY_SCORE: Record<Recommendation["moneySavingPotential"], number> = {
  high: 3,
  medium: 2,
  low: 1,
  none: 0,
};

function categoryPercentage(result: FootprintResult, category: CarbonCategory): number {
  return result.breakdown.find((item) => item.category === category)?.percentage ?? 0;
}

function categoryKg(result: FootprintResult, category: CarbonCategory): number {
  return result.breakdown.find((item) => item.category === category)?.kgCO2e ?? 0;
}

function saving(result: FootprintResult, category: CarbonCategory, fallback: number): number {
  const fromCategory = categoryKg(result, category) * POTENTIAL_SAVINGS_TARGET_FACTOR;
  return Math.round(Math.max(fromCategory, fallback));
}

function withSaving(draft: RecommendationDraft, result: FootprintResult): Recommendation {
  const { baseSavingKgCO2ePerMonth, ...recommendation } = draft;

  return {
    ...recommendation,
    estimatedSavingKgCO2ePerMonth: saving(
      result,
      recommendation.category,
      baseSavingKgCO2ePerMonth
    ),
  };
}

function topOrHighShare(
  result: FootprintResult,
  category: CarbonCategory,
  threshold: number
): boolean {
  return result.topCategory === category || categoryPercentage(result, category) >= threshold;
}

function transportRules(input: FootprintInput, result: FootprintResult): RecommendationDraft[] {
  if (!topOrHighShare(result, "transport", 35)) {
    return [];
  }

  const fuelHeavy =
    input.transport.twoWheelerKmPerWeek +
      input.transport.carKmPerWeek +
      input.transport.cabAutoTripsPerWeek * 6 >
    80;

  return [
    {
      id: "transport-replace-fuel-trips",
      category: "transport",
      title: "Replace 2 short fuel trips this week",
      reason: "Transport is currently your highest footprint opportunity.",
      action:
        "Use metro, bus, walking, or cycling for two short trips instead of scooter, car, cab, or auto.",
      baseSavingKgCO2ePerMonth: fuelHeavy ? 8 : 5,
      difficulty: "easy",
      impact: "medium",
      moneySavingPotential: "high",
      weeklyChallenge: "Replace two short fuel trips with public transport or walking.",
    },
    {
      id: "transport-batch-errands",
      category: "transport",
      title: "Batch errands into one route",
      reason: "Combining short fuel trips reduces avoidable start-stop travel.",
      action: "Plan errands on one route instead of taking separate short rides.",
      baseSavingKgCO2ePerMonth: 4,
      difficulty: "easy",
      impact: "low",
      moneySavingPotential: "medium",
      weeklyChallenge: "Combine two errands into one trip this weekend.",
    },
  ];
}

function energyRules(input: FootprintInput, result: FootprintResult): RecommendationDraft[] {
  if (!topOrHighShare(result, "energy", 30)) {
    return [];
  }

  return [
    {
      id: "energy-reduce-ac",
      category: "energy",
      title: "Reduce AC use by 1 hour per day",
      reason: "Home energy is a major part of your monthly footprint.",
      action: "Use fan cooling for one AC hour each day or set a timer before sleeping.",
      baseSavingKgCO2ePerMonth: input.energy.acHoursPerDay > 0 ? 10 : 5,
      difficulty: "medium",
      impact: "medium",
      moneySavingPotential: "high",
      weeklyChallenge: "Reduce AC time by one hour on five days this week.",
    },
    {
      id: "energy-track-bill",
      category: "energy",
      title: "Track electricity use weekly",
      reason: "Small electricity habits are easier to change when visible.",
      action: "Note your meter or bill trend and switch off idle appliances.",
      baseSavingKgCO2ePerMonth: 4,
      difficulty: "easy",
      impact: "low",
      moneySavingPotential: "medium",
      weeklyChallenge: "Switch off idle chargers and appliances for seven days.",
    },
  ];
}

function foodRules(input: FootprintInput, result: FootprintResult): RecommendationDraft[] {
  const rules: RecommendationDraft[] = [];

  if (topOrHighShare(result, "food", 25)) {
    rules.push({
      id: "food-low-carbon-meal",
      category: "food",
      title: "Try one low-carbon meal day",
      reason: "Food choices are a recurring weekly opportunity.",
      action: "Choose vegetarian, seasonal, lower-waste meals for one day.",
      baseSavingKgCO2ePerMonth: 5,
      difficulty: "easy",
      impact: "medium",
      moneySavingPotential: "low",
      weeklyChallenge: "Make one day this week a low-carbon meal day.",
    });
  }

  if (input.food.foodWasteLevel === "high") {
    rules.push({
      id: "food-waste-plan-meals",
      category: "food",
      title: "Reduce food waste with a two-meal plan",
      reason: "High food waste adds avoidable emissions and spending.",
      action: "Plan two meals before shopping or ordering so leftovers get used.",
      baseSavingKgCO2ePerMonth: 6,
      difficulty: "easy",
      impact: "medium",
      moneySavingPotential: "medium",
      weeklyChallenge: "Use leftovers once before ordering new food.",
    });
  }

  return rules;
}

function shoppingRules(input: FootprintInput, result: FootprintResult): RecommendationDraft[] {
  if (
    !topOrHighShare(result, "shopping", 18) &&
    input.shopping.clothesPerMonth < 3 &&
    input.shopping.onlineOrdersPerMonth < 8
  ) {
    return [];
  }

  return [
    {
      id: "shopping-no-buy-week",
      category: "shopping",
      title: "Try a no-buy week",
      reason: "Delaying non-essential purchases cuts both emissions and spending.",
      action: "Wait seven days before buying clothes, gadgets, or non-essential items.",
      baseSavingKgCO2ePerMonth: 8,
      difficulty: "medium",
      impact: "medium",
      moneySavingPotential: "high",
      weeklyChallenge: "Delay one non-essential purchase for a full week.",
    },
  ];
}

function wasteRules(input: FootprintInput, result: FootprintResult): RecommendationDraft[] {
  if (
    !topOrHighShare(result, "waste", 10) &&
    input.waste.recycles &&
    input.waste.composts &&
    input.waste.plasticUsage === "low"
  ) {
    return [];
  }

  return [
    {
      id: "waste-separate-dry-wet",
      category: "waste",
      title: "Separate dry and wet waste",
      reason: "Basic sorting makes recycling and composting easier to sustain.",
      action: "Keep two bins for dry and wet waste where you usually dispose trash.",
      baseSavingKgCO2ePerMonth: 3,
      difficulty: "easy",
      impact: "low",
      moneySavingPotential: "none",
      weeklyChallenge: "Separate dry and wet waste for five days.",
    },
  ];
}

export function goalScore(goal: MainGoal, recommendation: Recommendation): number {
  if (goal === "save_money") {
    return MONEY_SCORE[recommendation.moneySavingPotential] * 140;
  }
  if (goal === "habit_building") {
    return DIFFICULTY_SCORE[recommendation.difficulty] * 80;
  }
  if (goal === "reduce_carbon") {
    return recommendation.estimatedSavingKgCO2ePerMonth * 8;
  }

  if (goal === "learn") {
    // Prioritise tracking/planning actions and weight by difficulty so it is accessible but informative
    const isTrackingOrPlanning = /track|plan|separate|measure/i.test(
      recommendation.title + " " + recommendation.reason
    );
    const trackingBonus = isTrackingOrPlanning ? 100 : 0;
    return DIFFICULTY_SCORE[recommendation.difficulty] * 40 + trackingBonus;
  }

  return 0;
}

function rankRecommendations(
  recommendations: Recommendation[],
  result: FootprintResult,
  profile: UserProfile
): Recommendation[] {
  return [...recommendations].sort((left, right) => {
    const leftScore =
      (left.category === result.topCategory ? 1000 : 0) +
      goalScore(profile.mainGoal, left) +
      left.estimatedSavingKgCO2ePerMonth * 10 +
      IMPACT_SCORE[left.impact] * 20 +
      DIFFICULTY_SCORE[left.difficulty] * 10;
    const rightScore =
      (right.category === result.topCategory ? 1000 : 0) +
      goalScore(profile.mainGoal, right) +
      right.estimatedSavingKgCO2ePerMonth * 10 +
      IMPACT_SCORE[right.impact] * 20 +
      DIFFICULTY_SCORE[right.difficulty] * 10;

    return rightScore - leftScore;
  });
}

export function getRecommendations(
  input: FootprintInput,
  result: FootprintResult,
  profile: UserProfile
): Recommendation[] {
  const drafts = [
    ...transportRules(input, result),
    ...energyRules(input, result),
    ...foodRules(input, result),
    ...shoppingRules(input, result),
    ...wasteRules(input, result),
  ];
  const recommendations = drafts.map((draft) => withSaving(draft, result));

  return rankRecommendations(recommendations, result, profile).slice(0, 5);
}
