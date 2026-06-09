import { clamp, round } from "@/lib/carbon/utils";

import type { FootprintInput, UserProfile } from "@/lib/carbon/types";
// round() and clamp() are provided by @/lib/carbon/utils

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

  return round(clamp(100 - householdAdjustedTotal / 4 + habitBonus, 0, 100));
}
