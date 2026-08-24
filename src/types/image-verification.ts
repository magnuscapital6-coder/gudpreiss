export type ImageVerificationStatus = 
  | 'VERIFIED'
  | 'MISMATCH'
  | 'MISSING'
  | 'LOW_QUALITY'
  | 'SOURCE_UNAVAILABLE'
  | 'NEEDS_REVIEW'
  | 'SYNCED';

export interface ProductImageSpec {
  id?: string;
  url: string;
  local_path: string;
  width: number;
  height: number;
  mime_type: string;
  alt_de: string;
  is_primary: boolean;
  variant_color?: string;
  hash?: string;
  size_bytes?: number;
}

export interface ProductImageAuditItem {
  product_id: string;
  product_name: string;
  slug: string;
  brand: string;
  category_id: string;
  variant_info: {
    color?: string;
    capacity?: string;
    model?: string;
    sku?: string;
  };
  source: string;
  primary_status: ImageVerificationStatus;
  gallery_status: ImageVerificationStatus;
  overall_status: ImageVerificationStatus;
  primary_image: ProductImageSpec | null;
  gallery_images: ProductImageSpec[];
  match_confidence: number; // 0 to 100%
  notes?: string;
  last_verified_at: string;
}

export interface ImageAuditSummary {
  total_products: number;
  verified_count: number;
  mismatch_count: number;
  missing_count: number;
  low_quality_count: number;
  needs_review_count: number;
  last_audit_at: string;
}
