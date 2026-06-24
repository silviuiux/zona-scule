# Zona Scule — supplier ETL

Standalone tooling that turns supplier feeds/scrapes into `products` rows in the
same Supabase project the app uses. **Not part of the Next.js app** — it lives
here for convenience but nothing in `app/`, `lib/`, or `components/` imports it,
and it is never bundled or deployed by Vercel.

## Why this exists

Writing a bespoke scraper *and* a bespoke formatter per supplier is the rabbit
hole. This pipeline decouples them into four stages, and standardizes the middle
two so a new supplier is a ~20-line config, not a new program:

```
 extract  ──►  normalize  ──►  enrich  ──►  load
 (per-          (shared)       (shared,     (shared,
  supplier,                     Claude)      Supabase
  dumb read)                                 upsert)
```

- **extract** (`core.pipeline.extract`) — dumb read of a CSV/XLSX feed or your
  existing scraper output. No schema logic. pandas reads everything as strings so
  EANs / leading-zero SKUs survive.
- **normalize** (`core/normalize.py`) — raw record + a `SupplierConfig` → the one
  canonical product shape (`core/schema.py`, mirrors `lib/types.ts`). Handles
  slug, family/variant rollup, galleries.
- **enrich** (`core/enrich.py`) — the step that used to be hand-written parsing.
  One Claude call with a **forced JSON schema** turns messy raw text into the
  `st1..3` / `c1..3` / `app_01..03` / `specs` / `axes` fields the PDP renders, in
  Romanian. Skips cleanly with no API key.
- **load** (`core/load.py`) — idempotent upsert on `sku` (service-role key only).

## Setup

```bash
cd etl
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

The pipeline reads the app's existing `../.env.local` automatically for
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, and `ANTHROPIC_API_KEY`.

## Run

```bash
# Dry run — no DB, no API key. Proves the mapping end-to-end, writes a JSONL you can read.
python run.py karcher samples/karcher_sample.csv --no-enrich --dry-run --out out.jsonl

# With enrichment but still no DB write (needs ANTHROPIC_API_KEY):
python run.py karcher samples/karcher_sample.csv --dry-run --out out.jsonl

# Full run into Supabase (needs SUPABASE_SERVICE_KEY):
python run.py karcher path/to/real_karcher_feed.csv
```

Flags: `--limit N`, `--no-enrich`, `--no-scrape`, `--dry-run`, `--out file.jsonl`.

## NOVALIA (worked example)

The NOVALIA price list (`suppliers/novalia.py`) is a real, richer case than the
Kärcher template and shows the **resolver** stage in action.

The 2026 price-list xlsx is basically a list of product codes (`PDT_SUP_REF`) +
short descriptions — **no images, no categories, no brand, no EAN**. But every
product has a server-rendered page on novaliaromania.ro that resolves from the
code alone (`/ro/produse/{CODE}/x/` → redirects to the product). So the supplier
`resolver` fetches that page and fills, per product:

- `main_image_url` + `gallery_url_1..4` (from `og:image` + page gallery, badges filtered)
- `brand_name` — the real manufacturer (Bessey, Peddinghaus, Mob, …), from the brand logo
- `category_text` / `subcategory_text` — Novalia's own taxonomy, from the breadcrumb
- `ean` — present on the page even though the price list omits it
- a cleaner `long_description`

Variants share one page, so the fetcher caches by URL (`etl/.scrape_cache/`) and
only ~1,470 of the 4,117 rows trigger a real download.

```bash
# Structure check, no network, no DB:
python run.py novalia "path/to/2026 NOVALIA price list.xlsx" --no-scrape --no-enrich --dry-run --out novalia.jsonl

# Real resolve from the live site (network needed), still no DB write — inspect novalia.jsonl:
python run.py novalia "path/to/...xlsx" --limit 50 --no-enrich --dry-run --out novalia.jsonl

# Full load into Supabase:
python run.py novalia "path/to/...xlsx"
```

To map Novalia's categories onto a different taxonomy later, fill `_CATEGORY_REMAP`
/ `_SUBCATEGORY_REMAP` in `suppliers/novalia.py` — no other code changes.

### NOVALIA is a REFRESH, not a fresh import

The live catalog already holds ~3,200 products under Novalia's brands (MOB, IUS,
LEBORGNE, BESSEY, PEDDINGHAUS, …) loaded from this same price list. A sample check
found **~76% of the 4,030 price-list codes already exist** in `products`; ~24% are
new. So the load (`core/load.py`) matches on `sku` and **updates existing rows in
place / inserts only new ones** — it never duplicates. (`products.sku` has no unique
index and a few existing dupes, so a PostgREST `ON CONFLICT` upsert isn't possible.)

Overwrite policy:
- **default (fill-empty)** — only fills columns that are currently empty on the
  existing row, preserving any manual curation. Safe to run repeatedly.
- **`--overwrite`** — replaces existing values with freshly-scraped ones (still
  never writes a NULL over a populated field). Use when you trust the Novalia site
  as source of truth over what's currently stored.

### First-import runbook (NOVALIA)

```bash
cd etl && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# 1. Sanity dry-run, no network, no DB — confirms parsing of the xlsx:
python run.py novalia "<price list>.xlsx" --no-scrape --no-enrich --dry-run --limit 20 --out a.jsonl

# 2. Resolve from the live site for a small batch, still no DB — eyeball images/brands/categories:
python run.py novalia "<price list>.xlsx" --no-enrich --dry-run --limit 50 --out b.jsonl

# 3. Dry-run the REAL load: prints how many would update vs insert (reads DB, writes nothing):
python run.py novalia "<price list>.xlsx" --no-enrich --dry-run

# 4. Go: full refresh into Supabase (fill-empty). Re-runnable.
python run.py novalia "<price list>.xlsx" --no-enrich

# (optional) add Claude enrichment for the st*/c*/app* PDF display fields:
#   drop --no-enrich   (needs ANTHROPIC_API_KEY)
```

Hygiene follow-up (optional): dedupe the 11 duplicate skus and add
`create unique index on products(sku)` so future loads can use a faster upsert.

## Adding a supplier

1. Copy `suppliers/karcher.py` → `suppliers/<name>.py`.
2. Edit `column_map` so each canonical field points at the right feed column (or a
   small `lambda raw: ...`). List only what the feed provides — enrichment fills
   the rest.
3. Set `gallery_columns`, and a `family_key` if the supplier has variant families.
4. `python run.py <name> <feed.csv> --no-enrich --dry-run --out out.jsonl` and eyeball `out.jsonl`.

That's the whole per-supplier surface. extract / normalize / enrich / load never change.

## Notes / decisions

- **Conflict key is `sku`** (`core/schema.UPSERT_CONFLICT_KEY`). Re-runs update in
  place. Needs a UNIQUE index on `products.sku`; switch to `ean` if your SKUs
  aren't unique across suppliers.
- **Enrichment only writes display/derived fields** (`schema.ENRICHED_FIELDS`), so
  re-enriching never clobbers identity or taxonomy from the feed. Backfill later by
  re-running on rows where `enriched = false`.
- **`*_storage_url` and image migration are intentionally out of scope** — load
  sets `images_migrated = false` and writes the external `*_url`s; the app's
  existing image-migration job copies them into Supabase Storage.
- **Prefer real supplier feeds over scraping** whenever a supplier offers a
  CSV/Excel/XML product export — point `extract` at that and skip the scraper.
