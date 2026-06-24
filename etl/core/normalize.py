"""Stage 2 — normalize: raw supplier record -> canonical product dict.

This is the heart of the de-rabbit-holing. A supplier is just a SupplierConfig:
a column map + a few small callables. Adding a supplier means writing ~20 lines of
config, NOT a new parsing program. All suppliers share this one normalizer.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from .schema import empty_product
from .slug import clean, slugify

# A mapping value is either a source-column name (str) or a function of the raw row.
MapValue = str | Callable[[dict], object]


@dataclass
class SupplierConfig:
    """Everything supplier-specific, in one place.

    name:        short id, e.g. "karcher".
    brand_name:  default brand for every row (overridable via column_map).
    reader:      "csv" | "xlsx" — how extract() reads the feed.
    column_map:  canonical_field -> source column name OR callable(raw_row)->value.
                 Only list fields the feed actually provides; the rest stay None
                 and get filled by the enrichment stage.
    gallery_columns: source columns whose values become gallery_url_1..4 (in order).
    family_key:  callable(normalized_row)->str|None grouping variants into a family.
                 Return None for standalone products (they group with themselves).
    enrich_source: callable(normalized_row)->str building the raw text blob handed
                 to Claude for enrichment. Defaults to name + long_description.
    """

    name: str
    brand_name: str
    reader: str = "csv"
    column_map: dict[str, MapValue] = field(default_factory=dict)
    gallery_columns: list[str] = field(default_factory=list)
    family_key: Callable[[dict], str | None] | None = None
    enrich_source: Callable[[dict], str] | None = None
    csv_kwargs: dict = field(default_factory=dict)
    # Optional predicate on the RAW row: return False to drop it before normalizing
    # (e.g. blank/total rows in a price list). Default keeps everything.
    row_filter: Callable[[dict], bool] | None = None
    # Optional enrichment-from-source-of-truth step that runs AFTER normalize and
    # BEFORE the LLM enrich. Signature: resolver(row, fetch) -> dict of field
    # updates (merged into the row). `fetch` is an HTTP getter the pipeline injects.
    # Used by NOVALIA to pull image/brand/category/ean from the live product page.
    resolver: Callable[[dict, Callable[[str], str | None]], dict] | None = None


def _resolve(mapping: MapValue, raw: dict):
    if callable(mapping):
        return mapping(raw)
    return raw.get(mapping)


def normalize(raw: dict, cfg: SupplierConfig) -> dict:
    """Turn one raw feed/scrape record into a canonical product dict."""
    row = empty_product()
    row["brand_name"] = cfg.brand_name

    # 1. Apply the supplier's explicit field mappings.
    for canonical, mapping in cfg.column_map.items():
        row[canonical] = clean(_resolve(mapping, raw))

    # 2. Galleries: positional, first 4 non-empty.
    gallery_vals = [clean(raw.get(c)) for c in cfg.gallery_columns]
    gallery_vals = [v for v in gallery_vals if v][:4]
    for i, url in enumerate(gallery_vals, start=1):
        row[f"gallery_url_{i}"] = url

    # 3. Derive name/model if the supplier didn't map them explicitly.
    if not row.get("name"):
        row["name"] = " ".join(
            p for p in [cfg.brand_name, row.get("model")] if p
        ) or None

    # 4. Family rollup (the tricky bit from REBUILD.md §5.2).
    if cfg.family_key:
        fid = cfg.family_key(row)
        if fid:
            row["family_id"] = fid
            if not row.get("family_name"):
                row["family_name"] = row.get("name")

    # 5. Slug — stable, derived from brand + model/name + sku for uniqueness.
    if not row.get("slug"):
        row["slug"] = slugify(
            cfg.brand_name,
            row.get("model") or row.get("name"),
            row.get("sku"),
        )

    return row


def build_enrich_source(row: dict, cfg: SupplierConfig) -> str:
    """The raw text blob the enrichment stage reasons over."""
    if cfg.enrich_source:
        return cfg.enrich_source(row)
    parts = [
        f"Brand: {row.get('brand_name')}",
        f"Model: {row.get('model')}",
        f"Name: {row.get('name')}",
        f"Category: {row.get('category_text')} / {row.get('subcategory_text')}",
        f"Description: {row.get('long_description') or row.get('short_description') or ''}",
    ]
    return "\n".join(p for p in parts if p)
