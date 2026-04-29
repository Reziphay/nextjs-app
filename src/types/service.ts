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

export type Service = {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  branch_id: string | null;
  service_category_id: string | null;
  service_category: ServiceCategory | null;
  price: number | null;
  price_type: PriceType;
  duration: number | null;
  address?: string;
  status: ServiceStatus;
  rejection_reason?: string;
  images: ServiceImage[];
  created_at: string;
  updated_at: string;
};
