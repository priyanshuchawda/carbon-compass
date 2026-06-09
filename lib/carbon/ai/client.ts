import "server-only";
import { MODELS, getGeminiApiKey, INPUT_COST_PER_MILLION, OUTPUT_COST_PER_MILLION } from "./config";
import { ASSISTANT_TOOLS } from "../assistant-tools";
import { GEMINI_RESPONSE_SCHEMA } from "./prompt";

export interface GeminiPart {
  text?: string;
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
  functionResponse?: {
    name: string;
    response: { result: unknown };
  };
}

export interface GeminiContent {
  role: "user" | "model" | "function";
  parts: GeminiPart[];
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
}

export interface GeminiResponseBody {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
  }[];
  usageMetadata?: GeminiUsageMetadata;
}

export interface GeminiCallResult {
  responseBody: GeminiResponseBody;
  costUSD: number;
  modelUsed: string;
}

const MAX_ATTEMPTS = 3;
const INITIAL_DELAY_MS = 250;
const JITTER_RATIO = 0.25;

function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) return null;
  const seconds = Number(headerValue);
  if (!isNaN(seconds) && seconds > 0) {
    return seconds * 1000;
  }
  const dateMs = Date.parse(headerValue);
  if (!isNaN(dateMs)) {
    const diff = dateMs - Date.now();
    return diff > 0 ? diff : null;
  }
  return null;
}

async function fetchGeminiRaw(
  apiKey: string,
  model: string,
  payload: unknown,
  signal: AbortSignal
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal
  });
}

class GeminiFatalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiFatalError";
  }
}

/**
 * Execute a call to the Gemini API, handling retries (with backoff & jitter)
 * and falling back to a secondary model if the primary fails.
 */
export async function callGeminiWithFallback(
  contents: GeminiContent[],
  signal: AbortSignal
): Promise<GeminiCallResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  let lastError: unknown = null;

  for (const model of MODELS) {
    const payload = {
      contents,
      tools: [{ functionDeclarations: ASSISTANT_TOOLS }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_RESPONSE_SCHEMA
      }
    };

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetchGeminiRaw(apiKey, model, payload, signal);

        if (response.ok) {
          const responseBody = (await response.json()) as GeminiResponseBody;
          
          const promptTokens = responseBody.usageMetadata?.promptTokenCount ?? 0;
          const candidatesTokens = responseBody.usageMetadata?.candidatesTokenCount ?? 0;
          
          const costUSD = Number(
            (
              (promptTokens / 1_000_000) * INPUT_COST_PER_MILLION +
              (candidatesTokens / 1_000_000) * OUTPUT_COST_PER_MILLION
            ).toFixed(8)
          );

          return {
            responseBody,
            costUSD,
            modelUsed: model
          };
        }

        const status = response.status;
        if (status === 429 || status >= 500) {
          const retryAfterHeader = response.headers.get("retry-after");
          const retryAfterMs = parseRetryAfter(retryAfterHeader);
          
          const backoffMs = INITIAL_DELAY_MS * 2 ** (attempt - 1);
          const delayMs = retryAfterMs ? Math.max(backoffMs, retryAfterMs) : backoffMs;
          const jitter = (Math.random() * 2 - 1) * delayMs * JITTER_RATIO;
          const finalDelay = Math.max(0, Math.round(delayMs + jitter));
          
          await new Promise((resolve) => setTimeout(resolve, finalDelay));
        } else {
          // Client errors (400, 403, etc.) should fail fast and not be retried
          throw new GeminiFatalError(`Gemini API client error: status ${status}`);
        }
      } catch (err) {
        lastError = err;
        if (err instanceof Error && err.name === "GeminiFatalError") {
          break; // move to next model immediately
        }
        if (attempt < MAX_ATTEMPTS) {
          const backoffMs = INITIAL_DELAY_MS * 2 ** (attempt - 1);
          const jitter = (Math.random() * 2 - 1) * backoffMs * JITTER_RATIO;
          const finalDelay = Math.max(0, Math.round(backoffMs + jitter));
          await new Promise((resolve) => setTimeout(resolve, finalDelay));
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models failed to respond");
}
