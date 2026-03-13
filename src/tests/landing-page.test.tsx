import { render, screen } from "@testing-library/react";

import LandingPage from "@/app/(public)/page";

describe("LandingPage", () => {
  it("renders the primary CTAs", () => {
    render(<LandingPage />);

    expect(
      screen.getByRole("link", { name: "Get the app" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "For businesses" }),
    ).toBeInTheDocument();
  });
});
