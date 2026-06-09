"use client";

import { useState } from "react";
import { RecommendationCard } from "@/components/carbon/recommendation-card";
import { calculateFootprint } from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";
import { loadSessionPayload } from "@/lib/carbon/session";
import type { FootprintResult, Recommendation, UserProfile } from "@/lib/carbon/types";
import {
  demoFootprintResult,
  demoProfile,
  demoRecommendations,
} from "@/lib/carbon/demo";

type ActionsState = {
  result: FootprintResult;
  recommendations: Recommendation[];
  profile: UserProfile;
  isDemo: boolean;
};

function buildDemoState(): ActionsState {
  return {
    result: demoFootprintResult,
    recommendations: demoRecommendations,
    profile: demoProfile,
    isDemo: true,
  };
}

export function ActionsClient() {
  const [state] = useState<ActionsState>(() => {
    const session = loadSessionPayload();
    if (!session) return buildDemoState();

    const result = calculateFootprint(session.footprint, session.profile);
    const recommendations = getRecommendations(session.footprint, result, session.profile);
    return { result, recommendations, profile: session.profile, isDemo: false };
  });

  const { result, recommendations, profile, isDemo } = state;

  return (
    <>
      <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
        {isDemo
          ? `Demo — ${profile.city}`
          : `${profile.city} · ${profile.persona} · Goal: ${profile.mainGoal.replace("_", " ")}`}
      </p>

      {/* ── summary strip ─────────────────────────────────────────── */}
      <section
        aria-label="Action plan summary"
        className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600">Top source</dt>
            <dd className="mt-1 text-xl font-semibold capitalize text-slate-950">
              {result.topCategory}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Recommended actions</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-950">
              {recommendations.length}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Best first action</dt>
            <dd className="mt-1 text-xl font-semibold text-slate-950">
              {recommendations[0]?.title ?? "Review habits"}
            </dd>
          </div>
        </dl>
      </section>

      {/* ── recommendation cards ──────────────────────────────────── */}
      <section aria-label="Prioritised recommendations" className="mt-6">
        <div className="grid gap-4">
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              index={index}
            />
          ))}
        </div>
      </section>
    </>
  );
}
