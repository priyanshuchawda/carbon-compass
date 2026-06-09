/**
 * Tests for components/carbon/footprint-form.tsx
 *
 * Verifies:
 * - All 5 fieldsets render (transport, energy, food, shopping, waste)
 * - All 7 previously-missing fields are now present
 * - Number inputs update correctly
 * - Checkbox inputs toggle correctly
 * - Demo fill populates all key fields
 * - Clear button resets to zero values
 * - Submit button is present
 */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FootprintForm } from "@/components/carbon/footprint-form";

// Mock next/navigation router
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock session save (we test session separately)
vi.mock("@/lib/carbon/session", () => ({
  saveSessionFootprint: vi.fn(),
  saveSessionProfile: vi.fn(),
}));

describe("FootprintForm", () => {
  it("renders all five fieldset sections", () => {
    render(<FootprintForm />);

    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("Home energy")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Shopping")).toBeInTheDocument();
    expect(screen.getByText("Waste habits")).toBeInTheDocument();
  });

  it("renders previously-missing fields: flightsPerYear", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/domestic flights per year/i)).toBeInTheDocument();
  });

  it("renders previously-missing fields: meatMealsPerWeek", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/meat meals per week/i)).toBeInTheDocument();
  });

  it("renders previously-missing fields: dairyFrequency", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/dairy frequency/i)).toBeInTheDocument();
  });

  it("renders previously-missing fields: foodWasteLevel", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/food waste level/i)).toBeInTheDocument();
  });

  it("renders previously-missing fields: electronicsPerYear", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/electronics per year/i)).toBeInTheDocument();
  });

  it("renders previously-missing fields: plasticUsage", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/plastic usage level/i)).toBeInTheDocument();
  });

  it("renders previously-missing fields: composts checkbox", () => {
    render(<FootprintForm />);
    expect(screen.getByLabelText(/composts food scraps/i)).toBeInTheDocument();
  });

  it("updates a number input when the user types", async () => {
    const user = userEvent.setup();
    render(<FootprintForm />);

    const input = screen.getByLabelText(/two-wheeler km per week/i);
    await user.clear(input);
    await user.type(input, "80");

    expect((input as HTMLInputElement).value).toBe("80");
  });

  it("toggles the recycles checkbox", async () => {
    const user = userEvent.setup();
    render(<FootprintForm />);

    const checkbox = screen.getByLabelText(/separates and recycles dry waste/i);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    await user.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("toggles the composts checkbox", async () => {
    const user = userEvent.setup();
    render(<FootprintForm />);

    const checkbox = screen.getByLabelText(/composts food scraps/i);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    await user.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("demo fill populates all key transport and energy fields", async () => {
    const user = userEvent.setup();
    render(<FootprintForm />);

    await user.click(screen.getByRole("button", { name: /use pune student demo data/i }));

    expect(
      (screen.getByLabelText(/two-wheeler km per week/i) as HTMLInputElement).value,
    ).toBe("120");
    expect(
      (screen.getByLabelText(/monthly electricity/i) as HTMLInputElement).value,
    ).toBe("100");
    expect(
      (screen.getByLabelText(/ac hours per day/i) as HTMLInputElement).value,
    ).toBe("2");
    expect(
      (screen.getByLabelText(/domestic flights per year/i) as HTMLInputElement).value,
    ).toBe("1");
  });

  it("clear button resets two-wheeler km to 0", async () => {
    const user = userEvent.setup();
    render(<FootprintForm />);

    // Fill first
    await user.click(screen.getByRole("button", { name: /use pune student demo data/i }));
    // Then clear
    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(
      (screen.getByLabelText(/two-wheeler km per week/i) as HTMLInputElement).value,
    ).toBe("0");
  });

  it("has a submit button labelled 'Calculate and view dashboard'", () => {
    render(<FootprintForm />);
    expect(
      screen.getByRole("button", { name: /calculate and view dashboard/i }),
    ).toBeInTheDocument();
  });

  it("form submit does not navigate without saving footprint", async () => {
    const { saveSessionFootprint } = await import("@/lib/carbon/session");
    render(<FootprintForm />);

    fireEvent.submit(screen.getByRole("form", { hidden: true }) ?? document.querySelector("form")!);

    expect(saveSessionFootprint).toHaveBeenCalled();
  });
});
