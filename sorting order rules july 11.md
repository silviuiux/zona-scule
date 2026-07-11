# Sorting order rules — July 11, 2026

Snapshot of every rule that determined the order products appeared in across the site, captured **before** all of it was replaced with a single global rule: **price, descending (most expensive first)**. Kept for reference in case any of this logic needs to be restored or partially reused later.

## 1. `getProducts()` — general filtered fetch (`lib/supabase.ts`)

Used by every non-"Toate" `/produse` view (`brand=`, `categorie=`, `subcategorie=`, `q=` search), by `LoadMore`/`/api/products` pagination for those views, by `/api/search` (typeahead), and by the "Produse recomandate" block on `/zona-solutii/[slug]` article pages.

- Queried `product_listing_mv` (one row per product family) with `.order('name')` — **ascending alphabetical by name**, no secondary sort key.
- Full-text search (`q=`) filtered which rows matched via `search_vector`/`ro_unaccent`, but did **not** rank results by relevance — matches were still returned alphabetically.

## 2. `getHomeProducts()` — "Toate" merchandising tiers (`lib/supabase.ts`)

Applied only to the fully-unfiltered `/produse` view (no brand/category/subcategory/search — the "Toate" state). Prioritized four business-picked tiers ahead of everything else, each internally sorted alphabetical by name:

1. **Aspiratoare** — every product in these subcategories: Aspiratoare casnice, Aspiratoare industriale, Aspiratoare de geamuri, Aspiratoare umed-uscat (NT), Aspiratoare uscate (T).
2. **Scule electrice** — the entire category.
3. **Rest of Curatenie** — cleaning machines/appliances not already counted as aspiratoare above (plus a tiny sub-tier for the ~1 Curatenie row with no subcategory at all, to avoid it vanishing under 3-valued SQL NULL logic).
4. **Everything else.**

Tiers were stitched together across "Load more" pages via offset math against per-tier row counts (5 cheap `count`-only queries up front, then per-tier `.range()` queries for whichever tiers a given page's window overlapped). No RPC was involved — filtering was done with chained PostgREST methods (`.in`, `.eq`, `.not(...)`) against `product_listing_mv`.

On error, this silently fell back to plain `getProducts()` (alphabetical, no tiering) rather than a hard failure.

## 3. Server-side shuffle (`app/produse/page.tsx`)

A Fisher-Yates shuffle, re-rolled on every request (page has `dynamic = 'force-dynamic'`), applied **only** to the first (server-rendered) page of results, and **only** in this specific case:

| View | Shuffled? |
|---|---|
| "Toate" (fully unfiltered) | No — kept `getHomeProducts()`'s tier order |
| Subcategory selected (with or without category/brand) | No — kept stable name order |
| Search (`q=`) | No — kept stable name order |
| **Brand-only or category-only** (no subcategory, no search) | **Yes** — shuffled |

Known inconsistency: shuffle only affected page 1. `LoadMore`'s subsequent pages (`/api/products` → `getProducts()`) were never shuffled, so scrolling past page 1 on a shuffled brand/category view snapped back to strict alphabetical order with no shared seed between the two.

## 4. `LoadMore.tsx` pagination

Purely additive (`fetch next offset page → append to state`) — never re-sorted anything client-side. It forwarded the same filters as the initial load to `/api/products`, which mirrored the same `isTrulyUnfiltered` branching as `app/produse/page.tsx`, so order stayed consistent across pages for the "Toate" and subcategory/search cases (but not for the shuffled brand/category case — see §3).

## 5. Other listing surfaces

- **Homepage** (`app/page.tsx`): no product-card grid at all — category cards ordered by `categories.sort_order` (admin-configured), a featured-subcategory carousel ordered by the `get_featured_subcategories_with_image` RPC, and a brand-chip strip sorted by product count descending (client-side).
- **Brand/category pages**: no separate route — both went through `/produse` → `getProducts()` (alphabetical) + shuffle rules from §3.
- **Search** (`/api/search` typeahead and `/produse?q=`): both alphabetical by name (§1) — search only filtered which rows matched, it never ranked them.
- **PDP** (`app/produse/[slug]/page.tsx`): variant selector/carousel ordered by `variant_label`; prev/next navigation ordered by `name` (alphabetical sequence within a subcategory, or catalog-wide if none).
- **Admin catalog** (`app/admin/catalog/page.tsx`): separate concern, queries the raw `products` table directly (not `product_listing_mv`), `.order('name')`, no tiering, no shuffle, no family-dedup. Unaffected by this change — internal tool, not the public storefront.

## 6. Underlying category/subcategory/brand sidebar ordering (not product order, but adjacent)

- Categories/subcategories: `.order('sort_order', { ascending: true, nullsFirst: false })` — an admin-configured manual order column.
- Brands and subcategory pill counts: base table alphabetical, then re-sorted client-side by product count descending.
These were **not** touched by the price-sort change — they govern which filter options appear and in what order, not the product grid itself.

## 7. What replaced all of this

As of July 11, 2026, all of the above (tiering, shuffle, alphabetical fallback) was retired in favor of one rule, applied everywhere `getProducts()` is used: **order by `price` descending** (most expensive item first), with `name` ascending as a tiebreak for products at the same price. This required a database migration adding `price` to the `product_listing`/`product_listing_mv` views (it previously only existed on the raw `products` table and wasn't exposed to the storefront's listing queries).
