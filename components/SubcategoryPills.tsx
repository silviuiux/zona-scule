import Link from "next/link";
import { filterHref, type CatalogSearchParams } from "@/lib/filters";
import type { SubcategoryPill } from "@/lib/data/categories";

export default function SubcategoryPills({
  pills,
  active,
}: {
  pills: SubcategoryPill[];
  active: CatalogSearchParams;
}) {
  if (pills.length === 0) return null;

  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:-mx-0 md:px-0">
      {pills.map((pill) => {
        const isActive = active.subcategory === pill.name;
        return (
          <Link
            // Subcategory names aren't globally unique — the same name (e.g.
            // a generic "Diverse" catch-all) can exist under multiple parent
            // categories, so `name` alone collides as a React key. The
            // filtering itself is still correct (category + subcategory are
            // AND-ed together in the actual query), this is just giving each
            // pill a key that's actually unique.
            key={`${pill.parent_category_id ?? "none"}-${pill.name}`}
            href={filterHref(active, "subcategory", pill.name)}
            className={`label shrink-0 whitespace-nowrap rounded-full border px-4 py-2 transition-colors ${
              isActive
                ? "border-red bg-red text-white"
                : "border-border-strong text-ink hover:border-ink"
            }`}
          >
            {pill.name} <span className="opacity-60">{pill.count}</span>
          </Link>
        );
      })}
    </div>
  );
}
