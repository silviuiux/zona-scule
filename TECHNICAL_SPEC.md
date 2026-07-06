# Zona Scule — Technical Specification Document

**Version:** 1.0 · **Date:** 2026-07-05 · **Status:** Draft for review

---

## 1. Executive Summary

Zona Scule (zonascule.ro) is a B2B/B2C product catalog website for a Romanian professional-tools distributor, presenting ~31,000 products across 28 brands, 38 categories, and 80 subcategories. It is built on Next.js 16 (App Router, Turbopack) with React 19 and TypeScript (strict mode), backed by Supabase PostgreSQL for data, storage, and full-text search. There is no e-commerce checkout; the site drives leads via a contact form (stored in Supabase, notified via Resend email) and offers an internal admin dashboard for taxonomy management, protected by a lightweight HMAC-cookie session.

The architecture is sound for its scale: hybrid rendering (ISR for stable pages, dynamic for filtered listings), a materialized view for family-deduplicated listings, tsvector/GIN full-text search, and a Claude-assisted data-enrichment pipeline that scrapes and normalizes supplier data (Kärcher et al.). Airtable is no longer part of the stack — Supabase is the sole source of truth, and the former bidirectional sync tool has been removed.

The code review identified **no critical vulnerabilities but several high-impact gaps**: (a) SEO is largely unrealized — no sitemap, robots, per-product metadata, or structured data, which for a 31k-product catalog is the single biggest missed opportunity; (b) admin authentication reuses the login password as the session-signing secret and has no login rate limiting; (c) the main catalog page performs ~10–12 uncached database round-trips per view; (d) a wildcard image-host allowlist turns the image optimizer into an open proxy; and (e) there are zero automated tests and no CI. Section 7 lays out all findings with severity and suggested fixes for review before any changes are made.

---

## 2. System Overview

| Attribute | Value |
|---|---|
| Purpose | Product catalog + lead generation for professional tools distributor |
| Framework | Next.js 16.2.4 (App Router, Turbopack), React 19.2.4, TypeScript 5 (strict) |
| Database | Supabase PostgreSQL (JS client 2.105.3) + Supabase Storage for images |
| Styling | Tailwind CSS 4 (via PostCSS) + large inline `<style>` blocks; CSS variables; SVG noise-texture system |
| Fonts | Bungee / Bungee Inline (display), Recursive (body), Inter (UI) via Google Fonts `<link>` |
| Hosting | Vercel (Analytics 1.6.1 enabled) |
| Email | Resend (contact-form notifications) |
| Enrichment | Anthropic Claude SDK 0.95.0 (scripts only) |
| Smooth scroll | Lenis 1.3.23 |
| Auth | Custom HMAC-signed cookie session for `/admin` (8h TTL) |
| Data volume | 31,167 products, 28 brands, 38 categories, 80 subcategories |

## 3. Application Structure

### 3.1 Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | ISR (1h) | Homepage: animated hero, category grid, featured-subcategory carousel, services, product carousel |
| `/produse` | `force-dynamic` | Catalog with sidebar filters (brand/category/subcategory), search, pagination, mobile filter drawer, infinite Load More |
| `/produse/[slug]` | ISR (1h) | Product detail: specs, gallery, variant selector, prev/next navigation, SKU copy |
| `/contact` | Static | Contact form (server action → Supabase insert + Resend email) |
| `/zona-solutii` | ISR | Article listing with profession filter (static article data in `articles.ts`) |
| `/zona-solutii/[slug]` | ISR | Article detail with related-product links |
| `/admin` | Dynamic, auth | Subcategory reassignment/rename dashboard (`AdminClient.tsx`) |
| `/admin/login` | Public | Login form |
| `/admin/status` | Dynamic, auth | Sync status and data-health dashboard |

**API endpoints (all public, GET):** `/api/products` (paginated filtered listing, mirrors `/produse` logic), `/api/search` (typeahead, max 8 slim results), `/api/brand-categories` (category counts per brand).

### 3.2 Key modules

