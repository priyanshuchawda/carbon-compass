"use client";

import { useMemo, useState } from "react";
import { calculateActivityEmissions } from "@/lib/carbon/calculate";
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_CATEGORY_META,
  getActivityType,
  getActivityTypesForCategory,
} from "@/lib/carbon/activity-types";
import { makeActivityId, type ActivityLogEntry } from "@/lib/carbon/activity-log";
import type { CarbonCategory } from "@/lib/carbon/types";

type ActivityFormProps = {
  initialEntry?: ActivityLogEntry | null;
  onSave: (entry: ActivityLogEntry) => void;
  onCancel?: () => void;
};

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function entryDateInputValue(entry?: ActivityLogEntry | null): string {
  if (!entry) {
    return todayInputValue();
  }

  return new Date(entry.recordedAt).toISOString().slice(0, 10);
}

function parseDateInput(value: string): Date | null {
  if (value.trim() === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ActivityForm({
  initialEntry = null,
  onSave,
  onCancel,
}: ActivityFormProps) {
  const [category, setCategory] = useState<CarbonCategory>(
    initialEntry?.category ?? "transport",
  );
  const [activityType, setActivityType] = useState(
    initialEntry?.activityType ?? "two_wheeler",
  );
  const [value, setValue] = useState(
    initialEntry ? String(initialEntry.value) : "",
  );
  const [dateValue, setDateValue] = useState(() =>
    entryDateInputValue(initialEntry),
  );
  const [feedback, setFeedback] = useState("");

  const activityOptions = useMemo(
    () => getActivityTypesForCategory(category),
    [category],
  );
  const currentActivity = getActivityType(category, activityType);
  const numericValue = Number(value);
  const previewEmissions =
    value.trim() === "" || Number.isNaN(numericValue)
      ? 0
      : calculateActivityEmissions(category, activityType, numericValue);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (value.trim() === "" || Number.isNaN(numericValue) || numericValue < 0) {
      setFeedback("Please enter a valid non-negative quantity.");
      return;
    }

    const recordedAt = parseDateInput(dateValue);
    if (!recordedAt) {
      setFeedback("Please choose a valid activity date.");
      return;
    }

    onSave({
      id: initialEntry?.id ?? makeActivityId(),
      recordedAt: recordedAt.toISOString(),
      category,
      activityType,
      value: numericValue,
      kgCO2e: previewEmissions,
    });

    if (!initialEntry) {
      setValue("");
    }
    setFeedback("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4"
      aria-label={initialEntry ? "Edit activity entry" : "Log activity entry"}
      noValidate
    >
      <div className="border-b border-slate-100 pb-2 md:col-span-2 lg:col-span-4">
        <h2 className="text-sm font-bold text-slate-900">
          {initialEntry ? "Edit Activity Entry" : "Log Natural Activity"}
        </h2>
      </div>

      <div>
        <label htmlFor="log-date" className="block text-xs font-semibold text-slate-700">
          Date
        </label>
        <input
          id="log-date"
          type="date"
          required
          value={dateValue}
          onChange={(event) => setDateValue(event.target.value)}
          className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label htmlFor="log-category" className="block text-xs font-semibold text-slate-700">
          Category
        </label>
        <select
          id="log-category"
          value={category}
          onChange={(event) => {
            const nextCategory = event.target.value as CarbonCategory;
            setCategory(nextCategory);
            setActivityType(getActivityTypesForCategory(nextCategory)[0]?.id ?? "");
            setFeedback("");
          }}
          className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {ACTIVITY_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {ACTIVITY_CATEGORY_META[item].label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="log-type" className="block text-xs font-semibold text-slate-700">
          Activity Type
        </label>
        <select
          id="log-type"
          value={activityType}
          onChange={(event) => {
            setActivityType(event.target.value);
            setFeedback("");
          }}
          className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {activityOptions.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="log-value" className="block text-xs font-semibold text-slate-700">
          Quantity ({currentActivity?.unit ?? "unit"})
        </label>
        <input
          id="log-value"
          type="number"
          min="0"
          step="any"
          required
          placeholder="e.g. 50"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setFeedback("");
          }}
          aria-describedby="activity-preview"
          className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <p
        id="activity-preview"
        className="text-sm text-slate-700 md:col-span-2 lg:col-span-3"
        aria-live="polite"
      >
        Impact Preview:{" "}
        <span
          className={`font-mono font-bold ${
            previewEmissions >= 0 ? "text-amber-700" : "text-emerald-700"
          }`}
        >
          {previewEmissions >= 0 ? "+" : ""}
          {previewEmissions.toFixed(2)} kg CO2e
        </span>
      </p>

      <div className="flex justify-end gap-2 md:col-span-2 lg:col-span-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          {initialEntry ? "Save Changes" : "Submit Activity"}
        </button>
      </div>

      {feedback && (
        <p className="text-sm font-medium text-red-700 md:col-span-2 lg:col-span-4" role="alert">
          {feedback}
        </p>
      )}
    </form>
  );
}
