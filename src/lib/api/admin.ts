import { publicEnv } from "@/lib/config/env";
import { ApiError, fetchJson } from "@/lib/api/http";
import {
  adminEndpointTemplates,
  compileAdminEndpoint,
} from "@/lib/config/admin-endpoints";
import {
  activityRecords,
  adminOverview,
  analyticsSeries,
  brandRecords,
  reportRecords,
  serviceRecords,
  sponsorshipCampaignRecords,
  userRecords,
  visibilityAssignmentRecords,
} from "@/lib/mock/admin-data";
import type {
  ActivityRecord,
  AdminOverview,
  AdminStatus,
  AnalyticsSeries,
  BrandAdminDetail,
  BrandRecord,
  ListResult,
  ReportAdminDetail,
  ReportRecord,
  ServiceAdminDetail,
  ServiceRecord,
  SponsorshipCampaignRecord,
  UserAdminDetail,
  UserRecord,
  VisibilityAssignmentRecord,
} from "@/lib/types/admin";

const DEFAULT_PAGE_SIZE = 4;

type AdminSessionLike = {
  accessToken?: string;
} | null;

export type ReportListOptions = {
  query?: string;
  page?: number;
  status?: "all" | AdminStatus;
};

export type UserListOptions = {
  query?: string;
  page?: number;
  state?: "all" | UserRecord["state"];
};

export type BrandListOptions = {
  query?: string;
  page?: number;
  status?: "all" | BrandRecord["status"];
};

export type ServiceListOptions = {
  query?: string;
  page?: number;
  status?: "all" | ServiceRecord["status"];
};

function normalizeQuery(query?: string) {
  return query?.trim().toLowerCase();
}

function normalizePage(page?: number) {
  if (!page || Number.isNaN(page) || page < 1) {
    return 1;
  }

  return page;
}

function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): ListResult<T> {
  const normalizedPage = normalizePage(page);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(normalizedPage, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
    totalPages,
    counts: {},
  };
}

function countBy<T>(items: T[], getValue: (item: T) => string) {
  return items.reduce<Record<string, number>>(
    (counts, item) => ({
      ...counts,
      [getValue(item)]: (counts[getValue(item)] ?? 0) + 1,
    }),
    { all: items.length },
  );
}

function matchesQuery(values: string[], query?: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.join(" ").toLowerCase().includes(normalizedQuery);
}

function buildQueryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") {
      return;
    }

    search.set(key, String(value));
  });

  const suffix = search.toString();

  return suffix ? `?${suffix}` : "";
}

function shouldUseMockData() {
  return publicEnv.NEXT_PUBLIC_USE_MOCK_DATA;
}

function buildAdminHeaders(session: AdminSessionLike) {
  const headers: Record<string, string> = {};

  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  return headers;
}

async function readRemoteAdminSession(): Promise<AdminSessionLike> {
  try {
    const { readAdminSession } = await import("@/lib/auth/admin-auth");

    return await readAdminSession();
  } catch {
    return null;
  }
}

async function fetchAdmin<T>(path: string, session?: AdminSessionLike) {
  const resolvedSession =
    session === undefined ? await readRemoteAdminSession() : session;

  return fetchJson<T>(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: buildAdminHeaders(resolvedSession),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readArray<T>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function isUserRecord(value: unknown): value is UserRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    Array.isArray(value.roles)
  );
}

function isBrandRecord(value: unknown): value is BrandRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.owner === "string"
  );
}

function isReportRecord(value: unknown): value is ReportRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.subject === "string" &&
    typeof value.targetType === "string" &&
    typeof value.targetId === "string" &&
    typeof value.status === "string" &&
    typeof value.reason === "string" &&
    typeof value.submittedAt === "string" &&
    typeof value.priority === "string" &&
    typeof value.reporterLabel === "string"
  );
}

function isServiceRecord(value: unknown): value is ServiceRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.provider === "string" &&
    typeof value.brand === "string"
  );
}

function isActivityRecord(value: unknown): value is ActivityRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.time === "string"
  );
}

