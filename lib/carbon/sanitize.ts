/**
 * Input sanitization helpers.
 *
 * These run on untrusted user input before it is persisted, rendered, or
 * forwarded to the AI provider. They are deliberately conservative: strip
 * control characters and invisible code points that can be used for spoofing
 * or prompt-injection obfuscation, normalize Unicode, and bound length.
 *
 * All functions are pure and synchronous so they can be exhaustively tested.
 */

/** Characters that are never legitimate in free-text input. */
const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f]/g;

/** Zero-width and bidirectional-override characters used to hide content. */
const INVISIBLE_CHARS =
  /[\u200b-\u200d\u200e-\u200f\u202a-\u202e\u2060-\u2064\ufeff\ufe00-\ufe0f\u00ad\u180e]/g;

/**
 * Sanitize a free-text string.
 *
 * - Normalizes to Unicode NFC.
 * - Removes control characters (keeping tab and newline).
 * - Removes zero-width / bidi-override characters.
 * - Collapses runs of 3+ blank lines to a maximum of two.
 * - Trims surrounding whitespace.
 * - Enforces an optional maximum length.
 */
export function sanitizeText(input: string, maxLength = 2_000): string {
  if (typeof input !== "string") return "";

  let out = input.normalize("NFC");
  out = out.replace(CONTROL_CHARS, "");
  out = out.replace(INVISIBLE_CHARS, "");
  // Normalize Windows/Mac line endings to \n.
  out = out.replace(/\r\n?/g, "\n");
  // Collapse excessive blank lines.
  out = out.replace(/\n{3,}/g, "\n\n");
  out = out.trim();

  if (out.length > maxLength) out = out.slice(0, maxLength);
  return out;
}

/** Escape the five significant HTML characters. Defense in depth for any sink. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Patterns that look like credentials we never want to echo back in logs. */
const SECRET_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "[redacted-bearer]", re: /Bearer\s+[A-Za-z0-9._\-]+/gi },
  { label: "[redacted-key]", re: /\b(sk|pk|api|key)[-_][A-Za-z0-9]{8,}\b/gi },
  { label: "[redacted-jwt]", re: /\beyJ[A-Za-z0-9._-]{10,}\b/g },
];

/**
 * Redact anything that resembles a secret from a string before it is logged.
 * This protects against accidental key/token leakage into server logs.
 */
export function redactSecrets(input: string): string {
  let out = input;
  for (const { label, re } of SECRET_PATTERNS) {
    out = out.replace(re, label);
  }
  return out;
}

/**
 * Validate and clamp a numeric quantity coming from user input.
 * Rejects NaN, Infinity, and negatives; clamps to a sane upper bound.
 */
export function clampQuantity(value: number, max = 1_000_000): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, max);
}
