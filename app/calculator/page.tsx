import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function CalculatorPage() {
  return (
    <PagePlaceholder
      eyebrow="Step 2"
      title="Calculate your monthly footprint"
      description="Enter commute, electricity, food, shopping, and waste habits. The final implementation will validate inputs and calculate emissions on the server-safe carbon engine."
      nextHref="/dashboard"
      nextLabel="View dashboard"
    />
  );
}
