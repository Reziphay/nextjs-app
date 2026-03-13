import {
  buildAdminLoginRedirect,
  parseAdminSession,
  resolveAdminGuard,
  serializeAdminSession,
  sanitizeNextPath,
} from "@/lib/auth/admin-auth";

describe("resolveAdminGuard", () => {
  it("returns a redirect for unauthenticated access", () => {
    const result = resolveAdminGuard({
      adminRoute: "operator",
      isAuthenticated: false,
      pathname: "/operator/reports",
    });

    expect(result.allowed).toBe(false);
    if (result.allowed) {
      throw new Error("Expected unauthenticated guard result.");
    }

    expect(result.redirectTo).toContain("/operator/login");
    expect(result.redirectTo).toContain(encodeURIComponent("/operator/reports"));
  });
});

describe("sanitizeNextPath", () => {
  it("rejects external redirect targets", () => {
    expect(sanitizeNextPath("https://example.com", "/operator")).toBe("/operator");
    expect(sanitizeNextPath("//example.com", "/operator")).toBe("/operator");
  });

  it("keeps internal admin paths", () => {
    expect(sanitizeNextPath("/operator/reports?status=open", "/operator")).toBe(
      "/operator/reports?status=open",
    );
  });
});

describe("buildAdminLoginRedirect", () => {
  it("preserves the exact protected path in the login redirect", () => {
    expect(buildAdminLoginRedirect("/operator/users/123?tab=reports", "operator")).toBe(
      "/operator/login?next=%2Foperator%2Fusers%2F123%3Ftab%3Dreports",
    );
  });
});

describe("admin session serialization", () => {
  it("round-trips a typed admin session cookie payload", () => {
    const serialized = serializeAdminSession({
      mode: "mock",
      email: "ops@reziphay.local",
      issuedAt: "2026-03-13T16:00:00.000Z",
    });

    expect(parseAdminSession(serialized)).toEqual({
      mode: "mock",
      email: "ops@reziphay.local",
      issuedAt: "2026-03-13T16:00:00.000Z",
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
    });
  });
});