function isVisibilityAssignmentRecord(
  value: unknown,
): value is VisibilityAssignmentRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.label === "string" &&
    typeof value.targetId === "string" &&
    typeof value.targetName === "string"
  );
}

function isSponsorshipCampaignRecord(
  value: unknown,
): value is SponsorshipCampaignRecord {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.campaignName === "string" &&
    typeof value.targetId === "string" &&
    typeof value.targetName === "string"
  );
}

function normalizeUserAdminDetailPayload(payload: unknown): UserAdminDetail | null {
  if (isUserRecord(payload)) {
    return {
      user: payload,
      relatedBrands: [],
      relatedServices: [],
      relatedReports: [],
    };
  }

  if (!isRecord(payload) || !isUserRecord(payload.user)) {
    return null;
  }

  return {
    user: payload.user,
    relatedBrands: readArray<BrandRecord>(payload.relatedBrands ?? payload.brands),
    relatedServices: readArray<ServiceRecord>(
      payload.relatedServices ?? payload.services,
    ),
    relatedReports: readArray<ReportRecord>(payload.relatedReports ?? payload.reports),
  };
}

function normalizeBrandAdminDetailPayload(payload: unknown): BrandAdminDetail | null {
  if (isBrandRecord(payload)) {
    return {
      brand: payload,
      relatedServices: [],
      relatedReports: [],
    };
  }

  if (!isRecord(payload) || !isBrandRecord(payload.brand)) {
    return null;
  }

  return {
    brand: payload.brand,
    relatedServices: readArray<ServiceRecord>(
      payload.relatedServices ?? payload.services,
    ),
    relatedReports: readArray<ReportRecord>(payload.relatedReports ?? payload.reports),
  };
}

function normalizeServiceAdminDetailPayload(payload: unknown): ServiceAdminDetail | null {
  if (isServiceRecord(payload)) {
    return {
      service: payload,
      relatedReports: [],
      provider: null,
      brand: null,
    };
  }

  if (!isRecord(payload) || !isServiceRecord(payload.service)) {
    return null;
  }

  return {
    service: payload.service,
    relatedReports: readArray<ReportRecord>(payload.relatedReports ?? payload.reports),
    provider: isUserRecord(payload.provider) ? payload.provider : null,
    brand: isBrandRecord(payload.brand) ? payload.brand : null,
  };
}

function createReportAdminDetail(
  report: ReportRecord,
  detail: Partial<Omit<ReportAdminDetail, "report">> = {},
): ReportAdminDetail {
  return {
    report,
    targetUser: detail.targetUser ?? null,
    targetBrand: detail.targetBrand ?? null,
    targetService: detail.targetService ?? null,
    serviceProvider: detail.serviceProvider ?? null,
    serviceBrand: detail.serviceBrand ?? null,
    relatedReports: detail.relatedReports ?? [],
  };
}

function normalizeReportAdminDetailPayload(payload: unknown): ReportAdminDetail | null {
  if (isReportRecord(payload)) {
    return createReportAdminDetail(payload);
  }

  if (!isRecord(payload) || !isReportRecord(payload.report)) {
    return null;
  }

  const report = payload.report;
  const target = payload.target;
  const targetBrand =
    (isBrandRecord(payload.targetBrand) ? payload.targetBrand : null) ??
    (report.targetType === "brand" && isBrandRecord(target) ? target : null) ??
    (report.targetType === "brand" && isBrandRecord(payload.brand)
      ? payload.brand
      : null);
  const targetUser =
    (isUserRecord(payload.targetUser) ? payload.targetUser : null) ??
    (report.targetType === "user" && isUserRecord(target) ? target : null) ??
    (report.targetType === "user" && isUserRecord(payload.user) ? payload.user : null);
  const targetService =
    (isServiceRecord(payload.targetService) ? payload.targetService : null) ??
    ((report.targetType === "service" || report.targetType === "review") &&
    isServiceRecord(target)
      ? target
      : null) ??
    ((report.targetType === "service" || report.targetType === "review") &&
    isServiceRecord(payload.service)
      ? payload.service
      : null);

  return createReportAdminDetail(report, {
    targetUser,
    targetBrand,
    targetService,
    serviceProvider:
      (isUserRecord(payload.serviceProvider) ? payload.serviceProvider : null) ??
      (isUserRecord(payload.provider) ? payload.provider : null),
    serviceBrand:
      (isBrandRecord(payload.serviceBrand) ? payload.serviceBrand : null) ??
      ((report.targetType === "service" || report.targetType === "review") &&
      isBrandRecord(payload.brand)
        ? payload.brand
        : null),
    relatedReports: readArray<unknown>(payload.relatedReports ?? payload.reports)
      .filter(isReportRecord)
      .filter((relatedReport) => relatedReport.id !== report.id),
  });
}

