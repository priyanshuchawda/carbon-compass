/**
 * Tests for components/carbon/onboarding-form.tsx
 *
 * Verifies:
 * - Form renders all expected fields
 * - Submit button is present
 * - Submitting saves the profile to sessionStorage
 * - Router navigates to /calculator on submit
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "@/components/carbon/onboarding-form";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const { mockSaveProfile } = vi.hoisted(() => ({
  mockSaveProfile: vi.fn().mockReturnValue({ ok: true }),
}));

vi.mock("@/lib/carbon/session", () => ({
  saveSessionProfile: mockSaveProfile,
}));

describe("OnboardingForm", () => {
  it("renders all expected input fields", () => {
    render(<OnboardingForm />);

    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/household size/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/persona/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/main goal/i)).toBeInTheDocument();
  });

  it("has a visible submit button", () => {
    render(<OnboardingForm />);

    expect(screen.getByRole("button", { name: /continue to calculator/i })).toBeInTheDocument();
  });

  it("saves profile and navigates to /calculator on submit", async () => {
    const user = userEvent.setup();
    render(<OnboardingForm />);

    await user.click(screen.getByRole("button", { name: /continue to calculator/i }));

    expect(mockSaveProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        city: "Pune",
        country: "India",
        persona: "student",
      })
    );
    expect(mockPush).toHaveBeenCalledWith("/calculator");
  });

  it("persists user-edited city in saved profile", async () => {
    const user = userEvent.setup();
    render(<OnboardingForm />);

    const cityInput = screen.getByLabelText(/city/i);
    await user.clear(cityInput);
    await user.type(cityInput, "Mumbai");

    await user.click(screen.getByRole("button", { name: /continue to calculator/i }));

    expect(mockSaveProfile).toHaveBeenCalledWith(expect.objectContaining({ city: "Mumbai" }));
  });

  it("persists selected goal in saved profile", async () => {
    const user = userEvent.setup();
    render(<OnboardingForm />);

    const goalSelect = screen.getByLabelText(/main goal/i);
    await user.selectOptions(goalSelect, "save_money");

    await user.click(screen.getByRole("button", { name: /continue to calculator/i }));

    expect(mockSaveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ mainGoal: "save_money" })
    );
  });
});
