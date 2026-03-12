import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "@/features/forms/contact-form";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows validation errors and does not submit invalid payloads", async () => {
    const user = userEvent.setup();

    render(<ContactForm />);

    await user.click(
      screen.getByRole("button", {
        name: "Send message",
      }),
    );

    expect(await screen.findByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(
      screen.getByText("Share enough detail so the team can follow up."),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});
