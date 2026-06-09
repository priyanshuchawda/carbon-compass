import { clamp, round } from "@/lib/carbon/utils";

import type { FootprintInput, UserProfile } from "@/lib/carbon/types";
// round() and clamp() are provided by @/lib/carbon/utils

/**
 * Calculates the Eco Score (0 to 100) based on per-capita monthly footprint.
 * 
 * Calibration Logic:
 * - India's national average carbon footprint is ~1,900 kg CO2e/year per capita,
 *   which is ~158 kg CO2e/month per capita.
 * - We calibrate the scoring so that an average user (158 kg/month) achieves a base score of ~70
 *   before habit bonuses. This makes any score above 70 indicate a below-average footprint,
 *   aligning with the platform's documentation.
 * - Divisor = 158 / (100 - 70) = 5.26. We round this to 5.25 for simplicity and stability.
 * - Habit bonuses (renewable energy, recycling, composting) can add up to +10 points,
 *   rewarding positive lifestyle actions.
 */
export function calculateEcoScore(
  monthlyTotalKgCO2e: number,
  input: FootprintInput,
  profile: UserProfile,
): number {
  const householdAdjustedTotal =
    monthlyTotalKgCO2e / Math.max(profile.householdSize, 1);
  const habitBonus =
    (input.energy.renewableEnergy ? 4 : 0) +
    (input.waste.recycles ? 3 : 0) +
    (input.waste.composts ? 3 : 0);

  return round(clamp(100 - householdAdjustedTotal / 5.25 + habitBonus, 0, 100), 0);
}
