import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActivityForm } from "@/components/carbon/activity-form";

describe("ActivityForm", () => {
  it("previews emissions and submits a validated entry", () => {
    const onSave = vi.fn();

    render(<ActivityForm onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "energy" },
    });
    fireEvent.change(screen.getByLabelText(/activity type/i), {
      target: { value: "electricity" },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "100" },
    });

    expect(screen.getByText(/\+71\.00 kg CO2e/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /submit activity/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "energy",
        activityType: "electricity",
        value: 100,
        kgCO2e: 71,
      }),
    );
  });

  it("shows validation feedback for invalid quantity", () => {
    const onSave = vi.fn();

    render(<ActivityForm onSave={onSave} />);

    fireEvent.click(screen.getByRole("button", { name: /submit activity/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText(/please enter a valid non-negative quantity/i),
    ).toBeInTheDocument();
  });

  it("shows validation feedback for invalid date", () => {
    const onSave = vi.fn();

    render(<ActivityForm onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/date/i), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "10" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit activity/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/please choose a valid activity date/i)).toBeInTheDocument();
  });
});
