"use client";

import { useState, useMemo } from "react";
import { AssistantInsight } from "@/components/carbon/assistant-insight";
import { CategoryBreakdown } from "@/components/carbon/category-breakdown";
import { MetricCard } from "@/components/carbon/metric-card";
import { RecommendationCard } from "@/components/carbon/recommendation-card";
import { WhatIfSimulator } from "@/components/carbon/what-if-simulator";
import { GoalSetter } from "@/components/carbon/goal-setter";
import { useCarbonSessionState } from "@/lib/carbon/use-carbon-session-state";
import { SIMULATION_ACTIONS, simulateAction } from "@/lib/carbon/simulator";
import { appendProgressEntry } from "@/lib/carbon/progress";
import { makeClientId } from "@/lib/carbon/ids";
import { formatKgCO2e } from "@/lib/carbon/format";

export function DashboardClient() {
  const state = useCarbonSessionState();
  const { result, recommendations, profile, isDemo, footprintInput } = state;
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  function handleSaveCheckIn() {
    const entry = {
      id: makeClientId("checkin"),
      recordedAt: new Date().toISOString(),
      monthlyTotalKgCO2e: result.monthlyTotalKgCO2e,
      ecoScore: result.ecoScore,
      topCategory: result.topCategory,
    };
    const saveResult = appendProgressEntry(entry);
    if (!saveResult.ok) {
      setCheckInError(saveResult.reason ?? "Failed to save check-in.");
      return;
    }
    setCheckInError(null);
    setCheckInSaved(true);
  }

  const topCategory = result.breakdown.find((item) => item.category === result.topCategory);
  const leadingRecommendation = recommendations[0];
  const simulations = useMemo(
    () => SIMULATION_ACTIONS.map((action) => simulateAction(footprintInput, profile, action.id)),
    [footprintInput, profile]
  );

  return (
    <>
      {/* Header badge */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
          {isDemo
            ? `Demo profile — ${profile.city} · ${profile.persona}`
            : `${profile.city} · ${profile.persona}`}
        </p>
        {!isDemo && (
          <button
            onClick={handleSaveCheckIn}
            disabled={checkInSaved}
            className={`inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition ${
              checkInSaved
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700"
            }`}
          >
            {checkInSaved
              ? "✓ Footprint saved to history"
              : "Save this check-in to progress history"}
          </button>
        )}
      </div>
      {isDemo && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Showing demo data. Complete the{" "}
          <a href="/calculator" className="font-semibold underline underline-offset-2">
            calculator
          </a>{" "}
          to see your personalised results.
        </p>
      )}
      {checkInError && (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {checkInError}
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Monthly footprint"
          value={formatKgCO2e(result.monthlyTotalKgCO2e)}
          detail={`${formatKgCO2e(result.annualTotalKgCO2e)} estimated per year.`}
        />
        <MetricCard
          label="Top source"
          value={topCategory?.label ?? "Unknown"}
          detail={`${formatKgCO2e(topCategory?.kgCO2e ?? 0)} per month from the largest category.`}
        />
        <MetricCard
          label="Potential monthly saving"
          value={formatKgCO2e(result.potentialMonthlySavingKgCO2e)}
          detail="Estimated from reducing the top category by 18%."
        />
        <MetricCard
          label="Eco score"
          value={`${result.ecoScore}/100`}
          detail="Higher scores reflect lower per-person emissions and existing habits."
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CategoryBreakdown breakdown={result.breakdown} />
        {leadingRecommendation && (
          <AssistantInsight
            result={result}
            recommendation={leadingRecommendation}
            profile={profile}
            footprint={footprintInput}
          />
        )}
      </div>

      <section aria-labelledby="dashboard-recommendations-heading" className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="dashboard-recommendations-heading"
              className="text-2xl font-semibold text-slate-950"
            >
              First recommended actions
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
              Ranked by category priority, expected saving, difficulty, and
              {profile.mainGoal === "save_money"
                ? " money-saving potential (your chosen goal)."
                : profile.mainGoal === "habit_building"
                  ? " ease of habit formation (your chosen goal)."
                  : " carbon impact."}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {recommendations.slice(0, 2).map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              index={index}
              compact
            />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <GoalSetter currentMonthlyKg={result.monthlyTotalKgCO2e} isDemo={isDemo} />
        <WhatIfSimulator simulations={simulations} />
      </div>
    </>
  );
}
