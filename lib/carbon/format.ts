/**
 * Shared display formatting utilities for Carbon Compass.
 *
 * Centralises emission value formatting so the notation stays consistent
 * across all components. Using CO₂e (with Unicode subscript) matches
 * scientific convention throughout the UI.
 */

/**
 * Format a numeric emission value for display.
 *
 * Uses integer rounding for readability — fractional kg differences are
 * within the margin of error of the estimation model.
 */
export function formatKgCO2e(value: number): string {
  return `${Math.round(value)} kg CO₂e`;
}

/**
 * Format a percentage for display with one decimal place.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calculate percentage change between two values.
 * Returns 0 when the baseline is zero to avoid division-by-zero.
 */
export function calculatePercentageChange(before: number, after: number): number {
  if (before === 0) return 0;
  return ((after - before) / before) * 100;
}
