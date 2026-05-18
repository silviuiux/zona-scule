#!/usr/bin/env python3
"""
Zona Scule — Supabase ↔ Airtable Bidirectional Sync
============================================================

Usage:
  python sync.py                                        # Full bidirectional sync
  python sync.py --direction at2sb                      # Airtable → Supabase only
  python sync.py --direction sb2at                      # Supabase → Airtable (NULL ids only)
  python sync.py --push-all                             # Push ALL Supabase rows → Airtable
  python sync.py --push-all --tables categories subcategories products
  python sync.py --table brands                         # One table only (bidirectional)
  python sync.py --dry-run                              # Preview without writing

Tables synced (in dependency order):
  1. brands
  2. categories
  3. subcategories   (parent_category_id FK → categories)
  4. products        (brand_id / category_id / subcategory_id FKs)

Sync strategies:
  at2sb      Fetch ALL Airtable records → upsert into Supabase via airtable_id.
  sb2at      Find Supabase rows where airtable_id IS NULL → create in Airtable,
             write new AT record ID back to Supabase.
  push-all   Push EVERY Supabase row to Airtable regardless of airtable_id
             (use after bulk-deleting Airtable records to restore from Supabase).
             Uses batch_create for speed, updates airtable_id in Supabase afterward.
             ⚠  Will create duplicates if AT records were NOT deleted first.

Requirements:
  pip install supabase pyairtable python-dotenv

Expected runtime:
  brands / categories / subcategories  → seconds
  products (31 k rows, push-all)       → ~20–30 min  (batched, rate-limited)
"""

from __future__ import annotations

import argparse
import logging
import os
import time
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("sync")

# ─── Constants ────────────────────────────────────────────────────────────────

BASE_ID = os.environ.get("AIRTABLE_BASE_ID", "appXLx3eF5z2ogYwL")

AT_TABLES: dict[str, str] = {
    "brands":        "tbltSqpUS0r0gLDRI",
    "categories":    "tblvYLr5gAzIGm2eP",
    "subcategories": "tblqcB9zWgu9rl8g2",
    "products":      "tblg9Zw3JpVp5w8K4",
}

SYNC_ORDER = ["brands", "categories", "subcategories", "products"]

# ─── Field Maps ───────────────────────────────────────────────────────────────
#
# "scalar"  Airtable field name → Supabase column name.
#           Values are copied as-is (str, bool, number).
#
# "linked"  Airtable linked-record field → Supabase FK column.
#           AT returns a list of record IDs; only the first is used.
#           Resolved via the airtable_id ↔ uuid cache.

FIELD_MAPS: dict[str, dict] = {
    "brands": {
        "scalar": {
            "Name":              "name",
            "Slug":              "slug",
            "Logo URL":          "logo_url",
            "Brand Color":       "brand_color",
            "Country":           "country",
            "Short Description": "short_description",
            "Featured":          "featured",
        },
        "linked": {},
    },
    "categories": {
        "scalar": {
            "Name":           "name",
            "Slug":           "slug",
            "Hero Image URL": "hero_image_url",
            "Description":    "description",
            "Featured":       "featured",
            "Sort Order":     "sort_order",
        },
        "linked": {},
    },
    "subcategories": {
        "scalar": {
            "Name":           "name",
            "Slug":           "slug",
            "Description":    "description",
            "Icon URL":       "icon_url",
            "Hero Image URL": "hero_image_url",
            "Sort Order":     "sort_order",
            "Featured":       "featured",
        },
        "linked": {
            "Parent Category": {
                "sb_col":    "parent_category_id",
                "ref_table": "categories",
            },
        },
    },
    "products": {
        "scalar": {
            "Name":              "name",
            "Slug":              "slug",
            "SKU":               "sku",
            "Brand Name":        "brand_name",
            "Model":             "model",
            "Short Description": "short_description",
            "Category Text":     "category_text",
            "Subcategory Text":  "subcategory_text",
            "Main Image URL":    "main_image_url",
            "Gallery URL 1":     "gallery_url_1",
            "Gallery URL 2":     "gallery_url_2",
            "Gallery URL 3":     "gallery_url_3",
            "Gallery URL 4":     "gallery_url_4",
            "Status":            "status",
            "Featured":          "featured",
            "ST1 Label":         "st1_label",
            "ST1 Value":         "st1_value",
            "ST1 Details":       "st1_details",
            "ST2 Label":         "st2_label",
            "ST2 Value":         "st2_value",
            "ST2 Details":       "st2_details",
            "ST3 Label":         "st3_label",
            "ST3 Value":         "st3_value",
            "ST3 Details":       "st3_details",
            "App 01 Title":      "app_01_title",
            "App 01 Details":    "app_01_details",
            "App 02 Title":      "app_02_title",
            "App 02 Details":    "app_02_details",
            "App 03 Title":      "app_03_title",
            "App 03 Details":    "app_03_details",
            "C1 Title":          "c1_title",
            "C1 Details":        "c1_details",
            "C2 Title":          "c2_title",
            "C2 Details":        "c2_details",
            "C3 Title":          "c3_title",
            "C3 Details":        "c3_details",
            "Q2":                "q2",
            "A2":                "a2",
        },
        "linked": {
            "Brand": {
                "sb_col":    "brand_id",
                "ref_table": "brands",
            },
            "Category": {
                "sb_col":    "category_id",
                "ref_table": "categories",
            },
            "Subcategory": {
                "sb_col":    "subcategory_id",
                "ref_table": "subcategories",
            },
        },
    },
}

