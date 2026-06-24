// URL helpers for the catalog filter UI. Pure functions so sidebar/pill
// components can stay server components — no client JS needed just to
// build an href that toggles a filter on/off in the query string.

export type CatalogSearchParams = {
  brand?: string;
  category?: string;
  subcategory?: string;
  search?: string;
};

const KEYS: (keyof CatalogSearchParams)[] = ["brand", "category", "subcategory", "search"];

/**
 * Builds the `/produse` href for toggling one filter key to `value`.
 * Clicking an already-active value clears that filter instead (toggle).
 * Changing `category` clears `subcategory` (a stale subcategory from a
 * different category would otherwise produce an impossible AND-ed filter).
 */
export function filterHref(
  current: CatalogSearchParams,
  key: keyof CatalogSearchParams,
  value: string
): string {
  const next: CatalogSearchParams = {};
  for (const k of KEYS) if (current[k]) next[k] = current[k];

  if (next[key] === value) {
    delete next[key];
  } else {
    next[key] = value;
  }

  if (key === "category" && next.category !== current.category) {
    delete next.subcategory;
  }

  const qs = new URLSearchParams(
    Object.entries(next).filter(([, v]) => Boolean(v)) as [string, string][]
  ).toString();

  return qs ? `/produse?${qs}` : "/produse";
}

/** Href that clears every filter. */
export function clearFiltersHref(): string {
  return "/produse";
}
