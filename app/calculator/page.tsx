import { FootprintForm } from "@/components/carbon/footprint-form";

export default function CalculatorPage() {
  return (
    <main id="main-content" className="min-h-[70vh] bg-[#f6fbf8]">
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-10">
        <p className="mb-4 w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
          Step 2
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Calculate your monthly footprint
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          Enter commute, electricity, food, shopping, and waste habits. The
          final result is validated and calculated through the server-safe carbon
          engine.
        </p>
        <FootprintForm />
      </section>
    </main>
  );
}
