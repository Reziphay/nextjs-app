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
  AnalyticsOverviewData,
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
  VisibilityLabelRecord,
} from "@/lib/types/admin";
import { formatShortDate } from "@/lib/utils/format";

const DEFAULT_PAGE_SIZE = 4;
const PUBLIC_BRANDS_PATH = "/brands";
const PUBLIC_SERVICES_PATH = "/services";
const FALLBACKABLE_REMOTE_STATUS_CODES = [401, 403, 404, 405, 501];

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

function formatCount(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readIsoDate(value: unknown) {
  const raw = readString(value);

  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function formatDurationLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  if (minutes < 24 * 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  const days = Math.round(minutes / (24 * 60));
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function formatLeadTimeLabel(
  minAdvanceMinutes: number | null,
  maxAdvanceMinutes: number | null,
) {
  if (minAdvanceMinutes === null && maxAdvanceMinutes === null) {
    return "Flexible coordination";
  }

  const start =
    minAdvanceMinutes === null ? "Now" : formatDurationLabel(minAdvanceMinutes);
  const end =
    maxAdvanceMinutes === null ? "Flexible" : formatDurationLabel(maxAdvanceMinutes);

  return `${start} to ${end}`;
}

function mapAdminStatusValue(value: unknown): AdminStatus {
  switch (readString(value)?.toLowerCase()) {
    case "under_review":
    case "reviewing":
      return "reviewing";
    case "resolved":
      return "resolved";
    case "dismissed":
      return "dismissed";
    default:
      return "open";
  }
}

function mapUserStateValue(value: unknown): UserRecord["state"] {
  switch (readString(value)?.toLowerCase()) {
    case "suspended":
      return "suspended";
    case "closed":
      return "closed";
    default:
      return "active";
  }
}

function mapBrandStatusValue(value: unknown): BrandRecord["status"] {
  return readString(value)?.toLowerCase() === "active" ? "healthy" : "flagged";
}

function mapServiceStatusValue(value: unknown): ServiceRecord["status"] {
  if (typeof value === "boolean") {
    return value ? "active" : "paused";
  }

  switch (readString(value)?.toLowerCase()) {
    case "flagged":
      return "flagged";
    case "paused":
    case "inactive":
    case "closed":
      return "paused";
    case "active":
    default:
      return "active";
  }
}

function mapVisibilityTargetType(
  value: unknown,
): VisibilityLabelRecord["targetType"] | null {
  switch (readString(value)?.toLowerCase()) {
    case "brand":
      return "brand";
    case "service":
      return "service";
    case "user":
      return "user";
    default:
      return null;
  }
}

function mapReportTargetType(value: unknown): ReportRecord["targetType"] | null {
  switch (readString(value)?.toLowerCase()) {
    case "service":
      return "service";
    case "brand":
      return "brand";
    case "review":
      return "review";
    case "user":
      return "user";
    default:
      return null;
  }
}

function slugifyLabel(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readCollectionItems(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of ["items", ...keys]) {
    const value = payload[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function extractVisibilityNames(value: unknown) {
  return readArray<unknown>(value)
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (!isRecord(entry)) {
        return null;
      }

      const label = isRecord(entry.label) ? entry.label : entry;

      return readString(label.name) ?? readString(label.slug);
    })
    .filter((entry): entry is string => Boolean(entry));
}

function formatRatingSummary(value: unknown) {
  if (!isRecord(value)) {
    return "No ratings yet";
  }

  const avgRating = readNumber(value.avgRating) ?? 0;
  const reviewCount = readNumber(value.reviewCount) ?? 0;

  if (!reviewCount) {
    return "No ratings yet";
  }

  return `${avgRating.toFixed(1)}★ across ${formatCount(reviewCount)} reviews`;
}

function createFallbackUserRecord(
  input: Partial<UserRecord> & Pick<UserRecord, "id" | "name">,
): UserRecord {
  return {
    id: input.id,
    name: input.name,
    roles: input.roles ?? [],
    state: input.state ?? "active",
    penaltyPoints: input.penaltyPoints ?? 0,
    brands: input.brands ?? 0,
    services: input.services ?? 0,
    joinedAt: input.joinedAt ?? new Date(0).toISOString(),
    completedReservations: input.completedReservations ?? 0,
    linkedBrandIds: input.linkedBrandIds ?? [],
    linkedServiceIds: input.linkedServiceIds ?? [],
  };
}

function matchesQuery(values: string[], query?: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.join(" ").toLowerCase().includes(normalizedQuery);
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
) {
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

function normalizeMappedCollectionPayload<T>(
  payload: unknown,
  keys: string[],
  normalizeItem: (item: unknown) => T | null,
) {
  return readCollectionItems(payload, keys)
    .map((item) => normalizeItem(item))
    .filter((item): item is T => item !== null);
}

function normalizeRemoteBrandPayload(payload: unknown): BrandRecord | null {
  if (isBrandRecord(payload)) {
    return payload;
  }

  const source =
    isRecord(payload) && isRecord(payload.brand) ? payload.brand : payload;

  if (!isRecord(source) || typeof source.id !== "string") {
    return null;
  }

  const owner = isRecord(source.owner) ? source.owner : null;

  return {
    id: source.id,
    name: readString(source.name) ?? source.id,
    ownerId: readString(owner?.id) ?? "",
    owner: readString(owner?.fullName) ?? "Unknown owner",
    members: readNumber(source.memberCount) ?? 0,
    memberNames: readArray<unknown>(source.memberNames)
      .map((member) => readString(member))
      .filter((member): member is string => Boolean(member)),
    services: readNumber(source.serviceCount) ?? 0,
    serviceIds: readArray<unknown>(source.serviceIds)
      .map((serviceId) => readString(serviceId))
      .filter((serviceId): serviceId is string => Boolean(serviceId)),
    visibility: extractVisibilityNames(source.visibilityLabels),
    status: mapBrandStatusValue(source.status),
    responseReliability: formatRatingSummary(source.ratingStats),
  };
}

function normalizeRemoteServicePayload(payload: unknown): ServiceRecord | null {
  if (isServiceRecord(payload)) {
    return payload;
  }

  const source =
    isRecord(payload) && isRecord(payload.service) ? payload.service : payload;

  if (!isRecord(source) || typeof source.id !== "string") {
    return null;
  }

  const owner = isRecord(source.owner) ? source.owner : null;
  const brand = isRecord(source.brand) ? source.brand : null;
  const category = isRecord(source.category) ? source.category : null;
  const waitingTimeMinutes = readNumber(source.waitingTimeMinutes) ?? 0;
  const minAdvanceMinutes = readNumber(source.minAdvanceMinutes);
  const maxAdvanceMinutes = readNumber(source.maxAdvanceMinutes);
  const approvalMode = readString(source.approvalMode)?.toLowerCase();

  return {
    id: source.id,
    name: readString(source.name) ?? source.id,
    providerId: readString(owner?.id) ?? "",
    provider: readString(owner?.fullName) ?? "Unknown provider",
    brandId: readString(brand?.id) ?? "",
    brand: readString(brand?.name) ?? "Independent",
    visibility: extractVisibilityNames(source.visibilityLabels),
    status: mapServiceStatusValue(source.isActive ?? source.status),
    requestsToday: 0,
    category: readString(category?.name) ?? "General",
    reservationMode: approvalMode === "auto" ? "automatic" : "manual",
    waitingTimeMinutes,
    leadTimeLabel: formatLeadTimeLabel(minAdvanceMinutes, maxAdvanceMinutes),
  };
}

function normalizeRemoteVisibilityLabelPayload(
  payload: unknown,
): VisibilityLabelRecord | null {
  const source =
    isRecord(payload) && isRecord(payload.visibilityLabel)
      ? payload.visibilityLabel
      : payload;

  if (!isRecord(source) || typeof source.id !== "string") {
    return null;
  }

  const targetType = mapVisibilityTargetType(source.targetType);

  if (!targetType) {
    return null;
  }

  return {
    id: source.id,
    name: readString(source.name) ?? source.id,
    slug: readString(source.slug) ?? slugifyLabel(readString(source.name) ?? source.id),
    targetType,
    description: readString(source.description),
    priority: readNumber(source.priority) ?? 0,
    isActive: source.isActive !== false,
    assignmentCount: readNumber(source.assignmentCount) ?? 0,
    createdAt: readIsoDate(source.createdAt) ?? new Date(0).toISOString(),
    updatedAt: readIsoDate(source.updatedAt) ?? new Date(0).toISOString(),
  };
}

function buildReportReporterLabel(source: Record<string, unknown>) {
  const reporterUser = isRecord(source.reporterUser) ? source.reporterUser : null;

  return (
    readString(reporterUser?.fullName) ??
    readString(reporterUser?.email) ??
    "Customer report"
  );
}

function buildReportSubject(
  targetType: ReportRecord["targetType"],
  targetSummary: Record<string, unknown> | null,
  fallbackId: string,
) {
  if (targetType === "service") {
    return `Service report: ${readString(targetSummary?.name) ?? fallbackId}`;
  }

  if (targetType === "brand") {
    return `Brand report: ${readString(targetSummary?.name) ?? fallbackId}`;
  }

  if (targetType === "review") {
    const rating = readNumber(targetSummary?.rating);
    return rating
      ? `Review report: ${rating}★ feedback`
      : `Review report: ${fallbackId}`;
  }

  return `User report: ${readString(targetSummary?.fullName) ?? fallbackId}`;
}

function buildReportPriority(
  status: AdminStatus,
  targetType: ReportRecord["targetType"],
): ReportRecord["priority"] {
  if (status === "resolved" || status === "dismissed") {
    return "low";
  }

  if (targetType === "service" || targetType === "review") {
    return "high";
  }

  return "medium";
}

function normalizeRemoteReportPayload(payload: unknown): ReportRecord | null {
  if (isReportRecord(payload)) {
    return payload;
  }

  const source =
    isRecord(payload) && isRecord(payload.report) ? payload.report : payload;

  if (!isRecord(source) || typeof source.id !== "string") {
    return null;
  }

  const targetType = mapReportTargetType(source.targetType);

  if (!targetType) {
    return null;
  }

  const status = mapAdminStatusValue(source.status);
  const targetSummary =
    isRecord(source.targetSummary)
      ? source.targetSummary
      : isRecord(payload) && isRecord(payload.targetSummary)
        ? payload.targetSummary
        : null;

  return {
    id: source.id,
    subject: buildReportSubject(targetType, targetSummary, source.id),
    targetType,
    targetId: readString(source.targetId) ?? source.id,
    status,
    reason: readString(source.reason) ?? "No moderation reason provided.",
    submittedAt: readIsoDate(source.createdAt) ?? new Date(0).toISOString(),
    priority: buildReportPriority(status, targetType),
    reporterLabel: buildReportReporterLabel(source),
  };
}

type RemoteReportEntry = {
  report: ReportRecord;
  targetSummary: Record<string, unknown> | null;
};

function normalizeRemoteReportEntry(payload: unknown): RemoteReportEntry | null {
  const report = normalizeRemoteReportPayload(payload);

  if (!report) {
    return null;
  }

  const source =
    isRecord(payload) && isRecord(payload.report) ? payload.report : payload;
  const targetSummary =
    isRecord(source) && isRecord(source.targetSummary)
      ? source.targetSummary
      : isRecord(payload) && isRecord(payload.targetSummary)
        ? payload.targetSummary
        : null;

  return {
    report,
    targetSummary,
  };
}

function normalizeUserFromReportSummary(
  summary: Record<string, unknown>,
  overrides: Partial<UserRecord> = {},
) {
  return createFallbackUserRecord({
    id: readString(summary.id) ?? "unknown-user",
    name: readString(summary.fullName) ?? readString(summary.name) ?? "Unknown user",
    state: mapUserStateValue(summary.status),
    ...overrides,
  });
}

function normalizeBrandFromReportSummary(
  summary: Record<string, unknown>,
  overrides: Partial<BrandRecord> = {},
): BrandRecord {
  return {
    id: readString(summary.id) ?? "unknown-brand",
    name: readString(summary.name) ?? "Unknown brand",
    ownerId: overrides.ownerId ?? "",
    owner: overrides.owner ?? "Unknown owner",
    members: overrides.members ?? 0,
    memberNames: overrides.memberNames ?? [],
    services: overrides.services ?? 0,
    serviceIds: overrides.serviceIds ?? [],
    visibility: overrides.visibility ?? [],
    status: mapBrandStatusValue(summary.status),
    responseReliability: overrides.responseReliability ?? "No ratings yet",
  };
}

function normalizeServiceFromReportSummary(
  summary: Record<string, unknown>,
  overrides: Partial<ServiceRecord> = {},
): ServiceRecord {
  const brand = isRecord(summary.brand) ? summary.brand : null;
  const ownerUser = isRecord(summary.ownerUser) ? summary.ownerUser : null;

  return {
    id: readString(summary.id) ?? "unknown-service",
    name: readString(summary.name) ?? "Unknown service",
    providerId: overrides.providerId ?? readString(ownerUser?.id) ?? "",
    provider:
      overrides.provider ?? readString(ownerUser?.fullName) ?? "Unknown provider",
    brandId: overrides.brandId ?? readString(brand?.id) ?? "",
    brand: overrides.brand ?? readString(brand?.name) ?? "Independent",
    visibility: overrides.visibility ?? [],
    status:
      overrides.status ?? mapServiceStatusValue(summary.isActive ?? summary.status),
    requestsToday: overrides.requestsToday ?? 0,
    category: overrides.category ?? "General",
    reservationMode: overrides.reservationMode ?? "manual",
    waitingTimeMinutes: overrides.waitingTimeMinutes ?? 0,
    leadTimeLabel: overrides.leadTimeLabel ?? "Flexible coordination",
  };
}

function normalizeRemoteAnalyticsPayload(
  payload: unknown,
): AnalyticsOverviewData | null {
  if (Array.isArray(payload)) {
    const series = payload.filter(
      (entry): entry is AnalyticsSeries =>
        isRecord(entry) &&
        typeof entry.label === "string" &&
        Array.isArray(entry.values),
    );

    return {
      metrics: series.map((item) => ({
        label: item.label,
        value: formatCount(item.values[item.values.length - 1] ?? 0),
        detail: `${item.values.length} recorded points`,
      })),
      series,
    };
  }

  if (!isRecord(payload)) {
    return null;
  }

  const users = isRecord(payload.users) ? payload.users : {};
  const brands = isRecord(payload.brands) ? payload.brands : {};
  const services = isRecord(payload.services) ? payload.services : {};
  const reservations = isRecord(payload.reservations) ? payload.reservations : {};
  const reports = isRecord(payload.reports) ? payload.reports : {};
  const objections = isRecord(payload.reservationObjections)
    ? payload.reservationObjections
    : {};
  const visibility = isRecord(payload.activeVisibilityAssignments)
    ? payload.activeVisibilityAssignments
    : {};

  return {
    metrics: [
      {
        label: "Users",
        value: formatCount(readNumber(users.ACTIVE) ?? 0),
        detail: `${formatCount(readNumber(users.SUSPENDED) ?? 0)} suspended · ${formatCount(readNumber(users.CLOSED) ?? 0)} closed`,
      },
      {
        label: "Brands",
        value: formatCount(readNumber(brands.ACTIVE) ?? 0),
        detail: `${formatCount(readNumber(brands.FLAGGED) ?? 0)} flagged · ${formatCount(readNumber(brands.CLOSED) ?? 0)} closed`,
      },
      {
        label: "Services",
        value: formatCount(readNumber(services.active) ?? 0),
        detail: `${formatCount(readNumber(services.inactive) ?? 0)} inactive out of ${formatCount(readNumber(services.total) ?? 0)}`,
      },
      {
        label: "Reservations",
        value: formatCount(readNumber(reservations.CONFIRMED) ?? 0),
        detail: `${formatCount(readNumber(reservations.PENDING) ?? 0)} pending · ${formatCount(readNumber(reservations.CANCELLED) ?? 0)} cancelled`,
      },
      {
        label: "Reports",
        value: formatCount(readNumber(reports.OPEN) ?? 0),
        detail: `${formatCount(readNumber(reports.UNDER_REVIEW) ?? 0)} under review · ${formatCount(readNumber(objections.OPEN) ?? 0)} objections open`,
      },
      {
        label: "Visibility",
        value: formatCount(
          (readNumber(visibility.brands) ?? 0) +
            (readNumber(visibility.services) ?? 0) +
            (readNumber(visibility.users) ?? 0),
        ),
        detail: `${formatCount(readNumber(visibility.brands) ?? 0)} brands · ${formatCount(readNumber(visibility.services) ?? 0)} services · ${formatCount(readNumber(visibility.users) ?? 0)} users`,
      },
    ],
    series: [],
  };
}

function synthesizeRemoteActivity(
  reports: ReportRecord[],
  visibilityLabels: VisibilityLabelRecord[],
) {
  const reportItems = reports.slice(0, 3).map((report) => ({
    id: `report-${report.id}`,
    title:
      report.status === "resolved"
        ? "Report resolved"
        : report.status === "dismissed"
          ? "Report dismissed"
          : "Report received",
    detail: report.subject,
    time: formatShortDate(report.submittedAt),
    category: "moderation" as const,
    actor: report.reporterLabel,
    sortAt: report.submittedAt,
  }));
  const visibilityItems = visibilityLabels.slice(0, 2).map((label) => ({
    id: `visibility-${label.id}`,
    title: label.isActive ? "Visibility label active" : "Visibility label inactive",
    detail: `${label.name} targets ${label.targetType} with ${label.assignmentCount} assignments.`,
    time: formatShortDate(label.updatedAt),
    category: "visibility" as const,
    actor: "Growth operations",
    sortAt: label.updatedAt,
  }));

  return [...reportItems, ...visibilityItems]
    .sort((left, right) => right.sortAt.localeCompare(left.sortAt))
    .map((item) => {
      const { sortAt, ...activity } = item;
      void sortAt;
      return activity;
    });
}

function synthesizeOverviewFromRemoteData(
  analytics: AnalyticsOverviewData,
  reports: ReportRecord[],
  visibilityLabels: VisibilityLabelRecord[],
): AdminOverview {
  return {
    kpis: analytics.metrics.slice(0, 4).map((metric) => ({
      label: metric.label,
      value: metric.value,
      detail: metric.detail,
    })),
    activity: synthesizeRemoteActivity(reports, visibilityLabels).slice(0, 3),
  };
}

async function fetchAdminWithFallbackPaths<T>(
  paths: string[],
  session?: AdminSessionLike,
  fallbackStatuses = FALLBACKABLE_REMOTE_STATUS_CODES,
) {
  const uniquePaths = [...new Set(paths)];

  for (const path of uniquePaths) {
    try {
      return await fetchAdmin<T>(path, session);
    } catch (error) {
      if (error instanceof ApiError && fallbackStatuses.includes(error.status)) {
        continue;
      }

      throw error;
    }
  }

  return null;
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
  return {
    metrics: [
      {
        label: "Reservations",
        value: formatCount(analyticsSeries[0]?.values.at(-1) ?? 0),
        detail: "Recent trend snapshot from the typed local dataset.",
      },
      {
        label: "Reports",
        value: formatCount(analyticsSeries[1]?.values.at(-1) ?? 0),
        detail: "Tracks moderation volume across the most recent points.",
      },
      {
        label: "Sponsored clicks",
        value: formatCount(analyticsSeries[2]?.values.at(-1) ?? 0),
        detail: "Visibility performance remains separate from payments.",
      },
    ],
    series: analyticsSeries,
  } satisfies AnalyticsOverviewData;
}

async function getVisibilityAssignmentsMock() {
  return visibilityAssignmentRecords;
}

async function getVisibilityLabelsMock() {
  return visibilityAssignmentRecords.reduce<VisibilityLabelRecord[]>(
    (labels, assignment) => {
      const existing = labels.find(
        (label) =>
          label.name === assignment.label &&
          label.targetType === assignment.targetType,
      );

      if (existing) {
        existing.assignmentCount += 1;
        return labels;
      }

      labels.push({
        id: `${assignment.targetType}-${slugifyLabel(assignment.label)}`,
        name: assignment.label,
        slug: slugifyLabel(assignment.label),
        targetType: assignment.targetType,
        description: assignment.note,
        priority: 0,
        isActive: assignment.status !== "ended",
        assignmentCount: 1,
        createdAt: assignment.startsAt,
        updatedAt: assignment.endsAt,
      });

      return labels;
    },
    [],
  );
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

function mapBackendReportStatus(status?: "all" | AdminStatus) {
  switch (status) {
    case "reviewing":
      return "UNDER_REVIEW";
    case "resolved":
      return "RESOLVED";
    case "dismissed":
      return "DISMISSED";
    case "open":
      return "OPEN";
    default:
      return undefined;
  }
}

async function getRemoteReportEntries(options?: { status?: "all" | AdminStatus }) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    `${adminEndpointTemplates.reports}${buildQueryString({
      status: mapBackendReportStatus(options?.status),
      limit: 100,
    })}`,
  ]);

  if (!payload) {
    return [];
  }

  return normalizeMappedCollectionPayload(payload, ["reports"], (item) =>
    normalizeRemoteReportEntry(item),
  );
}

async function getRemoteVisibilityLabelsDataset() {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    adminEndpointTemplates.visibilityLabels,
  ]);

  if (!payload) {
    return [];
  }

  return normalizeMappedCollectionPayload(payload, ["labels", "visibilityLabels"], (item) =>
    normalizeRemoteVisibilityLabelPayload(item),
  );
}

async function getRemoteBrandPayload(id: string) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    compileAdminEndpoint(adminEndpointTemplates.brandAdminDetail, { id }),
    compileAdminEndpoint(adminEndpointTemplates.brandDetail, { id }),
    `${PUBLIC_BRANDS_PATH}/${encodeURIComponent(id)}`,
  ]);

  return payload ? normalizeRemoteBrandPayload(payload) : null;
}

