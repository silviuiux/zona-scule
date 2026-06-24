"""Orchestrator: extract -> normalize -> enrich -> load, for one supplier."""

from __future__ import annotations

from dataclasses import dataclass

from .enrich import Enricher
from .load import Loader, dump_jsonl
from .normalize import SupplierConfig, build_enrich_source, normalize
from .schema import validate


@dataclass
class RunOptions:
    limit: int | None = None
    enrich: bool = True
    scrape: bool = True
    dry_run: bool = False
    overwrite: bool = False
    out_jsonl: str | None = None


def extract(path: str, cfg: SupplierConfig) -> list[dict]:
    """Stage 1 — read the feed/scrape output into a list of raw dicts.

    Deliberately dumb: no schema logic here, just 'get the rows in'. pandas reads
    csv/xlsx (and most supplier exports) uniformly, treating everything as strings
    so codes like EANs and leading-zero SKUs survive intact.
    """
    import pandas as pd

    if cfg.reader == "xlsx":
        df = pd.read_excel(path, dtype=str)
    else:
        df = pd.read_csv(path, dtype=str, keep_default_na=False, **cfg.csv_kwargs)
    return df.to_dict(orient="records")


def run(path: str, cfg: SupplierConfig, opts: RunOptions) -> dict:
    raw_rows = extract(path, cfg)
    total_in = len(raw_rows)
    if cfg.row_filter:
        raw_rows = [r for r in raw_rows if cfg.row_filter(r)]
    if opts.limit:
        raw_rows = raw_rows[: opts.limit]
    dropped = total_in - len(raw_rows) if not opts.limit else 0
    print(f"[1/4] extract     : {len(raw_rows)} raw rows from {path}"
          + (f" ({dropped} dropped by row_filter)" if dropped else ""))

    normalized = [normalize(r, cfg) for r in raw_rows]
    print(f"[2/5] normalize   : {len(normalized)} canonical rows")

    # Stage 2.5 — resolve from the supplier's source of truth (e.g. live product
    # page): image / brand / category / ean. Cached + deduped by the fetcher.
    if cfg.resolver and opts.scrape:
        from .webscrape import HttpFetcher
        fetcher = HttpFetcher()
        resolved = 0
        for n, row in enumerate(normalized, 1):
            updates = cfg.resolver(row, fetcher.get)
            if updates:
                row.update(updates)
                resolved += 1
            if n % 25 == 0:
                print(f"      resolved {n}/{len(normalized)} "
                      f"(cache hits={fetcher.hits})")
        with_img = sum(1 for r in normalized if r.get("main_image_url"))
        print(f"[2.5] resolve     : {resolved}/{len(normalized)} pages matched, "
              f"{with_img} now have an image")
    elif cfg.resolver:
        print("[2.5] resolve     : skipped (--no-scrape)")

    problems = []
    for i, row in enumerate(normalized):
        errs = validate(row)
        if errs:
            problems.append((i, row.get("sku") or row.get("name"), errs))
    if problems:
        print(f"      ⚠ {len(problems)} rows have validation issues:")
        for idx, ident, errs in problems[:10]:
            print(f"        row {idx} ({ident}): {'; '.join(errs)}")

    enricher = Enricher(enabled=opts.enrich)
    if enricher.enabled:
        enriched = []
        for n, row in enumerate(normalized, 1):
            src = build_enrich_source(row, cfg)
            enriched.append(enricher.enrich(row, src))
            if n % 10 == 0:
                print(f"      enriched {n}/{len(normalized)}")
        normalized = enriched
        print(f"[4/5] enrich      : {sum(r['enriched'] for r in normalized)} rows enriched via Claude")
    else:
        print("[4/5] enrich      : skipped (no API key or --no-enrich) — rows marked enriched=False")

    if opts.out_jsonl:
        dump_jsonl(normalized, opts.out_jsonl)
        print(f"      wrote {opts.out_jsonl}")

    loaded = Loader(dry_run=opts.dry_run, overwrite=opts.overwrite).upsert(normalized)
    print(f"[5/5] load        : {loaded} rows {'(dry run)' if opts.dry_run else 'upserted'}")

    return {
        "raw": len(raw_rows),
        "normalized": len(normalized),
        "validation_problems": len(problems),
        "loaded": loaded,
    }
