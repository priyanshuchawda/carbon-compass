import {
  ACTIVITY_CATEGORY_META,
  getActivityType,
} from "@/lib/carbon/activity-types";
import type { ActivityLogEntry } from "@/lib/carbon/activity-log";

type ActivityTableProps = {
  entries: ActivityLogEntry[];
  onEdit: (entry: ActivityLogEntry) => void;
  onDelete: (id: string) => void;
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ActivityTable({ entries, onEdit, onDelete }: ActivityTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Logged carbon activities with date, category, quantity, footprint, and actions.
        </caption>
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-700">
            <th className="px-6 py-4" scope="col">
              Date
            </th>
            <th className="px-6 py-4" scope="col">
              Category
            </th>
            <th className="px-6 py-4" scope="col">
              Action Detail
            </th>
            <th className="px-6 py-4 text-right" scope="col">
              Quantity
            </th>
            <th className="px-6 py-4 text-right" scope="col">
              Footprint
            </th>
            <th className="px-6 py-4 text-right" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-900 tabular-nums">
          {entries.map((entry) => {
            const meta = ACTIVITY_CATEGORY_META[entry.category];
            const activity = getActivityType(entry.category, entry.activityType);
            const kgPrefix = entry.kgCO2e >= 0 ? "+" : "";

            return (
              <tr key={entry.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-6 py-4 font-mono">
                  {formatDate(entry.recordedAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">
                  {activity?.label ?? entry.activityType}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right font-mono">
                  {entry.value} {activity?.unit ?? ""}
                </td>
                <td
                  className={`whitespace-nowrap px-6 py-4 text-right font-mono font-semibold ${
                    entry.kgCO2e >= 0 ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {kgPrefix}
                  {entry.kgCO2e.toFixed(1)} kg
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
