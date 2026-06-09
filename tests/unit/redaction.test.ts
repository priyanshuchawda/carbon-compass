import { describe, expect, it } from "vitest";
import {
  redactSensitiveString,
  redactObjectValue,
  redactError,
} from "../../lib/carbon/redaction";

describe("Security redaction utilities", () => {
  describe("redactSensitiveString", () => {
    it("scrubs Google API keys", () => {
      const input = "Failed to call endpoint with Google key AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6";
      const result = redactSensitiveString(input);
      expect(result).not.toContain("AIzaSy");
      expect(result).toContain("[REDACTED_GOOGLE_API_KEY]");
    });

    it("scrubs Bearer Authorization tokens", () => {
      const input = "Authorization: Bearer mySecretToken123456789abcde";
      const result = redactSensitiveString(input);
      expect(result).not.toContain("mySecretToken");
      expect(result).toContain("Bearer [REDACTED]");
    });

    it("scrubs query parameter keys in URLs", () => {
      const input = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyTestKey";
      const result = redactSensitiveString(input);
      expect(result).not.toContain("AIzaSyTestKey");
      expect(result).toContain("?key=[REDACTED]");
    });
  });

  describe("redactObjectValue", () => {
    it("scrubs nested sensitive key fields", () => {
      const rawPayload = {
        name: "Test User",
        secret: "superSecretPassword",
        nested: {
          apiKey: "my-key-value",
          token: "session-1234"
        }
      };
      const redacted = redactObjectValue(rawPayload) as typeof rawPayload;
      expect(redacted.secret).toBe("[REDACTED]");
      expect(redacted.nested.apiKey).toBe("[REDACTED]");
      expect(redacted.nested.token).toBe("[REDACTED]");
      expect(redacted.name).toBe("Test User");
    });
  });

  describe("redactError", () => {
    it("transforms Error exceptions with redacted messages", () => {
      const err = new Error("Connection failed for Google key AIzaSyKey123_4567890_abcdefghij");
      const safe = redactError(err);
      expect(safe.name).toBe("Error");
      expect(safe.message).toContain("[REDACTED_GOOGLE_API_KEY]");
      expect(safe.message).not.toContain("AIzaSyKey123_4567890_abcdefghij");
    });
  });
});
