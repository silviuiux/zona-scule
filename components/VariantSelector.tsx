import Link from "next/link";
import type { Product } from "@/lib/types";

export default function VariantSelector({
  variants,
  currentSlug,
}: {
  variants: Product[];
  currentSlug: string;
}) {
  if (variants.length === 0) return null;

  return (
    <div>
      <p className="label mb-3 text-text-faint">Variante disponibile</p>
      <div className="flex flex-wrap gap-2">
        <span className="label rounded-full border border-red bg-red px-4 py-2 text-white">
          {variants.find((v) => v.slug === currentSlug)?.variant_label ?? "Curent"}
        </span>
        {variants
          .filter((v) => v.slug !== currentSlug)
          .map((variant) => (
            <Link
              key={variant.id}
              href={`/produse/${variant.slug}`}
              className="label rounded-full border border-border-strong px-4 py-2 text-ink transition-colors hover:border-ink"
            >
              {variant.variant_label ?? variant.name}
            </Link>
          ))}
      </div>
    </div>
  );
}
