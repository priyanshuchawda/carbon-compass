import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi, beforeAll } from "vitest";

// Mock server-only module for JSDOM test environment
vi.mock("server-only", () => ({}));

// Mock global fetch for JSDOM environment where base URI is missing
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi
    .fn()
    .mockImplementation((url: string | URL | Request, options?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
      if (urlStr.includes("/api/assistant/narrate")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              narrative: "Mocked AI Narrative context.",
              weeklyChallenge: "Mocked weekly challenge description.",
              goalTip: "Mocked goal tip.",
              costUSD: 0.0001,
              isDemo: false,
            }),
        } as Response);
      }
      if (originalFetch) {
        return originalFetch(url, options);
      }
      return Promise.reject(new Error(`Unhandled fetch call to ${urlStr}`));
    }) as unknown as typeof global.fetch;
});

afterEach(() => {
  cleanup();
});
