"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductListingRow } from "@/lib/types";
import type { CatalogSearchParams } from "@/lib/filters";

export default function LoadMoreProducts({
  filter,
  initialPage,
  initialHasMore,
  pageSize,
}: {
  filter: CatalogSearchParams;
  initialPage: number;
  initialHasMore: boolean;
  pageSize: number;
}) {
  const [products, setProducts] = useState<ProductListingRow[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const qs = new URLSearchParams();
      if (filter.brand) qs.set("brand", filter.brand);
      if (filter.category) qs.set("category", filter.category);
      if (filter.subcategory) qs.set("subcategory", filter.subcategory);
      if (filter.search) qs.set("search", filter.search);
      qs.set("page", String(nextPage));
      qs.set("pageSize", String(pageSize));

      const res = await fetch(`/api/products?${qs.toString()}`);
      if (!res.ok) throw new Error("request failed");
      const data: { products: ProductListingRow[]; hasMore: boolean } = await res.json();

      setProducts((prev) => [...prev, ...data.products]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch {
      setError("Nu am putut încărca mai multe produse. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {products.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {error && <p className="mt-6 text-center text-sm text-red">{error}</p>}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="label rounded-full border border-border-strong px-8 py-3.5 text-ink transition-colors hover:border-ink disabled:opacity-50"
          >
            {loading ? "Se încarcă…" : "Încarcă mai multe"}
          </button>
        </div>
      )}
    </>
  );
}
