import type { Product } from "@/lib/types";

/**
 * Only ever returns Supabase Storage URLs (allowlisted in next.config.ts),
 * never the raw `main_image_url`/manufacturer URLs — those are arbitrary
 * third-party hosts we don't want to hotlink through next/image, and
 * allowing them would force `unoptimized` back on. Components should treat
 * `null` as "render a placeholder."
 */
export function getProductImage(product: Pick<Product, "main_image_storage_url">): string | null {
  return product.main_image_storage_url || null;
}

export function getProductGallery(
  product: Pick<
    Product,
    | "main_image_storage_url"
    | "gallery_storage_url_1"
    | "gallery_storage_url_2"
    | "gallery_storage_url_3"
    | "gallery_storage_url_4"
  >
): string[] {
  return [
    product.main_image_storage_url,
    product.gallery_storage_url_1,
    product.gallery_storage_url_2,
    product.gallery_storage_url_3,
    product.gallery_storage_url_4,
  ].filter((url): url is string => Boolean(url));
}
