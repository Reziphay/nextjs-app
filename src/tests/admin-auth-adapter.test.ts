import { loginAdmin } from "@/lib/api/admin-auth";

describe("loginAdmin", () => {
  it("accepts the configured mock credentials", async () => {
    const result = await loginAdmin({
      email: "ops@reziphay.local",
      password: "reziphay-admin",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected mock login to succeed.");
    }

    expect(result.session.mode).toBe("mock");
    expect(result.session.email).toBe("ops@reziphay.local");
  });

  it("rejects invalid mock credentials", async () => {
    const result = await loginAdmin({
      email: "ops@reziphay.local",
      password: "wrong-pass",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected mock login to fail.");
    }

    expect(result.status).toBe(401);
  });
});
