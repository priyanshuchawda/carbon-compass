"use client";

import { useEffect, useState } from "react";
import { logError } from "@/lib/carbon/logger";
import { aiNarratorResponseSchema } from "@/lib/validation/schemas";
import type {
  FootprintInput,
  FootprintResult,
  Recommendation,
  UserProfile,
} from "@/lib/carbon/types";
import type { z } from "zod";

type AssistantInsightProps = {
  result: FootprintResult;
  recommendation: Recommendation;
  profile: UserProfile;
  footprint: FootprintInput;
};

const PERSONA_CONTEXT: Record<UserProfile["persona"], string> = {
  student: "For a student in India, ",
  working: "As a working professional, ",
  family: "For your household, ",
};

const GOAL_CONTEXT: Record<UserProfile["mainGoal"], string> = {
  reduce_carbon: "to reduce your carbon impact",
  save_money: "and save money",
  learn: "to understand your impact",
  habit_building: "and build a lasting habit",
};

type AINarratorResponse = z.infer<typeof aiNarratorResponseSchema>;
type NarrationState = {
  key: string;
  data: AINarratorResponse | null;
};

export function AssistantInsight({
  result,
  recommendation,
  profile,
  footprint,
}: AssistantInsightProps) {
  const requestKey = `${recommendation.id}:${result.monthlyTotalKgCO2e}:${profile.id}`;
  const [narrationState, setNarrationState] = useState<NarrationState | null>(null);
  const currentNarration =
    narrationState?.key === requestKey ? narrationState : { key: requestKey, data: null };
  const aiData = currentNarration.data;
  const loading = narrationState?.key !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/assistant/narrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        result,
        recommendations: [recommendation],
        footprint,
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const parsedData = aiNarratorResponseSchema.parse(data);
        setNarrationState({ key: requestKey, data: parsedData });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        logError("Failed to load assistant narration", err);
        setNarrationState({ key: requestKey, data: null });
      });

    return () => {
      controller.abort();
    };
  }, [profile, result, recommendation, footprint, requestKey]);

  const topCategory = result.breakdown.find((item) => item.category === result.topCategory);

  const personaPrefix = PERSONA_CONTEXT[profile.persona];
  const goalSuffix = GOAL_CONTEXT[profile.mainGoal];

  return (
    <section
      aria-label="Compass Assistant insight"
      className="rounded-lg bg-emerald-950 p-6 text-white shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Compass Assistant
          </p>
          {!loading && aiData && (
            <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-800/40">
              {aiData.isDemo ? "Offline Fallback" : `USD Cost: $${aiData.costUSD.toFixed(6)}`}
            </span>
          )}
        </div>

        <h2 className="mt-3 text-2xl font-semibold">
          {topCategory?.label ?? "Your top category"} is your largest source.
        </h2>

        {/* ── Narrative section ──────────────────────────────────────── */}
        {aiData ? (
          // Progressive Gemini-Narrated summary
          <div className="transition-all duration-300">
            <p className="mt-3 text-sm leading-6 text-emerald-100">{aiData.narrative}</p>
            <p className="mt-3 text-sm leading-6 text-emerald-50">{aiData.goalTip}</p>
          </div>
        ) : (
          // Default Grounded Recommendation (visible on mount and as fallback)
          <div className="transition-all duration-300">
            {loading && (
              <p
                role="status"
                aria-live="polite"
                className="text-[11px] font-mono text-emerald-300/80 animate-pulse mb-3"
              >
                &gt; Personalising guidance with AI...
              </p>
            )}
            <p className="mt-3 text-sm leading-6 text-emerald-100">
              {recommendation.reason} It contributes {topCategory?.percentage.toFixed(1) ?? "0.0"}%
              of your monthly footprint ({Math.round(topCategory?.kgCO2e ?? 0)} kg CO₂e).
            </p>
            <p className="mt-3 text-sm leading-6 text-emerald-50">
              {personaPrefix}the best first step {goalSuffix} is:{" "}
              <strong className="text-white">{recommendation.title}</strong>. Estimated saving:{" "}
              {recommendation.estimatedSavingKgCO2ePerMonth} kg CO₂e/month.
            </p>
          </div>
        )}
      </div>

      {/* ── Weekly challenge card ───────────────────────────────────── */}
      <div className="mt-6 pt-4 border-t border-emerald-900/60">
        <p className="rounded-md bg-emerald-900/70 px-4 py-3 text-sm text-emerald-100">
          <span className="font-semibold text-emerald-200">This week&apos;s challenge: </span>
          {!loading && aiData ? aiData.weeklyChallenge : recommendation.weeklyChallenge}
        </p>
      </div>
    </section>
  );
}