- **`lib/supabase.ts` (574 lines)** — client creation, all domain types (`Product`, `Brand`, `Category`, `Subcategory`), and ~15 query helpers: `getProducts` (filters + tsvector search + pagination over `product_listing_mv`), `getHomeProducts` (5-tier merchandising fetch: aspiratoare → scule electrice → Curatenie → rest), `getProductBySlug`, `getAdjacentProducts`, `getProductVariants`, taxonomy/count helpers.
- **`lib/auth.ts` (99 lines)** — Edge-compatible HMAC session: `createSessionToken` (payload = issuedAt), `verifySessionToken` (constant-time signature check, 8h expiry), `hasValidAdminSession`, `checkAdminCredentials` (env `ADMIN_USER`/`ADMIN_PASS`).
- **`proxy.ts` (40 lines)** — Next.js 16 middleware; thin auth gate for `/admin/*` redirecting to login. Deliberately not the sole security boundary — server components re-verify (CVE-2025-29927-aware design).
- **`lib/quote-pricing.ts`** — quote pricing: 25% margin, 1% volume discount per 10 units, capped at 42%.
- **`app/contact/actions.ts`** — validates form, inserts into `contact_messages` (anon key, INSERT-only RLS), best-effort Resend notification.
- **`app/admin/actions.ts`** — server actions (reassign products, rename subcategories); each guarded by `assertAdmin()`; uses service-role client.

### 3.3 Components

Navigation/layout: `Nav` (443 lines, sticky navbar + debounced typeahead), `Footer`, `NavigationProgress` (TransitionLink progress bar), `SmoothScroll` (Lenis), `DotsParallax`. Homepage: `AnimatedHero`, `HeroSearch`, `CategoryGrid`, `ServicesGrid`, `SubcategoryCarousel`. Catalog/PDP: `ProductCard` (hover image swap, spec chips), `Sidebar`, `SubcategoryBar`, `LoadMore`, `MobileFilterDrawer`, `GallerySection`, `HeroImage`, `ProductNavArrows`, `VariantSelector`, `SkuCopyField`, `ScrollAnimations`.

## 4. Data Layer

**Supabase tables:** `products` (31,167 rows; specs st1–3, features c1–3, applications app_01–03, gallery, family/variant fields, enrichment flags), `product_listing_mv` (materialized view — one representative per product family, ranked by display priority), `brands`, `categories`, `subcategories`, `contact_messages` (anon INSERT-only RLS). Public anon SELECT RLS on catalog tables. GIN index on generated `search_vector` tsvector; prefix tsquery (`token:*`) enables partial-word search with per-token sanitization of tsquery metacharacters.

**Image strategy:** migration in progress from supplier CDNs to Supabase Storage (`main_image_storage_url` preferred, `main_image_url` fallback). Remote patterns allow Supabase, S3, Cloudinary, Milwaukee, PFERD, Novalia, Krause — plus a wildcard `**` (see finding S-4).

**Enrichment pipeline (`scripts/`):** `enrich-karcher.mjs` (fetch supplier pages → Claude extracts specs/descriptions → upsert, ~2s/product, resumable), `enrich-karcher-playwright.py` (JS-heavy pages), `verify-products.mjs` (audits quality, classifies completeness, flags cross-contamination → `logs/verify-report-*.json`, `logs/to-fix-*.csv`), URL resolvers, description importer, `download-storage-images.mjs`. `KARCHER-Grid_view.csv` (the historical Airtable import source) has been deleted now that Airtable is no longer part of the stack.

**Airtable sync (removed 2026-07-07):** the project previously maintained a bidirectional Supabase↔Airtable sync (`sync.py`) for manual curation. Airtable is no longer used — `sync.py` was deleted and the `airtable_id` columns/unique indexes were dropped from `brands`, `categories`, `subcategories`, and `products` (the `product_listing` view and `product_listing_mv` materialized view were recreated without that column).

## 5. Authentication & Security Model

Public pages need no auth. Admin flow: login form → `checkAdminCredentials` against env vars → HMAC-signed cookie (`zs_admin_session`, httpOnly, sameSite=lax, secure in prod, 8h) → middleware gate + authoritative `hasValidAdminSession()` in server components → `assertAdmin()` on every mutating server action. Contact form relies on RLS (INSERT-only). Secrets are externalized to env vars throughout: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `ADMIN_USER`, `ADMIN_PASS`, `RESEND_API_KEY`, `CONTACT_NOTIFY_TO/FROM`, `ANTHROPIC_API_KEY` (scripts only).

## 6. Rendering & Performance Strategy (current)

ISR (1h revalidate) for homepage, PDPs, articles; on-demand `revalidatePath` after admin edits. `force-dynamic` for `/produse`. Tiered homepage fetch dedupes by family via the materialized view. Typeahead is a slim dedicated endpoint. Next/Image with AVIF assets; Turbopack builds; Lenis smooth scroll.

---

## 7. Improvement Areas — For Review (no changes made)

Severity: 🔴 High · 🟡 Medium · 🟢 Low. Each item is a proposal; nothing has been changed.

### 7.1 SEO & Discoverability

