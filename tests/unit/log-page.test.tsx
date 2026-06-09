import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LogPage from "@/app/log/page";
import * as progressLib from "@/lib/carbon/progress";
import type { ActivityLogEntry } from "@/lib/carbon/progress";

// Mock progress helpers
vi.mock("@/lib/carbon/progress", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/carbon/progress")>();
  return {
    ...original,
    loadActivityLog: vi.fn(),
    saveActivityLog: vi.fn(),
  };
});

describe("LogPage Activity Tracker Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  it("renders log page empty state correctly", () => {
    vi.mocked(progressLib.loadActivityLog).mockReturnValue([]);

    render(<LogPage />);

    expect(screen.getByRole("heading", { name: /activity tracker log/i })).toBeInTheDocument();
    expect(screen.getByText(/no tracked activities recorded/i)).toBeInTheDocument();
  });

  it("renders a list of saved entries", () => {
    const mockEntries: ActivityLogEntry[] = [
      {
        id: "1",
        recordedAt: new Date("2026-06-01").toISOString(),
        category: "transport",
        activityType: "car",
        value: 150,
        kgCO2e: 27,
      },
    ];
    vi.mocked(progressLib.loadActivityLog).mockReturnValue(mockEntries);

    render(<LogPage />);

    expect(screen.getByText(/150 km/i)).toBeInTheDocument();
    expect(screen.getByText(/Car travel/i)).toBeInTheDocument();
    expect(screen.getByText(/Transport/i)).toBeInTheDocument();
    expect(screen.getByText(/\+27\.0 kg/i)).toBeInTheDocument();
  });

  it("allows adding a new manual activity", () => {
    vi.mocked(progressLib.loadActivityLog).mockReturnValue([]);

    const { container } = render(<LogPage />);

    // Click to show the form
    const logNewBtn = screen.getByRole("button", { name: /log new activity/i });
    fireEvent.click(logNewBtn);

    // Form inputs should be visible
    const categorySelect = screen.getByLabelText(/category/i);
    const typeSelect = screen.getByLabelText(/activity type/i);
    const valueInput = screen.getByLabelText(/quantity/i);

    fireEvent.change(categorySelect, { target: { value: "energy" } });
    fireEvent.change(typeSelect, { target: { value: "electricity" } });
    fireEvent.change(valueInput, { target: { value: "100" } });

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    expect(progressLib.saveActivityLog).toHaveBeenCalled();
    expect(screen.getByText(/activity logged successfully!/i)).toBeInTheDocument();
  });

  it("displays validation messages for bad input in the form", () => {
    vi.mocked(progressLib.loadActivityLog).mockReturnValue([]);

    const { container } = render(<LogPage />);

    // Click to show form
    fireEvent.click(screen.getByRole("button", { name: /log new activity/i }));

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    expect(screen.getByText(/please enter a valid non-negative quantity/i)).toBeInTheDocument();
  });

  it("allows editing an existing entry", () => {
    const mockEntries: ActivityLogEntry[] = [
      {
        id: "activity-1",
        recordedAt: new Date("2026-06-01").toISOString(),
        category: "transport",
        activityType: "car",
        value: 150,
        kgCO2e: 27,
      },
    ];
    vi.mocked(progressLib.loadActivityLog).mockReturnValue(mockEntries);

    const { container } = render(<LogPage />);

    const editBtn = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editBtn);

    // Form should be visible in edit mode
    expect(screen.getByRole("heading", { name: /edit activity entry/i })).toBeInTheDocument();
    const valueInput = screen.getByLabelText(/quantity/i);
    fireEvent.change(valueInput, { target: { value: "200" } });

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);

    expect(progressLib.saveActivityLog).toHaveBeenCalled();
    expect(screen.getByText(/entry updated successfully!/i)).toBeInTheDocument();
  });

  it("allows deleting an entry", () => {
    const mockEntries: ActivityLogEntry[] = [
      {
        id: "activity-1",
        recordedAt: new Date("2026-06-01").toISOString(),
        category: "transport",
        activityType: "car",
        value: 150,
        kgCO2e: 27,
      },
    ];
    vi.mocked(progressLib.loadActivityLog).mockReturnValue(mockEntries);

    render(<LogPage />);

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(progressLib.saveActivityLog).toHaveBeenCalledWith([]);
    expect(screen.getByText(/entry deleted/i)).toBeInTheDocument();
  });

  it("allows clearing all entries after confirmation", () => {
    const mockEntries: ActivityLogEntry[] = [
      {
        id: "activity-1",
        recordedAt: new Date("2026-06-01").toISOString(),
        category: "transport",
        activityType: "car",
        value: 150,
        kgCO2e: 27,
      },
    ];
    vi.mocked(progressLib.loadActivityLog).mockReturnValue(mockEntries);

    render(<LogPage />);

    const clearAllBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearAllBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(progressLib.saveActivityLog).toHaveBeenCalledWith([]);
    expect(screen.getByText(/history cleared/i)).toBeInTheDocument();
  });
});
