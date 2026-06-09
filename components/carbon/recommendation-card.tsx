import type { Recommendation } from "@/lib/carbon/types";

type RecommendationCardProps = {
  recommendation: Recommendation;
  index: number;
  compact?: boolean;
};

function label(value: string): string {
  return value.replaceAll("_", " ");
}

export function RecommendationCard({
  recommendation,
  index,
  compact = false,
}: RecommendationCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Priority {index + 1}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{recommendation.title}</h3>
        </div>
        <p className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium capitalize text-emerald-800">
          {label(recommendation.category)}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">{recommendation.reason}</p>
      {!compact && <p className="mt-3 text-sm leading-6 text-slate-700">{recommendation.action}</p>}

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">Estimated saving</dt>
          <dd className="mt-1 font-semibold text-slate-950">
            {recommendation.estimatedSavingKgCO2ePerMonth} kg CO2e/month
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Difficulty</dt>
          <dd className="mt-1 font-semibold capitalize text-slate-950">
            {recommendation.difficulty}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Money saving</dt>
          <dd className="mt-1 font-semibold capitalize text-slate-950">
            {recommendation.moneySavingPotential}
          </dd>
        </div>
      </dl>

      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-800">
        <span className="font-semibold">Weekly challenge:</span> {recommendation.weeklyChallenge}
      </p>
    </article>
  );
}
