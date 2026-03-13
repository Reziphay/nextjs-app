import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ProviderInquiryForm } from "@/features/marketing/provider-inquiry-form";

describe("ProviderInquiryForm", () => {
  it("shows a success state after a valid submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
        }),
      }),
    );

    render(<ProviderInquiryForm />);

    fireEvent.change(screen.getByLabelText("Contact name"), {
      target: { value: "Ayla Mammadova" },
    });
    fireEvent.change(screen.getByLabelText("Business or brand"), {
      target: { value: "Calm Studio" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "owner@calmstudio.az" },
    });
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "+994501112233" },
    });
    fireEvent.change(screen.getByLabelText("Current workflow"), {
      target: {
        value:
          "We manage requests through phone calls and messaging, and we need a flexible approval process without rigid slots.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send provider inquiry" }));

    await waitFor(() => {
      expect(
        screen.getByText("Your inquiry was accepted for provider follow-up."),
      ).toBeInTheDocument();
    });
  });
});
