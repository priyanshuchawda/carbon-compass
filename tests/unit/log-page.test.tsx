import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import LogPage from "@/app/log/page";
import * as activityLog from "@/lib/carbon/activity-log";
import type { ActivityLogEntry } from "@/lib/carbon/activity-log";

// Mock activity log helpers
vi.mock("@/lib/carbon/activity-log", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/carbon/activity-log")>();
  return {
    ...original,
    loadActivityLog: vi.fn(),
    addActivityLogEntry: vi.fn(),
    updateActivityLogEntry: vi.fn(),
    deleteActivityLogEntry: vi.fn(),
    clearActivityLog: vi.fn(),
  };
});

describe("LogPage Activity Tracker Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders log page empty state correctly", () => {
    vi.mocked(activityLog.loadActivityLog).mockReturnValue([]);

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
    vi.mocked(activityLog.loadActivityLog).mockReturnValue(mockEntries);

    render(<LogPage />);

    expect(screen.getByText(/150 km/i)).toBeInTheDocument();
    expect(screen.getByText(/Car travel/i)).toBeInTheDocument();
    expect(screen.getByText(/Transport/i)).toBeInTheDocument();
    expect(screen.getByText(/\+27\.0 kg/i)).toBeInTheDocument();
  });

  it("allows adding a new manual activity", () => {
    vi.mocked(activityLog.loadActivityLog).mockReturnValue([]);
    vi.mocked(activityLog.addActivityLogEntry).mockImplementation((entry) => ({ ok: true, entries: [entry] }));

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

    expect(activityLog.addActivityLogEntry).toHaveBeenCalled();
    expect(screen.getByText(/activity logged successfully!/i)).toBeInTheDocument();
  });

  it("displays validation messages for bad input in the form", () => {
    vi.mocked(activityLog.loadActivityLog).mockReturnValue([]);

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
    vi.mocked(activityLog.loadActivityLog).mockReturnValue(mockEntries);
    vi.mocked(activityLog.updateActivityLogEntry).mockImplementation((_id, entry) => ({ ok: true, entries: [entry] }));

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

    expect(activityLog.updateActivityLogEntry).toHaveBeenCalled();
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
    vi.mocked(activityLog.loadActivityLog).mockReturnValue(mockEntries);
    vi.mocked(activityLog.deleteActivityLogEntry).mockReturnValue([]);

    render(<LogPage />);

    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(activityLog.deleteActivityLogEntry).toHaveBeenCalledWith("activity-1");
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
    vi.mocked(activityLog.loadActivityLog).mockReturnValue(mockEntries);

    render(<LogPage />);

    const clearAllBtn = screen.getByRole("button", { name: /clear all/i });
    fireEvent.click(clearAllBtn);

    // Dialog should be displayed; click the "Yes, Clear All" button inside the modal
    const confirmBtn = screen.getByRole("button", { name: /yes, clear all/i });
    fireEvent.click(confirmBtn);

    expect(activityLog.clearActivityLog).toHaveBeenCalled();
    expect(screen.getByText(/history cleared/i)).toBeInTheDocument();
  });
});
