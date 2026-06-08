import type { FootprintResult, Recommendation } from "@/lib/carbon/types";

type AssistantInsightProps = {
  result: FootprintResult;
  recommendation: Recommendation;
};

export function AssistantInsight({
  result,
  recommendation,
}: AssistantInsightProps) {
  const topCategory = result.breakdown.find(
    (item) => item.category === result.topCategory,
  );

  return (
    <section
      aria-label="Compass Assistant insight"
      className="rounded-lg bg-emerald-950 p-6 text-white shadow-sm"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
        Compass Assistant
      </p>
      <h2 className="mt-3 text-2xl font-semibold">
        {topCategory?.label ?? "Your top category"} is your largest source.
      </h2>
      <p className="mt-4 text-sm leading-6 text-emerald-50">
        It contributes {topCategory?.percentage.toFixed(1) ?? "0.0"}% of this
        demo footprint. Start with {recommendation.title} because it has a clear
        weekly challenge and an estimated monthly saving of{" "}
        {recommendation.estimatedSavingKgCO2ePerMonth} kg CO2e.
      </p>
    </section>
  );
}
