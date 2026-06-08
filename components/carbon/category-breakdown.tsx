"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import type { CategoryBreakdown as CategoryBreakdownItem } from "@/lib/carbon/types";

type CategoryBreakdownProps = {
  breakdown: CategoryBreakdownItem[];
};

const COLORS: Record<CategoryBreakdownItem["category"], string> = {
  transport: "#047857",
  energy: "#0f766e",
  food: "#2563eb",
  shopping: "#7c3aed",
  waste: "#64748b",
};

function formatKg(value: number): string {
  return `${value.toFixed(1)} kg CO2e`;
}

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  return (
    <section
      aria-label="Category breakdown"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div aria-hidden="true" className="flex justify-center lg:w-72">
          <PieChart width={260} height={220}>
            <Pie
              data={breakdown}
              dataKey="kgCO2e"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={88}
              paddingAngle={2}
            >
              {breakdown.map((item) => (
                <Cell key={item.category} fill={COLORS[item.category]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? formatKg(value) : value
              }
            />
          </PieChart>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-950">
            Category breakdown
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            The chart mirrors this text summary so the result stays readable
            without relying on visual color alone.
          </p>
          <ul
            aria-label="Category breakdown text summary"
            className="mt-5 grid gap-3 sm:grid-cols-2"
          >
            {breakdown.map((item) => (
              <li key={item.category} className="rounded-md bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-950">
                    {item.label}
                  </span>
                  <span className="text-sm text-slate-600">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  {formatKg(item.kgCO2e)} per month
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
