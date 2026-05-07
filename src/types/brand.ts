export type BrandStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CLOSED';

export type BrandCategory = {
  id: string;
  key: string;
};

export type Break = {
  id?: string; // undefined for client-only draft breaks not yet persisted
  start: string;
  end: string;
};

export type Branch = {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  address1: string;
  address2?: string;
  phone?: string;
  email?: string;
  is_24_7: boolean;
  opening?: string;
  closing?: string;
  breaks: Break[];
  cover_media_id?: string | null;
  cover_url?: string | null;
};

export type BrandGalleryItem = {
  id: string;
  media_id: string;
  url: string;
  order: number;
};

export type BrandSocialLinks = {
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  whatsapp_url?: string;
  linkedin_url?: string;
  x_url?: string;
  website_url?: string;
};

export type BrandViewerRole = 'OWNER' | 'MEMBER' | 'NONE';

export type Brand = {
  id: string;
  name: string;
  description?: string;
  status: BrandStatus;
  owner_id: string;
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
  };
  logo_url?: string;
  gallery?: BrandGalleryItem[];
  branches?: Branch[];
  categories: BrandCategory[];
  rating: number | null;
  rating_count: number;
  my_rating: number | null;
  // Set on getMyBrands and getBrandById; undefined on public listings.
  viewer_role?: BrandViewerRole;
  viewer_branch_id?: string | null;
  created_at: string;
  updated_at: string;
} & BrandSocialLinks;