async function fetchAdminDetailWithFallback<T>(
  detailPath: string,
  fallbackPath: string,
  normalize: (payload: unknown) => T | null,
) {
  const session = await readRemoteAdminSession();

  try {
    const detailPayload = await fetchAdmin<unknown>(detailPath, session);
    const detail = normalize(detailPayload);

    if (detail) {
      return detail;
    }
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      ![404, 405, 501].includes(error.status)
    ) {
      throw error;
    }
  }

  const fallbackPayload = await fetchAdmin<unknown>(fallbackPath, session);

  return normalize(fallbackPayload);
}

async function fetchOptionalAdminDetail<T>(
  path: string,
  normalize: (payload: unknown) => T | null,
  session?: AdminSessionLike,
) {
  try {
    const payload = await fetchAdmin<unknown>(path, session);

    return normalize(payload);
  } catch (error) {
    if (error instanceof ApiError && [404, 405, 501].includes(error.status)) {
      return null;
    }

    throw error;
  }
}

async function fetchOptionalAdminCollection<T>(
  path: string,
  normalize: (payload: unknown) => T[],
) {
  try {
    const payload = await fetchAdmin<unknown>(path);

    return normalize(payload);
  } catch (error) {
    if (error instanceof ApiError && [404, 405, 501].includes(error.status)) {
      return [];
    }

    throw error;
  }
}

function normalizeCollectionPayload<T>(
  payload: unknown,
  isItem: (value: unknown) => value is T,
  keys: string[],
) {
  if (Array.isArray(payload)) {
    return payload.filter(isItem);
  }

  if (!isRecord(payload)) {
    return [] as T[];
  }

  for (const key of ["items", ...keys]) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value.filter(isItem);
    }
  }

  return [] as T[];
}

async function getAdminOverviewMock() {
  return adminOverview;
}

async function getReportsMock(options?: ReportListOptions) {
  const base = reportRecords.filter((report) =>
    matchesQuery(
      [report.subject, report.targetType, report.status, report.reason],
      options?.query,
    ),
  );
  const filtered =
    options?.status && options.status !== "all"
      ? base.filter((report) => report.status === options.status)
      : base;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(base, (report) => report.status),
  } satisfies ListResult<ReportRecord>;
}

async function getReportByIdMock(id: string) {
  return reportRecords.find((report) => report.id === id) ?? null;
}

async function getReportAdminDetailMock(id: string) {
  const report = await getReportByIdMock(id);

  if (!report) {
    return null;
  }

  const targetService =
    report.targetType === "service" || report.targetType === "review"
      ? serviceRecords.find((service) => service.id === report.targetId) ?? null
      : null;

  return createReportAdminDetail(report, {
    targetUser:
      report.targetType === "user"
        ? userRecords.find((user) => user.id === report.targetId) ?? null
        : null,
    targetBrand:
      report.targetType === "brand"
        ? brandRecords.find((brand) => brand.id === report.targetId) ?? null
        : null,
    targetService,
    serviceProvider:
      targetService
        ? userRecords.find((user) => user.id === targetService.providerId) ?? null
        : null,
    serviceBrand:
      targetService
        ? brandRecords.find((brand) => brand.id === targetService.brandId) ?? null
        : null,
    relatedReports: reportRecords.filter(
      (relatedReport) =>
        relatedReport.id !== report.id && relatedReport.targetId === report.targetId,
    ),
  });
}

