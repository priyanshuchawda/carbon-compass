import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

describe("site shell", () => {
  it("offers primary navigation to product routes", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /carbon compass home/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calculator/i })).toHaveAttribute(
      "href",
      "/calculator"
    );
    expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute("href", "/dashboard");
  });

  it("states the educational estimate disclaimer", () => {
    render(<SiteFooter />);

    expect(
      screen.getByText(/educational estimates based on configurable emission factors/i)
    ).toBeInTheDocument();
  });
});
