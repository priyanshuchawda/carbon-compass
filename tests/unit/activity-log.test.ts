import { describe, expect, it } from "vitest";
import {
  ACTIVITY_LOG_STORAGE_KEY,
  ACTIVITY_LOG_SCHEMA_VERSION,
  addActivityLogEntry,
  clearActivityLog,
  deleteActivityLogEntry,
  loadActivityLog,
  makeActivityId,
  saveActivityLog,
  updateActivityLogEntry,
} from "@/lib/carbon/activity-log";
import { getActivityType, getActivityTypesForCategory } from "@/lib/carbon/activity-types";
import type { ActivityLogEntry } from "@/lib/carbon/activity-log";

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

const makeEntry = (
  id: string,
  recordedAt: string,
  value = 10,
): ActivityLogEntry => ({
  id,
  recordedAt,
  category: "transport",
  activityType: "car",
  value,
  kgCO2e: value * 0.18,
});

describe("activity type metadata", () => {
  it("returns activity options for a category in stable order", () => {
    expect(getActivityTypesForCategory("transport").map((item) => item.id)).toEqual([
      "two_wheeler",
      "car",
      "public_transport",
      "cab_auto",
      "flight",
    ]);
  });

  it("looks up an activity type by category and id", () => {
    expect(getActivityType("energy", "electricity")).toMatchObject({
      id: "electricity",
      label: "Grid electricity",
      unit: "kWh",
    });
    expect(getActivityType("energy", "unknown")).toBeNull();
  });
});

describe("activity log storage", () => {
  it("returns an empty list when storage is unavailable or empty", () => {
    expect(loadActivityLog(undefined)).toEqual([]);
    expect(loadActivityLog(mockStorage())).toEqual([]);
  });

  it("returns an empty list for corrupted JSON or mismatched schema", () => {
    const storage = mockStorage();
    storage.setItem(ACTIVITY_LOG_STORAGE_KEY, "{bad-json");
    expect(loadActivityLog(storage)).toEqual([]);

    storage.setItem(
      ACTIVITY_LOG_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, entries: [] }),
    );
    expect(loadActivityLog(storage)).toEqual([]);
  });

  it("saves and loads valid entries sorted newest first", () => {
    const storage = mockStorage();
    const older = makeEntry("older", "2026-06-01T00:00:00.000Z", 5);
    const newer = makeEntry("newer", "2026-06-03T00:00:00.000Z", 8);

    saveActivityLog([older, newer], storage);

    expect(loadActivityLog(storage).map((entry) => entry.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("skips saving invalid entries", () => {
    const storage = mockStorage();
    // @ts-expect-error intentionally invalid test payload
    saveActivityLog([{ id: "", value: -1 }], storage);
    expect(storage.getItem(ACTIVITY_LOG_STORAGE_KEY)).toBeNull();
  });

  it("adds, updates, deletes, and clears entries", () => {
    const storage = mockStorage();
    const entry = makeEntry("entry-1", "2026-06-01T00:00:00.000Z", 5);

    expect(addActivityLogEntry(entry, storage)).toHaveLength(1);

    const updated = updateActivityLogEntry(
      "entry-1",
      { ...entry, value: 12, kgCO2e: 2.16 },
      storage,
    );
    expect(updated[0]).toMatchObject({ value: 12, kgCO2e: 2.16 });

    expect(deleteActivityLogEntry("entry-1", storage)).toEqual([]);

    addActivityLogEntry(entry, storage);
    clearActivityLog(storage);
    expect(loadActivityLog(storage)).toEqual([]);
  });

  it("creates usable activity ids", () => {
    const id = makeActivityId();
    expect(id).toMatch(/^(activity-|[0-9a-f-]{36})/i);
  });

  it("persists the current schema version", () => {
    const storage = mockStorage();
    saveActivityLog([makeEntry("entry-1", "2026-06-01T00:00:00.000Z")], storage);

    const raw = storage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "{}").schemaVersion).toBe(ACTIVITY_LOG_SCHEMA_VERSION);
  });
});