async function getRemoteBrandMembers(id: string) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    `${PUBLIC_BRANDS_PATH}/${encodeURIComponent(id)}/members`,
  ]);

  return normalizeMappedCollectionPayload(payload, ["members"], (item) => {
    if (!isRecord(item) || typeof item.id !== "string") {
      return null;
    }

    return {
      id: item.id,
      name: readString(item.fullName) ?? readString(item.name) ?? item.id,
    };
  });
}

async function getRemoteServicePayload(id: string) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    compileAdminEndpoint(adminEndpointTemplates.serviceAdminDetail, { id }),
    compileAdminEndpoint(adminEndpointTemplates.serviceDetail, { id }),
    `${PUBLIC_SERVICES_PATH}/${encodeURIComponent(id)}`,
  ]);

  return payload ? normalizeRemoteServicePayload(payload) : null;
}

async function getRemoteServicesByFilters(filters: {
  brandId?: string;
  ownerUserId?: string;
}) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    `${PUBLIC_SERVICES_PATH}${buildQueryString({
      brandId: filters.brandId,
      ownerUserId: filters.ownerUserId,
      includeInactive: true,
    })}`,
    `${adminEndpointTemplates.services}${buildQueryString({
      brandId: filters.brandId,
      ownerUserId: filters.ownerUserId,
      includeInactive: true,
    })}`,
  ]);

  if (!payload) {
    return [];
  }

  return normalizeMappedCollectionPayload(payload, ["services"], (item) =>
    normalizeRemoteServicePayload(item),
  );
}

