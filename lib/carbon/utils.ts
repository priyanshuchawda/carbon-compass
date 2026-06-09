/**
 * Shared numeric utilities used across the carbon calculation engine.
 * Centralised here to avoid duplication across calculate.ts, scoring.ts,
 * and simulator.ts.
 */

/**
 * Round a number to the given number of decimal digits.
 * Uses Number.EPSILON to avoid floating-point representation errors
 * (e.g. 1.005 rounding to 1.00 instead of 1.01).
 */
export function round(value: number, digits = 2): number {
  const multiplier = 10 ** digits;
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

/**
 * Clamp a number to the inclusive [min, max] range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
