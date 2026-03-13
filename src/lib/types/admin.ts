export type AdminStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type ReportRecord = {
  id: string;
  subject: string;
  targetType: "service" | "brand" | "review" | "user";
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
};

export type BrandRecord = {
  id: string;
  name: string;
  owner: string;
  members: number;
  services: number;
  visibility: string[];
  status: "healthy" | "flagged";
};

export type ServiceRecord = {
  id: string;
  name: string;
  provider: string;
  brand: string;
  visibility: string[];
  status: "active" | "paused" | "flagged";
  requestsToday: number;
};

export type AdminOverview = {
  kpis: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  activity: Array<{
    id: string;
    title: string;
    detail: string;
    time: string;
  }>;
};

export type AnalyticsSeries = {
  label: string;
  values: number[];
};

export type ListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: Record<string, number>;
};