async function getRemoteProviderFallbackUser(id: string) {
  const services = await getRemoteServicesByFilters({ ownerUserId: id });

  if (!services.length) {
    return null;
  }

  const firstService = services[0];
  const relatedBrandIds = [...new Set(services.map((service) => service.brandId).filter(Boolean))];

  return createFallbackUserRecord({
    id,
    name: firstService.provider,
    roles: ["USO"],
    state: "active",
    brands: relatedBrandIds.length,
    services: services.length,
    linkedBrandIds: relatedBrandIds,
    linkedServiceIds: services.map((service) => service.id),
  });
}

async function getAdminOverviewRemote() {
  const [analytics, reports, visibilityLabels] = await Promise.all([
    getAnalyticsOverviewRemote(),
    getReportsRemote({ page: 1 }),
    getVisibilityLabelsRemote(),
  ]);

  return synthesizeOverviewFromRemoteData(analytics, reports.items, visibilityLabels);
}

async function getReportsRemote(options?: ReportListOptions) {
  const entries = await getRemoteReportEntries({ status: options?.status });
  const base = entries.map((entry) => entry.report).filter((report) =>
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
    counts: countBy(entries.map((entry) => entry.report), (report) => report.status),
  } satisfies ListResult<ReportRecord>;
}

async function getReportByIdRemote(id: string) {
  const directPayload = await fetchAdminWithFallbackPaths<unknown>(
    [compileAdminEndpoint(adminEndpointTemplates.reportDetail, { id })],
    undefined,
    [404, 405, 501],
  );
  const directEntry = directPayload
    ? normalizeRemoteReportEntry(directPayload)
    : null;

  if (directEntry) {
    return directEntry.report;
  }

  const entries = await getRemoteReportEntries();

  return entries.find((entry) => entry.report.id === id)?.report ?? null;
}

