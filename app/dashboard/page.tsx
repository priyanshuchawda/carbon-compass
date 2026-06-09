import Link from "next/link";
import { DashboardClient } from "@/components/carbon/dashboard-client";

export default function DashboardPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8]">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Your Carbon Compass dashboard
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              Footprint totals, category drivers, eco score, and your first personalised actions —
              calculated from your inputs.
            </p>
          </div>
          <Link
            href="/actions"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Open full action plan
          </Link>
        </div>

        {/* DashboardClient reads sessionStorage and renders real or demo data */}
        <DashboardClient />
      </section>
    </main>
  );
}
