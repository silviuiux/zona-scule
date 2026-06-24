import Link from "next/link";
import { filterHref, clearFiltersHref, type CatalogSearchParams } from "@/lib/filters";
import type { Category, BrandCount } from "@/lib/types";

type CategoryWithCount = Category & { count: number };

export default function CatalogSidebar({
  categories,
  brands,
  active,
}: {
  categories: CategoryWithCount[];
  brands: BrandCount[];
  active: CatalogSearchParams;
}) {
  const hasActiveFilter = Boolean(active.brand || active.category || active.subcategory);

  return (
    <div className="flex flex-col gap-10">
      {hasActiveFilter && (
        <Link href={clearFiltersHref()} className="label text-red hover:text-red-hover">
          Șterge filtrele ×
        </Link>
      )}

      <div>
        <p className="label mb-4 text-text-faint">Categorii</p>
        <ul className="flex flex-col gap-0.5">
          {categories.map((category) => {
            const isActive = active.category === category.name;
            return (
              <li key={category.id}>
                <Link
                  href={filterHref(active, "category", category.name)}
                  className={`group flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${
                    isActive ? "bg-surface font-medium text-red" : "text-ink hover:bg-surface"
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="label text-text-faint group-hover:text-text-muted">
                    {category.count.toLocaleString("ro-RO")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="label mb-4 text-text-faint">Branduri</p>
        <ul className="flex flex-col gap-0.5">
          {brands.map((brand) => {
            const isActive = active.brand === brand.brand_name;
            return (
              <li key={brand.brand_name}>
                <Link
                  href={filterHref(active, "brand", brand.brand_name)}
                  className={`group flex items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors ${
                    isActive ? "bg-surface font-medium text-red" : "text-ink hover:bg-surface"
                  }`}
                >
                  <span>{brand.brand_name}</span>
                  <span className="label text-text-faint group-hover:text-text-muted">
                    {Number(brand.cnt).toLocaleString("ro-RO")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