async function getUsersRemote(options?: UserListOptions) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    `${adminEndpointTemplates.users}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.state,
    })}`,
  ], undefined, [404, 405, 501]);

  if (!payload) {
    return paginate([], options?.page);
  }

  const normalized = normalizeCollectionPayload(payload, isUserRecord, ["users"]);
  const base = normalized.filter((user) =>
    matchesQuery([user.name, user.state, user.roles.join(" ")], options?.query),
  );
  const filtered =
    options?.state && options.state !== "all"
      ? base.filter((user) => user.state === options.state)
      : base;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(normalized, (user) => user.state),
  } satisfies ListResult<UserRecord>;
}

async function getUserByIdRemote(id: string) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    compileAdminEndpoint(adminEndpointTemplates.userDetail, { id }),
  ], undefined, [404, 405, 501]);

  if (payload) {
    return isUserRecord(payload) ? payload : null;
  }

  return getRemoteProviderFallbackUser(id);
}

async function getBrandsRemote(options?: BrandListOptions) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    `${adminEndpointTemplates.brands}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
    })}`,
    `${PUBLIC_BRANDS_PATH}${buildQueryString({
      q: options?.query,
    })}`,
  ]);

  const normalized = payload
    ? normalizeMappedCollectionPayload(payload, ["brands"], (item) =>
        normalizeRemoteBrandPayload(item),
      )
    : [];
  const filtered =
    options?.status && options.status !== "all"
      ? normalized.filter((brand) => brand.status === options.status)
      : normalized;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(normalized, (brand) => brand.status),
  } satisfies ListResult<BrandRecord>;
}

