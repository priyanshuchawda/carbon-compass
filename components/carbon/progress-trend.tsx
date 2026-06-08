import {
  bestMonthlyImprovement,
  progressHistoryTextSummary,
} from "@/lib/carbon/progress";
import type { ProgressEntry } from "@/lib/carbon/progress";

type ProgressTrendProps = {
  entries: ProgressEntry[];
};

function kg(value: number): string {
  return `${Math.round(value)} kg CO2e`;
}

function shortDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function ProgressTrend({ entries }: ProgressTrendProps) {
  const maxMonthlyTotal = Math.max(
    ...entries.map((entry) => entry.monthlyTotalKgCO2e),
    1,
  );
  const bestImprovement = bestMonthlyImprovement(entries);
  const textSummary = progressHistoryTextSummary(entries);

  return (
    <section
      aria-label="Progress trend"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-slate-950">
        Progress trend
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{textSummary}</p>
      <p className="mt-3 text-sm font-semibold text-emerald-800">
        Best improvement: {kg(bestImprovement)} in one check-in.
      </p>

      <div aria-hidden="true" className="mt-5 grid gap-3">
        {entries.map((entry) => (
          <div key={entry.id} className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">
                {shortDate(entry.recordedAt)}
              </span>
              <span className="text-slate-600">
                {kg(entry.monthlyTotalKgCO2e)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-700"
                style={{
                  width: `${Math.max(
                    (entry.monthlyTotalKgCO2e / maxMonthlyTotal) * 100,
                    8,
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <ul
        aria-label="Progress trend text summary"
        className="mt-5 grid gap-2 text-sm text-slate-700"
      >
        {entries.map((entry) => (
          <li key={entry.id}>
            {shortDate(entry.recordedAt)}: {kg(entry.monthlyTotalKgCO2e)}, eco
            score {entry.ecoScore}/100, top source {entry.topCategory}.
          </li>
        ))}
      </ul>
    </section>
  );
}
