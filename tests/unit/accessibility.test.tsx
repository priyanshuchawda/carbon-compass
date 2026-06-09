import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActionsPage from "@/app/actions/page";
import CalculatorPage from "@/app/calculator/page";
import DashboardPage from "@/app/dashboard/page";
import Home from "@/app/page";
import ReportPage from "@/app/report/page";
import { CategoryBreakdown } from "@/components/carbon/category-breakdown";
import { demoFootprintResult } from "@/lib/carbon/demo";

// Provide a mock router so components using useRouter don't throw
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock session so DashboardClient and ActionsClient don't touch real storage
vi.mock("@/lib/carbon/session", () => ({
  loadSessionPayload: () => null,
  saveSessionFootprint: vi.fn(),
  saveSessionProfile: vi.fn(),
  loadSessionFootprint: () => null,
  loadSessionProfile: () => null,
  clearSessionData: vi.fn(),
}));

describe("accessibility baseline", () => {
  it.each([
    ["landing", <Home key="landing" />],
    ["calculator", <CalculatorPage key="calculator" />],
    ["dashboard", <DashboardPage key="dashboard" />],
    ["actions", <ActionsPage key="actions" />],
    ["report", <ReportPage key="report" />],
  ])("%s page exposes one primary h1", (_name, page) => {
    render(page);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("keeps category chart data available as text", () => {
    render(<CategoryBreakdown breakdown={demoFootprintResult.breakdown} />);

    expect(
      screen.getByRole("list", { name: /category breakdown text summary/i }),
    ).toHaveTextContent(/transport/i);
  });
});