async function getBrandByIdRemote(id: string) {
  return getRemoteBrandPayload(id);
}

async function getServicesRemote(options?: ServiceListOptions) {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    `${adminEndpointTemplates.services}${buildQueryString({
      q: options?.query,
      page: options?.page,
      status: options?.status,
      includeInactive: true,
    })}`,
    `${PUBLIC_SERVICES_PATH}${buildQueryString({
      q: options?.query,
      includeInactive: true,
    })}`,
  ]);

  const normalized = payload
    ? normalizeMappedCollectionPayload(payload, ["services"], (item) =>
        normalizeRemoteServicePayload(item),
      )
    : [];
  const filtered =
    options?.status && options.status !== "all"
      ? normalized.filter((service) => service.status === options.status)
      : normalized;
  const result = paginate(filtered, options?.page);

  return {
    ...result,
    counts: countBy(normalized, (service) => service.status),
  } satisfies ListResult<ServiceRecord>;
}

async function getServiceByIdRemote(id: string) {
  return getRemoteServicePayload(id);
}

async function getAnalyticsOverviewRemote() {
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    adminEndpointTemplates.analyticsOverview,
  ], undefined, [404, 405, 501]);

  return payload
    ? normalizeRemoteAnalyticsPayload(payload) ?? { metrics: [], series: [] }
    : { metrics: [], series: [] };
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

