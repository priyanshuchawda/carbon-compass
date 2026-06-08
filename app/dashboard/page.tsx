import Link from "next/link";
import { AssistantInsight } from "@/components/carbon/assistant-insight";
import { CategoryBreakdown } from "@/components/carbon/category-breakdown";
import { MetricCard } from "@/components/carbon/metric-card";
import { RecommendationCard } from "@/components/carbon/recommendation-card";
import { WhatIfSimulator } from "@/components/carbon/what-if-simulator";
import {
  demoFootprintInput,
  demoFootprintResult,
  demoProfile,
  demoRecommendations,
} from "@/lib/carbon/demo";
import { SIMULATION_ACTIONS, simulateAction } from "@/lib/carbon/simulator";

function kg(value: number): string {
  return `${Math.round(value)} kg CO2e`;
}

export default function DashboardPage() {
  const topCategory = demoFootprintResult.breakdown.find(
    (item) => item.category === demoFootprintResult.topCategory,
  );
  const leadingRecommendation = demoRecommendations[0];
  const simulations = SIMULATION_ACTIONS.map((action) =>
    simulateAction(demoFootprintInput, demoProfile, action.id),
  );

  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8]">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
              Demo profile - {demoProfile.city}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your Carbon Compass dashboard
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              A deterministic demo view for reviewing footprint totals,
              category drivers, eco score, and the first actions to take.
            </p>
          </div>
          <Link
            href="/actions"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Open full action plan
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Monthly footprint"
            value={kg(demoFootprintResult.monthlyTotalKgCO2e)}
            detail={`${kg(demoFootprintResult.annualTotalKgCO2e)} estimated per year.`}
          />
          <MetricCard
            label="Top source"
            value={topCategory?.label ?? "Unknown"}
            detail={`${kg(topCategory?.kgCO2e ?? 0)} per month from the largest category.`}
          />
          <MetricCard
            label="Potential monthly saving"
            value={kg(demoFootprintResult.potentialMonthlySavingKgCO2e)}
            detail="Estimated from reducing the top category by 18%."
          />
          <MetricCard
            label="Eco score"
            value={`${demoFootprintResult.ecoScore}/100`}
            detail="Higher scores reflect lower per-person emissions and existing habits."
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <CategoryBreakdown breakdown={demoFootprintResult.breakdown} />
          {leadingRecommendation && (
            <AssistantInsight
              result={demoFootprintResult}
              recommendation={leadingRecommendation}
            />
          )}
        </div>

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
                money-saving potential.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {demoRecommendations.slice(0, 2).map((recommendation, index) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                index={index}
                compact
              />
            ))}
          </div>
        </section>

        <div className="mt-8">
          <WhatIfSimulator simulations={simulations} />
        </div>
      </section>
    </main>
  );
}
