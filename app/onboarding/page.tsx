import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function OnboardingPage() {
  return (
    <PagePlaceholder
      eyebrow="Step 1"
      title="Set your Carbon Compass context"
      description="Tell Carbon Compass your city, household size, routine, and main goal so later recommendations can match an urban Indian student or young professional lifestyle."
      nextHref="/calculator"
      nextLabel="Continue to calculator"
    />
  );
}
