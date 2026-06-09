import Link from "next/link";

const featureCards = [
  {
    title: "Estimate daily habits",
    body: "Track commute, electricity, food, shopping, and waste in simple monthly terms.",
  },
  {
    title: "Find the biggest lever",
    body: "See which lifestyle category contributes most and why it matters.",
  },
  {
    title: "Act one week at a time",
    body: "Get practical, non-shaming actions with estimated savings and difficulty.",
  },
] as const;

const demoStats = [
  { label: "Monthly footprint", value: "182 kg CO2e" },
  { label: "Top opportunity", value: "Transport" },
  { label: "Potential saving", value: "24 kg CO2e" },
] as const;

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f6fbf8]">
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-4 w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
            Built for urban students and young professionals in India
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Track your lifestyle carbon footprint and get practical ways to reduce it.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            Carbon Compass estimates your impact across commute, home energy, food, shopping, and
            waste, then turns the result into simple weekly actions.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/calculator"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Calculate My Footprint
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              View Demo Dashboard
            </Link>
          </div>
        </div>

        <aside
          aria-label="Carbon Compass demo summary"
          className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm"
        >
          <div className="rounded-md bg-emerald-950 p-6 text-white">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-200">
              Compass Assistant
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Your biggest opportunity is transport.</h2>
            <p className="mt-4 text-sm leading-6 text-emerald-50">
              Because weekly scooter and cab travel is higher than other categories, replacing two
              short fuel trips can create a visible monthly reduction.
            </p>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {demoStats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-600">{stat.label}</dt>
                <dd className="mt-2 text-lg font-semibold text-slate-950">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section aria-labelledby="features-heading" className="border-t border-emerald-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10">
          <h2
            id="features-heading"
            className="text-2xl font-semibold tracking-tight text-slate-950"
          >
            From estimate to action
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
              <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
