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

/**
 * Read request body in chunks with a hard limit in bytes.
 */
export async function readBoundedBody(request: Request, limitBytes = 65536): Promise<string> {
  const body = request.body;
  if (!body) {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > limitBytes) {
      throw new Error(`Request payload exceeds maximum allowed size of ${limitBytes} bytes`);
    }
    return text;
  }
  const reader = body.getReader();
  let accumulated = "";
  const decoder = new TextDecoder();
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > limitBytes) {
          throw new Error(`Request payload exceeds maximum allowed size of ${limitBytes} bytes`);
        }
        accumulated += decoder.decode(value, { stream: true });
      }
    }
    accumulated += decoder.decode(); // flush
  } finally {
    reader.releaseLock();
  }
  return accumulated;
}
