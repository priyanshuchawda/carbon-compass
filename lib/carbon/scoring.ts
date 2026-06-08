import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

function round(value: number, digits = 0): number {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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
