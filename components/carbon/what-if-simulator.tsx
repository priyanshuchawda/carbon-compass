import type { SimulationResult } from "@/lib/carbon/simulator";

type WhatIfSimulatorProps = {
  simulations: SimulationResult[];
};

function kg(value: number): string {
  return `${Math.round(value)} kg CO2e`;
}

export function WhatIfSimulator({ simulations }: WhatIfSimulatorProps) {
  return (
    <section
      aria-label="What-if simulator"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            What-if simulator
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
            Compare deterministic before and after estimates for practical
            action ideas. Each saving comes from the same carbon engine and
            factor set as the dashboard.
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {simulations.map((simulation) => {
          const action = simulation.appliedActions[0];

          if (!action) {
            return null;
          }

          return (
            <li
              key={action.id}
              className="rounded-md border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold capitalize text-emerald-700">
                {action.category}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                {action.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {action.description}
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-slate-500">Before</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {kg(simulation.beforeResult.monthlyTotalKgCO2e)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">After</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {kg(simulation.afterResult.monthlyTotalKgCO2e)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Estimated saving</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {kg(simulation.savingKgCO2e)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-xs leading-5 text-slate-600">
                {action.factorNote}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
