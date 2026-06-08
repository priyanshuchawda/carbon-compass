import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ActionsPage from "@/app/actions/page";
import DashboardPage from "@/app/dashboard/page";

describe("dashboard and action plan", () => {
  it("renders the demo dashboard with metrics, breakdown, and assistant guidance", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /your carbon compass dashboard/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/monthly footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/top source/i)).toBeInTheDocument();
    expect(screen.getByText(/potential monthly saving/i)).toBeInTheDocument();
    expect(screen.getAllByText(/eco score/i).length).toBeGreaterThan(0);

    expect(
      screen.getByRole("region", { name: /category breakdown/i }),
    ).toBeInTheDocument();
    const textSummary = screen.getByRole("list", {
      name: /category breakdown text summary/i,
    });
    expect(within(textSummary).getByText(/transport/i)).toBeInTheDocument();
    expect(within(textSummary).getByText(/home energy/i)).toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: /compass assistant insight/i }),
    ).toHaveTextContent(/transport is your largest source/i);
    expect(
      screen.getByRole("link", { name: /open full action plan/i }),
    ).toHaveAttribute("href", "/actions");

    const simulator = screen.getByRole("region", {
      name: /what-if simulator/i,
    });
    expect(simulator).toHaveTextContent(/swap short fuel trips/i);
    expect(simulator).toHaveTextContent(/reduce ac by 1 hour/i);
    expect(simulator).toHaveTextContent(/before/i);
    expect(simulator).toHaveTextContent(/after/i);
    expect(simulator).toHaveTextContent(/estimated saving/i);
  });

  it("renders a prioritized weekly action plan", () => {
    render(<ActionsPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /weekly action plan/i,
      }),
    ).toBeInTheDocument();

    const recommendations = screen.getAllByRole("article");
    expect(recommendations.length).toBeGreaterThanOrEqual(3);
    expect(recommendations[0]).toHaveTextContent(/replace 2 short fuel trips/i);
    expect(recommendations[0]).toHaveTextContent(/estimated saving/i);
    expect(recommendations[0]).toHaveTextContent(/weekly challenge/i);
  });
});
