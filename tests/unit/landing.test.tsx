import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("landing page", () => {
  it("presents Carbon Compass with primary judge demo routes", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /track your lifestyle carbon footprint/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /calculate my footprint/i }),
    ).toHaveAttribute("href", "/calculator");
    expect(
      screen.getByRole("link", { name: /view demo dashboard/i }),
    ).toHaveAttribute("href", "/dashboard");
  });
});
