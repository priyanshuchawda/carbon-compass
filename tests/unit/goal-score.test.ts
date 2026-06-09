import { describe, expect, it } from "vitest";
import { goalScore } from "@/lib/carbon/recommendations";
import type { Recommendation } from "@/lib/carbon/types";

const mockRecommendation = (overrides: Partial<Recommendation> = {}): Recommendation => ({
  id: "test-rec",
  category: "energy",
  title: "Test action",
  reason: "Test reason for testing.",
  action: "Do test action.",
  estimatedSavingKgCO2ePerMonth: 10,
  difficulty: "easy",
  impact: "medium",
  moneySavingPotential: "medium",
  weeklyChallenge: "Test challenge",
  ...overrides,
});

describe("recommendation goal scoring", () => {
  it("scores save_money goal based on money saving potential", () => {
    const recHigh = mockRecommendation({ moneySavingPotential: "high" });
    const recMedium = mockRecommendation({ moneySavingPotential: "medium" });
    const recNone = mockRecommendation({ moneySavingPotential: "none" });

    expect(goalScore("save_money", recHigh)).toBe(3 * 140);
    expect(goalScore("save_money", recMedium)).toBe(2 * 140);
    expect(goalScore("save_money", recNone)).toBe(0);
  });

  it("scores habit_building goal based on difficulty (easier is higher score)", () => {
    const recEasy = mockRecommendation({ difficulty: "easy" });
    const recMedium = mockRecommendation({ difficulty: "medium" });
    const recHard = mockRecommendation({ difficulty: "hard" });

    expect(goalScore("habit_building", recEasy)).toBe(3 * 80);
    expect(goalScore("habit_building", recMedium)).toBe(2 * 80);
    expect(goalScore("habit_building", recHard)).toBe(1 * 80);
  });

  it("scores reduce_carbon goal based on estimated savings", () => {
    const rec10 = mockRecommendation({ estimatedSavingKgCO2ePerMonth: 10 });
    const rec25 = mockRecommendation({ estimatedSavingKgCO2ePerMonth: 25 });

    expect(goalScore("reduce_carbon", rec10)).toBe(10 * 8);
    expect(goalScore("reduce_carbon", rec25)).toBe(25 * 8);
  });

  it("scores learn goal prioritizing tracking and planning, then difficulty", () => {
    // Action containing 'track' in title
    const recTrack = mockRecommendation({
      title: "Track your electricity bills",
      reason: "This builds awareness.",
      difficulty: "easy",
    });

    // Action containing 'plan' in reason
    const recPlan = mockRecommendation({
      title: "Sort waste daily",
      reason: "Plan two meals ahead to avoid organic waste.",
      difficulty: "medium",
    });

    // Normal non-learning action
    const recNormal = mockRecommendation({
      title: "Turn off lights",
      reason: "Saves energy.",
      difficulty: "easy",
    });

    // Tracking + Easy difficulty score should be: (3 * 40) + 100 = 220
    expect(goalScore("learn", recTrack)).toBe(220);

    // Planning + Medium difficulty score should be: (2 * 40) + 100 = 180
    expect(goalScore("learn", recPlan)).toBe(180);

    // Normal + Easy difficulty score should be: (3 * 40) + 0 = 120
    expect(goalScore("learn", recNormal)).toBe(120);
  });
});