# ─── ID Caches (airtable_record_id ↔ supabase_uuid) ──────────────────────────

_at_to_sb: dict[str, dict[str, str]] = {}   # table → {at_rec_id: sb_uuid}
_sb_to_at: dict[str, dict[str, str]] = {}   # table → {sb_uuid: at_rec_id}


def build_cache(table_name: str, sb) -> None:
    """Load airtable_id ↔ id pairs from Supabase for FK resolution."""
    log.debug(f"  Caching {table_name} IDs…")
    all_rows: list[dict] = []
    page_size = 1000
    offset = 0
    while True:
        resp = (
            sb.table(table_name)
            .select("id,airtable_id")
            .not_.is_("airtable_id", "null")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = resp.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    _at_to_sb[table_name] = {r["airtable_id"]: r["id"] for r in all_rows}
    _sb_to_at[table_name] = {r["id"]: r["airtable_id"] for r in all_rows}
    log.debug(f"  {table_name}: {len(all_rows)} pairs cached")


def at_id_to_sb_uuid(table_name: str, at_rec_id: str) -> Optional[str]:
    return _at_to_sb.get(table_name, {}).get(at_rec_id)


def sb_uuid_to_at_id(table_name: str, sb_uuid: str) -> Optional[str]:
    return _sb_to_at.get(table_name, {}).get(sb_uuid)


# ─── Field Conversion ─────────────────────────────────────────────────────────

def at_record_to_sb_row(at_record: dict, table_name: str) -> dict:
    """Convert one Airtable record → Supabase row dict."""
    fmap = FIELD_MAPS[table_name]
    fields = at_record.get("fields", {})
    row: dict = {"airtable_id": at_record["id"]}

    for at_field, sb_col in fmap["scalar"].items():
        val = fields.get(at_field)
        if val is not None:
            row[sb_col] = val

    for at_field, link_cfg in fmap["linked"].items():
        linked_ids: list = fields.get(at_field) or []
        if linked_ids:
            sb_uuid = at_id_to_sb_uuid(link_cfg["ref_table"], linked_ids[0])
            if sb_uuid:
                row[link_cfg["sb_col"]] = sb_uuid
            else:
                log.debug(
                    f"  {table_name}: no SB UUID for AT {linked_ids[0]} "
                    f"('{at_field}') — FK skipped"
                )
    return row


def sb_row_to_at_fields(row: dict, table_name: str) -> dict:
    """Convert a Supabase row → Airtable fields dict."""
    fmap = FIELD_MAPS[table_name]
    fields: dict = {}

    reverse_scalar = {v: k for k, v in fmap["scalar"].items()}
    for sb_col, at_field in reverse_scalar.items():
        val = row.get(sb_col)
        if val is not None:
            fields[at_field] = val

    for at_field, link_cfg in fmap["linked"].items():
        sb_uuid = row.get(link_cfg["sb_col"])
        if sb_uuid:
            at_rec_id = sb_uuid_to_at_id(link_cfg["ref_table"], sb_uuid)
            if at_rec_id:
                fields[at_field] = [at_rec_id]
            else:
                log.debug(
                    f"  {table_name}: no AT ID for SB UUID {sb_uuid} "
                    f"('{at_field}') — FK skipped"
                )
    return fields


# ─── Utilities ────────────────────────────────────────────────────────────────

def chunked(lst: list, size: int):
    for i in range(0, len(lst), size):
        yield lst[i : i + size]


def fetch_all_from_supabase(sb, table_name: str, only_null_at_id: bool = False) -> list[dict]:
    """Fetch all rows from a Supabase table, paginating through 1 000-row pages."""
    all_rows: list[dict] = []
    page_size = 1000
    offset = 0
    while True:
        query = sb.table(table_name).select("*")
        if only_null_at_id:
            query = query.is_("airtable_id", "null")
        resp = query.range(offset, offset + page_size - 1).execute()
        batch = resp.data or []
        all_rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
        if offset % 10_000 == 0:
            log.info(f"  {table_name}: {offset} rows fetched so far…")
    return all_rows


# ─── Sync Functions ───────────────────────────────────────────────────────────

def sync_at_to_sb(table_name: str, at_tbl, sb, dry_run: bool) -> None:
    """Pull all Airtable records → upsert into Supabase (conflict on airtable_id)."""
    log.info(f"[AT→SB] {table_name}: fetching from Airtable…")

    records = list(at_tbl.all())   # pyairtable handles pagination + rate limiting
    log.info(f"[AT→SB] {table_name}: {len(records)} records fetched")

    rows = [at_record_to_sb_row(r, table_name) for r in records]

    if dry_run:
        log.info(f"[AT→SB] {table_name}: DRY RUN — would upsert {len(rows)} rows")
        if rows:
            log.info(f"  Sample: {rows[0]}")
        return

    total = 0
    for batch in chunked(rows, 500):
        sb.table(table_name).upsert(batch, on_conflict="airtable_id").execute()
        total += len(batch)
        log.info(f"[AT→SB] {table_name}: {total}/{len(rows)} upserted…")

    log.info(f"[AT→SB] {table_name}: ✓ {len(rows)} rows done")
    build_cache(table_name, sb)


def sync_sb_to_at(table_name: str, at_tbl, sb, dry_run: bool) -> None:
    """Push Supabase rows with airtable_id IS NULL → new Airtable records."""
    log.info(f"[SB→AT] {table_name}: finding rows without airtable_id…")

    rows = fetch_all_from_supabase(sb, table_name, only_null_at_id=True)

    if not rows:
        log.info(f"[SB→AT] {table_name}: nothing to push")
        return

    log.info(f"[SB→AT] {table_name}: {len(rows)} rows to create in Airtable")

    if dry_run:
        log.info(f"[SB→AT] {table_name}: DRY RUN — would create {len(rows)} records")
        return

    created = errors = 0
    for row in rows:
        at_fields = sb_row_to_at_fields(row, table_name)
        if not at_fields:
            log.warning(f"[SB→AT] {table_name}: empty fields for id={row['id']}, skipping")
            continue
        try:
            new_rec = at_tbl.create(at_fields)
            new_at_id = new_rec["id"]
            sb.table(table_name).update({"airtable_id": new_at_id}).eq("id", row["id"]).execute()
            _at_to_sb.setdefault(table_name, {})[new_at_id] = row["id"]
            _sb_to_at.setdefault(table_name, {})[row["id"]] = new_at_id
            created += 1
            time.sleep(0.22)
        except Exception as exc:
            log.error(f"[SB→AT] {table_name}: failed for id={row['id']}: {exc}")
            errors += 1

    log.info(f"[SB→AT] {table_name}: ✓ {created} created ({errors} errors)")


def push_all_sb_to_at(table_name: str, at_tbl, sb, dry_run: bool) -> None:
    """
    Push ALL Supabase rows → Airtable, regardless of existing airtable_id.

    Use this after bulk-deleting Airtable records to restore from Supabase.
    After creation, writes the new AT record IDs back to Supabase and refreshes
    the cache so dependent tables (subcategories, products) can resolve their FKs.

    ⚠  Running this on a table whose AT records were NOT deleted will create
       duplicates.  Use --tables to target only the deleted tables.
    """
    log.info(f"[PUSH-ALL] {table_name}: fetching all rows from Supabase…")
    rows = fetch_all_from_supabase(sb, table_name)
    log.info(f"[PUSH-ALL] {table_name}: {len(rows)} rows to push")

    if not rows:
        log.info(f"[PUSH-ALL] {table_name}: nothing to push")
        return

    # Build (AT fields dict, sb_uuid) pairs — skip rows that produce empty AT fields
    at_field_list: list[dict] = []
    sb_id_list: list[str] = []
    skipped = 0
    for row in rows:
        at_fields = sb_row_to_at_fields(row, table_name)
        if at_fields:
            at_field_list.append(at_fields)
            sb_id_list.append(row["id"])
        else:
            skipped += 1

    if skipped:
        log.warning(f"[PUSH-ALL] {table_name}: {skipped} rows skipped (no mappable fields)")

    if dry_run:
        log.info(
            f"[PUSH-ALL] {table_name}: DRY RUN — would batch-create {len(at_field_list)} "
            f"AT records and update {len(at_field_list)} Supabase airtable_ids"
        )
        if at_field_list:
            log.info(f"  Sample AT fields: {at_field_list[0]}")
        return

    log.info(
        f"[PUSH-ALL] {table_name}: batch-creating {len(at_field_list)} records in Airtable "
        f"(10 per batch — this may take a while for large tables)…"
    )

    # batch_create splits into 10-record API calls and handles rate limiting
    created_records = at_tbl.batch_create(at_field_list)

    if len(created_records) != len(sb_id_list):
        log.warning(
            f"[PUSH-ALL] {table_name}: created {len(created_records)} but expected "
            f"{len(sb_id_list)} — partial success, writing back what we have"
        )

    # Map new AT record IDs → Supabase UUIDs and update cache
    id_updates: list[dict] = []
    for sb_id, new_rec in zip(sb_id_list, created_records):
        new_at_id = new_rec["id"]
        id_updates.append({"id": sb_id, "airtable_id": new_at_id})
        _at_to_sb.setdefault(table_name, {})[new_at_id] = sb_id
        _sb_to_at.setdefault(table_name, {})[sb_id] = new_at_id

    # Write new airtable_ids back to Supabase in batches of 500
    log.info(f"[PUSH-ALL] {table_name}: writing {len(id_updates)} new airtable_ids back to Supabase…")
    written = 0
    for batch in chunked(id_updates, 500):
        sb.table(table_name).upsert(batch, on_conflict="id").execute()
        written += len(batch)
        if written % 5000 == 0:
            log.info(f"[PUSH-ALL] {table_name}: {written}/{len(id_updates)} IDs written…")

    log.info(
        f"[PUSH-ALL] {table_name}: ✓ {len(created_records)} records created in Airtable, "
        f"{written} airtable_ids updated in Supabase"
    )


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Zona Scule — Supabase ↔ Airtable bidirectional sync",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Restore deleted AT records from Supabase (your current situation):
  python sync.py --push-all --tables categories subcategories products

  # Normal bidirectional sync:
  python sync.py

  # One-direction syncs:
  python sync.py --direction at2sb
  python sync.py --direction sb2at

  # Single table:
  python sync.py --push-all --tables brands
        """,
    )
    parser.add_argument(
        "--direction",
        choices=["at2sb", "sb2at", "both"],
        default="both",
        help="Sync direction for normal mode (default: both)",
    )
    parser.add_argument(
        "--table",
        choices=list(AT_TABLES.keys()),
        help="Sync a single table (normal bidirectional mode only)",
    )
    parser.add_argument(
        "--push-all",
        action="store_true",
        help="Push ALL Supabase rows → Airtable (use after bulk AT deletion)",
    )
    parser.add_argument(
        "--tables",
        nargs="+",
        choices=list(AT_TABLES.keys()),
        help="Tables to include in --push-all (default: all, in dependency order)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing anything",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show debug-level log messages",
    )
    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    if args.dry_run:
        log.info("=== DRY RUN — no changes will be written ===")

    from supabase import create_client
    from pyairtable import Api

    sb = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_KEY"],
    )
    at_api = Api(os.environ["AIRTABLE_API_KEY"])

    # ── PUSH-ALL MODE ────────────────────────────────────────────────────────
    if args.push_all:
        # Respect dependency order even when user specifies --tables
        requested = set(args.tables) if args.tables else set(SYNC_ORDER)
        tables_to_push = [t for t in SYNC_ORDER if t in requested]

        log.info(f"=== PUSH-ALL MODE: {', '.join(tables_to_push)} ===")
        if not args.dry_run and not args.tables:
            log.warning(
                "⚠  No --tables specified — pushing ALL tables including brands. "
                "This will create duplicates if brands still exist in Airtable!"
            )

        # Build caches for ALL tables first (needed for FK resolution)
        log.info("Building ID caches from Supabase…")
        for tbl in SYNC_ORDER:
            build_cache(tbl, sb)

        for table_name in tables_to_push:
            at_tbl = at_api.table(BASE_ID, AT_TABLES[table_name])
            log.info(f"\n{'─' * 52}")
            log.info(f"  PUSH-ALL: {table_name.upper()}")
            log.info(f"{'─' * 52}")
            push_all_sb_to_at(table_name, at_tbl, sb, args.dry_run)
            # Cache is updated inside push_all_sb_to_at — dependent tables
            # (subcategories needs categories, products needs all three)
            # will see the new AT record IDs automatically.

        log.info("\n✅  Push-all complete.")
        return

    # ── NORMAL BIDIRECTIONAL / ONE-DIRECTION MODE ────────────────────────────
    tables_to_sync = [args.table] if args.table else SYNC_ORDER

    log.info("Building ID caches from Supabase…")
    for tbl in SYNC_ORDER:
        build_cache(tbl, sb)

    for table_name in tables_to_sync:
        at_tbl = at_api.table(BASE_ID, AT_TABLES[table_name])

        log.info(f"\n{'─' * 52}")
        log.info(f"  {table_name.upper()}")
        log.info(f"{'─' * 52}")

        if args.direction in ("at2sb", "both"):
            sync_at_to_sb(table_name, at_tbl, sb, args.dry_run)

        if args.direction in ("sb2at", "both"):
            sync_sb_to_at(table_name, at_tbl, sb, args.dry_run)

    log.info("\n✅  Sync complete.")


if __name__ == "__main__":
    main()
