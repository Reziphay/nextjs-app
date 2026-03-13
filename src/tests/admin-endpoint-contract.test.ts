function createServerEnvMock(overrides: Record<string, string> = {}) {
  return {
    ADMIN_ROUTE_SEGMENT: "operator",
    ADMIN_AUTH_MODE: "remote",
    ADMIN_AUTH_LOGIN_PATH: "/admin/auth/login",
    ADMIN_AUTH_LOGOUT_PATH: "/admin/auth/logout",
    ADMIN_OVERVIEW_PATH: "/admin/overview",
    ADMIN_REPORTS_PATH: "/admin/reports",
    ADMIN_REPORT_DETAIL_PATH: "/admin/reports/:id",
    ADMIN_REPORT_ACTION_PATH: "/admin/reports/:id/:action",
    ADMIN_USERS_PATH: "/admin/users",
    ADMIN_USER_DETAIL_PATH: "/admin/users/:id",
    ADMIN_USER_ADMIN_DETAIL_PATH: "/admin/users/:id/detail",
    ADMIN_USER_ACTION_PATH: "/admin/users/:id/:action",
    ADMIN_BRANDS_PATH: "/admin/brands",
    ADMIN_BRAND_DETAIL_PATH: "/admin/brands/:id",
    ADMIN_BRAND_ADMIN_DETAIL_PATH: "/admin/brands/:id/detail",
    ADMIN_SERVICES_PATH: "/admin/services",
    ADMIN_SERVICE_DETAIL_PATH: "/admin/services/:id",
    ADMIN_SERVICE_ADMIN_DETAIL_PATH: "/admin/services/:id/detail",
    ADMIN_ANALYTICS_OVERVIEW_PATH: "/admin/analytics/overview",
    ADMIN_VISIBILITY_LABELS_PATH: "/admin/visibility-labels",
    ADMIN_SPONSORED_VISIBILITY_PATH: "/admin/sponsored-visibility",
    ADMIN_ACTIVITY_PATH: "/admin/activity",
    ADMIN_LOGIN_EMAIL: "ops@reziphay.local",
    ADMIN_LOGIN_PASSWORD: "reziphay-admin",
    ...overrides,
  };
}

describe("admin endpoint contract", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("compiles custom endpoint templates with named parameters", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: createServerEnvMock({
        ADMIN_REPORT_ACTION_PATH: "/ops/reports/:id/decision/:action",
      }),
    }));

    const { adminEndpointTemplates, compileAdminEndpoint } = await import(
      "@/lib/config/admin-endpoints"
    );

    expect(
      compileAdminEndpoint(adminEndpointTemplates.reportAction, {
        id: "rpt-4021",
        action: "resolve",
      }),
    ).toBe("/ops/reports/rpt-4021/decision/resolve");
  });

  it("throws on missing endpoint parameters", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: createServerEnvMock(),
    }));

    const { compileAdminEndpoint } = await import("@/lib/config/admin-endpoints");

    expect(() =>
      compileAdminEndpoint("/ops/reports/:id/:action", { id: "rpt-4021" }),
    ).toThrow('Missing admin endpoint parameter "action"');
  });
});
