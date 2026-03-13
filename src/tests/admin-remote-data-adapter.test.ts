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

describe("remote admin data adapter", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("forwards the admin access token and accepts detail payload variants", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: createServerEnvMock(),
    }));
    vi.doMock("@/lib/auth/admin-auth", () => ({
      readAdminSession: vi.fn().mockResolvedValue({
        mode: "remote",
        email: "ops@reziphay.local",
        accessToken: "remote-token",
        issuedAt: "2026-03-13T00:00:00.000Z",
      }),
    }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          user: {
            id: "usr-remote-1",
            name: "Remote Operator",
            roles: ["USO"],
            state: "active",
            penaltyPoints: 0,
            brands: 1,
            services: 1,
            joinedAt: "2026-02-01T00:00:00.000Z",
            completedReservations: 17,
            linkedBrandIds: ["brd-remote-1"],
            linkedServiceIds: ["srv-remote-1"],
          },
          brands: [
            {
              id: "brd-remote-1",
              name: "Remote Brand",
              ownerId: "usr-remote-1",
              owner: "Remote Operator",
              members: 2,
              memberNames: ["Remote Operator", "Support Member"],
              services: 1,
              serviceIds: ["srv-remote-1"],
              visibility: ["Featured"],
              status: "healthy",
              responseReliability: "93% in approval window",
            },
          ],
          services: [
            {
              id: "srv-remote-1",
              name: "Remote Service",
              providerId: "usr-remote-1",
              provider: "Remote Operator",
              brandId: "brd-remote-1",
              brand: "Remote Brand",
              visibility: ["Featured"],
              status: "active",
              requestsToday: 5,
              category: "Wellness",
              reservationMode: "manual",
              waitingTimeMinutes: 20,
              leadTimeLabel: "Same day to 10 days",
            },
          ],
          reports: [
            {
              id: "rpt-remote-1",
              subject: "Remote detail report",
              targetType: "user",
              targetId: "usr-remote-1",
              status: "open",
              reason: "Needs operator review.",
              submittedAt: "2026-03-13T08:00:00.000Z",
              priority: "medium",
              reporterLabel: "Admin audit",
            },
          ],
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const { getUserAdminDetail } = await import("@/lib/api/admin");
    const detail = await getUserAdminDetail("usr-remote-1");

    expect(detail?.user.id).toBe("usr-remote-1");
    expect(detail?.relatedBrands.map((brand) => brand.id)).toEqual(["brd-remote-1"]);
    expect(detail?.relatedServices.map((service) => service.id)).toEqual([
      "srv-remote-1",
    ]);
    expect(detail?.relatedReports.map((report) => report.id)).toEqual([
      "rpt-remote-1",
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.reziphay.test/admin/users/usr-remote-1/detail",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
  });

  it("falls back from missing detail endpoints to the base entity endpoint", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: createServerEnvMock(),
    }));
    vi.doMock("@/lib/auth/admin-auth", () => ({
      readAdminSession: vi.fn().mockResolvedValue({
        mode: "remote",
        email: "ops@reziphay.local",
        accessToken: "remote-token",
        issuedAt: "2026-03-13T00:00:00.000Z",
      }),
    }));

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            id: "srv-remote-2",
            name: "Fallback Service",
            providerId: "usr-remote-2",
            provider: "Fallback Operator",
            brandId: "brd-remote-2",
            brand: "Fallback Brand",
            visibility: [],
            status: "paused",
            requestsToday: 1,
            category: "Dental",
            reservationMode: "manual",
            waitingTimeMinutes: 15,
            leadTimeLabel: "1 day to 7 days",
          },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const { getServiceAdminDetail } = await import("@/lib/api/admin");
    const detail = await getServiceAdminDetail("srv-remote-2");

    expect(detail?.service.id).toBe("srv-remote-2");
    expect(detail?.provider).toBeNull();
    expect(detail?.brand).toBeNull();
    expect(detail?.relatedReports).toEqual([]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.reziphay.test/admin/services/srv-remote-2/detail",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.reziphay.test/admin/services/srv-remote-2",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
  });

  it("normalizes remote collection payloads for operations pages", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: createServerEnvMock({
        ADMIN_VISIBILITY_LABELS_PATH: "/ops/labels",
        ADMIN_SPONSORED_VISIBILITY_PATH: "/ops/sponsored",
        ADMIN_ACTIVITY_PATH: "/ops/activity-feed",
      }),
    }));
    vi.doMock("@/lib/auth/admin-auth", () => ({
      readAdminSession: vi.fn().mockResolvedValue({
        mode: "remote",
        email: "ops@reziphay.local",
        accessToken: "remote-token",
        issuedAt: "2026-03-13T00:00:00.000Z",
      }),
    }));

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            assignments: [
              {
                id: "vis-remote-1",
                label: "Featured",
                targetId: "brd-remote-1",
                targetName: "Remote Brand",
                targetType: "brand",
                startsAt: "2026-03-01T00:00:00.000Z",
                endsAt: "2026-03-31T23:59:59.000Z",
                note: "Remote visibility record.",
                status: "active",
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            campaigns: [
              {
                id: "spn-remote-1",
                campaignName: "Remote spotlight",
                targetId: "srv-remote-1",
                targetName: "Remote Service",
                targetType: "service",
                startsAt: "2026-03-10T00:00:00.000Z",
                endsAt: "2026-03-20T23:59:59.000Z",
                note: "Remote sponsored record.",
                status: "active",
                performanceLabel: "8.2k impressions",
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            activity: [
              {
                id: "act-remote-1",
                title: "Remote event",
                detail: "Backend-driven activity item.",
                time: "2 min ago",
                category: "sponsorship",
                actor: "Growth ops",
              },
            ],
          },
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const {
      getActivityFeed,
      getSponsorshipCampaigns,
      getVisibilityAssignments,
    } = await import("@/lib/api/admin");

    const assignments = await getVisibilityAssignments();
    const campaigns = await getSponsorshipCampaigns();
    const activity = await getActivityFeed();

    expect(assignments.map((assignment) => assignment.id)).toEqual(["vis-remote-1"]);
    expect(campaigns.map((campaign) => campaign.id)).toEqual(["spn-remote-1"]);
    expect(activity.map((item) => item.id)).toEqual(["act-remote-1"]);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.reziphay.test/ops/labels",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
  });

  it("uses configured custom detail path templates", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: createServerEnvMock({
        ADMIN_USER_ADMIN_DETAIL_PATH: "/ops/members/:id/context",
        ADMIN_USER_DETAIL_PATH: "/ops/members/:id",
      }),
    }));
    vi.doMock("@/lib/auth/admin-auth", () => ({
      readAdminSession: vi.fn().mockResolvedValue({
        mode: "remote",
        email: "ops@reziphay.local",
        accessToken: "remote-token",
        issuedAt: "2026-03-13T00:00:00.000Z",
      }),
    }));

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          user: {
            id: "usr-remote-3",
            name: "Custom Route Operator",
            roles: ["USO"],
            state: "active",
            penaltyPoints: 0,
            brands: 0,
            services: 0,
            joinedAt: "2026-01-01T00:00:00.000Z",
            completedReservations: 2,
            linkedBrandIds: [],
            linkedServiceIds: [],
          },
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const { getUserAdminDetail } = await import("@/lib/api/admin");
    await getUserAdminDetail("usr-remote-3");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.reziphay.test/ops/members/usr-remote-3/context",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
  });
});
