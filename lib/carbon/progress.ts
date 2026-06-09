import { z } from "zod";
import type { CarbonCategory } from "@/lib/carbon/types";
import { round } from "@/lib/carbon/utils";

export const PROGRESS_SCHEMA_VERSION = 1;
export const PROGRESS_STORAGE_KEY = "carbon-compass:progress:v1";

export type ProgressEntry = {
  id: string;
  recordedAt: string;
  monthlyTotalKgCO2e: number;
  ecoScore: number;
  topCategory: CarbonCategory;
};

type ProgressStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const progressEntrySchema = z.object({
  id: z.string().min(1),
  recordedAt: z.string().datetime(),
  monthlyTotalKgCO2e: z.number().finite().nonnegative(),
  ecoScore: z.number().finite().min(0).max(100),
  topCategory: z.enum(["transport", "energy", "food", "shopping", "waste"]),
});

const progressPayloadSchema = z.object({
  schemaVersion: z.literal(PROGRESS_SCHEMA_VERSION),
  entries: z.array(progressEntrySchema),
});

function safeStorage(): ProgressStorage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

function sortHistory(entries: ProgressEntry[]): ProgressEntry[] {
  return [...entries].sort(
    (left, right) =>
      new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime(),
  );
}



export function loadProgressHistory(
  storage = safeStorage(),
): ProgressEntry[] {
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = progressPayloadSchema.safeParse(JSON.parse(raw));

    return parsed.success ? sortHistory(parsed.data.entries) : [];
  } catch {
    return [];
  }
}

export function saveProgressHistory(
  entries: ProgressEntry[],
  storage = safeStorage(),
): void {
  if (!storage) {
    return;
  }

  const safeEntries = z.array(progressEntrySchema).safeParse(entries);

  if (!safeEntries.success) {
    return;
  }

  storage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: PROGRESS_SCHEMA_VERSION,
      entries: sortHistory(safeEntries.data),
    }),
  );
}

export function appendProgressEntry(
  entry: ProgressEntry,
  storage = safeStorage(),
): ProgressEntry[] {
  const history = [...loadProgressHistory(storage), entry];
  const latest = sortHistory(history).slice(-12);

  saveProgressHistory(latest, storage);

  return latest;
}

export function progressHistoryTextSummary(entries: ProgressEntry[]): string {
  const history = sortHistory(entries);

  if (history.length < 2) {
    return "Add at least two progress entries to compare change over time.";
  }

  const first = history[0];
  const last = history[history.length - 1];

  if (!first || !last) {
    return "Progress history is unavailable.";
  }

  const reduction = round(first.monthlyTotalKgCO2e - last.monthlyTotalKgCO2e, 0);
  const scoreImprovement = round(last.ecoScore - first.ecoScore, 0);
  const footprintPhrase =
    reduction >= 0
      ? `reduced by ${reduction} kg CO2e`
      : `increased by ${Math.abs(reduction)} kg CO2e`;
  const scorePhrase =
    scoreImprovement >= 0
      ? `eco score improved by ${scoreImprovement}`
      : `eco score decreased by ${Math.abs(scoreImprovement)}`;

  return `Monthly footprint ${footprintPhrase}; ${scorePhrase}.`;
}

export function bestMonthlyImprovement(entries: ProgressEntry[]): number {
  const history = sortHistory(entries);
  let best = 0;

  for (let index = 1; index < history.length; index += 1) {
    const previous = history[index - 1];
    const current = history[index];

    if (previous && current) {
      best = Math.max(
        best,
        previous.monthlyTotalKgCO2e - current.monthlyTotalKgCO2e,
      );
    }
  }

  return round(best, 0);
}

export const GOAL_STORAGE_KEY = "carbon-compass:goal:v1";

export function loadMonthlyGoal(storage = safeStorage()): number | null {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(GOAL_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMonthlyGoal(target: number | null, storage = safeStorage()): void {
  if (!storage) {
    return;
  }
  try {
    if (target === null || !Number.isFinite(target)) {
      storage.removeItem(GOAL_STORAGE_KEY);
    } else {
      storage.setItem(GOAL_STORAGE_KEY, String(target));
    }
  } catch {
    // ignore
  }
}
