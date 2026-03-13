import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { AdminLoginForm } from "@/features/admin-auth/login-form";

describe("AdminLoginForm", () => {
  it("shows an inline error on failed login", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Credentials do not match the configured admin account.",
        }),
      }),
    );

    render(<AdminLoginForm adminRoute="operator" nextPath="/operator" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ops@reziphay.local" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(
        screen.getByText("Credentials do not match the configured admin account."),
      ).toBeInTheDocument();
    });
  });

  it("submits and redirects on success", async () => {
    const originalLocation = window.location;
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
        }),
      }),
    );

    render(<AdminLoginForm adminRoute="operator" nextPath="/operator/reports" />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ops@reziphay.local" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "reziphay-admin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("/operator/reports");
    });

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
