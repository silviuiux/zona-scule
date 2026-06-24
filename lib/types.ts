// Shared types mirroring the Supabase schema described in docs/REBUILD.md §5.1.
// Intentionally omits `airtable_id` (present on brands/categories in the live DB
// but dead weight from the retired Airtable integration) — never read or written here.

export type Product = {
  id: string;
  slug: string | null;
  name: string;
  sku: string | null;
  brand_id: string | null;
  brand_name: string | null;
  model: string | null;
  short_description: string | null;
  category_id: string | null;
  category_text: string | null;
  subcategory_id: string | null;
  subcategory_text: string | null;
  main_image_url: string | null;
  main_image_storage_url: string | null;
  gallery_url_1: string | null;
  gallery_url_2: string | null;
  gallery_url_3: string | null;
  gallery_url_4: string | null;
  gallery_storage_url_1: string | null;
  gallery_storage_url_2: string | null;
  gallery_storage_url_3: string | null;
  gallery_storage_url_4: string | null;
  images_migrated: boolean | null;
  status: string | null;
  featured: boolean | null;
  st1_label: string | null;
  st1_value: string | null;
  st1_details: string | null;
  st2_label: string | null;
  st2_value: string | null;
  st2_details: string | null;
  st3_label: string | null;
  st3_value: string | null;
  st3_details: string | null;
  c1_title: string | null;
  c1_details: string | null;
  c2_title: string | null;
  c2_details: string | null;
  c3_title: string | null;
  c3_details: string | null;
  app_01_title: string | null;
  app_01_details: string | null;
  app_02_title: string | null;
  app_02_details: string | null;
  app_03_title: string | null;
  app_03_details: string | null;
  manufacturer_url: string | null;
  created_at: string | null;
  family_id: string | null;
  family_name: string | null;
  variant_label: string | null;
  ean: string | null;
  long_description: string | null;
  special_features: string | null;
  applications: string | null;
  datasheet_url_1: string | null;
  datasheet_url_2: string | null;
  specs: Record<string, unknown> | null;
  axes: Record<string, unknown> | null;
  enriched: boolean | null;
};

export type ProductListingRow = Product & {
  group_key: string;
  variant_count: number;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  country: string | null;
  short_description: string | null;
  featured: boolean | null;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  hero_image_url: string | null;
  description: string | null;
  featured: boolean | null;
  sort_order: number | null;
};

export type Subcategory = {
  id: string;
  slug: string;
  name: string;
  parent_category_id: string | null;
  description: string | null;
  icon_url: string | null;
  sort_order: number | null;
};

export type ContactMessage = {
  id?: string;
  created_at?: string;
  nume: string;
  email: string;
  telefon: string | null;
  companie: string | null;
  produs: string | null;
  mesaj: string;
};

export type CountRow<K extends string> = { [key in K]: string } & { cnt: number };

export type BrandCount = { brand_name: string; cnt: number };
export type CategoryCount = { category_text: string; cnt: number };
export type SubcategoryCount = { subcategory_text: string; cnt: number };

export type FeaturedSubcategory = {
  id: string;
  name: string;
  slug: string;
  parent_category_id: string | null;
  product_count: number;
  image_url: string | null;
};

export type ProductFilter = {
  brandName?: string;
  categoryText?: string;
  subcategoryText?: string;
  search?: string;
};

export type Article = {
  id: string;
  slug: string;
  profession: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_gradient: string | null;
  tag: string | null;
  read_minutes: number | null;
  product_filter: ProductFilter;
  published_at: string | null;
  created_at?: string;
};
