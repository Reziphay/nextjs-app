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
  avatar_url?: string | null;
};

export type QueueItem = {
  id: string;
  type: "brand" | "service";
  title: string;
  owner: QueueItemOwner;
  created_at: string;
  updated_at?: string;
  status: "PENDING";
  service_category?: { id: string; key: string } | null;
  categories?: { id: string; key: string }[];
  address?: string | null;
  branch?: {
    id: string;
    name: string;
    address1: string;
    address2?: string | null;
  } | null;
  brand?: {
    id: string;
    name: string;
    logo_url?: string | null;
    rating?: number | null;
    rating_count?: number;
  };
  logo_url?: string | null;
};

export type ModerationBrandDetail = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  owner: QueueItemOwner & { type?: string; created_at?: string };
  created_at: string;
  updated_at?: string;
  categories?: { id: string; key: string }[];
  logo_url?: string | null;
  gallery?: { url: string; order?: number }[];
  branches?: {
    id: string;
    name: string;
    description?: string | null;
    address1: string;
    address2?: string | null;
    phone?: string | null;
    email?: string | null;
    is_24_7?: boolean;
    opening?: string | null;
    closing?: string | null;
    cover_url?: string | null;
  }[];
  checklist?: ChecklistItem[];
};

export type ModerationServiceDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  owner: QueueItemOwner & { type?: string; created_at?: string };
  created_at: string;
  updated_at?: string;
  service_category_id?: string | null;
  service_category?: { id: string; key: string } | null;
  images?: { url: string }[];
  price?: number | null;
  price_type?: string;
  duration?: number | null;
  address?: string | null;
  branch?: {
    id: string;
    name: string;
    address1: string;
    address2?: string | null;
    brand?: {
      id: string;
      name: string;
      logo_url?: string | null;
      rating?: number | null;
      rating_count?: number;
    } | null;
  } | null;
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
