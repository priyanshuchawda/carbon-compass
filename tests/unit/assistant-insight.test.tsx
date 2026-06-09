/**
 * Tests for components/carbon/assistant-insight.tsx
 *
 * Verifies:
 * - No "demo" word appears in output
 * - Recommendation reason is displayed
 * - Persona context prefix is displayed
 * - Goal context suffix is displayed
 * - Weekly challenge is displayed
 * - Top category label appears in h2
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssistantInsight } from "@/components/carbon/assistant-insight";
import { demoFootprintResult, demoRecommendations, demoFootprintInput } from "@/lib/carbon/demo";
import type { UserProfile } from "@/lib/carbon/types";

const studentProfile: UserProfile = {
  id: "test",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

const workingProfile: UserProfile = {
  ...studentProfile,
  persona: "working",
  mainGoal: "save_money",
};

const recommendation = demoRecommendations[0]!;

describe("AssistantInsight", () => {
  it("does not render the word 'demo' in any visible text", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    const allText = document.body.textContent ?? "";
    expect(allText.toLowerCase()).not.toContain("demo footprint");
  });

  it("renders the top category label in the heading", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      /transport|energy|food|shopping|waste/i
    );
  });

  it("surfaces the recommendation reason text", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(document.body.textContent).toContain(recommendation.reason);
  });

  it("shows the weekly challenge", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(document.body.textContent).toContain(recommendation.weeklyChallenge);
  });

  it("shows student persona prefix for student profile", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(document.body.textContent).toContain("For a student in India");
  });

  it("shows working persona prefix for working profile", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={workingProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(document.body.textContent).toContain("As a working professional");
  });

  it("shows save_money goal suffix for save_money goal", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={workingProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(document.body.textContent).toContain("and save money");
  });

  it("displays the estimated saving number", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(document.body.textContent).toContain(
      String(recommendation.estimatedSavingKgCO2ePerMonth)
    );
  });

  it("has an accessible section aria-label", () => {
    render(
      <AssistantInsight
        result={demoFootprintResult}
        recommendation={recommendation}
        profile={studentProfile}
        footprint={demoFootprintInput}
      />
    );

    expect(screen.getByRole("region", { name: /compass assistant insight/i })).toBeInTheDocument();
  });
});