async function getVisibilityLabelsRemote() {
  return getRemoteVisibilityLabelsDataset();
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
  const payload = await fetchAdminWithFallbackPaths<unknown>([
    adminEndpointTemplates.activity,
  ], undefined, [404, 405, 501]);

  if (payload) {
    const activity = normalizeCollectionPayload(payload, isActivityRecord, [
      "activity",
      "events",
    ]);

    if (activity.length) {
      return activity;
    }
  }

  const [reports, visibilityLabels] = await Promise.all([
    getRemoteReportEntries(),
    getRemoteVisibilityLabelsDataset(),
  ]);

  return synthesizeRemoteActivity(
    reports.map((entry) => entry.report),
    visibilityLabels,
  );
}

async function getUserAdminDetailRemote(id: string) {
  const directDetail = await fetchAdminWithFallbackPaths<unknown>([
    compileAdminEndpoint(adminEndpointTemplates.userAdminDetail, { id }),
    compileAdminEndpoint(adminEndpointTemplates.userDetail, { id }),
  ], undefined, [404, 405, 501]);

  if (directDetail) {
    const normalized = normalizeUserAdminDetailPayload(directDetail);

    if (normalized) {
      return normalized;
    }
  }

  const providerUser = await getRemoteProviderFallbackUser(id);

  if (!providerUser) {
    return null;
  }

  const [relatedServices, reports] = await Promise.all([
    getRemoteServicesByFilters({ ownerUserId: id }),
    getRemoteReportEntries(),
  ]);
  const relatedBrandIds = [...new Set(relatedServices.map((service) => service.brandId).filter(Boolean))];
  const relatedBrands = (
    await Promise.all(relatedBrandIds.map((brandId) => getRemoteBrandPayload(brandId)))
  ).filter((brand): brand is BrandRecord => brand !== null);

  return {
    user: {
      ...providerUser,
      brands: relatedBrands.length,
      services: relatedServices.length,
      linkedBrandIds: relatedBrandIds,
      linkedServiceIds: relatedServices.map((service) => service.id),
    },
    relatedBrands,
    relatedServices,
    relatedReports: reports
      .map((entry) => entry.report)
      .filter((report) => report.targetId === id),
  } satisfies UserAdminDetail;
}

