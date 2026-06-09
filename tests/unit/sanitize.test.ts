import { describe, expect, it } from "vitest";
import { sanitizeText, escapeHtml, redactSecrets, clampQuantity } from "../../lib/carbon/sanitize";

describe("sanitizeText", () => {
  it("normalizes to NFC", () => {
    // "café" written with combining accent vs precomposed
    const input = "cafe\u0301";
    const sanitized = sanitizeText(input);
    expect(sanitized).toBe("caf\u00e9");
  });

  it("removes control characters but keeps tab and newline", () => {
    const input = "Hello\x00World\nTabs\tHere\x1f";
    expect(sanitizeText(input)).toBe("HelloWorld\nTabs\tHere");
  });

  it("removes zero-width and bidi override characters", () => {
    const input = "Secret\u200bText\u202eObfuscated";
    expect(sanitizeText(input)).toBe("SecretTextObfuscated");
  });

  it("collapses runs of 3+ blank lines to a max of two", () => {
    const input = "Line1\n\n\n\nLine2\n\n\nLine3";
    expect(sanitizeText(input)).toBe("Line1\n\nLine2\n\nLine3");
  });

  it("trims surrounding whitespace", () => {
    const input = "   padded text   \n";
    expect(sanitizeText(input)).toBe("padded text");
  });

  it("enforces maximum length", () => {
    const input = "1234567890";
    expect(sanitizeText(input, 5)).toBe("12345");
  });
});

describe("escapeHtml", () => {
  it("escapes special HTML characters", () => {
    const input = `<script>alert("hello & welcome's");</script>`;
    expect(escapeHtml(input)).toBe("&lt;script&gt;alert(&quot;hello &amp; welcome&#39;s&quot;);&lt;/script&gt;");
  });
});

describe("redactSecrets", () => {
  it("redacts bearer tokens", () => {
    const input = "Authorization: Bearer mySecretToken123";
    expect(redactSecrets(input)).toBe("Authorization: [redacted-bearer]");
  });

  it("redacts standard sk/pk api keys", () => {
    const input = "const key = 'sk-5123456789';";
    expect(redactSecrets(input)).toBe("const key = '[redacted-key]';");
  });

  it("redacts jwt tokens", () => {
    const input = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    expect(redactSecrets(input)).toContain("[redacted-jwt]");
  });
});

describe("clampQuantity", () => {
  it("handles standard clamp logic", () => {
    expect(clampQuantity(150, 100)).toBe(100);
    expect(clampQuantity(-10)).toBe(0);
    expect(clampQuantity(NaN)).toBe(0);
    expect(clampQuantity(Infinity)).toBe(0);
    expect(clampQuantity(50)).toBe(50);
  });
});
