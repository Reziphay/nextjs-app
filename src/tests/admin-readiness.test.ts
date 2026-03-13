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

describe("admin backend readiness", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("skips remote probes while mock data is active", async () => {
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

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { getAdminBackendReadiness } = await import("@/lib/config/admin-readiness");
    const readiness = await getAdminBackendReadiness(null);

    expect(readiness.counts.skipped).toBe(readiness.probes.length);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps remote probe responses into readiness statuses", async () => {
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
      serverEnv: createServerEnvMock(),
    }));

    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/admin/overview")) {
        return Promise.resolve({ ok: true, status: 200 });
      }

      if (url.endsWith("/admin/reports")) {
        return Promise.resolve({ ok: false, status: 401 });
      }

      if (url.endsWith("/admin/users")) {
        return Promise.resolve({ ok: false, status: 404 });
      }

      if (url.endsWith("/admin/brands")) {
        return Promise.reject(new Error("connect ECONNREFUSED"));
      }

      return Promise.resolve({ ok: true, status: 200 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const { getAdminBackendReadiness } = await import("@/lib/config/admin-readiness");
    const readiness = await getAdminBackendReadiness({
      mode: "remote",
      email: "ops@reziphay.local",
      accessToken: "remote-token",
      issuedAt: "2026-03-13T00:00:00.000Z",
    });

    expect(readiness.counts.ready).toBe(6);
    expect(readiness.counts.unauthorized).toBe(1);
    expect(readiness.counts.missing).toBe(1);
    expect(readiness.counts.failing).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.reziphay.test/admin/overview",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
  });
});
