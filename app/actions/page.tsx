import Link from "next/link";
import { ActionsClient } from "@/components/carbon/actions-client";

export default function ActionsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8]">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
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

        {/* ActionsClient reads sessionStorage and renders user or demo data */}
        <ActionsClient />
      </section>
    </main>
  );
}
