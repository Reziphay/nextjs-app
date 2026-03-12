import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("renders primary navigation items", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "For customers" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
    expect(
      screen.getByLabelText("Open navigation menu"),
    ).toBeInTheDocument();
  });
});
