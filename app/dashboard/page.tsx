import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function DashboardPage() {
  return (
    <PagePlaceholder
      eyebrow="Step 3"
      title="Your Carbon Compass dashboard"
      description="Review monthly footprint, category breakdown, top source, eco score, and Compass Assistant recommendations with text summaries for chart data."
      nextHref="/actions"
      nextLabel="Open action plan"
    />
  );
}