async function getUsersMock(options?: UserListOptions) {
  const base = userRecords.filter((user) =>
    matchesQuery([user.name, user.state, user.roles.join(" ")], options?.query),
  );
  const filtered =
    options?.state && options.state !== "all"
      ? base.filter((user) => user.state === options.state)
      : base;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(base, (user) => user.state),
  } satisfies ListResult<UserRecord>;
}

async function getUserByIdMock(id: string) {
  return userRecords.find((user) => user.id === id) ?? null;
}

async function getBrandsMock(options?: BrandListOptions) {
  const base = brandRecords.filter((brand) =>
    matchesQuery([brand.name, brand.owner, brand.status], options?.query),
  );
  const filtered =
    options?.status && options.status !== "all"
      ? base.filter((brand) => brand.status === options.status)
      : base;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(base, (brand) => brand.status),
  } satisfies ListResult<BrandRecord>;
}

async function getBrandByIdMock(id: string) {
  return brandRecords.find((brand) => brand.id === id) ?? null;
}

async function getServicesMock(options?: ServiceListOptions) {
  const base = serviceRecords.filter((service) =>
    matchesQuery(
      [service.name, service.provider, service.brand, service.status],
      options?.query,
    ),
  );
  const filtered =
    options?.status && options.status !== "all"
      ? base.filter((service) => service.status === options.status)
      : base;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(base, (service) => service.status),
  } satisfies ListResult<ServiceRecord>;
}

async function getServiceByIdMock(id: string) {
  return serviceRecords.find((service) => service.id === id) ?? null;
}

async function getAnalyticsOverviewMock() {
  return analyticsSeries;
}

async function getVisibilityAssignmentsMock() {
  return visibilityAssignmentRecords;
}

async function getSponsorshipCampaignsMock() {
  return sponsorshipCampaignRecords;
}

async function getActivityFeedMock() {
  return activityRecords;
}

async function getUserAdminDetailMock(id: string) {
  const user = await getUserByIdMock(id);

  if (!user) {
    return null;
  }

  return {
    user,
    relatedBrands: brandRecords.filter((brand) =>
      user.linkedBrandIds.includes(brand.id),
    ),
    relatedServices: serviceRecords.filter((service) =>
      user.linkedServiceIds.includes(service.id),
    ),
    relatedReports: reportRecords.filter((report) => report.targetId === user.id),
  } satisfies UserAdminDetail;
}

async function getBrandAdminDetailMock(id: string) {
  const brand = await getBrandByIdMock(id);

  if (!brand) {
    return null;
  }

  return {
    brand,
    relatedServices: serviceRecords.filter((service) => service.brandId === brand.id),
    relatedReports: reportRecords.filter((report) => report.targetId === brand.id),
  } satisfies BrandAdminDetail;
}

async function getServiceAdminDetailMock(id: string) {
  const service = await getServiceByIdMock(id);

  if (!service) {
    return null;
  }

  return {
    service,
    relatedReports: reportRecords.filter((report) => report.targetId === service.id),
    provider:
      userRecords.find((user) => user.id === service.providerId) ?? null,
    brand: brandRecords.find((brand) => brand.id === service.brandId) ?? null,
  } satisfies ServiceAdminDetail;
}

async function getAdminOverviewRemote() {
  return fetchAdmin<AdminOverview>(adminEndpointTemplates.overview);
}

