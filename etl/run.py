#!/usr/bin/env python3
"""Zona Scule ETL — one CLI for every supplier.

Examples
--------
# Dry run (no DB, no API key needed) — see what would be loaded:
python run.py karcher samples/karcher_sample.csv --no-enrich --dry-run --out out.jsonl

# Full run against the same Supabase project the app uses (reads .env.local):
python run.py karcher path/to/karcher_feed.csv

Adding a supplier = drop a suppliers/<name>.py exporting CONFIG (clone karcher.py).
"""

from __future__ import annotations

import argparse
import importlib
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))


def load_env() -> None:
    """Load the app's .env.local (one level up) so load/enrich share its values."""
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    for candidate in (ROOT.parent / ".env.local", ROOT / ".env.local", ROOT / ".env"):
        if candidate.exists():
            load_dotenv(candidate)
            return


def get_config(supplier: str):
    try:
        mod = importlib.import_module(f"suppliers.{supplier}")
    except ModuleNotFoundError as exc:
        sys.exit(f"No supplier module 'suppliers/{supplier}.py' ({exc}). "
                 f"Clone suppliers/karcher.py to add one.")
    if not hasattr(mod, "CONFIG"):
        sys.exit(f"suppliers/{supplier}.py must export a CONFIG = SupplierConfig(...)")
    return mod.CONFIG


def main() -> None:
    ap = argparse.ArgumentParser(description="Zona Scule supplier ETL")
    ap.add_argument("supplier", help="supplier id, e.g. 'karcher' (suppliers/<id>.py)")
    ap.add_argument("feed", help="path to the supplier CSV/XLSX feed or scrape output")
    ap.add_argument("--limit", type=int, default=None, help="process only the first N rows")
    ap.add_argument("--no-enrich", action="store_true", help="skip the Claude enrichment step")
    ap.add_argument("--no-scrape", action="store_true", help="skip the live-site resolver (image/brand/category)")
    ap.add_argument("--dry-run", action="store_true", help="do everything except write to Supabase")
    ap.add_argument("--overwrite", action="store_true",
                    help="on refresh, overwrite existing non-empty fields (default: fill only empty ones)")
    ap.add_argument("--out", dest="out_jsonl", default=None, help="also dump normalized rows to a JSONL file")
    args = ap.parse_args()

    load_env()

    from core.pipeline import RunOptions, run

    cfg = get_config(args.supplier)
    opts = RunOptions(
        limit=args.limit,
        enrich=not args.no_enrich,
        scrape=not args.no_scrape,
        dry_run=args.dry_run,
        overwrite=args.overwrite,
        out_jsonl=args.out_jsonl,
    )
    print(f"=== Zona Scule ETL :: {cfg.name} ===")
    summary = run(args.feed, cfg, opts)
    print(f"=== done: {summary} ===")


if __name__ == "__main__":
    main()
