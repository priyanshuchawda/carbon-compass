import { beforeEach, describe, expect, it } from "vitest";
import {
  PROGRESS_SCHEMA_VERSION,
  PROGRESS_STORAGE_KEY,
  appendProgressEntry,
  bestMonthlyImprovement,
  loadProgressHistory,
  progressHistoryTextSummary,
  saveProgressHistory,
  loadMonthlyGoal,
  saveMonthlyGoal,
} from "@/lib/carbon/progress";
import type { ProgressEntry } from "@/lib/carbon/progress";

const makeEntry = (
  id: string,
  monthlyTotalKgCO2e: number,
  ecoScore: number,
  daysAgo = 0
): ProgressEntry => ({
  id,
  recordedAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  monthlyTotalKgCO2e,
  ecoScore,
  topCategory: "transport",
});

const mockStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
};

describe("progress storage – edge cases", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns empty array when no storage is available (SSR)", () => {
    // pass undefined explicitly to simulate server-side
    expect(loadProgressHistory(undefined)).toEqual([]);
  });

  it("returns empty array when key is missing from storage", () => {
    const storage = mockStorage();
    expect(loadProgressHistory(storage)).toEqual([]);
  });

  it("returns empty array when storage value is corrupted JSON", () => {
    const storage = mockStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, "{not valid json{{");
    expect(loadProgressHistory(storage)).toEqual([]);
  });

  it("returns empty array when schema version mismatches", () => {
    const storage = mockStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ schemaVersion: 99, entries: [] }));
    expect(loadProgressHistory(storage)).toEqual([]);
  });

  it("returns empty array when entries array has an invalid entry", () => {
    const storage = mockStorage();
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: PROGRESS_SCHEMA_VERSION,
        entries: [
          {
            id: "",
            recordedAt: "not-a-date",
            monthlyTotalKgCO2e: -1,
            ecoScore: 999,
            topCategory: "bad",
          },
        ],
      })
    );
    expect(loadProgressHistory(storage)).toEqual([]);
  });

  it("silently skips save when entries fail validation", () => {
    const storage = mockStorage();
    // @ts-expect-error intentionally invalid data
    saveProgressHistory([{ id: "" }], storage);
    expect(storage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
  });

  it("silently skips save when no storage is available", () => {
    // Should not throw
    expect(() => saveProgressHistory([makeEntry("e1", 200, 50)], undefined)).not.toThrow();
  });

  it("sorts entries chronologically when loading", () => {
    const storage = mockStorage();
    const newer = makeEntry("e2", 180, 55, 0);
    const older = makeEntry("e1", 220, 40, 10);
    saveProgressHistory([newer, older], storage);

    const history = loadProgressHistory(storage);
    expect(history[0]?.id).toBe("e1");
    expect(history[1]?.id).toBe("e2");
  });

  it("caps history at 12 entries via appendProgressEntry", () => {
    const storage = mockStorage();
    const existing = Array.from({ length: 12 }, (_, i) =>
      makeEntry(`e${i}`, 200 - i, 40 + i, 12 - i)
    );
    saveProgressHistory(existing, storage);
    appendProgressEntry(makeEntry("e13", 150, 65, 0), storage);

    const history = loadProgressHistory(storage);
    expect(history).toHaveLength(12);
    expect(history[history.length - 1]?.id).toBe("e13");
  });
});

describe("progressHistoryTextSummary – edge cases", () => {
  it("returns guidance when fewer than 2 entries", () => {
    expect(progressHistoryTextSummary([])).toMatch(/at least two/i);
    expect(progressHistoryTextSummary([makeEntry("e1", 200, 50)])).toMatch(/at least two/i);
  });

  it("reports an increase when footprint went up", () => {
    const summary = progressHistoryTextSummary([
      makeEntry("e1", 200, 50, 30),
      makeEntry("e2", 240, 42, 0),
    ]);
    expect(summary).toMatch(/increased by 40 kg CO2e/i);
    expect(summary).toMatch(/eco score decreased by 8/i);
  });

  it("reports a reduction when footprint went down", () => {
    const summary = progressHistoryTextSummary([
      makeEntry("e1", 240, 42, 30),
      makeEntry("e2", 200, 55, 0),
    ]);
    expect(summary).toMatch(/reduced by 40 kg CO2e/i);
    expect(summary).toMatch(/eco score improved by 13/i);
  });
});

describe("bestMonthlyImprovement", () => {
  it("returns 0 for a single entry", () => {
    expect(bestMonthlyImprovement([makeEntry("e1", 200, 50)])).toBe(0);
  });

  it("returns 0 when footprint worsened every month", () => {
    expect(
      bestMonthlyImprovement([
        makeEntry("e1", 100, 70, 20),
        makeEntry("e2", 150, 60, 10),
        makeEntry("e3", 200, 50, 0),
      ])
    ).toBe(0);
  });

  it("finds the best single-month reduction across multiple periods", () => {
    const best = bestMonthlyImprovement([
      makeEntry("e1", 300, 30, 60),
      makeEntry("e2", 250, 40, 30), // saved 50
      makeEntry("e3", 230, 43, 0), // saved 20
    ]);
    expect(best).toBe(50);
  });
});

describe("monthly goal storage", () => {
  it("returns null when no goal is saved", () => {
    const storage = mockStorage();
    expect(loadMonthlyGoal(storage)).toBeNull();
  });

  it("saves and loads a valid goal", () => {
    const storage = mockStorage();
    saveMonthlyGoal(180, storage);
    expect(loadMonthlyGoal(storage)).toBe(180);
  });

  it("removes the goal when saving null or invalid value", () => {
    const storage = mockStorage();
    saveMonthlyGoal(180, storage);
    expect(loadMonthlyGoal(storage)).toBe(180);
    saveMonthlyGoal(null, storage);
    expect(loadMonthlyGoal(storage)).toBeNull();
  });
});
