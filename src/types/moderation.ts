export type ChecklistItem = {
  key: string;
  label: string;
  passed: boolean;
};

export type QueueItemOwner = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export type QueueItem = {
  id: string;
  type: "brand" | "service";
  title: string;
  owner: QueueItemOwner;
  created_at: string;
  status: "PENDING";
};

export type ModerationBrandDetail = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  owner: QueueItemOwner;
  created_at: string;
  categories?: { id: string; key: string }[];
  logo_url?: string | null;
  gallery?: { url: string }[];
  checklist?: ChecklistItem[];
};

export type ModerationServiceDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  owner: QueueItemOwner;
  created_at: string;
  service_category_id?: string | null;
  service_category?: { id: string; key: string } | null;
  images?: { url: string }[];
  checklist?: ChecklistItem[];
};

export type ApproveBrandPayload = {
  checklist?: ChecklistItem[];
};

export type RejectBrandPayload = {
  rejection_reason: string;
  checklist?: ChecklistItem[];
};

export type ApproveServicePayload = {
  checklist?: ChecklistItem[];
};

export type RejectServicePayload = {
  rejection_reason: string;
  checklist?: ChecklistItem[];
};

export type ModerationReview = {
  entityId: string;
  entityType: "brand" | "service";
  action: "approve" | "reject";
  rejectionReason?: string;
  checklist?: ChecklistItem[];
};