async function getBrandAdminDetailRemote(id: string) {
  const [brand, members, relatedServices, reports] = await Promise.all([
    getRemoteBrandPayload(id),
    getRemoteBrandMembers(id),
    getRemoteServicesByFilters({ brandId: id }),
    getRemoteReportEntries(),
  ]);

  if (!brand) {
    return null;
  }

  return {
    brand: {
      ...brand,
      members: members.length || brand.members,
      memberNames: members.length ? members.map((member) => member.name) : brand.memberNames,
      services: relatedServices.length || brand.services,
      serviceIds: relatedServices.length
        ? relatedServices.map((service) => service.id)
        : brand.serviceIds,
    },
    relatedServices,
    relatedReports: reports
      .map((entry) => entry.report)
      .filter((report) => report.targetId === id),
  } satisfies BrandAdminDetail;
}

async function getServiceAdminDetailRemote(id: string) {
  const service = await getRemoteServicePayload(id);

  if (!service) {
    return null;
  }

  const reports = await getRemoteReportEntries();

  return {
    service,
    relatedReports: reports
      .map((entry) => entry.report)
      .filter((report) => report.targetId === id),
    provider: createFallbackUserRecord({
      id: service.providerId,
      name: service.provider,
      roles: ["USO"],
      state: "active",
      services: 1,
      linkedBrandIds: service.brandId ? [service.brandId] : [],
      linkedServiceIds: [service.id],
    }),
    brand: service.brandId
      ? normalizeBrandFromReportSummary(
          {
            id: service.brandId,
            name: service.brand,
            status: service.status === "flagged" ? "FLAGGED" : "ACTIVE",
          },
          {
            ownerId: service.providerId,
            owner: service.provider,
            services: 1,
            serviceIds: [service.id],
            visibility: [],
            responseReliability: "No ratings yet",
          },
        )
      : null,
  } satisfies ServiceAdminDetail;
}

