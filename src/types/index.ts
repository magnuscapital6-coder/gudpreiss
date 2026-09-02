export type UserRole = 'customer' | 'admin' | 'manager' | 'editor' | 'support';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  parent_id?: string | null;
  active: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  image_url?: string;
  attributes_json: Record<string, string>;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  gtin?: string;
  mpn?: string;
  google_product_category?: string;
  condition?: 'new' | 'refurbished' | 'used';
  brand_id?: string;
  brand_name?: string;
  category_id?: string;
  category_name?: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock: number;
  low_stock_threshold: number;
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  on_sale: boolean;
  weight_kg: number;
  rating: number;
  review_count: number;
  images: string[];
  specifications?: Record<string, any>;
  variants?: ProductVariant[];
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon_code?: string;
}

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string;
  tracking_number?: string;
  coupon_code?: string;
  bank_transfer_iban?: string;
  bank_transfer_bic?: string;
  bank_transfer_holder?: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  times_used: number;
  active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id?: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  status: 'pending' | 'approved' | 'hidden';
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  price_text?: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  position: 'hero' | 'promo_side' | 'middle_banner' | 'category_card';
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  seo_title?: string;
  seo_description?: string;
  keywords?: string[];
  seo_score?: number;
  read_time_minutes?: number;
  featured?: boolean;
  views_count?: number;
}

export interface StoreSettings {
  store_name: string;
  contact_email: string;
  contact_phone: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  free_shipping_threshold: number;
  default_shipping_fee: number;
  stripe_enabled: boolean;
  cod_enabled: boolean;
  iban?: string;
  bic?: string;
  bank_name?: string;
  account_holder?: string;
  vat_number?: string;
  logo_url?: string;
  logo_dark_url?: string;
  logo_mobile_url?: string;
  favicon_url?: string;
  apple_touch_icon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  // Email templates (editable from admin)
  email_template_order_customer?: string;
  email_template_order_admin?: string;
  email_subject_order_customer?: string;
  email_subject_order_admin?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'system' | 'alert';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface LegalPage {
  slug: 'impressum' | 'privacy' | 'terms' | 'return-policy';
  title: string;
  subtitle: string;
  content: string;
  last_updated: string;
}
