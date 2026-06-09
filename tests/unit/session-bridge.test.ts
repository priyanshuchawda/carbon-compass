/**
 * Tests for the sessionStorage bridge (lib/carbon/session.ts).
 *
 * Verifies that:
 * - saveSessionFootprint / loadSessionFootprint round-trip correctly
 * - saveSessionProfile / loadSessionProfile round-trip correctly
 * - loadSessionPayload returns null when either half is missing
 * - Tampered / corrupt JSON returns null (Zod re-parse)
 * - clearSessionData removes both keys
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearSessionData,
  loadSessionFootprint,
  loadSessionPayload,
  loadSessionProfile,
  saveSessionFootprint,
  saveSessionProfile,
} from "@/lib/carbon/session";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

// ── fixtures ──────────────────────────────────────────────────────────────────

const validProfile: UserProfile = {
  id: "test-user",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

const validFootprint: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 80,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 4,
    cabAutoTripsPerWeek: 2,
    flightsPerYear: 1,
  },
  energy: {
    monthlyElectricityKWh: 100,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 2,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed",
    meatMealsPerWeek: 2,
    dairyFrequency: "medium",
    foodDeliveryPerWeek: 3,
    foodWasteLevel: "medium",
  },
  shopping: {
    clothesPerMonth: 2,
    onlineOrdersPerMonth: 5,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "medium",
  },
};

// ── setup: inject in-memory sessionStorage into globalThis ───────────────────

function makeMemoryStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

let memStorage: Storage;

beforeEach(() => {
  memStorage = makeMemoryStorage();
  // Patch globalThis.window so safeSessionStorage() returns our mock.
  (globalThis as unknown as { window: { sessionStorage: Storage } }).window = {
    sessionStorage: memStorage,
  };
});

afterEach(() => {
  // Remove the patched window.
  (globalThis as unknown as { window?: unknown }).window = undefined;
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe("session bridge — footprint", () => {
  it("saves and loads a valid FootprintInput round-trip", () => {
    saveSessionFootprint(validFootprint);
    const loaded = loadSessionFootprint();
    expect(loaded).toEqual(validFootprint);
  });

  it("returns null when nothing is stored", () => {
    expect(loadSessionFootprint()).toBeNull();
  });

  it("returns null when stored JSON is corrupt", () => {
    memStorage.setItem("carbon-compass.session.footprint", "not-json{{{");
    expect(loadSessionFootprint()).toBeNull();
  });

  it("returns null when stored JSON fails Zod validation (negative km)", () => {
    const bad = {
      ...validFootprint,
      transport: { ...validFootprint.transport, twoWheelerKmPerWeek: -1 },
    };
    memStorage.setItem("carbon-compass.session.footprint", JSON.stringify(bad));
    expect(loadSessionFootprint()).toBeNull();
  });
});

describe("session bridge — profile", () => {
  it("saves and loads a valid UserProfile round-trip", () => {
    saveSessionProfile(validProfile);
    const loaded = loadSessionProfile();
    expect(loaded).toEqual(validProfile);
  });

  it("returns null when nothing is stored", () => {
    expect(loadSessionProfile()).toBeNull();
  });

  it("returns null when stored profile has invalid persona", () => {
    const bad = { ...validProfile, persona: "invalid-persona" };
    memStorage.setItem("carbon-compass.session.profile", JSON.stringify(bad));
    expect(loadSessionProfile()).toBeNull();
  });
});

describe("session bridge — combined payload", () => {
  it("returns full payload when both footprint and profile exist", () => {
    saveSessionFootprint(validFootprint);
    saveSessionProfile(validProfile);
    const payload = loadSessionPayload();
    expect(payload).not.toBeNull();
    expect(payload?.footprint).toEqual(validFootprint);
    expect(payload?.profile).toEqual(validProfile);
  });

  it("returns null when only profile is stored", () => {
    saveSessionProfile(validProfile);
    expect(loadSessionPayload()).toBeNull();
  });

  it("returns null when only footprint is stored", () => {
    saveSessionFootprint(validFootprint);
    expect(loadSessionPayload()).toBeNull();
  });
});

describe("session bridge — clearSessionData", () => {
  it("removes both keys after saving both", () => {
    saveSessionFootprint(validFootprint);
    saveSessionProfile(validProfile);
    clearSessionData();
    expect(loadSessionFootprint()).toBeNull();
    expect(loadSessionProfile()).toBeNull();
  });
});
