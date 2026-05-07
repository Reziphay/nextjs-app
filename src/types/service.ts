export type ServiceStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'PAUSED' | 'ARCHIVED';
export type PriceType = 'FIXED' | 'STARTING_FROM' | 'FREE';

export type ServiceCategory = {
  id: string;
  key: string;
};

export type ServiceImage = {
  id: string;
  media_id: string;
  order: number;
  url: string;
};

export type ServiceBrandContext = {
  id: string;
  name: string;
  owner_id: string;
  logo_url?: string;
  rating: number | null;
  rating_count: number;
};

export type Service = {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  brand_id: string | null;
  brand?: ServiceBrandContext | null;
  service_category_id: string | null;
  service_category: ServiceCategory | null;
  price: number | null;
  price_type: PriceType;
  duration: number | null;
  address?: string;
  status: ServiceStatus;
  rejection_reason?: string;
  images: ServiceImage[];
  rating: number | null;
  rating_count: number;
  my_rating: number | null;
  created_at: string;
  updated_at: string;
};

// ─── Team-member ↔ Service assignment ────────────────────────────────────────

export type ServiceAssignmentStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ServiceAssignmentInitiator = 'MEMBER' | 'OWNER';

export type ServiceAssignment = {
  id: string;
  team_member_id: string;
  service_id: string;
  status: ServiceAssignmentStatus;
  initiated_by: ServiceAssignmentInitiator;
  proposed_description: string | null;
  proposed_price: number | null;
  proposed_duration: number | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

// Trimmed service shape returned alongside an assignable-services listing.
export type AssignableService = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  price_type: PriceType;
  duration: number | null;
  status: ServiceStatus;
  assigned_team_members_count: number;
  assigned_branches_count: number;
  images: { id: string; order: number; url: string }[];
  my_assignment: ServiceAssignment | null;
};

export type ServiceAssignmentRequest = {
  assignment: ServiceAssignment;
  service: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    price_type: PriceType;
    duration: number | null;
    images: { id: string; order: number; url: string }[];
  };
  team_member: {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
  };
  branch: { id: string; name: string };
};

export type AssignedService = ServiceAssignment & {
  service: {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    price_type: PriceType;
    duration: number | null;
    status: ServiceStatus;
    images: { id: string; order: number; url: string }[];
    brand: {
      id: string;
      name: string;
      owner_id?: string;
      logo_url?: string | null;
      rating?: number | null;
      rating_count?: number;
    } | null;
    branch: {
      id: string;
      name: string;
    } | null;
  };
};
