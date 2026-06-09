"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PrintReportButton } from "@/components/carbon/print-report-button";
import { ProgressTrend } from "@/components/carbon/progress-trend";
import { useCarbonSessionState } from "@/lib/carbon/use-carbon-session-state";
import { loadProgressHistory } from "@/lib/carbon/progress";
import { demoProgressHistory } from "@/lib/carbon/demo-progress";

function kg(value: number): string {
  return `${Math.round(value)} kg CO2e`;
}

export function ReportClient() {
  const state = useCarbonSessionState();
  const { result, recommendations, profile, isDemo } = state;

  const progressHistory = useMemo(() => {
    if (isDemo) return demoProgressHistory;
    let history = loadProgressHistory();
    if (history.length === 0) {
      history = [
        {
          id: "initial-checkin",
          recordedAt: "2026-06-09T00:00:00.000Z",
          monthlyTotalKgCO2e: result.monthlyTotalKgCO2e,
          ecoScore: result.ecoScore,
          topCategory: result.topCategory,
        },
      ];
    }
    return history;
  }, [isDemo, result]);

  const topCategory = result.breakdown.find((item) => item.category === result.topCategory);
  const bestAction = recommendations[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-6 print:hidden sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
            Step 5 - Shareable summary
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Carbon Compass report
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
            {isDemo
              ? `A judge-ready demo report for ${profile.city}, showing the estimate, top source, strongest action, progress trend, and transparent assumptions.`
              : `Your personalised lifestyle carbon report for ${profile.city}, showing your footprint breakdown, best actions, and tracking trend.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Back to dashboard
          </Link>
          <PrintReportButton />
        </div>
      </div>

      {isDemo && (
        <div className="mt-6 print:hidden rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Showing demo data. Complete the{" "}
          <Link href="/calculator" className="font-semibold underline underline-offset-2">
            calculator
          </Link>{" "}
          to see your personal report.
        </div>
      )}

      <article className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm print:mt-0 print:border-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Carbon Compass
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Lifestyle footprint report</h2>
          <p className="mt-2 text-sm text-slate-600">
            {isDemo ? "Demo profile: " : "Profile: "}
            {profile.persona}, {profile.city}, {profile.country}
          </p>
        </header>

        <section
          aria-label="Report summary"
          className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-4"
        >
          <ReportMetric
            label="Monthly footprint"
            value={kg(result.monthlyTotalKgCO2e)}
            detail={`${kg(result.annualTotalKgCO2e)} per year`}
          />
          <ReportMetric
            label="Top source"
            value={topCategory?.label ?? "Unknown"}
            detail={`${kg(topCategory?.kgCO2e ?? 0)} per month`}
          />
          <ReportMetric
            label="Best action"
            value={bestAction?.title ?? "Review habits"}
            detail={
              bestAction
                ? `${kg(bestAction.estimatedSavingKgCO2ePerMonth)} estimated saving`
                : "No action available"
            }
          />
          <ReportMetric
            label="Potential saving"
            value={kg(result.potentialMonthlySavingKgCO2e)}
            detail="Based on reducing the top source by 18%"
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <ProgressTrend entries={progressHistory} />

          <section
            aria-label="Transparent assumptions"
            className="rounded-lg border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="text-2xl font-semibold text-slate-950">Transparent assumptions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              This report is an educational estimate, not a certified carbon audit. It avoids exact
              addresses and unnecessary personal data.
            </p>
            <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
              {result.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}

type ReportMetricProps = {
  label: string;
  value: string;
  detail: string;
};

function ReportMetric({ label, value, detail }: ReportMetricProps) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{detail}</p>
    </div>
  );
}
