import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ReportPage from "@/app/report/page";
import {
  PROGRESS_STORAGE_KEY,
  appendProgressEntry,
  loadProgressHistory,
  progressHistoryTextSummary,
  saveProgressHistory,
} from "@/lib/carbon/progress";
import type { ProgressEntry } from "@/lib/carbon/progress";

const entry: ProgressEntry = {
  id: "entry-1",
  recordedAt: "2026-06-08T12:00:00.000Z",
  monthlyTotalKgCO2e: 240,
  ecoScore: 42,
  topCategory: "transport",
};

describe("progress storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("falls back to empty history when local storage is corrupted", () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, "{bad json");

    expect(loadProgressHistory(window.localStorage)).toEqual([]);
  });

  it("saves and appends schema-versioned progress entries", () => {
    saveProgressHistory([entry], window.localStorage);
    appendProgressEntry(
      { ...entry, id: "entry-2", monthlyTotalKgCO2e: 210, ecoScore: 50 },
      window.localStorage,
    );

    const history = loadProgressHistory(window.localStorage);
    expect(history).toHaveLength(2);
    expect(history[1]?.monthlyTotalKgCO2e).toBe(210);
    expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY))
      .toContain("\"schemaVersion\":1");
  });

  it("creates a text trend summary with best improvement", () => {
    const summary = progressHistoryTextSummary([
      entry,
      { ...entry, id: "entry-2", monthlyTotalKgCO2e: 210, ecoScore: 52 },
    ]);

    expect(summary).toMatch(/reduced by 30 kg CO2e/i);
    expect(summary).toMatch(/eco score improved by 10/i);
  });
});

describe("report page", () => {
  it("renders a printable report with progress text alternative", () => {
    render(<ReportPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /carbon compass report/i,
      }),
    ).toBeInTheDocument();
    const reportSummary = screen.getByRole("region", {
      name: /report summary/i,
    });
    expect(within(reportSummary).getByText(/^monthly footprint$/i))
      .toBeInTheDocument();
    expect(within(reportSummary).getByText(/^top source$/i))
      .toBeInTheDocument();
    expect(within(reportSummary).getByText(/^best action$/i))
      .toBeInTheDocument();
    expect(within(reportSummary).getByText(/^potential saving$/i))
      .toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /print report/i }),
    ).toBeInTheDocument();

    const trend = screen.getByRole("region", { name: /progress trend/i });
    expect(trend).toHaveTextContent(/best improvement/i);
    const textSummary = within(trend).getByRole("list", {
      name: /progress trend text summary/i,
    });
    expect(textSummary).toHaveTextContent(/kg CO2e/i);

    expect(
      screen.getByRole("region", { name: /transparent assumptions/i }),
    ).toBeInTheDocument();
  });
});
