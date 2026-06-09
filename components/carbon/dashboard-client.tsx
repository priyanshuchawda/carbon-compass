"use client";

import { useState, useMemo } from "react";
import { AssistantInsight } from "@/components/carbon/assistant-insight";
import { CategoryBreakdown } from "@/components/carbon/category-breakdown";
import { MetricCard } from "@/components/carbon/metric-card";
import { RecommendationCard } from "@/components/carbon/recommendation-card";
import { WhatIfSimulator } from "@/components/carbon/what-if-simulator";
import { GoalSetter } from "@/components/carbon/goal-setter";
import { calculateFootprint } from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";
import { loadSessionPayload } from "@/lib/carbon/session";
import { SIMULATION_ACTIONS, simulateAction } from "@/lib/carbon/simulator";
import type { FootprintInput, FootprintResult, Recommendation, UserProfile } from "@/lib/carbon/types";
import {
  demoFootprintInput,
  demoFootprintResult,
  demoProfile,
  demoRecommendations,
} from "@/lib/carbon/demo";

function kg(value: number): string {
  return `${Math.round(value)} kg CO₂e`;
}

type DashboardState = {
  result: FootprintResult;
  recommendations: Recommendation[];
  profile: UserProfile;
  footprintInput: FootprintInput;
  isDemo: boolean;
};

function buildDemoState(): DashboardState {
  return {
    result: demoFootprintResult,
    recommendations: demoRecommendations,
    profile: demoProfile,
    footprintInput: demoFootprintInput,
    isDemo: true,
  };
}

export function DashboardClient() {
  const [state] = useState<DashboardState>(() => {
    const session = loadSessionPayload();
    if (!session) return buildDemoState();

    const result = calculateFootprint(session.footprint, session.profile);
    const recommendations = getRecommendations(session.footprint, result, session.profile);
    return { result, recommendations, profile: session.profile, footprintInput: session.footprint, isDemo: false };
  });

  const { result, recommendations, profile, isDemo, footprintInput } = state;

  const topCategory = result.breakdown.find(
    (item) => item.category === result.topCategory,
  );
  const leadingRecommendation = recommendations[0];
  const simulations = useMemo(
    () =>
      SIMULATION_ACTIONS.map((action) =>
        simulateAction(footprintInput, profile, action.id),
      ),
    [footprintInput, profile],
  );


  return (
    <>
      {/* ── header badge ─────────────────────────────────────────── */}
      <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
        {isDemo ? `Demo profile — ${profile.city} · ${profile.persona}` : `${profile.city} · ${profile.persona}`}
      </p>
      {isDemo && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Showing demo data. Complete the{" "}
          <a href="/calculator" className="font-semibold underline underline-offset-2">
            calculator
          </a>{" "}
          to see your personalised results.
        </p>
      )}

      {/* ── metric cards ─────────────────────────────────────────── */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Monthly footprint"
          value={kg(result.monthlyTotalKgCO2e)}
          detail={`${kg(result.annualTotalKgCO2e)} estimated per year.`}
        />
        <MetricCard
          label="Top source"
          value={topCategory?.label ?? "Unknown"}
          detail={`${kg(topCategory?.kgCO2e ?? 0)} per month from the largest category.`}
        />
        <MetricCard
          label="Potential monthly saving"
          value={kg(result.potentialMonthlySavingKgCO2e)}
          detail="Estimated from reducing the top category by 18%."
        />
        <MetricCard
          label="Eco score"
          value={`${result.ecoScore}/100`}
          detail="Higher scores reflect lower per-person emissions and existing habits."
        />
      </div>

      {/* ── chart + assistant ─────────────────────────────────────── */}
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

      {/* ── recommendation cards ──────────────────────────────────── */}
      <section
        aria-labelledby="dashboard-recommendations-heading"
        className="mt-8"
      >
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

      {/* ── goal tracker & simulator ───────────────────────────────── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <GoalSetter currentMonthlyKg={result.monthlyTotalKgCO2e} isDemo={isDemo} />
        <WhatIfSimulator simulations={simulations} />
      </div>
    </>
  );
}
