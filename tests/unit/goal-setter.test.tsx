import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { GoalSetter } from "@/components/carbon/goal-setter";
import * as progressLib from "@/lib/carbon/progress";

// Mock loadMonthlyGoal and saveMonthlyGoal
vi.mock("@/lib/carbon/progress", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/carbon/progress")>();
  return {
    ...original,
    loadMonthlyGoal: vi.fn(),
    saveMonthlyGoal: vi.fn(),
  };
});

describe("GoalSetter Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders with header and input field", () => {
    vi.mocked(progressLib.loadMonthlyGoal).mockReturnValue(null);

    render(<GoalSetter currentMonthlyKg={200} />);

    expect(screen.getByRole("heading", { name: /monthly carbon goal/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Target (kg CO2e / month)")).toBeInTheDocument();
    expect(screen.queryByText(/target reached/i)).not.toBeInTheDocument();
  });

  it("renders goal state when a goal is loaded", () => {
    vi.mocked(progressLib.loadMonthlyGoal).mockReturnValue(250);

    render(<GoalSetter currentMonthlyKg={200} />);

    expect(screen.getByDisplayValue("250")).toBeInTheDocument();
    expect(screen.getByText(/80% of target reached/i)).toBeInTheDocument();
    expect(screen.getByText(/Goal Met/i)).toBeInTheDocument();
  });

  it("allows setting a new goal", async () => {
    const user = userEvent.setup();
    vi.mocked(progressLib.loadMonthlyGoal).mockReturnValue(null);

    render(<GoalSetter currentMonthlyKg={200} />);

    const input = screen.getByLabelText("Target (kg CO2e / month)");
    await user.type(input, "150");

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    expect(progressLib.saveMonthlyGoal).toHaveBeenCalledWith(150);
    expect(screen.getByText(/Goal saved successfully/i)).toBeInTheDocument();
  });

  it("allows clearing an existing goal", async () => {
    const user = userEvent.setup();
    vi.mocked(progressLib.loadMonthlyGoal).mockReturnValue(250);

    render(<GoalSetter currentMonthlyKg={200} />);

    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    expect(progressLib.saveMonthlyGoal).toHaveBeenCalledWith(null);
    expect(screen.getByText(/Goal cleared/i)).toBeInTheDocument();
  });
});
