"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { loadMonthlyGoal, saveMonthlyGoal } from "@/lib/carbon/progress";

type GoalSetterProps = {
  currentMonthlyKg: number;
  isDemo?: boolean;
};

export function GoalSetter({ currentMonthlyKg, isDemo = false }: GoalSetterProps) {
  const [goal, setGoal] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGoal = loadMonthlyGoal();
      setGoal(savedGoal);
      if (savedGoal !== null) {
        setInputValue(String(savedGoal));
      }
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isDemo) {
      setFeedback("Complete the calculator first to set a goal for your real data.");
      return;
    }
    const parsed = Number(inputValue);
    if (inputValue.trim() === "") {
      saveMonthlyGoal(null);
      setGoal(null);
      setFeedback("Goal cleared successfully.");
      return;
    }
    if (Number.isNaN(parsed) || parsed < 0) {
      setFeedback("Please enter a valid target footprint.");
      return;
    }
    saveMonthlyGoal(parsed);
    setGoal(parsed);
    setFeedback("Goal saved successfully!");
  }

  // Calculate progress percentage
  const progressPercent = goal && goal > 0 
    ? Math.min(Math.round((currentMonthlyKg / goal) * 100), 100)
    : 0;

  const isGoalMet = goal !== null && currentMonthlyKg <= goal;

  return (
    <section 
      aria-label="Monthly footprint target goal tracker"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-950">Monthly carbon goal</h3>
      <p className="mt-1 text-sm text-slate-600">
        Set a target monthly footprint in kg CO2e to monitor your reduction progress.
      </p>

      <form onSubmit={handleSave} className="mt-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="goal-input" className="block text-xs font-medium text-slate-700">
            Target (kg CO2e / month)
          </label>
          <input
            id="goal-input"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 150"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setFeedback("");
            }}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[38px] items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
        >
          Save
        </button>
        {goal !== null && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              saveMonthlyGoal(null);
              setGoal(null);
              setFeedback("Goal cleared.");
            }}
            className="inline-flex min-h-[38px] items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </form>

      {feedback && (
        <p className="mt-2 text-xs font-medium text-emerald-800" role="alert">
          {feedback}
        </p>
      )}

      {goal !== null && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">
              Current: <strong className="text-slate-950 font-semibold">{Math.round(currentMonthlyKg)} kg</strong>
            </span>
            <span className="text-slate-600">
              Target: <strong className="text-emerald-800 font-semibold">{goal} kg</strong>
            </span>
          </div>

          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalMet ? "bg-emerald-600" : "bg-amber-500"
              }`}
              style={{ width: `${goal > 0 ? Math.min((currentMonthlyKg / goal) * 100, 100) : 0}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {goal > 0 ? `${progressPercent}% of target reached` : ""}
            </span>
            {isGoalMet ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                Goal Met
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/10">
                Above Target
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
