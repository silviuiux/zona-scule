import Link from "next/link";
import type { ProductListingRow } from "@/lib/types";

export default function ProductNavArrows({
  prev,
  next,
}: {
  prev: ProductListingRow | null;
  next: ProductListingRow | null;
}) {
  if (!prev && !next) return null;

  return (
    <>
      {prev && (
        <Link
          href={`/produse/${prev.slug}`}
          aria-label={`Produsul anterior: ${prev.name}`}
          className="fixed left-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-white text-ink shadow-sm transition-colors hover:border-ink lg:flex"
        >
          ←
        </Link>
      )}
      {next && (
        <Link
          href={`/produse/${next.slug}`}
          aria-label={`Produsul următor: ${next.name}`}
          className="fixed right-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border-strong bg-white text-ink shadow-sm transition-colors hover:border-ink lg:flex"
        >
          →
        </Link>
      )}
    </>
  );
}
