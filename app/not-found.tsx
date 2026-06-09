import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — Carbon Compass",
  description: "The page you are looking for does not exist. Return to Carbon Compass to track your footprint.",
};

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
        Error 404
      </p>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700">
        The page you are looking for does not exist or has moved. Return to the
        dashboard to continue tracking your carbon footprint.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Go to home
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          View dashboard
        </Link>
      </div>
    </main>
  );
}
