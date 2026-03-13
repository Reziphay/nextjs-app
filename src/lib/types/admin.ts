export type AdminStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ReportRecord = {
  id: string;
  subject: string;
  targetType: "service" | "brand" | "review" | "user";
  targetId: string;
  status: AdminStatus;
  reason: string;
  submittedAt: string;
  priority: "low" | "medium" | "high";
  reporterLabel: string;
};

export type UserRecord = {
  id: string;
  name: string;
  roles: string[];
  state: "active" | "suspended" | "closed";
  penaltyPoints: number;
  brands: number;
  services: number;
  joinedAt: string;
  completedReservations: number;
  linkedBrandIds: string[];
  linkedServiceIds: string[];
};

export type BrandRecord = {
  id: string;
  name: string;
  ownerId: string;
  owner: string;
  members: number;
  memberNames: string[];
  services: number;
  serviceIds: string[];
  visibility: string[];
  status: "healthy" | "flagged";
  responseReliability: string;
};

export type ServiceRecord = {
  id: string;
  name: string;
  providerId: string;
  provider: string;
  brandId: string;
  brand: string;
  visibility: string[];
  status: "active" | "paused" | "flagged";
  requestsToday: number;
  category: string;
  reservationMode: "manual" | "automatic";
  waitingTimeMinutes: number;
  leadTimeLabel: string;
};

export type ActivityRecord = {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: "moderation" | "visibility" | "account" | "sponsorship";
  actor: string;
};

export type VisibilityAssignmentRecord = {
  id: string;
  label: string;
  targetId: string;
  targetName: string;
  targetType: "brand" | "service";
  startsAt: string;
  endsAt: string;
  note: string;
  status: "scheduled" | "active" | "ended";
};

export type VisibilityLabelRecord = {
  id: string;
  name: string;
  slug: string;
  targetType: "brand" | "service" | "user";
  description: string | null;
  priority: number;
  isActive: boolean;
  assignmentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SponsorshipCampaignRecord = {
  id: string;
  campaignName: string;
  targetId: string;
  targetName: string;
  targetType: "brand" | "service";
  startsAt: string;
  endsAt: string;
  note: string;
  status: "scheduled" | "active" | "ended";
  performanceLabel: string;
};

export type AdminOverview = {
  kpis: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  activity: ActivityRecord[];
};

export type AnalyticsSeries = {
  label: string;
  values: number[];
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AnalyticsOverviewData = {
  metrics: AnalyticsMetric[];
  series: AnalyticsSeries[];
};

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: Record<string, number>;
};

export type UserAdminDetail = {
  user: UserRecord;
  relatedBrands: BrandRecord[];
  relatedServices: ServiceRecord[];
  relatedReports: ReportRecord[];
};

export type BrandAdminDetail = {
  brand: BrandRecord;
  relatedServices: ServiceRecord[];
  relatedReports: ReportRecord[];
};

export type ServiceAdminDetail = {
  service: ServiceRecord;
  relatedReports: ReportRecord[];
  provider: UserRecord | null;
  brand: BrandRecord | null;
};

export type ReportAdminDetail = {
  report: ReportRecord;
  targetUser: UserRecord | null;
  targetBrand: BrandRecord | null;
  targetService: ServiceRecord | null;
  serviceProvider: UserRecord | null;
  serviceBrand: BrandRecord | null;
  relatedReports: ReportRecord[];
};
