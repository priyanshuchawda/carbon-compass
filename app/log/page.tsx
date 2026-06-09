"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { loadActivityLog, saveActivityLog } from "@/lib/carbon/progress";
import type { ActivityLogEntry } from "@/lib/carbon/progress";
import type { CarbonCategory } from "@/lib/carbon/types";
import { calculateActivityEmissions } from "@/lib/carbon/calculate";

const CATEGORY_META: Record<CarbonCategory, { emoji: string; badgeClass: string; label: string }> = {
  transport: { emoji: "🚗", badgeClass: "bg-emerald-50 text-emerald-800 border border-emerald-200", label: "Transport" },
  energy: { emoji: "⚡", badgeClass: "bg-teal-50 text-teal-800 border border-teal-200", label: "Home Energy" },
  food: { emoji: "🍲", badgeClass: "bg-blue-50 text-blue-800 border border-blue-200", label: "Food" },
  shopping: { emoji: "🛍️", badgeClass: "bg-purple-50 text-purple-800 border border-purple-200", label: "Shopping" },
  waste: { emoji: "♻️", badgeClass: "bg-slate-50 text-slate-800 border border-slate-200", label: "Waste" },
};

const ACTIVITY_TYPES: Record<CarbonCategory, { value: string; label: string; unit: string }[]> = {
  transport: [
    { value: "two_wheeler", label: "Two-wheeler travel", unit: "km" },
    { value: "car", label: "Car travel", unit: "km" },
    { value: "public_transport", label: "Public transport", unit: "trips" },
    { value: "cab_auto", label: "Cab or auto ride", unit: "trips" },
    { value: "flight", label: "Domestic flight", unit: "flights" },
  ],
  energy: [
    { value: "electricity", label: "Grid electricity", unit: "kWh" },
    { value: "lpg", label: "LPG cylinders", unit: "cylinders" },
    { value: "ac", label: "Air conditioning", unit: "hours" },
  ],
  food: [
    { value: "meat_meal", label: "Meals with meat", unit: "meals" },
    { value: "delivery", label: "Food delivery orders", unit: "orders" },
  ],
  shopping: [
    { value: "clothes", label: "Clothing items bought", unit: "items" },
    { value: "online", label: "Online orders placed", unit: "orders" },
    { value: "electronics", label: "Electronics purchased", unit: "devices" },
  ],
  waste: [
    { value: "recycling", label: "Recycled dry waste", unit: "actions" },
    { value: "composting", label: "Composted food scraps", unit: "actions" },
  ],
};

