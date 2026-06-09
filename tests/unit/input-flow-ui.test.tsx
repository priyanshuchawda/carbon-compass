/**
 * Input flow UI tests — exercises the onboarding and calculator forms.
 *
 * Both forms use next/navigation (useRouter), so we provide a vi.mock.
 * Session module is also mocked so tests don't touch real storage.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CalculatorPage from "@/app/calculator/page";
import OnboardingPage from "@/app/onboarding/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/carbon/session", () => ({
  loadSessionPayload: () => null,
  saveSessionFootprint: vi.fn(() => ({ ok: true })),
  saveSessionProfile: vi.fn(() => ({ ok: true })),
  loadSessionFootprint: () => null,
  loadSessionProfile: () => null,
  clearSessionData: vi.fn(),
}));

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

    expect(screen.getByLabelText(/two-wheeler km per week/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly electricity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/diet type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/clothes bought per month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/separates and recycles dry waste/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /calculate and view dashboard/i })
    ).toBeInTheDocument();
  });

  it("fills practical demo data for a student in Pune", async () => {
    const user = userEvent.setup();
    render(<CalculatorPage />);

    await user.click(screen.getByRole("button", { name: /use pune student demo data/i }));

    expect(screen.getByLabelText(/two-wheeler km per week/i)).toHaveValue(120);
    expect(screen.getByLabelText(/monthly electricity/i)).toHaveValue(100);
    expect(screen.getByLabelText(/diet type/i)).toHaveValue("mixed");
  });
});