| ID | Sev | Finding | Fix |
|---|---|---|---|
| SEO-1 | 🔴 | **No sitemap or robots.** No `app/sitemap.ts`, `app/robots.ts`, or static equivalents — for a 31k-product catalog this forfeits most organic indexing. | Add chunked `sitemap.ts` generated from product slugs (sitemap index) + `robots.ts` disallowing `/admin`. |
| SEO-2 | 🔴 | **No per-product metadata.** `app/produse/[slug]/page.tsx` has no `generateMetadata`; every PDP shares the generic root title/description. No Open Graph, no JSON-LD `Product` schema anywhere. | Add `generateMetadata` (title/description/OG image from product data) + `Product` JSON-LD on PDPs; category metadata on `/produse`. |
| SEO-3 | 🟢 | `/produse` has no `<h1>` — the hero title is styled `<span>`s (`app/produse/page.tsx:397-420`). | Use a real `<h1>`. |

### 7.2 Security

| ID | Sev | Finding | Fix |
|---|---|---|---|
| S-1 | 🔴 | **Admin password doubles as HMAC signing secret** (`lib/auth.ts:14-20`). Token payload is only `issuedAt` — no nonce, no server-side revocation; logout just deletes the cookie. | Introduce separate `ADMIN_SESSION_SECRET`; add nonce/jti to payload; consider Supabase Auth longer-term. |
| S-2 | 🔴 | **No rate limiting on admin login**; credential check is plain `===` comparison (`lib/auth.ts:70-75`) — brute-forceable. | Per-IP rate limit + failure delay; constant-time comparison (hash both sides). |
| S-3 | 🟡 | **Unclamped public API input.** `/api/products` passes raw `parseInt` page/pageSize to Supabase — `?pageSize=100000` forces huge ranges; `NaN` breaks the range. Contact form has no field-length caps, honeypot, or rate limit (spam/Resend-quota risk). | Clamp `pageSize` to 1–100, `page` ≥ 1; cap contact field lengths; add basic rate limiting/honeypot. |
| S-4 | 🟡 | **Wildcard image host** `hostname: '**'` in `next.config.ts` nullifies the explicit allowlist and makes `/_next/image` an open proxy (bandwidth/SSRF-adjacent abuse). | Remove the `**` entry; keep the explicit CDN allowlist. |
| S-5 | 🟢 | Admin service-role client silently falls back to the anon key if `SUPABASE_SERVICE_KEY` is unset (`app/admin/actions.ts:9-12`). | Fail fast (throw) when the service key is missing. |
| S-6 | 🟢 | tsquery sanitizer is solid, but `getBrandsByFilter` passes raw `search` into the `get_brands_by_filter` RPC — safety depends on that SQL function. | Verify the RPC uses `plainto_tsquery`/parameters, not string concatenation. |

### 7.3 Performance

| ID | Sev | Finding | Fix |
|---|---|---|---|
| P-1 | 🔴 | **~10–12 uncached DB round-trips per `/produse` view.** `force-dynamic` + `getHomeProducts` (5 count + up to 5 range queries) + 4 taxonomy/count queries per request. | Cache tier counts and taxonomy with `unstable_cache`/`revalidateTag` (invalidated on admin edits); keep dynamic only when filters/search present. |
| P-2 | 🟡 | `count: 'exact'` on a 31k-row table on every listing request (`lib/supabase.ts:136,202,257,493`). | Use `estimated`, or cache counts. |
| P-3 | 🟡 | **Per-card `<style>` duplication:** `ProductCard.tsx` renders its full style block once per card → 24+ identical style tags per listing page. | Hoist to a shared stylesheet / CSS module (see M-1). |
| P-4 | 🟡 | **Shuffle breaks pagination:** brand/category-filtered page 1 is shuffled server-side (`app/produse/page.tsx:84-86`) but Load More pages arrive in DB order — likely duplicates/gaps at the seam. | Seeded/stable ordering shared with the API, or shuffle only where no pagination follows. |
| P-5 | 🟡 | `getAdjacentProducts` costs 3 queries per PDP render for prev/next arrows; its `subcategoryText` param is always `undefined` (dead branch). | Single RPC with window functions; drop the unused param. |
| P-6 | 🟢 | Google Fonts loaded via render-blocking `<link>` instead of `next/font`. | Migrate to `next/font/google` (self-hosted, `size-adjust`). |
| P-7 | 🟢 | No `priority`/`fetchPriority` on above-the-fold product images (LCP). | Add `priority` to first-row cards and PDP hero. |

### 7.4 Code Quality & Maintainability

