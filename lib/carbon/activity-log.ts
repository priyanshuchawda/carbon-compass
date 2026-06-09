import { z } from "zod";
import type { CarbonCategory } from "@/lib/carbon/types";
import type { ActivityTypeId } from "@/lib/carbon/activity-types";
import { ACTIVITY_TYPES } from "@/lib/carbon/activity-types";
import { makeClientId } from "@/lib/carbon/ids";

export const ACTIVITY_LOG_SCHEMA_VERSION = 1;
export const ACTIVITY_LOG_STORAGE_KEY = "carbon-compass:activities:v1";

type ActivityLogStorage = Pick<Storage, "getItem" | "setItem" | "removeItem"> | undefined;

export type ActivityLogEntry = {
  id: string;
  recordedAt: string;
  category: CarbonCategory;
  activityType: ActivityTypeId;
  value: number;
  kgCO2e: number;
};

export const activityLogEntrySchema = z
  .object({
    id: z.string().min(1),
    recordedAt: z.string().datetime(),
    category: z.enum(["transport", "energy", "food", "shopping", "waste"]),
    activityType: z.custom<ActivityTypeId>(
      (val) => typeof val === "string" && ACTIVITY_TYPES.some((a) => a.id === val),
      "Invalid activity type ID"
    ),
    value: z.number().finite().nonnegative(),
    kgCO2e: z.number().finite(),
  })
  .strict();

const activityLogPayloadSchema = z
  .object({
    schemaVersion: z.literal(ACTIVITY_LOG_SCHEMA_VERSION),
    entries: z.array(activityLogEntrySchema),
  })
  .strict();

function safeStorage(): ActivityLogStorage {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.localStorage;
}

function sortEntries(entries: ActivityLogEntry[]): ActivityLogEntry[] {
  return [...entries].sort(
    (left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime()
  );
}

export function makeActivityId(): string {
  return makeClientId("activity");
}

export function loadActivityLog(storage = safeStorage()): ActivityLogEntry[] {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = activityLogPayloadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? sortEntries(parsed.data.entries) : [];
  } catch {
    return [];
  }
}

export function saveActivityLog(
  entries: ActivityLogEntry[],
  storage = safeStorage()
): { ok: boolean; reason?: string } {
  if (!storage) {
    return { ok: false, reason: "Storage not available" };
  }

  const safeEntries = z.array(activityLogEntrySchema).safeParse(entries);
  if (!safeEntries.success) {
    return { ok: false, reason: "Validation failed: " + safeEntries.error.message };
  }

  try {
    storage.setItem(
      ACTIVITY_LOG_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: ACTIVITY_LOG_SCHEMA_VERSION,
        entries: sortEntries(safeEntries.data),
      })
    );
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Write failed";
    return { ok: false, reason: msg };
  }
}

export type ActivityLogMutationResult = {
  ok: boolean;
  reason?: string;
  entries: ActivityLogEntry[];
};

export function addActivityLogEntry(
  entry: ActivityLogEntry,
  storage = safeStorage()
): ActivityLogMutationResult {
  const entries = sortEntries([...loadActivityLog(storage), entry]);
  const saveResult = saveActivityLog(entries, storage);
  return { ...saveResult, entries };
}

export function updateActivityLogEntry(
  id: string,
  nextEntry: ActivityLogEntry,
  storage = safeStorage()
): ActivityLogMutationResult {
  // Map in-memory and return the mapped array directly — avoids a second
  // localStorage read after saving.
  const entries = loadActivityLog(storage).map((existing) =>
    existing.id === id ? nextEntry : existing
  );
  const saveResult = saveActivityLog(entries, storage);
  return { ...saveResult, entries };
}

export function deleteActivityLogEntry(id: string, storage = safeStorage()): ActivityLogEntry[] {
  const entries = loadActivityLog(storage).filter((entry) => entry.id !== id);
  saveActivityLog(entries, storage);
  return entries;
}

export function clearActivityLog(storage = safeStorage()): void {
  storage?.removeItem(ACTIVITY_LOG_STORAGE_KEY);
}
