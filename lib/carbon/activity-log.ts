import { z } from "zod";
import type { CarbonCategory } from "@/lib/carbon/types";

export const ACTIVITY_LOG_SCHEMA_VERSION = 1;
export const ACTIVITY_LOG_STORAGE_KEY = "carbon-compass:activities:v1";

type ActivityLogStorage =
  | Pick<Storage, "getItem" | "setItem" | "removeItem">
  | undefined;

export type ActivityLogEntry = {
  id: string;
  recordedAt: string;
  category: CarbonCategory;
  activityType: string;
  value: number;
  kgCO2e: number;
};

export const activityLogEntrySchema = z
  .object({
    id: z.string().min(1),
    recordedAt: z.string().datetime(),
    category: z.enum(["transport", "energy", "food", "shopping", "waste"]),
    activityType: z.string().min(1),
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
    (left, right) =>
      new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime(),
  );
}

export function makeActivityId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `activity-${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e9,
  ).toString(36)}`;
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
  storage = safeStorage(),
): void {
  if (!storage) {
    return;
  }

  const safeEntries = z.array(activityLogEntrySchema).safeParse(entries);
  if (!safeEntries.success) {
    return;
  }

  storage.setItem(
    ACTIVITY_LOG_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: ACTIVITY_LOG_SCHEMA_VERSION,
      entries: sortEntries(safeEntries.data),
    }),
  );
}

export function addActivityLogEntry(
  entry: ActivityLogEntry,
  storage = safeStorage(),
): ActivityLogEntry[] {
  const entries = sortEntries([...loadActivityLog(storage), entry]);
  saveActivityLog(entries, storage);
  return entries;
}

export function updateActivityLogEntry(
  id: string,
  nextEntry: ActivityLogEntry,
  storage = safeStorage(),
): ActivityLogEntry[] {
  const entries = loadActivityLog(storage).map((entry) =>
    entry.id === id ? nextEntry : entry,
  );
  saveActivityLog(entries, storage);
  return loadActivityLog(storage);
}

export function deleteActivityLogEntry(
  id: string,
  storage = safeStorage(),
): ActivityLogEntry[] {
  const entries = loadActivityLog(storage).filter((entry) => entry.id !== id);
  saveActivityLog(entries, storage);
  return entries;
}

export function clearActivityLog(storage = safeStorage()): void {
  storage?.removeItem(ACTIVITY_LOG_STORAGE_KEY);
}
