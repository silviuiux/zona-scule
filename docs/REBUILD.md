# Zona Scule — Rebuild Reference

Snapshot date: 2026-06-19, taken from the `main` branch of `silviuiux/zona-scule`. This document is the complete brief for rebuilding the site from scratch in a new project. It covers every page, every on-screen element, the filtering system, and the full Supabase schema as currently used by the live code. Airtable is intentionally excluded — it has been fully retired and has no role in the rebuild.

## 1. What this rebuild keeps vs. changes

**Keep:**
- Supabase as the single data source — same project, same tables/views/RPCs described in §4. The new app should reconnect to the *same* Supabase project so no data migration is needed.
- Light/white color scheme overall.
- Brand red: `rgb(217, 44, 43)` / `#D92C2B` (hover state `rgb(190, 35, 34)`).
- Romanian-language UI copy (the whole site is in Romanian).
- The catalog's underlying logic: family/variant rollup, full-text search, brand/category/subcategory filtering — the *behavior*, not necessarily the current visual implementation.

**Open for reinvention:** layout, typography, component styling, motion design, page composition — everything visual beyond the two constraints above.

**Explicitly excluded:** Airtable (fully retired, no code or schema should reference it), the `scripts/` enrichment CLIs (see §6), and the separate local ETL/scraping workspace (see §6) — none of that is part of the deployed application.

## 2. Stack

- **Framework:** Next.js 16 (App Router, Server Components), React 19, TypeScript.
- **Styling:** Tailwind CSS v4 (used minimally — most components use inline `<style>` tags with hand-written CSS) plus hand-rolled CSS custom properties for design tokens.
- **Data:** Supabase (Postgres + PostgREST + RPC functions), accessed via `@supabase/supabase-js`. No ORM.
- **Hosting:** Vercel, deployed from GitHub (`silviuiux/zona-scule`, public repo), auto-deploy on push to `main`.
- **Smooth scroll:** `lenis` library, mounted globally in the root layout.
- **No auth system, no CMS, no Airtable, no payment processing.** The product catalog is read-heavy/public; the only write paths are an admin recategorization tool and an unfinished contact form (see §3.6 and §3.7).

### Fonts (loaded via Google Fonts in `<head>`)
- **Bungee** — display/headline font (uppercase, blocky, used for big titles like "ZONA SOLUȚII", product names on PDP, hero titles).
- **Recursive** (weights 400/500) — body text, labels, nav, most UI copy. Set as the global `body` font.
- **Inter** (weights 400/500/600) — small UI elements: uppercase labels, breadcrumbs, spec labels, buttons.

### Color tokens (from `globals.css`)
```css
--surface: rgb(244, 244, 244);   /* page background, card-on-card surfaces */
--white: rgb(255, 255, 255);     /* card backgrounds, header bg */
--black: rgb(0, 0, 0);
--light-black: rgb(30, 30, 30);
--red: rgb(217, 44, 43);         /* brand red — KEEP */
--red-hover: rgb(190, 35, 34);
--text-70: rgb(102, 102, 102);
--border: rgba(0, 0, 0, 0.08);
```
There's also a subtle noise-texture SVG overlay system (`.noise-global`, `.noise-card`, `.noise-dark`) applied via `mix-blend-mode: overlay` at low opacity — a nice-to-carry-forward detail but entirely optional for the new visual direction.

## 3. Page-by-page inventory

### 3.1 `/` — Homepage (`app/page.tsx`)
Server component, `force-dynamic`. Fetches in parallel: categories with product counts, all brands with counts, featured subcategories with a representative image, and total product count.

