import {
  createSponsorshipCampaign,
  createVisibilityAssignment,
  submitReportAction,
  submitUserAction,
} from "@/lib/api/admin-mutations";

const mockSession = {
  mode: "mock" as const,
  email: "ops@reziphay.local",
  issuedAt: "2026-03-13T16:30:00.000Z",
};

describe("admin mutation adapters", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("accepts report and user actions in mock mode", async () => {
    const reportResult = await submitReportAction(
      {
        reportId: "rpt-4021",
        action: "resolve",
        reason: "Evidence confirms the report.",
      },
      mockSession,
    );
    const userResult = await submitUserAction(
      {
        userId: "usr-1002",
        action: "suspend",
        reason: "Penalty state requires temporary restriction.",
      },
      mockSession,
    );

    expect(reportResult.ok).toBe(true);
    expect(userResult.ok).toBe(true);
  });

  it("accepts visibility and sponsorship creation in mock mode", async () => {
    const visibilityResult = await createVisibilityAssignment(
      {
        label: "VIP",
        targetType: "brand",
        targetId: "brd-11",
        startsAt: "2026-03-13",
        endsAt: "2026-04-13",
        note: "Visibility promotion for a high-quality brand.",
      },
      mockSession,
    );
    const sponsorshipResult = await createSponsorshipCampaign(
      {
        campaignName: "Homepage highlight",
        targetType: "brand",
        targetId: "brd-11",
        startsAt: "2026-03-13",
        endsAt: "2026-04-13",
        note: "Sponsored brand campaign for launch visibility.",
      },
      mockSession,
    );

    expect(visibilityResult.ok).toBe(true);
    expect(sponsorshipResult.ok).toBe(true);
  });

  it("uses configured remote endpoint templates", async () => {
    vi.doMock("@/lib/config/env", () => ({
      publicEnv: {
        NEXT_PUBLIC_API_BASE_URL: "https://api.reziphay.test",
        NEXT_PUBLIC_USE_MOCK_DATA: false,
      },
      serverEnv: {
        ADMIN_ROUTE_SEGMENT: "operator",
        ADMIN_AUTH_MODE: "remote",
        ADMIN_AUTH_LOGIN_PATH: "/admin/auth/login",
        ADMIN_AUTH_LOGOUT_PATH: "/admin/auth/logout",
        ADMIN_OVERVIEW_PATH: "/admin/overview",
        ADMIN_REPORTS_PATH: "/admin/reports",
        ADMIN_REPORT_DETAIL_PATH: "/admin/reports/:id",
        ADMIN_REPORT_ACTION_PATH: "/ops/reports/:id/decision/:action",
        ADMIN_USERS_PATH: "/admin/users",
        ADMIN_USER_DETAIL_PATH: "/admin/users/:id",
        ADMIN_USER_ADMIN_DETAIL_PATH: "/admin/users/:id/detail",
        ADMIN_USER_ACTION_PATH: "/ops/users/:id/account/:action",
        ADMIN_BRANDS_PATH: "/admin/brands",
        ADMIN_BRAND_DETAIL_PATH: "/admin/brands/:id",
        ADMIN_BRAND_ADMIN_DETAIL_PATH: "/admin/brands/:id/detail",
        ADMIN_SERVICES_PATH: "/admin/services",
        ADMIN_SERVICE_DETAIL_PATH: "/admin/services/:id",
        ADMIN_SERVICE_ADMIN_DETAIL_PATH: "/admin/services/:id/detail",
        ADMIN_ANALYTICS_OVERVIEW_PATH: "/admin/analytics/overview",
        ADMIN_VISIBILITY_LABELS_PATH: "/ops/visibility",
        ADMIN_VISIBILITY_LABEL_ASSIGN_PATH: "/ops/visibility/:id/assign",
        ADMIN_SPONSORED_VISIBILITY_PATH: "/ops/campaigns",
        ADMIN_ACTIVITY_PATH: "/admin/activity",
        ADMIN_LOGIN_EMAIL: "ops@reziphay.local",
        ADMIN_LOGIN_PASSWORD: "reziphay-admin",
      },
    }));

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ id: "lbl-remote-1", name: "VIP", slug: "vip" }],
        }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: null }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: null }) });
    vi.stubGlobal("fetch", fetchMock);

    const {
      createSponsorshipCampaign,
      createVisibilityAssignment,
      submitReportAction,
      submitUserAction,
    } = await import("@/lib/api/admin-mutations");

    const remoteSession = {
      mode: "remote" as const,
      email: "ops@reziphay.local",
      accessToken: "remote-token",
      issuedAt: "2026-03-13T16:30:00.000Z",
    };

    await submitReportAction(
      {
        reportId: "rpt-4021",
        action: "resolve",
        reason: "Evidence confirmed.",
      },
      remoteSession,
    );
    await submitUserAction(
      {
        userId: "usr-1002",
        action: "suspend",
        reason: "Penalty cluster confirmed.",
      },
      remoteSession,
    );
    await createVisibilityAssignment(
      {
        label: "VIP",
        targetType: "brand",
        targetId: "brd-11",
        startsAt: "2026-03-13",
        endsAt: "2026-04-13",
        note: "Visibility promotion for a high-quality brand.",
      },
      remoteSession,
    );
    await createSponsorshipCampaign(
      {
        campaignName: "Homepage highlight",
        targetType: "brand",
        targetId: "brd-11",
        startsAt: "2026-03-13",
        endsAt: "2026-04-13",
        note: "Sponsored brand campaign for launch visibility.",
      },
      remoteSession,
    );

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api.reziphay.test/ops/reports/rpt-4021/decision/resolve",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.reziphay.test/ops/users/usr-1002/account/suspend",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://api.reziphay.test/ops/visibility?targetType=BRAND",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          Authorization: "Bearer remote-token",
        }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "https://api.reziphay.test/ops/visibility/lbl-remote-1/assign",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      "https://api.reziphay.test/ops/campaigns",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
