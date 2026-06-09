"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { loadProgressHistory, saveProgressHistory } from "@/lib/carbon/progress";
import type { ProgressEntry } from "@/lib/carbon/progress";
import type { CarbonCategory } from "@/lib/carbon/types";

export default function LogPage() {
  const [history, setHistory] = useState<ProgressEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [kgValue, setKgValue] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [category, setCategory] = useState<CarbonCategory>("transport");
  const [dateValue, setDateValue] = useState(() => {
    return new Date().toISOString().split("T")[0] || "";
  });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setHistory(loadProgressHistory());
  }, []);

  function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    const kg = Number(kgValue);
    const score = Number(scoreValue);

    if (kgValue.trim() === "" || Number.isNaN(kg) || kg < 0) {
      setFeedback("Please enter a valid non-negative footprint in kg CO2e.");
      return;
    }
    if (scoreValue.trim() === "" || Number.isNaN(score) || score < 0 || score > 100) {
      setFeedback("Please enter a valid eco-score between 0 and 100.");
      return;
    }

    const recordedAt = new Date(dateValue).toISOString();
    const newEntry: ProgressEntry = {
      id: `manual-${Date.now()}`,
      recordedAt,
      monthlyTotalKgCO2e: kg,
      ecoScore: score,
      topCategory: category,
    };

    const updated = [...history, newEntry].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    saveProgressHistory(updated);
    setHistory(updated);
    setFeedback("Entry added successfully!");

    // Reset inputs
    setKgValue("");
    setScoreValue("");
    setShowForm(false);
  }

  function handleDeleteEntry(id: string) {
    const updated = history.filter((entry) => entry.id !== id);
    saveProgressHistory(updated);
    setHistory(updated);
    setFeedback("Entry deleted.");
  }

  function handleClearAll() {
    if (confirm("Are you sure you want to clear your entire progress log? This cannot be undone.")) {
      saveProgressHistory([]);
      setHistory([]);
      setFeedback("History cleared.");
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
              Track and manage your carbon footprint check-ins over time.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setFeedback("");
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              {showForm ? "Cancel" : "Log New Entry"}
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
            onSubmit={handleAddEntry}
            className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end"
          >
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
              <label htmlFor="log-kg" className="block text-xs font-semibold text-slate-700">
                Footprint (kg CO2e)
              </label>
              <input
                id="log-kg"
                type="number"
                min="0"
                step="1"
                required
                placeholder="e.g. 250"
                value={kgValue}
                onChange={(e) => setKgValue(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="log-score" className="block text-xs font-semibold text-slate-700">
                Eco Score (0-100)
              </label>
              <input
                id="log-score"
                type="number"
                min="0"
                max="100"
                step="1"
                required
                placeholder="e.g. 70"
                value={scoreValue}
                onChange={(e) => setScoreValue(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="log-category" className="block text-xs font-semibold text-slate-700">
                Top Category
              </label>
              <select
                id="log-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CarbonCategory)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="transport">Transport</option>
                <option value="energy">Home Energy</option>
                <option value="food">Food</option>
                <option value="shopping">Shopping</option>
                <option value="waste">Waste</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-2">
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Submit Entry
              </button>
            </div>
          </form>
        )}

        {/* History Table */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-600">No activities logged yet.</p>
              <p className="mt-2 text-xs text-slate-500">
                Complete a calculator session and save it, or click &quot;Log New Entry&quot; to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-700">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Footprint</th>
                    <th className="px-6 py-4 text-right">Eco Score</th>
                    <th className="px-6 py-4">Top Driver</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {history.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition">
                      <td className="whitespace-nowrap px-6 py-4">
                        {new Date(entry.recordedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium font-mono">
                        {Math.round(entry.monthlyTotalKgCO2e)} kg CO2e
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          entry.ecoScore >= 70
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {entry.ecoScore}/100
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 capitalize">
                        {entry.topCategory === "energy" ? "Home Energy" : entry.topCategory}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
