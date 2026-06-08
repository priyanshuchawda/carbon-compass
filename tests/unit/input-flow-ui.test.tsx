import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CalculatorPage from "@/app/calculator/page";
import OnboardingPage from "@/app/onboarding/page";

describe("input flow UI", () => {
  it("renders accessible onboarding fields", () => {
    render(<OnboardingPage />);

    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/household size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/persona/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main goal/i)).toBeInTheDocument();
  });

  it("renders calculator sections with labeled inputs", () => {
    render(<CalculatorPage />);

    expect(screen.getByLabelText(/two-wheeler km per week/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText(/monthly electricity kwh/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText(/diet type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/clothes bought per month/i))
      .toBeInTheDocument();
    expect(screen.getByLabelText(/recycles dry waste/i)).toBeInTheDocument();
  });

  it("fills practical demo data for a student in Pune", async () => {
    const user = userEvent.setup();
    render(<CalculatorPage />);

    await user.click(
      screen.getByRole("button", { name: /use pune student demo data/i }),
    );

    expect(screen.getByLabelText(/two-wheeler km per week/i))
      .toHaveValue(120);
    expect(screen.getByLabelText(/monthly electricity kwh/i)).toHaveValue(100);
    expect(screen.getByLabelText(/diet type/i)).toHaveValue("mixed");
  });
});