export default function LogPage() {
  const [history, setHistory] = useState<ActivityLogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [category, setCategory] = useState<CarbonCategory>("transport");
  const [activityType, setActivityType] = useState("two_wheeler");
  const [value, setValue] = useState("");
  const [dateValue, setDateValue] = useState(() => {
    return new Date().toISOString().split("T")[0] || "";
  });
  const [feedback, setFeedback] = useState("");

  // Sync activityType option when category changes
  useEffect(() => {
    const defaultType = ACTIVITY_TYPES[category][0]?.value ?? "";
    setActivityType(defaultType);
  }, [category]);

  useEffect(() => {
    setHistory(loadActivityLog());
  }, []);

  // Live emission preview
  const numVal = Number(value);
  const previewEmissions = Number.isNaN(numVal) || value.trim() === ""
    ? 0
    : calculateActivityEmissions(category, activityType, numVal);

  const currentUnit = ACTIVITY_TYPES[category].find((t) => t.value === activityType)?.unit ?? "";

  function handleAddOrUpdateEntry(e: React.FormEvent) {
    e.preventDefault();
    const parsedVal = Number(value);

    if (value.trim() === "" || Number.isNaN(parsedVal) || parsedVal < 0) {
      setFeedback("Please enter a valid non-negative quantity.");
      return;
    }

    const kgCO2e = calculateActivityEmissions(category, activityType, parsedVal);

    if (editingId) {
      // Update existing
      const updated = history.map((entry) => {
        if (entry.id === editingId) {
          return {
            ...entry,
            recordedAt: new Date(dateValue).toISOString(),
            category,
            activityType,
            value: parsedVal,
            kgCO2e,
          };
        }
        return entry;
      }).sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

      saveActivityLog(updated);
      setHistory(updated);
      setFeedback("Entry updated successfully!");
      setEditingId(null);
    } else {
      // Add new
      const recordedAt = new Date(dateValue).toISOString();
      const newEntry: ActivityLogEntry = {
        id: `activity-${Date.now()}`,
        recordedAt,
        category,
        activityType,
        value: parsedVal,
        kgCO2e,
      };

      const updated = [...history, newEntry].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );

      saveActivityLog(updated);
      setHistory(updated);
      setFeedback("Activity logged successfully!");
    }

    // Reset inputs
    setValue("");
    setShowForm(false);
  }

  function handleStartEdit(entry: ActivityLogEntry) {
    setEditingId(entry.id);
    setCategory(entry.category);
    setActivityType(entry.activityType);
    setValue(String(entry.value));
    setDateValue(new Date(entry.recordedAt).toISOString().split("T")[0] || "");
    setShowForm(true);
    setFeedback("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setValue("");
    setShowForm(false);
    setFeedback("");
  }

  function handleDeleteEntry(id: string) {
    const updated = history.filter((entry) => entry.id !== id);
    saveActivityLog(updated);
    setHistory(updated);
    setFeedback("Entry deleted.");
    if (editingId === id) {
      setEditingId(null);
      setValue("");
    }
  }

  function handleClearAll() {
    if (confirm("Are you sure you want to clear your entire activity log? This cannot be undone.")) {
      saveActivityLog([]);
      setHistory([]);
      setFeedback("History cleared.");
      setEditingId(null);
      setValue("");
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8] py-8">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Activity Tracker Log
            </h1>
            <p className="mt-1 text-sm text-slate-700">
              Track, edit, and manage your natural resource actions and emissions over time.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (editingId) {
                  handleCancelEdit();
                } else {
                  setShowForm(!showForm);
                  setFeedback("");
                }
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              {showForm ? "Cancel" : "Log New Activity"}
            </button>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800" role="alert">
            {feedback}
          </div>
        )}

        {/* Log Entry Form */}
        {showForm && (
          <form
            onSubmit={handleAddOrUpdateEntry}
            className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end"
          >
            <div className="md:col-span-2 lg:col-span-4 border-b border-slate-100 pb-2 mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                {editingId ? "✏️ Edit Activity Entry" : "➕ Log Natural Activity"}
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
                onChange={(e) => setDateValue(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="log-category" className="block text-xs font-semibold text-slate-700">
                Category
              </label>
              <select
                id="log-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CarbonCategory)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="transport">🚗 Transport</option>
                <option value="energy">⚡ Home Energy</option>
                <option value="food">🍲 Food</option>
                <option value="shopping">🛍️ Shopping</option>
                <option value="waste">♻️ Waste</option>
              </select>
            </div>
            <div>
              <label htmlFor="log-type" className="block text-xs font-semibold text-slate-700">
                Activity Type
              </label>
              <select
                id="log-type"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {ACTIVITY_TYPES[category].map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="log-value" className="block text-xs font-semibold text-slate-700">
                Quantity ({currentUnit})
              </label>
              <input
                id="log-value"
                type="number"
                min="0"
                step="any"
                required
                placeholder={`e.g. 50`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Live emission output */}
            <div className="md:col-span-2 lg:col-span-3 text-sm text-slate-700">
              Impact Preview:{" "}
              <span className={`font-mono font-bold ${previewEmissions >= 0 ? "text-amber-700" : "text-emerald-700"}`}>
                {previewEmissions >= 0 ? `+${previewEmissions.toFixed(2)}` : previewEmissions.toFixed(2)} kg CO2e
              </span>
            </div>

            <div className="md:col-span-2 lg:col-span-1 flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                {editingId ? "Save Changes" : "Submit Activity"}
              </button>
            </div>
          </form>
        )}

        {/* History Table */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-600 font-medium">No tracked activities recorded.</p>
              <p className="mt-2 text-xs text-slate-500">
                Log travel, energy billing items, composting actions or delivery counts to track footprints in real units.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Action Detail</th>
                    <th className="px-6 py-4 text-right">Quantity</th>
                    <th className="px-6 py-4 text-right">Footprint</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900 tabular-nums">
                  {history.map((entry) => {
                    const meta = CATEGORY_META[entry.category];
                    const activityLabel = ACTIVITY_TYPES[entry.category].find((t) => t.value === entry.activityType)?.label ?? entry.activityType;
                    const activityUnit = ACTIVITY_TYPES[entry.category].find((t) => t.value === entry.activityType)?.unit ?? "";
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 transition">
                        <td className="whitespace-nowrap px-6 py-4 font-mono">
                          {new Date(entry.recordedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}>
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {activityLabel}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono">
                          {entry.value} {activityUnit}
                        </td>
                        <td className={`whitespace-nowrap px-6 py-4 text-right font-semibold font-mono ${
                          entry.kgCO2e >= 0 ? "text-amber-700" : "text-emerald-700"
                        }`}>
                          {entry.kgCO2e >= 0 ? `+${entry.kgCO2e.toFixed(1)}` : entry.kgCO2e.toFixed(1)} kg
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