| ID | Sev | Finding | Fix |
|---|---|---|---|
| M-1 | 🔴 | **Massive inline `<style>` blocks** (~250 lines in `app/produse/page.tsx`, ~230 in PDP, ~270 in `AdminClient.tsx`, ~400 in `app/page.tsx`, plus `Nav.tsx`, `ProductCard.tsx`). Tailwind 4 is installed but barely used. | Migrate incrementally to Tailwind utilities or CSS modules; start with `ProductCard` (also fixes P-3). |
| M-2 | 🟡 | `lib/supabase.ts` is a 574-line god-module (client + types + 15 queries + merchandising logic). | Split into `lib/db/{client,types,products,taxonomy}.ts`. |
| M-3 | 🟡 | **5× copy-pasted count-normalization block** (lowercase/trim → map → filter → sort) across brand/category/subcategory helpers. | One generic `joinCounts()` helper. |
| M-4 | 🟡 | **Text-based joins:** products filtered by `brand_name`/`category_text` strings though `brand_id`/`category_id` exist — a casing mismatch already silently dropped a brand (comment at `lib/supabase.ts:372-374`). | Filter by FK IDs; keep text columns for display only. |
| M-5 | 🟡 | `any` escape hatches in `HOME_TIER_FILTERS` (`lib/supabase.ts:212,259`) erase type-checking on tier logic. | Type against `PostgrestFilterBuilder` or a minimal interface. |
| M-6 | 🟢 | Duplicated listing-fallback logic between `app/produse/page.tsx:35-61` and `app/api/products/route.ts:19-35` (comment admits they must stay in sync). | Shared `fetchListing()` in `lib/`. |
| M-7 | 🟢 | Dead code/deps: unchecked `cErr` in `getBrands`; `@supabase/ssr` appears unused. | Handle or remove; prune deps. |

### 7.5 Reliability & Error Handling

| ID | Sev | Finding | Fix |
|---|---|---|---|
| R-1 | 🟡 | No root `error.tsx`/`not-found.tsx`; `/api/products` filtered branch is un-caught — Supabase outage → raw 500. | Add error/not-found boundaries; wrap route handlers. |
| R-2 | 🟡 | **Admin actions non-atomic:** reassign/rename perform 2–3 sequential writes without a transaction — partial failure leaves taxonomy inconsistent. | Move each operation into a single Postgres RPC/transaction. |
| R-3 | 🟢 | Taxonomy helpers swallow DB errors as empty arrays (silent empty sidebar). | Log before returning `[]`. |
| R-4 | 🟢 | Contact submit awaits the Resend call inline, adding latency to every user submit. | Use `after()`/`waitUntil` for the notification. |
| R-5 | ✅ | ~~`sync.py:421` zips Supabase IDs with created Airtable records...~~ Resolved 2026-07-07: `sync.py` and Airtable integration removed entirely. | — |

### 7.6 Testing, Tooling & Accessibility

| ID | Sev | Finding | Fix |
|---|---|---|---|
| T-1 | 🔴 | **Zero automated tests** — no framework, no test script. The tier-pagination offset math and tsquery sanitizer are pure functions begging for unit tests. | Add Vitest; start with `getHomeProducts` math, sanitizer, `quote-pricing`. |
| T-2 | 🟡 | **No CI** — no workflows; lint/typecheck only run at Vercel deploy. | Minimal GitHub/GitLab CI: `tsc --noEmit`, `eslint`, `next build`. |
| T-3 | 🟢 | No `typecheck` npm script. | Add `"typecheck": "tsc --noEmit"`. |
| A-1 | 🟡 | Nav search dropdown: `role="listbox"` divs but input lacks `combobox`/`aria-expanded`/`aria-activedescendant`; options click-only. Admin edit icons and stat chips are clickable `<span>/<div>`s — not keyboard-reachable. | Proper combobox ARIA pattern; real `<button>` elements. |
| A-2 | 🟢 | Missing labels: nav search input (placeholder-only), admin checkboxes/select-all. | Add `aria-label`s. |

### 7.7 Suggested priority order

1. **SEO-1 + SEO-2** — sitemap, robots, per-product metadata + JSON-LD (largest business impact, low risk).
2. **S-1 + S-2** — separate session secret, login rate limiting.
3. **S-3 + S-4** — clamp API inputs, remove wildcard image host (quick wins).
4. **P-1/P-2/P-3** — listing-page caching + hoist ProductCard styles.
5. **T-1/T-2** — Vitest + CI before larger refactors.
6. **M-1–M-5** — incremental styling/module refactors, guarded by the new tests.

---

## 8. Compliance Notes

The site serves the RO market and stores contact-form PII (`contact_messages`: name, email, phone, company). Under GDPR, apply data minimization: define a retention policy for `contact_messages`, ensure a privacy notice covers the form, and avoid propagating form PII into logs or Resend beyond what is needed. Security questions: security@emag.ro.

---

*Prepared by Claude (Cowork). Findings in §7 are proposals only — no code has been modified.*
