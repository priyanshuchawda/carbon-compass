import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LogPage from "@/app/log/page";
import * as progressLib from "@/lib/carbon/progress";
import type { ProgressEntry } from "@/lib/carbon/progress";

// Mock progress helpers
vi.mock("@/lib/carbon/progress", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/carbon/progress")>();
  return {
    ...original,
    loadProgressHistory: vi.fn(),
    saveProgressHistory: vi.fn(),
  };
});

describe("LogPage Activity Tracker Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // mock confirm dialog
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  it("renders log page empty state correctly", () => {
    vi.mocked(progressLib.loadProgressHistory).mockReturnValue([]);

    render(<LogPage />);

    expect(screen.getByRole("heading", { name: /activity tracker log/i })).toBeInTheDocument();
    expect(screen.getByText(/no activities logged yet/i)).toBeInTheDocument();
  });

  it("renders a list of saved entries", () => {
    const mockEntries: ProgressEntry[] = [
      {
        id: "1",
        recordedAt: new Date("2026-06-01").toISOString(),
        monthlyTotalKgCO2e: 250,
        ecoScore: 75,
        topCategory: "transport",
      },
    ];
    vi.mocked(progressLib.loadProgressHistory).mockReturnValue(mockEntries);

    render(<LogPage />);

    expect(screen.getByText(/250 kg CO2e/i)).toBeInTheDocument();
    expect(screen.getByText(/75\/100/i)).toBeInTheDocument();
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
  });

  it("allows adding a new manual entry", () => {
    vi.mocked(progressLib.loadProgressHistory).mockReturnValue([]);

    const { container } = render(<LogPage />);

    // Click to show the form
    const logNewBtn = screen.getByRole("button", { name: /log new entry/i });
    fireEvent.click(logNewBtn);

    // Form inputs should be visible
    const footprintInput = screen.getByLabelText(/footprint/i);
    const scoreInput = screen.getByLabelText(/eco score/i);
    const categorySelect = screen.getByLabelText(/top category/i);

    fireEvent.change(footprintInput, { target: { value: "300" } });
    fireEvent.change(scoreInput, { target: { value: "85" } });
    fireEvent.change(categorySelect, { target: { value: "energy" } });

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    expect(progressLib.saveProgressHistory).toHaveBeenCalled();
    expect(screen.getByText(/entry added successfully!/i)).toBeInTheDocument();
  });

  it("displays validation messages for bad input in the form", () => {
    vi.mocked(progressLib.loadProgressHistory).mockReturnValue([]);

    const { container } = render(<LogPage />);

    // Click to show form
    fireEvent.click(screen.getByRole("button", { name: /log new entry/i }));

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    expect(screen.getByText(/please enter a valid non-negative footprint/i)).toBeInTheDocument();
  });

  it("allows deleting an entry", () => {
    const mockEntries: ProgressEntry[] = [
      {
        id: "1",
        recordedAt: new Date("2026-06-01").toISOString(),
        monthlyTotalKgCO2e: 250,
        ecoScore: 75,
        topCategory: "transport",
      },
    ];
    vi.mocked(progressLib.loadProgressHistory).mockReturnValue(mockEntries);

    render(<LogPage />);

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(progressLib.saveProgressHistory).toHaveBeenCalledWith([]);
    expect(screen.getByText(/entry deleted/i)).toBeInTheDocument();
  });

  it("allows clearing all entries after confirmation", () => {
    const mockEntries: ProgressEntry[] = [
      {
        id: "1",
        recordedAt: new Date("2026-06-01").toISOString(),
        monthlyTotalKgCO2e: 250,
        ecoScore: 75,
        topCategory: "transport",
      },
    ];
    vi.mocked(progressLib.loadProgressHistory).mockReturnValue(mockEntries);

    render(<LogPage />);

    const clearAllBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearAllBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(progressLib.saveProgressHistory).toHaveBeenCalledWith([]);
    expect(screen.getByText(/history cleared/i)).toBeInTheDocument();
  });
});
