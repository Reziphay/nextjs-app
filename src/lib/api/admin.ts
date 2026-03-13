import { publicEnv } from "@/lib/config/env";
import { fetchJson } from "@/lib/api/http";
import {
  adminOverview,
  analyticsSeries,
  brandRecords,
  reportRecords,
  serviceRecords,
  userRecords,
} from "@/lib/mock/admin-data";
import type {
  AdminOverview,
  AdminStatus,
  AnalyticsSeries,
  BrandRecord,
  ListResult,
  ReportRecord,
  ServiceRecord,
  UserRecord,
} from "@/lib/types/admin";

const DEFAULT_PAGE_SIZE = 4;

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

async function fetchAdmin<T>(path: string) {
  return fetchJson<T>(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    cache: "no-store",
  });
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

async function getAdminOverviewRemote() {
  return fetchAdmin<AdminOverview>("/admin/overview");
}

async function getReportsRemote(options?: ReportListOptions) {
  return fetchAdmin<ListResult<ReportRecord>>(
    `/admin/reports${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
  );
}

async function getReportByIdRemote(id: string) {
  return fetchAdmin<ReportRecord | null>(`/admin/reports/${id}`);
}

async function getUsersRemote(options?: UserListOptions) {
  return fetchAdmin<ListResult<UserRecord>>(
    `/admin/users${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.state,
    })}`,
  );
}

async function getUserByIdRemote(id: string) {
  return fetchAdmin<UserRecord | null>(`/admin/users/${id}`);
}

async function getBrandsRemote(options?: BrandListOptions) {
  return fetchAdmin<ListResult<BrandRecord>>(
    `/admin/brands${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
  );
}

async function getBrandByIdRemote(id: string) {
  return fetchAdmin<BrandRecord | null>(`/admin/brands/${id}`);
}

async function getServicesRemote(options?: ServiceListOptions) {
  return fetchAdmin<ListResult<ServiceRecord>>(
    `/admin/services${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
  );
}

async function getServiceByIdRemote(id: string) {
  return fetchAdmin<ServiceRecord | null>(`/admin/services/${id}`);
}

async function getAnalyticsOverviewRemote() {
  return fetchAdmin<AnalyticsSeries[]>("/admin/analytics/overview");
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