On-screen, top to bottom:
1. **Nav** (sticky, see §3.8).
2. **Animated hero** — brand chips row, big animated headline, subheading, CTA row, all with staggered entrance animations (`AnimatedHero` component receives the brand list to render logo chips).
3. **Hero search bar** (`HeroSearch`) — a search input that on submit routes to `/produse?q=...`; also displays the total product count as social proof.
4. **Category grid** (`CategoryGrid`) — visual grid of top-level categories with hero images and product counts, each linking to `/produse?categorie=...`.
5. **Subcategory carousel** (`SubcategoryCarousel`) — horizontally scrollable rail of "featured" subcategories, each with an image pulled from one of its products and a product count, linking to `/produse?categorie=...&subcategorie=...`.
6. **Footer** (see §3.9).

Global mounted components (in `app/layout.tsx`, present on every page): `SmoothScroll` (Lenis init) and `DotsParallax` (a parallax dot-grid background effect — currently CSS-disabled/hidden in favor of the noise overlay, but the JS still runs).

### 3.2 `/produse` — Catalog listing (`app/produse/page.tsx`)
Server component, `force-dynamic`. This is the main catalog/filter page. Reads `searchParams`: `brand`, `categorie`, `subcategorie`, `q`.

Data fetching per request:
- `getProducts({ page: 1, pageSize: 24 or similar, brandName, categoryText, subcategoryText, search })` — paginated product list from the `product_listing` view.
- `getCategoriesWithCount()` — for the sidebar.
- `getBrandsByFilter({ categoryText, subcategoryText, search })` — brand list scoped to the current filter, with live counts, for the sidebar.
- `getAllSubcategoriesWithCount()` / `getSubcategoriesByBrandName()` depending on whether a brand or category filter is active — feeds the subcategory pill bar.

On-screen:
1. **Nav.**
2. **Breadcrumb** (pill-shaped, uppercase) reflecting active brand/category/subcategory.
3. **Mobile filter toggle + backdrop** (`MobileFilterToggle`, `MobileFilterBackdrop`) — opens the sidebar as an overlay drawer on narrow viewports (breakpoint 768px).
4. **Sidebar** (`Sidebar`, desktop-persistent / mobile-drawer) — flat (non-accordion) list of categories and brands with hover-revealed count pills and an active-state chevron marker. No subcategory nesting here; subcategories moved to the pill bar (see below) in a prior iteration.
5. **Subcategory pill bar** (`SubcategoryBar`) — horizontal row of subcategory pills scoped to the active category and/or brand, each showing a count, with a "Toate" (All) pill showing the total.
6. **Products grid** — responsive grid of `ProductCard` components (see §3.10). Every 25th card gets a special highlight style (`nth-child(25n)`).
7. **Server-side shuffle:** when no subcategory/search filter is active, the product order is randomized per-request (Fisher-Yates) so the catalog doesn't always show the same products first; this shuffle is skipped when a subcategory or text search is active (those want deterministic/relevance order).
8. **Load more** (`LoadMore`, client component) — infinite-scroll-style "ÎNCARCĂ MAI MULTE" button that fetches additional pages from `/api/products`, with a loading skeleton grid, and persists loaded products + scroll position in `sessionStorage` so returning from a product page restores exactly where the user was (including scrolling back to the clicked card).
9. **Footer.**

### 3.3 `/produse/[slug]` — Product detail page (`app/produse/[slug]/page.tsx`)
Server component. `revalidate = 3600` (hourly ISR), `dynamicParams = true` (any slug not pre-rendered is rendered on first request, then cached).

Data fetching: `getProductBySlug(slug)` (queries the raw `products` table directly — bypasses `product_listing` and its null filters, see §5 for why this matters), `getAdjacentProducts(slug, subcategoryText)` for prev/next navigation, and `getProductVariants(familyId)` if the product belongs to a family.