async function getReportsRemote(options?: ReportListOptions) {
  return fetchAdmin<ListResult<ReportRecord>>(
    `${adminEndpointTemplates.reports}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
  );
}

async function getReportByIdRemote(id: string) {
  return fetchAdmin<ReportRecord | null>(
    compileAdminEndpoint(adminEndpointTemplates.reportDetail, { id }),
  );
}

async function getOptionalUserByIdRemote(id: string, session: AdminSessionLike) {
  return fetchOptionalAdminDetail(
    compileAdminEndpoint(adminEndpointTemplates.userDetail, { id }),
    (payload) => (isUserRecord(payload) ? payload : null),
    session,
  );
}

async function getOptionalBrandByIdRemote(id: string, session: AdminSessionLike) {
  return fetchOptionalAdminDetail(
    compileAdminEndpoint(adminEndpointTemplates.brandDetail, { id }),
    (payload) => (isBrandRecord(payload) ? payload : null),
    session,
  );
}

async function getOptionalServiceByIdRemote(id: string, session: AdminSessionLike) {
  return fetchOptionalAdminDetail(
    compileAdminEndpoint(adminEndpointTemplates.serviceDetail, { id }),
    (payload) => (isServiceRecord(payload) ? payload : null),
    session,
  );
}

async function getUsersRemote(options?: UserListOptions) {
  return fetchAdmin<ListResult<UserRecord>>(
    `${adminEndpointTemplates.users}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.state,
    })}`,
  );
}

async function getUserByIdRemote(id: string) {
  return fetchAdmin<UserRecord | null>(
    compileAdminEndpoint(adminEndpointTemplates.userDetail, { id }),
  );
}

async function getBrandsRemote(options?: BrandListOptions) {
  return fetchAdmin<ListResult<BrandRecord>>(
    `${adminEndpointTemplates.brands}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
  );
}

async function getBrandByIdRemote(id: string) {
  return fetchAdmin<BrandRecord | null>(
    compileAdminEndpoint(adminEndpointTemplates.brandDetail, { id }),
  );
}

