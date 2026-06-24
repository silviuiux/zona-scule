import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { getProductImage } from "@/lib/image";
import type { ProductListingRow } from "@/lib/types";

export default function ProductCard({ product }: { product: ProductListingRow }) {
  const specs = [
    product.st1_label && product.st1_value ? `${product.st1_label}: ${product.st1_value}` : null,
    product.st2_label && product.st2_value ? `${product.st2_label}: ${product.st2_value}` : null,
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/produse/${product.slug}`}
      className="group flex flex-col border border-border bg-white transition-colors hover:border-ink"
    >
      <div className="relative aspect-square overflow-hidden border-b border-border">
        <ProductImage
          src={getProductImage(product)}
          alt={product.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {product.variant_count > 1 && (
          <span className="label absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-text-muted shadow-sm">
            {product.variant_count} variante
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand_name && (
          <p className="label text-text-faint">{product.brand_name}</p>
        )}
        <h3 className="text-sm font-medium leading-snug text-ink transition-colors group-hover:text-red">
          {product.name}
        </h3>
        {specs.length > 0 && (
          <p className="mt-auto pt-2 text-xs leading-relaxed text-text-muted">
            {specs.join(" · ")}
          </p>
        )}
      </div>
    </Link>
  );
}
