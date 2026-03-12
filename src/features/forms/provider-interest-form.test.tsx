import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProviderInterestForm } from "@/features/forms/provider-interest-form";

describe("ProviderInterestForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors and blocks invalid submissions", async () => {
    const user = userEvent.setup();

    render(<ProviderInterestForm />);

    await user.click(
      screen.getByRole("button", {
        name: "Submit provider interest",
      }),
    );

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(
      screen.getByText("Enter the business or brand name."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tell us how you want to use Reziphay."),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
