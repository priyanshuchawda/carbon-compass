import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActionsPage from "@/app/actions/page";
import CalculatorPage from "@/app/calculator/page";
import DashboardPage from "@/app/dashboard/page";
import OnboardingPage from "@/app/onboarding/page";
import ReportPage from "@/app/report/page";

const plannedRoutes = [
  {
    name: "Onboarding",
    Component: OnboardingPage,
    heading: /set your carbon compass context/i,
  },
  {
    name: "Calculator",
    Component: CalculatorPage,
    heading: /calculate your monthly footprint/i,
  },
  {
    name: "Dashboard",
    Component: DashboardPage,
    heading: /your carbon compass dashboard/i,
  },
  {
    name: "Actions",
    Component: ActionsPage,
    heading: /weekly action plan/i,
  },
  {
    name: "Report",
    Component: ReportPage,
    heading: /carbon compass report/i,
  },
] as const;

describe("foundation routes", () => {
  it.each(plannedRoutes)("$name route has one clear h1", ({ Component, heading }) => {
    render(<Component />);

    expect(screen.getByRole("heading", { level: 1, name: heading }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
