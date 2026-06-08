import Link from "next/link";
import { RecommendationCard } from "@/components/carbon/recommendation-card";
import {
  demoFootprintResult,
  demoProfile,
  demoRecommendations,
} from "@/lib/carbon/demo";

export default function ActionsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8]">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
              Step 4 - {demoProfile.city} demo
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Weekly action plan
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              Start with the highest-ranked actions from your top footprint
              source. Each item includes one specific weekly challenge so the
              plan stays executable.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Back to dashboard
            </Link>
            <Link
              href="/report"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Create report
            </Link>
          </div>
        </div>

        <section
          aria-label="Action plan summary"
          className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-slate-600">Top source</dt>
              <dd className="mt-1 text-xl font-semibold capitalize text-slate-950">
                {demoFootprintResult.topCategory}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Recommended actions</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-950">
                {demoRecommendations.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-600">Best first action</dt>
              <dd className="mt-1 text-xl font-semibold text-slate-950">
                {demoRecommendations[0]?.title ?? "Review habits"}
              </dd>
            </div>
          </dl>
        </section>

        <section aria-label="Prioritized recommendations" className="mt-6">
          <div className="grid gap-4">
            {demoRecommendations.map((recommendation, index) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                index={index}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