On-screen:
1. **Nav.**
2. **Prev/next arrows** (`ProductNavArrows`) — fixed-position navigation to the adjacent product within the same subcategory (family-level, skips sibling variants).
3. **Editable breadcrumb** (`EditableBreadcrumb`) — brand / category / subcategory trail; "editable" because it doubles as the trigger for the admin recategorization flow described in §3.6 (clicking it lets a logged-in-as-admin-by-convenience user reassign the product's category — there is currently **no authentication gate** on this, see §6 security note).
4. **Product title** (`h1`, Bungee), SKU field with copy-to-clipboard (`SkuCopyField`).
5. **Variant selector** (`VariantSelector`) — dropdown/list of sibling variants in the same family (PFERD products mainly), each linking to its own slug.
6. **Hero image** (`HeroImage`) — main product image with scroll-triggered animation (`ScrollAnimations`).
7. **Gallery section** (`GallerySection`) — up to 4 additional gallery images.
8. **Specs block** — three generic spec rows (`st1`/`st2`/`st3`: label + value + detail).
9. **Characteristics block** — three generic feature rows (`c1`/`c2`/`c3`: title + detail).
10. **Applications block** — three generic "recommended use" rows (`app_01`/`app_02`/`app_03`: title + detail).
11. **"Cere ofertă" (Request a quote) CTA** linking to `/contact?sku=...&brand=...&model=...` to prefill the contact form.
12. **Footer.**

A `loading.tsx` skeleton exists for both `/produse` and `/produse/[slug]` for the Suspense fallback.

### 3.4 `/zona-solutii` — "Solutions" content hub (`app/zona-solutii/page.tsx` + `[slug]/page.tsx`)
Newly added section (not in the original Framer-era design). Profession-targeted articles (instalatori / electricieni / grădină / spălat-presiune) — not a blog, not reviews — that recommend real catalog products. Currently scaffolded with **hardcoded data** in `app/zona-solutii/articles.ts` (no Supabase table yet); the detail page pulls live product cards via `getProducts(article.productFilter)`.

- Listing page: white hero with Bungee title, breadcrumb, profession filter pills, stats, 3-column article card grid (gradient cover per profession, tag, title, excerpt, date, read time). `force-dynamic`.
- Detail page: `generateStaticParams` from the static article list, `revalidate = 3600`. Gradient hero, breadcrumb, profession tag, rich HTML body (two-column layout with a sidebar of related articles + catalog CTA), and a live "produse recomandate" section rendering real `ProductCard`s filtered by the article's brand/category, each linking back into `/produse` with that filter pre-applied.
- This section is a good template for "carry the *idea* forward, redesign the *look*" — in the rebuild, decide whether articles become a real Supabase table (recommended) or stay static.

### 3.5 `/contact` (`app/contact/page.tsx` + `ContactForm.tsx`)
Server page renders a hero ("Pitești, Argeș, România" location tag, title, subtitle, an info bar, a bottom section with a photo) plus the `ContactForm` client component.

**Important — current state is UI-only, not wired up:** `ContactForm` reads `?sku=&brand=&model=` to prefill the "produse de interes" field and message body, but `handleSubmit` only sets local state to show a "MESAJ TRIMIS!" success message — **it does not call Supabase, send an email, or persist anything.** There is a `contact_messages` table planned (see `supabase/setup.sql` referenced on the unreleased `redesign/test` branch) but it isn't live on `main`. The rebuild should actually wire this form to insert into a `contact_messages` table (or send an email via an API route) — this is a real gap, not a design choice to preserve.

### 3.6 `/admin` (`app/admin/page.tsx` + `AdminClient.tsx` + `actions.ts`)
Internal tool, not linked from the public nav. Lets someone reassign which top-level category a subcategory (and all its products) belongs to, rename a subcategory, or bulk-reassign multiple subcategories at once. Server actions (`reassignSubcategory`, `renameSubcategory`, `bulkReassign`) write directly to `subcategories` and `products` and call `revalidatePath('/admin')` + `revalidatePath('/produse')`.

**Security note to fix in the rebuild:** this route has **no authentication check at all** on `main` — anyone who finds `/admin` can repoint categories and trigger bulk writes. A previous branch (`redesign/test`, unmerged) added `ADMIN_USER`/`ADMIN_PASS` env-gated access; the rebuild should include real auth (even basic) on this route from day one.

### 3.7 API routes (`app/api/*/route.ts`)
Thin JSON endpoints consumed by client components:
- `GET /api/products` — paginated/filtered product list (backs `LoadMore`).
- `GET /api/search?q=` — lightweight typeahead (max 8 results, slim fields), `Cache-Control: no-store`, backs the nav search dropdown.
- `GET /api/subcategories?categorie=` — subcategories for a category name.
- `GET /api/all-categories` — full category name list.
- `GET /api/brand-categories?brand=` — category counts scoped to one brand (computed client-route-side from raw `products`, not via RPC).
- `POST /api/update-product-category` — writes `category_id`/`category_text`/`subcategory_id`/`subcategory_text` on one product; uses the **service-role key** (`SUPABASE_SERVICE_KEY`, falling back to the anon key if unset) to bypass RLS for the write. Same "no auth gate" caveat as `/admin`.

### 3.8 `Nav` component (`components/Nav.tsx`)
Client component, present on every page via being imported per-page (not in the root layout). Sticky header with scroll-shadow state, logo linking home, a debounced (250ms) typeahead search box (keyboard nav with arrow keys + Enter, click-outside-to-close, hits `/api/search`), and three nav links: **Catalog** (`/produse`), **Zona Soluții** (`/zona-solutii`), **Contact** (`/contact`).

### 3.9 `Footer` component
Present on every page. Social links bar (Facebook, Instagram, YouTube, email, phone — currently placeholder/generic URLs), a three-column grid (company blurb, "INFORMAȚII" links — currently `href="#"` placeholders for Terms/Returns/SEAP/ANPC, contact details with phone/email/address/CIF), and a bottom bar with company name, a personal credit link, and the year.

### 3.10 `ProductCard` component
Shared by the catalog grid, load-more results, and the "Zona Soluții" embedded recommendations. Shows: brand name, model/short-description, main image (Supabase Storage URL preferred, falls back to `main_image_url`), and up to two "default" spec chips (`st1`, `st2`). On hover: if the product has a second gallery image, cross-fades to a full-bleed cover shot of it; otherwise the main image gets a subtle zoom. If the product has at least one filled "application" field, a single randomly-but-deterministically chosen one (hashed from the product id, so it's stable per product) swaps in to replace the spec chips on hover — adds variety across the grid without being random per render.

## 4. Filtering & search system

This is the logic to reproduce, independent of UI:

- **Filter dimensions:** brand (`brand_name`), category (`category_text`), subcategory (`subcategory_text`), free-text search (`q`), and a `featured` boolean flag (used for homepage curation, not exposed as a user filter).
- **Combining filters:** all active filters are AND-ed together as exact-match `.eq()` clauses against `product_listing` (see §5), except search.
- **Search:** uses a Postgres generated `search_vector` tsvector column with a GIN index (`products_search_idx`). The query string is split on whitespace, each token is sanitized (strip `! & | ( ) ' " : \ < > *`), suffixed with `:*` for prefix matching, tokens dropped if ≤2 chars after sanitizing, and AND-ed (`&`) into a single `tsquery`, executed via `.textSearch('search_vector', tsq, { config: 'simple' })`. The `simple` config means no language-specific stemming — appropriate for Romanian brand/model names mixed with manufacturer codes.
- **Counts:** every filter sidebar/pill needs a *count*, and Supabase's REST API caps default counts at 1000 rows, so every count is computed via a Postgres RPC function (`count_products_by_brand`, `count_products_by_category`, `count_products_by_subcategory`, `get_brands_by_filter`, `get_subcategories_by_brand`) rather than a client-side `.select(..., {count})` on a filtered query. This RPC pattern should be preserved in the rebuild — it's the fix for a real scaling limit, not incidental.
- **Pagination:** simple offset pagination (`.range()`), page size 24 for the initial load, 100 for "load more" batches via `/api/products`.
- **Ordering:** alphabetical by `name` by default; randomized (server-side Fisher-Yates, fresh per request) only on the unfiltered/non-search default view, to keep the homepage-adjacent catalog feeling less static.
- **Family/variant rollup:** see §5 — this is the trickiest part to get right and is the actual root cause of a real bug encountered on `main` (PFERD products invisible after re-upload because the listing view's `not null` filters excluded rows missing `slug`/`main_image_storage_url`, while the detail page queried the raw table and worked fine). Any rebuild of the listing query must keep the `product_listing` view's null-filtering in sync with whatever a "valid, visible" row means, and the *detail* page should always read the raw `products` table by primary slug, not the view.

## 5. Supabase schema

Single Supabase project, Postgres + PostgREST + Storage. No secret values are included anywhere below — only table/column/function names and env var *names*.

### 5.1 Core tables

**`products`** — one row per SKU. Columns actually read/written by the app (from `lib/supabase.ts`'s `Product` type and the admin/API write paths):

| Column | Type | Notes |
|---|---|---|
| `id` | uuid/text (PK) | |
| `slug` | text | unique, used for routing; listing filters require non-null |
| `name` | text | also the default sort key |
| `sku` | text | |
| `brand_id`, `brand_name` | fk + denormalized text | |
| `model` | text | |
| `short_description` | text | |
| `category_id`, `category_text` | fk + denormalized text | |
| `subcategory_id`, `subcategory_text` | fk + denormalized text | |
| `main_image_url` | text | original/external source image |
| `main_image_storage_url` | text | Supabase Storage copy; listing requires non-null |
| `gallery_url_1..4` | text | external |
| `gallery_storage_url_1..4` | text | Storage copies |
| `images_migrated` | boolean | tracks the image migration job |
| `status` | text | |
| `featured` | boolean | |
| `st1_label/value/details`, `st2_*`, `st3_*` | text | generic spec rows shown on PDP |
| `c1_title/details`, `c2_*`, `c3_*` | text | generic characteristic rows |
| `app_01_title/details`, `app_02_*`, `app_03_*` | text | generic application rows |
| `manufacturer_url` | text | |
| `created_at` | timestamp | |
| `search_vector` | tsvector, **generated column** | backs full-text search; GIN index `products_search_idx` |
| `family_id` | text | groups variants (e.g. `FAM-06286`); added by the PFERD-variants migration |
| `family_name` | text | |
| `variant_label` | text | the varying axis (e.g. a dimension code) |
| `ean` | text | |
| `long_description` | text | scraped prose, fuller than `short_description` |
| `special_features` | text | |
| `applications` | text | |
| `datasheet_url_1`, `datasheet_url_2` | text | |
| `specs` | jsonb | sparse per-variant spec map (GIN index `products_specs_gin_idx`) |
| `axes` | jsonb | typed axes, e.g. `{dia_outer, len_cut, grit, cut, ...}` |
| `enriched` | boolean, default false | whether the AI-enrichment pass has run on this row |

Index: `products_family_id_idx` on `family_id`.

**`brands`** — `id`, `slug`, `name`, `logo_url`, `brand_color`, `country`, `short_description`, `featured`.

**`categories`** — `id`, `slug`, `name`, `hero_image_url`, `description`, `featured`, `sort_order`.

**`subcategories`** — `id`, `slug`, `name`, `parent_category_id` (fk → `categories.id`), `description`, `icon_url`, `sort_order`.

**`contact_messages`** — referenced in project notes as part of an unmerged branch's setup script; not present/used on `main`. If the rebuild wires up the contact form for real, this table (or equivalent) needs to be created — suggested shape: `id, created_at, nume, email, telefon, companie, produs, mesaj`.

### 5.2 View: `product_listing`

The catalog listing reads this view, not the raw table, so that PFERD-style product *families* (many SKUs that are really "the same product in different sizes") collapse into one card. Full definition (non-destructive, additive):

```sql
create or replace view product_listing as
select distinct on (coalesce(p.family_id, p.id::text))
       p.*,
       coalesce(p.family_id, p.id::text)                                 as group_key,
       count(*)  over (partition by coalesce(p.family_id, p.id::text))   as variant_count
from products p
order by coalesce(p.family_id, p.id::text),
         (p.main_image_storage_url is null),   -- rows WITH an image first
         p.name nulls last;

alter view product_listing set (security_invoker = on);
grant select on product_listing to anon, authenticated;
```

Products without a `family_id` group with themselves (via `coalesce(family_id, id)`), so nothing is hidden — every product appears in exactly one group. The representative row chosen per group prefers one that has a `main_image_storage_url`, which is what makes the listing's `not('main_image_storage_url','is',null)` filter behave correctly. **Known sharp edge:** if every variant in a family is missing `slug` or `main_image_storage_url`, the whole family vanishes from the listing even though direct-link/detail-page access (which queries `products` directly) still works — this is exactly what happened with the re-uploaded PFERD rows. The rebuild should either fix data-completeness at import time or relax/monitor this filter.

### 5.3 RPC functions (Postgres functions called via `.rpc()`)

These exist purely to get accurate aggregate counts without hitting PostgREST's 1000-row default cap. Exact SQL bodies aren't captured in the app repo (they live in the Supabase project itself) — recreate with this contract:

- **`count_products_by_brand()`** → rows of `{ brand_name: text, cnt: bigint }`, one row per brand across the whole catalog.
- **`count_products_by_category()`** → rows of `{ category_text: text, cnt: bigint }`.
- **`count_products_by_subcategory()`** → rows of `{ subcategory_text: text, cnt: bigint }`.
- **`get_brands_by_filter(p_category text, p_subcategory text, p_search text)`** → rows of `{ brand_name: text, cnt: bigint }`, scoped to whatever combination of category/subcategory/search is currently active (any param may be null = unfiltered on that dimension). Used to keep the sidebar's brand counts in sync with the active filter.
- **`get_subcategories_by_brand(p_brand text)`** → rows of `{ subcategory_text: text, cnt: bigint }`, scoped to one brand.
- **`get_featured_subcategories_with_image()`** → rows of `{ id, name, slug, parent_category_id, product_count, image_url }` — used by the homepage carousel; picks a representative image per featured subcategory.

**Known follow-up noted in project docs:** these RPCs currently count individual SKUs, not families, so sidebar counts can over-count families with many variants. If family-accurate counts matter, change each `count(*)` to `count(distinct coalesce(family_id, id))` inside the function bodies.

### 5.4 Storage

Supabase Storage buckets hold the migrated copies of product images (`main_image_storage_url`, `gallery_storage_url_1..4`), referenced by their public URL, hostnamed at `dfbhgnbqwoinujnzfxsl.supabase.co` per `next.config.ts`'s `images.remotePatterns`. Other allowed remote image hosts (for products not yet migrated to Storage): `milwaukee-media-images.s3.amazonaws.com`, `assets.pferd.com`, `res.cloudinary.com`, `novaliaromania.ro` / `www.novaliaromania.ro`, `www.krause-systems.co.uk`, and a wildcard `*.s3.amazonaws.com` plus a catch-all `**`. **Note:** `next/image` is used with the `unoptimized` prop throughout (`ProductCard`, PDP gallery) — Next's own image optimization/resizing is bypassed entirely. This is one real, fixable contributor to perceived slowness (see §6) and the rebuild should reconsider it.

### 5.5 RLS

Not fully auditable from the app repo (RLS policies live in Supabase, not in code), but the working assumption baked into the code is: `anon` key can read all public catalog tables/views and *write* to `subcategories`/`products` from `/admin` and `/api/update-product-category` (no auth check gates these in the current app — see §3.6/§3.7 security notes). The `product_listing` view explicitly grants `select` to `anon, authenticated` and is `security_invoker = on` (so it respects the underlying table's RLS rather than the view owner's). The rebuild should tighten this: read-only anon access to catalog tables, service-role-only (server action / route handler, never client-exposed) for any write path, with a real auth check in front of `/admin`.

### 5.6 Environment variables (names only — get actual values from the current `.env.local`, never put them in any document)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` (service-role key; used by `/api/update-product-category` for a write that needs to bypass RLS)
- `ANTHROPIC_API_KEY` (only used by the standalone enrichment scripts in §6 — not needed by the deployed app itself)
- Suggested additions for the rebuild: `ADMIN_USER` / `ADMIN_PASS` (or a proper auth provider) to gate `/admin`.

To reconnect the new project to the *same* Supabase project: copy these same env vars (with their real values, from wherever they're currently stored — e.g. the Vercel project settings or the local `.env.local`) into the new project's environment. No schema changes are required to start the rebuild; the existing tables/views/RPCs above are simply reused as-is.

## 6. What NOT to carry forward, and the "is it laggy" question

**Confirmed dead weight, safe to exclude from the new repo:**
- `scripts/*.mjs` and `scripts/*.py` (Kärcher/PFERD enrichment + verification CLIs) — verified by grep: **not imported by anything in `app/`, `lib/`, or `components/`, and not referenced by any `package.json` script** (`package.json` only defines `dev`/`build`/`start`/`lint`). They're one-off CLI tools a developer runs manually with `node --env-file=.env.local scripts/...`; Next.js never bundles or executes them. Excluding them from the rebuild is correct, but they were never running in production and weren't slowing the live site down either way.
- A large `KARCHER-Grid_view.csv` (1.8MB) sits at the repo root — leftover data export, not read by the app. Drop it.
- The entire separate local folder of scraping/enrichment scripts and CSVs (Kärcher/PFERD/Milwaukee/TOYA/RUKO pipelines, ~35 Python scripts, tens of MB of CSVs) is a *different folder* from the deployed repo entirely — it's a personal ETL workspace that pushes data into Supabase, not part of what Vercel builds or serves. It has no bearing on site performance. **Separately worth flagging:** an internal audit of that folder (dated 2026-06-10) found a live Airtable personal-access-token hardcoded in plain text in one script. Airtable itself is retired, but if that token hasn't been rotated yet, it's worth doing regardless of this rebuild — it's unrelated to the website but is a live credential exposure.

**The actual likely sources of "laggy":** none of the above. The real candidates, visible directly in the route code:
1. **`force-dynamic` on the homepage, `/produse`, `/zona-solutii`, and `/admin`** — every single request to these routes re-runs all of their Supabase queries server-side with zero caching (no ISR, no `revalidate`). The homepage alone fires 4 parallel queries including two that each do a paired table+RPC round trip. `/produse` does even more per request (products + categories + brands-by-filter + subcategories). This is the most likely real cause of slow page loads, and is straightforward to improve in the rebuild with `revalidate` (time-based ISR) instead of `force-dynamic`, or on-demand revalidation tied to admin writes.
2. **`next/image` with `unoptimized` everywhere** — Next's automatic resizing/format-conversion/lazy-loading optimization is disabled, so the browser downloads full-size source images (some from un-migrated external hosts) for every product card.
3. Several `lib/supabase.ts` helpers do two sequential/parallel round trips per call (table + RPC) rather than a single joined query — fine at current scale, worth revisiting if the catalog grows.

The rebuild should address #1 and #2 as real performance work, rather than assuming the old scripts were the cause.

## 7. Open decisions for the new project

These weren't nailed down on `main` and are worth deciding explicitly at the start of the rebuild rather than silently inheriting:
- Should `/admin` and the product-category-write API get real auth before the rebuild ships, or stay as an internal/manual tool gated only by URL obscurity?
- Should the contact form actually persist messages (Supabase insert + maybe an email notification), and should `contact_messages` be created now?
- Should "Zona Soluții" articles move into a real Supabase table (so they're editable without a code deploy), or stay as static data in the new codebase?
- Should the family/variant rollup view's "hide if missing slug or storage image" rule be relaxed, monitored, or fixed at import time, to avoid repeating the PFERD-invisible-products bug?
