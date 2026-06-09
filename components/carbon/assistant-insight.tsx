import type {
  FootprintResult,
  Recommendation,
  UserProfile,
} from "@/lib/carbon/types";

type AssistantInsightProps = {
  result: FootprintResult;
  recommendation: Recommendation;
  profile: UserProfile;
};

const PERSONA_CONTEXT: Record<UserProfile["persona"], string> = {
  student: "For a student in India, ",
  working: "As a working professional, ",
  family: "For your household, ",
};

const GOAL_CONTEXT: Record<UserProfile["mainGoal"], string> = {
  reduce_carbon: "to reduce your carbon impact",
  save_money: "and save money",
  learn: "to understand your impact",
  habit_building: "and build a lasting habit",
};

export function AssistantInsight({
  result,
  recommendation,
  profile,
}: AssistantInsightProps) {
  const topCategory = result.breakdown.find(
    (item) => item.category === result.topCategory,
  );

  const personaPrefix = PERSONA_CONTEXT[profile.persona];
  const goalSuffix = GOAL_CONTEXT[profile.mainGoal];

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
      <p className="mt-3 text-sm leading-6 text-emerald-100">
        {recommendation.reason} It contributes{" "}
        {topCategory?.percentage.toFixed(1) ?? "0.0"}% of your monthly
        footprint ({Math.round(topCategory?.kgCO2e ?? 0)} kg CO₂e).
      </p>
      <p className="mt-3 text-sm leading-6 text-emerald-50">
        {personaPrefix}the best first step {goalSuffix} is:{" "}
        <strong className="text-white">{recommendation.title}</strong>.
        Estimated saving:{" "}
        {recommendation.estimatedSavingKgCO2ePerMonth} kg CO₂e/month.
      </p>
      <p className="mt-3 rounded-md bg-emerald-900 px-4 py-3 text-sm text-emerald-100">
        <span className="font-semibold text-emerald-200">This week: </span>
        {recommendation.weeklyChallenge}
      </p>
    </section>
  );
}
