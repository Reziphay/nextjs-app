export type ServiceStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'PAUSED' | 'ARCHIVED';
export type PriceType = 'FIXED' | 'STARTING_FROM' | 'FREE';

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
  category?: string;
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
