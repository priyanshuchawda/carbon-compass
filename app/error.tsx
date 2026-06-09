"use client";

/**
 * Error Boundary for the Carbon Compass app.
 *
 * Catches any unhandled React render errors or server component failures
 * within the root layout. Provides a branded, accessible recovery page
 * instead of the raw Next.js error screen.
 *
 * Required by Next.js App Router: must be a Client Component.
 */

import { useEffect } from "react";
import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in non-production environments only.
    // In production, a real app would send to an observability service.
    if (process.env.NODE_ENV !== "production") {
      console.error("[Carbon Compass] Unhandled render error:", error.message);
    }
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="w-fit rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700">
        Something went wrong
      </p>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
        Unexpected error
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700">
        Carbon Compass encountered an unexpected error. Your data is safe in
        your browser — this was a display issue, not a data loss event.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-slate-500">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Go to home
        </Link>
      </div>
    </main>
  );
}
