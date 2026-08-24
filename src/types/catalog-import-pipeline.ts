export interface ProductIdentity {
  ean?: string;
  gtin?: string;
  upc?: string;
  asin?: string;
  mpn?: string;
  sku: string;
  brand: string;
  model: string;
  variant_color?: string;
  variant_capacity?: string;
  size?: string;
}

export interface FieldTraceability<T> {
  value: T;
  source_name: string;
  source_url: string;
  confidence_score: number; // 0 to 100
  extracted_at: string;
}

export type PipelineStatus = 
  | 'DISCOVERED'
  | 'ACCESSIBILITY_CHECKED'
  | 'EXTRACTED'
  | 'NORMALIZED'
  | 'VALIDATED'
  | 'NEEDS_REVIEW'
  | 'SOURCE_BLOCKED'
  | 'IMPORT_INCOMPLETE'
  | 'PUBLISHED';

export interface TracedProduct {
  id: string;
  identity: ProductIdentity;
  name: FieldTraceability<string>;
  slug: string;
  price: FieldTraceability<number>;
  compare_at_price?: FieldTraceability<number>;
  description: FieldTraceability<string>;
  short_description: FieldTraceability<string>;
  category_id: string;
  brand_id: string;
  primary_image: FieldTraceability<string>;
  gallery_images: FieldTraceability<string>[];
  stock: number;
  overall_confidence_score: number; // 0 to 100
  pipeline_status: PipelineStatus;
  validation_issues: string[];
  created_at: string;
  updated_at: string;
}

export interface ImportRunReport {
  execution_id: string;
  mode: 'DRY_RUN' | 'EXECUTE';
  total_detected: number;
  total_imported: number;
  total_rejected: number;
  total_needs_review: number;
  total_images_processed: number;
  fallback_levels_used: {
    level_1_official: number;
    level_2_structured_data: number;
    level_3_variant_match: number;
    level_4_multisource_fallback: number;
  };
  duplicates_prevented: number;
  average_confidence_score: number;
  sources_summary: {
    source_name: string;
    products_count: number;
    blocked_count: number;
  }[];
  execution_timestamp: string;
}
