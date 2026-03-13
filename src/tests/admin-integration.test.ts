function createServerEnvMock(overrides: Record<string, string> = {}) {
  return {
    ADMIN_ROUTE_SEGMENT: "operator",
    ADMIN_AUTH_MODE: "mock",
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

describe("admin integration snapshot", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("reports local mock posture when both auth and data are mocked", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
        NEXT_PUBLIC_USE_MOCK_DATA: true,
        NEXT_PUBLIC_DOWNLOAD_IOS_URL: "https://apps.apple.com/app/id000000000",
        NEXT_PUBLIC_DOWNLOAD_ANDROID_URL:
          "https://play.google.com/store/apps/details?id=com.reziphay.app",
        NEXT_PUBLIC_CONTACT_EMAIL: "hello@reziphay.com",
      },
      serverEnv: createServerEnvMock(),
    }));

    const { getAdminIntegrationSnapshot } = await import(
      "@/lib/config/admin-integration"
    );
    const snapshot = getAdminIntegrationSnapshot({
      mode: "mock",
      email: "ops@reziphay.local",
      issuedAt: "2026-03-13T00:00:00.000Z",
    });

    expect(snapshot.authMode).toBe("mock");
    expect(snapshot.dataMode).toBe("mock");
    expect(snapshot.warnings.some((warning) => warning.title.includes("Local mock"))).toBe(
      true,
    );
    expect(snapshot.groups[0].endpoints[0].path).toBe("/admin/auth/login");
  });

  it("surfaces hybrid warnings when remote data is enabled without remote auth", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
        NEXT_PUBLIC_DOWNLOAD_IOS_URL: "https://apps.apple.com/app/id000000000",
        NEXT_PUBLIC_DOWNLOAD_ANDROID_URL:
          "https://play.google.com/store/apps/details?id=com.reziphay.app",
        NEXT_PUBLIC_CONTACT_EMAIL: "hello@reziphay.com",
      },
      serverEnv: createServerEnvMock({
        ADMIN_AUTH_MODE: "mock",
        ADMIN_ACTIVITY_PATH: "/ops/activity-feed",
      }),
    }));

    const { getAdminIntegrationSnapshot } = await import(
      "@/lib/config/admin-integration"
    );
    const snapshot = getAdminIntegrationSnapshot({
      mode: "mock",
      email: "ops@reziphay.local",
      issuedAt: "2026-03-13T00:00:00.000Z",
    });

    expect(snapshot.dataMode).toBe("remote");
    expect(
      snapshot.warnings.some((warning) =>
        warning.title.includes("Hybrid mode: remote data with mock auth"),
      ),
    ).toBe(true);
    expect(snapshot.groups.some((group) => group.title === "Mutation contract")).toBe(
      true,
    );
    expect(
      snapshot.groups
        .flatMap((group) => group.endpoints)
        .some((endpoint) => endpoint.path === "/ops/activity-feed"),
    ).toBe(true);
  });

  it("warns when remote auth is configured but the current session lacks a backend token", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
        NEXT_PUBLIC_DOWNLOAD_IOS_URL: "https://apps.apple.com/app/id000000000",
        NEXT_PUBLIC_DOWNLOAD_ANDROID_URL:
          "https://play.google.com/store/apps/details?id=com.reziphay.app",
        NEXT_PUBLIC_CONTACT_EMAIL: "hello@reziphay.com",
      },
      serverEnv: createServerEnvMock({
        ADMIN_AUTH_MODE: "remote",
      }),
    }));

    const { getAdminIntegrationSnapshot } = await import(
      "@/lib/config/admin-integration"
    );
    const snapshot = getAdminIntegrationSnapshot({
      mode: "mock",
      email: "ops@reziphay.local",
      issuedAt: "2026-03-13T00:00:00.000Z",
    });

    expect(
      snapshot.warnings.some((warning) =>
        warning.title.includes("Current session is not backend-issued"),
      ),
    ).toBe(true);
    expect(
      snapshot.warnings.some((warning) =>
        warning.title.includes("Remote access token is missing"),
      ),
    ).toBe(true);
  });
});
