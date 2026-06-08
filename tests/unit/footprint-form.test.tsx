import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import CalculatorPage from "@/app/calculator/page";

describe("footprint-form interactions", () => {
  it("renders all five fieldset sections", () => {
    render(<CalculatorPage />);

    expect(screen.getByRole("group", { name: /transport/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /home energy/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /food/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /shopping/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /waste/i })).toBeInTheDocument();
  });

  it("has all expected labeled number inputs", () => {
    render(<CalculatorPage />);

    const inputs = [
      /two-wheeler km per week/i,
      /car km per week/i,
      /public transport trips per week/i,
      /cab or auto trips per week/i,
      /monthly electricity kwh/i,
      /lpg cylinders per month/i,
      /ac hours per day/i,
      /food delivery per week/i,
      /clothes bought per month/i,
      /online orders per month/i,
    ];

    for (const label of inputs) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("updates a number input when the user types", async () => {
    const user = userEvent.setup();
    render(<CalculatorPage />);

    const carField = screen.getByLabelText(/car km per week/i);
    await user.clear(carField);
    await user.type(carField, "50");

    expect(carField).toHaveValue(50);
  });

  it("updates the diet select when changed", async () => {
    const user = userEvent.setup();
    render(<CalculatorPage />);

    const dietSelect = screen.getByLabelText(/diet type/i);
    await user.selectOptions(dietSelect, "vegan");

    expect(dietSelect).toHaveValue("vegan");
  });

  it("toggles the recycles checkbox", async () => {
    const user = userEvent.setup();
    render(<CalculatorPage />);

    const checkbox = screen.getByLabelText(/recycles dry waste/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("demo fill populates all key transport and energy fields", async () => {
    const user = userEvent.setup();
    render(<CalculatorPage />);

    await user.click(
      screen.getByRole("button", { name: /use pune student demo data/i }),
    );

    expect(screen.getByLabelText(/two-wheeler km per week/i)).toHaveValue(120);
    expect(screen.getByLabelText(/car km per week/i)).toHaveValue(0);
    expect(screen.getByLabelText(/monthly electricity kwh/i)).toHaveValue(100);
    expect(screen.getByLabelText(/lpg cylinders per month/i)).toHaveValue(0.5);
    expect(screen.getByLabelText(/ac hours per day/i)).toHaveValue(2);
    expect(screen.getByLabelText(/food delivery per week/i)).toHaveValue(3);
    expect(screen.getByLabelText(/clothes bought per month/i)).toHaveValue(2);
    expect(screen.getByLabelText(/online orders per month/i)).toHaveValue(5);
    expect(screen.getByLabelText(/diet type/i)).toHaveValue("mixed");
  });

  it("submit button is present and has accessible name", () => {
    render(<CalculatorPage />);

    const submit = screen.getByRole("button", {
      name: /calculate and view dashboard/i,
    });
    expect(submit).toBeInTheDocument();
    expect(submit).toHaveAttribute("type", "submit");
  });
});
