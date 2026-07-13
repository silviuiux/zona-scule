# Brand pages rebuild — handoff

Built against a fresh clone of `silviuiux/zona-scule` (main), type-checked
clean (`tsc --noEmit`) and linted clean (`eslint`). Not run against a live
dev server — this sandbox has no Supabase credentials and no network path
to Supabase, so visual QA needs to happen locally or in Cowork.

## To apply

From your local repo root:
```
git apply zona-scule-brand-pages.patch
```
If that fails on `app/brand/pferd/page.tsx` (unlikely unless you've edited
it since this clone), the four standalone `.tsx` files in this folder are
drop-in replacements/additions at their matching paths:
- `lib/brand-content.ts`
- `components/BrandLandingTemplate.tsx`
- `app/brand/pferd/page.tsx` ← `pferd.page.tsx`
- `app/brand/karcher/page.tsx` ← `karcher.page.tsx`
(`lib/supabase.ts` is a patch-only change — two new functions added, nothing removed.)

## What changed

1. **`lib/supabase.ts`** — added `getBrandBySlug()` and
   `getApplicationGroupsByBrand()`. The second one is the concrete
   implementation of the "application-based discovery" differentiator from
   the research spec — it groups a brand's products by their real
   `app_01_title` field (already populated on enriched Karcher rows) with
   no new DB column or admin curation needed.

2. **`lib/brand-content.ts`** (new) — the editorial config that makes a
   brand page a data-entry task, not a dev task. PFERD's original hardcoded
   copy was extracted here unchanged; Karcher's is new, grounded in the
   real applications visible on zonascule.online today (aeroporturi și
   porturi, turnătorii, logistică și depozitare, etc.).

3. **`components/BrandLandingTemplate.tsx`** (new) — the shared template,
   generalized from the original `pferd/page.tsx`. Themed via
   `--brand-accent` (from `brands.brand_color`, `color-mix()` for tints) so
   a new brand needs a hex code, not a CSS rewrite. Sections are
   conditional: `intentGroups`/`pillars`/`glossary` for hand-curated brands
   like PFERD, `useUseCaseCarousels` for data-driven brands like Karcher.
   Also adds two things not in the old PFERD page: a **specialist/ask-us
   block** (named contact, links to `/contact?brand=X` which the contact
   page already supports) and an **FAQ block with `FAQPage` JSON-LD**
   — directly targets `TECHNICAL_SPEC.md` findings SEO-1/SEO-2 (no
   structured data anywhere on the site today).

4. **`app/brand/pferd/page.tsx`** — rewritten from ~550 lines to a ~50-line
   data-fetching wrapper around the template. No visual/copy change.

5. **`app/brand/karcher/page.tsx`** (new) — second flagship page, proving
   the template on a *different* pattern (real DB grouping instead of
   hand-curated chips).

## Still open (per the original spec)

- **Not wired into `<Nav />` or any sitemap yet** — same state PFERD was
  already in (per its original code comment). Both pages are direct-URL-only
  (`/brand/pferd`, `/brand/karcher`) until you decide the entry point —
  `AnimatedHero.tsx` already hardcodes `['KARCHER','MILWAUKEE','PFERD','FFGROUP']`
  as the featured-brand strip on the homepage, which is the natural place to
  link these in.
- **`brands` table rows for `karcher`/`pferd` slugs** — the pages fall back
  to a hardcoded default color/name if `getBrandBySlug` finds nothing, so
  they won't break, but for `brand_color` theming to reflect a deliberate
  choice rather than my guessed hex values (Karcher blue `#005f9e`, PFERD
  red `#d92c2b`), those rows need `slug` + `brand_color` set in Supabase.
- **Milwaukee, FFGroup, +2-3 more** — same pattern, new `lib/brand-content.ts`
  entries + new thin page files. Milwaukee is a good next candidate since
  its enrichment CSV (`MILWAUKEE-combined_0425_2303.csv`, per memory) may
  already carry application-style data worth checking before deciding
  curated-vs-data-driven for that page.
- **S.E.A.P. eligibility** — both configs default `seapEligible: true`;
  confirm this is actually accurate before it ships (this is a real trust
  claim, not decoration).
- **Case studies / documentation hub** — flagged in the original spec as
  phase-2, intentionally not built here; needs content from Călin first.
