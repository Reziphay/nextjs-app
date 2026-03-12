import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("renders primary navigation items", () => {
    render(<SiteHeader />);

    expect(screen.getAllByRole("link", { name: "Features" }).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("link", { name: "For customers" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Contact" }).length).toBeGreaterThan(0);
    expect(
      screen.getByLabelText("Open navigation menu"),
    ).toBeInTheDocument();
  });
});