async function getServicesRemote(options?: ServiceListOptions) {
  return fetchAdmin<ListResult<ServiceRecord>>(
    `${adminEndpointTemplates.services}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
  );
}

async function getServiceByIdRemote(id: string) {
  return fetchAdmin<ServiceRecord | null>(
    compileAdminEndpoint(adminEndpointTemplates.serviceDetail, { id }),
  );
}

async function getAnalyticsOverviewRemote() {
  return fetchAdmin<AnalyticsSeries[]>(adminEndpointTemplates.analyticsOverview);
}

async function getVisibilityAssignmentsRemote() {
  return fetchOptionalAdminCollection(adminEndpointTemplates.visibilityLabels, (payload) =>
    normalizeCollectionPayload(
      payload,
      isVisibilityAssignmentRecord,
      ["assignments", "visibilityAssignments"],
    ),
  );
}

async function getSponsorshipCampaignsRemote() {
  return fetchOptionalAdminCollection(adminEndpointTemplates.sponsoredVisibility, (payload) =>
    normalizeCollectionPayload(
      payload,
      isSponsorshipCampaignRecord,
      ["campaigns", "sponsorships"],
    ),
  );
}

async function getActivityFeedRemote() {
  return fetchOptionalAdminCollection(adminEndpointTemplates.activity, (payload) =>
    normalizeCollectionPayload(payload, isActivityRecord, ["activity", "events"]),
  );
}

async function getUserAdminDetailRemote(id: string) {
  return fetchAdminDetailWithFallback(
    compileAdminEndpoint(adminEndpointTemplates.userAdminDetail, { id }),
    compileAdminEndpoint(adminEndpointTemplates.userDetail, { id }),
    normalizeUserAdminDetailPayload,
  );
}

async function getBrandAdminDetailRemote(id: string) {
  return fetchAdminDetailWithFallback(
    compileAdminEndpoint(adminEndpointTemplates.brandAdminDetail, { id }),
    compileAdminEndpoint(adminEndpointTemplates.brandDetail, { id }),
    normalizeBrandAdminDetailPayload,
  );
}

async function getServiceAdminDetailRemote(id: string) {
  return fetchAdminDetailWithFallback(
    compileAdminEndpoint(adminEndpointTemplates.serviceAdminDetail, { id }),
    compileAdminEndpoint(adminEndpointTemplates.serviceDetail, { id }),
    normalizeServiceAdminDetailPayload,
  );
}

async function getReportAdminDetailRemote(id: string) {
  const session = await readRemoteAdminSession();
  const detail = await fetchOptionalAdminDetail(
    compileAdminEndpoint(adminEndpointTemplates.reportDetail, { id }),
    normalizeReportAdminDetailPayload,
    session,
  );

  if (!detail) {
    return null;
  }

  const { report } = detail;
  const targetService =
    report.targetType === "service" || report.targetType === "review"
      ? detail.targetService ??
        (await getOptionalServiceByIdRemote(report.targetId, session))
      : null;

  return createReportAdminDetail(report, {
    targetUser:
      report.targetType === "user"
        ? detail.targetUser ??
          (await getOptionalUserByIdRemote(report.targetId, session))
        : null,
    targetBrand:
      report.targetType === "brand"
        ? detail.targetBrand ??
          (await getOptionalBrandByIdRemote(report.targetId, session))
        : null,
    targetService,
    serviceProvider:
      targetService
        ? detail.serviceProvider ??
          (await getOptionalUserByIdRemote(targetService.providerId, session))
        : null,
    serviceBrand:
      targetService
        ? detail.serviceBrand ??
          (await getOptionalBrandByIdRemote(targetService.brandId, session))
        : null,
    relatedReports: detail.relatedReports,
  });
}

export async function getAdminOverview() {
  return shouldUseMockData() ? getAdminOverviewMock() : getAdminOverviewRemote();
}

export async function getReports(options?: ReportListOptions) {
  return shouldUseMockData() ? getReportsMock(options) : getReportsRemote(options);
}

export async function getReportById(id: string) {
  return shouldUseMockData() ? getReportByIdMock(id) : getReportByIdRemote(id);
}

export async function getReportAdminDetail(id: string) {
  return shouldUseMockData()
    ? getReportAdminDetailMock(id)
    : getReportAdminDetailRemote(id);
}

export async function getUsers(options?: UserListOptions) {
  return shouldUseMockData() ? getUsersMock(options) : getUsersRemote(options);
}

export async function getUserById(id: string) {
  return shouldUseMockData() ? getUserByIdMock(id) : getUserByIdRemote(id);
}

export async function getBrands(options?: BrandListOptions) {
  return shouldUseMockData() ? getBrandsMock(options) : getBrandsRemote(options);
}

export async function getBrandById(id: string) {
  return shouldUseMockData() ? getBrandByIdMock(id) : getBrandByIdRemote(id);
}

export async function getServices(options?: ServiceListOptions) {
  return shouldUseMockData()
    ? getServicesMock(options)
    : getServicesRemote(options);
}

export async function getServiceById(id: string) {
  return shouldUseMockData()
    ? getServiceByIdMock(id)
    : getServiceByIdRemote(id);
}

export async function getAnalyticsOverview() {
  return shouldUseMockData()
    ? getAnalyticsOverviewMock()
    : getAnalyticsOverviewRemote();
}

export async function getVisibilityAssignments() {
  return shouldUseMockData()
    ? getVisibilityAssignmentsMock()
    : getVisibilityAssignmentsRemote();
}

export async function getSponsorshipCampaigns() {
  return shouldUseMockData()
    ? getSponsorshipCampaignsMock()
    : getSponsorshipCampaignsRemote();
}

export async function getActivityFeed() {
  return shouldUseMockData() ? getActivityFeedMock() : getActivityFeedRemote();
}

export async function getUserAdminDetail(id: string) {
  return shouldUseMockData()
    ? getUserAdminDetailMock(id)
    : getUserAdminDetailRemote(id);
}

export async function getBrandAdminDetail(id: string) {
  return shouldUseMockData()
    ? getBrandAdminDetailMock(id)
    : getBrandAdminDetailRemote(id);
}

export async function getServiceAdminDetail(id: string) {
  return shouldUseMockData()
    ? getServiceAdminDetailMock(id)
    : getServiceAdminDetailRemote(id);
}
