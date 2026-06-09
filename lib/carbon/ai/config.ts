import "server-only";

export const INPUT_COST_PER_MILLION = 0.075;
export const OUTPUT_COST_PER_MILLION = 0.3;

export const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

/**
 * Returns the Gemini API key if present in the server environment.
 */
export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim();
}

/**
 * Checks if Gemini assistant features are enabled (i.e. API key exists).
 */
export function isGeminiEnabled(): boolean {
  return !!getGeminiApiKey();
}
