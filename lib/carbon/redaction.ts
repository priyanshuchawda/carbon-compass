/**
 * Security Utility: Error Sanitization and Redaction
 *
 * Prevents sensitive credentials (such as Google API keys, authorization headers,
 * and bearer tokens) from leaking in logs or client-facing HTTP response payloads.
 */

const MAX_STRING_LENGTH = 500;
const MAX_DEPTH = 3;

// Pattern matches:
const GOOGLE_API_KEY_PATTERN = /\bAIza[0-9A-Za-z_-]{20,}\b/g;
const BEARER_TOKEN_PATTERN = /\bbearer\s+[a-z0-9._~+/=-]{12,}/gi;
const HEADER_SECRET_PATTERN = /(authorization\s*[:=]\s*)(bearer\s+)?[^\s,;}\]]+/gi;
const URL_SECRET_PARAM_PATTERN = /((?:[?&]|\b)(?:key|api_key|apiKey|access_token|refresh_token|token|auth|authorization)=)([^&#\s]+)/gi;
const SENSITIVE_FIELD_PATTERN = /^(api[-_]?key|apikey|authorization|access[-_]?token|accesstoken|refresh[-_]?token|refreshtoken|token|secret|password|credential)s?$/i;

function truncateString(value: string): string {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }
  return `${value.slice(0, 240)}...[truncated ${value.length - 240} chars]`;
}

/**
 * Scrub a raw string for keys and credentials.
 */
export function redactSensitiveString(value: string): string {
  return truncateString(value)
    .replace(HEADER_SECRET_PATTERN, "$1$2[REDACTED]")
    .replace(BEARER_TOKEN_PATTERN, "Bearer [REDACTED]")
    .replace(URL_SECRET_PARAM_PATTERN, "$1[REDACTED]")
    .replace(GOOGLE_API_KEY_PATTERN, "[REDACTED_GOOGLE_API_KEY]");
}

function isSensitiveFieldName(fieldName: string): boolean {
  return SENSITIVE_FIELD_PATTERN.test(fieldName);
}

/**
 * Recursively inspect and scrub objects for sensitive fields.
 */
export function redactObjectValue(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return redactSensitiveString(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (depth >= MAX_DEPTH) {
    return "[REDACTED_DEEP_OBJECT]";
  }

  if (Array.isArray(value)) {
    return value.slice(0, 10).map((item) => redactObjectValue(item, depth + 1));
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      output[key] = isSensitiveFieldName(key)
        ? "[REDACTED]"
        : redactObjectValue(nestedValue, depth + 1);
    }
    return output;
  }

  return String(value);
}

export interface SanitizedError {
  name: string;
  message: string;
  statusCode?: number;
  stack?: string;
  details?: unknown;
}

/**
 * Transforms any caught error into a redacted, user-safe payload.
 */
export function redactError(error: unknown): SanitizedError {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error 
    ? redactSensitiveString(error.message)
    : redactSensitiveString(String(error));

  const safeError: SanitizedError = {
    name,
    message,
  };

  if (error && typeof error === "object") {
    if ("status" in error && typeof error.status === "number") {
      safeError.statusCode = error.status;
    } else if ("statusCode" in error && typeof error.statusCode === "number") {
      safeError.statusCode = error.statusCode;
    }

    // Capture non-production stack details safely
    if (error instanceof Error && error.stack && process.env.NODE_ENV !== "production") {
      safeError.stack = redactSensitiveString(error.stack);
    }

    if (!(error instanceof Error)) {
      safeError.details = redactObjectValue(error);
    }
  }

  return safeError;
}