async function getReportAdminDetailRemote(id: string) {
  const directPayload = await fetchAdminWithFallbackPaths<unknown>(
    [compileAdminEndpoint(adminEndpointTemplates.reportDetail, { id })],
    undefined,
    [404, 405, 501],
  );
  const directEntry = directPayload
    ? normalizeRemoteReportEntry(directPayload)
    : null;
  const entries = directEntry ? [] : await getRemoteReportEntries();
  const selectedEntry =
    directEntry ?? entries.find((entry) => entry.report.id === id);

  if (!selectedEntry) {
    return null;
  }

  const { report, targetSummary } = selectedEntry;
  const relatedReports = entries
    .map((entry) => entry.report)
    .filter(
      (relatedReport) =>
        relatedReport.id !== report.id &&
        relatedReport.targetType === report.targetType &&
        relatedReport.targetId === report.targetId,
    );

  let targetUser: UserRecord | null = null;
  let targetBrand: BrandRecord | null = null;
  let targetService: ServiceRecord | null = null;
  let serviceProvider: UserRecord | null = null;
  let serviceBrand: BrandRecord | null = null;

  if (report.targetType === "user" && targetSummary) {
    targetUser = normalizeUserFromReportSummary(targetSummary);
  }

  if (report.targetType === "brand") {
    targetBrand =
      (await getRemoteBrandPayload(report.targetId)) ??
      (targetSummary ? normalizeBrandFromReportSummary(targetSummary) : null);
  }

  if (report.targetType === "service") {
    targetService =
      (await getRemoteServicePayload(report.targetId)) ??
      (targetSummary ? normalizeServiceFromReportSummary(targetSummary) : null);
  }

  if (report.targetType === "review" && targetSummary) {
    targetService = null;
  }

  if (targetService) {
    serviceProvider =
      (targetService.providerId
        ? await getUserByIdRemote(targetService.providerId)
        : null) ??
      createFallbackUserRecord({
        id: targetService.providerId,
        name: targetService.provider,
        roles: ["USO"],
        state: "active",
        services: 1,
        linkedBrandIds: targetService.brandId ? [targetService.brandId] : [],
        linkedServiceIds: [targetService.id],
      });
    serviceBrand = targetService.brandId
      ? (await getRemoteBrandPayload(targetService.brandId)) ??
        normalizeBrandFromReportSummary(
          {
            id: targetService.brandId,
            name: targetService.brand,
            status: targetService.status === "flagged" ? "FLAGGED" : "ACTIVE",
          },
          {
            ownerId: targetService.providerId,
            owner: targetService.provider,
            services: 1,
            serviceIds: [targetService.id],
            visibility: [],
            responseReliability: "No ratings yet",
          },
        )
      : null;
  }

  return createReportAdminDetail(report, {
    targetUser,
    targetBrand,
    targetService,
    serviceProvider,
    serviceBrand,
    relatedReports,
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

export async function getVisibilityLabels() {
  return shouldUseMockData() ? getVisibilityLabelsMock() : getVisibilityLabelsRemote();
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
