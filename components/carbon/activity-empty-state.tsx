export function ActivityEmptyState() {
  return (
    <div className="p-8 text-center">
      <p className="text-sm font-medium text-slate-600">
        No tracked activities recorded.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Log travel, energy billing items, composting actions, or delivery
        counts to track footprints in real units.
      </p>
    </div>
  );
}
