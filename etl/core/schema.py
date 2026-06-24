"""Canonical product schema + the LLM enrichment contract.

This is the single source of truth that every supplier flows into. It mirrors the
`products` table in Supabase (see docs/REBUILD.md §5.1 and lib/types.ts). Nothing
supplier-specific lives here — suppliers map *into* this shape in suppliers/<name>.py.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# Every column the app reads/writes on `products`. Order is irrelevant; this is
# used to (a) validate normalized rows and (b) build the Supabase upsert payload.
# ---------------------------------------------------------------------------
PRODUCT_COLUMNS: tuple[str, ...] = (
    # identity / routing
    "slug", "name", "sku", "ean",
    # brand / taxonomy (denormalized text is what the catalog filters on)
    "brand_id", "brand_name", "model",
    "category_id", "category_text",
    "subcategory_id", "subcategory_text",
    # copy
    "short_description", "long_description",
    "special_features", "applications",
    # images (external source URLs; *_storage_url are filled by the image-migration job)
    "main_image_url",
    "gallery_url_1", "gallery_url_2", "gallery_url_3", "gallery_url_4",
    # display blocks rendered on the PDP — produced by enrichment
    "st1_label", "st1_value", "st1_details",
    "st2_label", "st2_value", "st2_details",
    "st3_label", "st3_value", "st3_details",
    "c1_title", "c1_details",
    "c2_title", "c2_details",
    "c3_title", "c3_details",
    "app_01_title", "app_01_details",
    "app_02_title", "app_02_details",
    "app_03_title", "app_03_details",
    # structured data
    "specs", "axes",
    # family / variant rollup
    "family_id", "family_name", "variant_label",
    # misc
    "manufacturer_url", "datasheet_url_1", "datasheet_url_2",
    "status", "featured",
    # pipeline flags
    "images_migrated", "enriched",
)

# Fields the enrichment step is allowed to write. The normalizer fills everything
# else from the feed; enrichment only touches display/derived fields so a re-run
# of enrichment never clobbers identity or taxonomy.
ENRICHED_FIELDS: tuple[str, ...] = (
    "short_description",
    "special_features", "applications",
    "st1_label", "st1_value", "st1_details",
    "st2_label", "st2_value", "st2_details",
    "st3_label", "st3_value", "st3_details",
    "c1_title", "c1_details",
    "c2_title", "c2_details",
    "c3_title", "c3_details",
    "app_01_title", "app_01_details",
    "app_02_title", "app_02_details",
    "app_03_title", "app_03_details",
    "specs", "axes",
)

# Conflict target for the upsert. We prefer SKU (always present, supplier-stable);
# EAN is the fallback dedupe key. Whichever you key on must have a UNIQUE index
# in Postgres for ON CONFLICT to work.
UPSERT_CONFLICT_KEY = "sku"


# ---------------------------------------------------------------------------
# JSON Schema handed to Claude as a tool, so the model is *forced* to return the
# exact structured shape — this is what replaces hand-written per-supplier parsing.
# Each st*/c*/app* block maps 1:1 to the columns the PDP renders.
# ---------------------------------------------------------------------------
ENRICHMENT_TOOL = {
    "name": "emit_product_fields",
    "description": (
        "Return the structured catalog fields for one product, derived strictly from "
        "the raw supplier data provided. Do not invent specs that aren't supported by "
        "the input. All human-readable text MUST be in Romanian."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "short_description": {
                "type": "string",
                "description": "One punchy sentence (max ~140 chars), Romanian, for the product card.",
            },
            "special_features": {
                "type": "string",
                "description": "Short Romanian prose listing the standout features. Empty string if unknown.",
            },
            "applications": {
                "type": "string",
                "description": "Short Romanian prose on what the product is used for. Empty string if unknown.",
            },
            # Three spec rows: label + value + optional detail.
            "st1_label": {"type": "string"}, "st1_value": {"type": "string"}, "st1_details": {"type": "string"},
            "st2_label": {"type": "string"}, "st2_value": {"type": "string"}, "st2_details": {"type": "string"},
            "st3_label": {"type": "string"}, "st3_value": {"type": "string"}, "st3_details": {"type": "string"},
            # Three characteristic rows: title + detail.
            "c1_title": {"type": "string"}, "c1_details": {"type": "string"},
            "c2_title": {"type": "string"}, "c2_details": {"type": "string"},
            "c3_title": {"type": "string"}, "c3_details": {"type": "string"},
            # Three application rows: title + detail.
            "app_01_title": {"type": "string"}, "app_01_details": {"type": "string"},
            "app_02_title": {"type": "string"}, "app_02_details": {"type": "string"},
            "app_03_title": {"type": "string"}, "app_03_details": {"type": "string"},
            # Free-form structured maps.
            "specs": {
                "type": "object",
                "description": "Flat key->value map of every technical spec found (e.g. {\"Presiune\": \"160 bar\"}). Keys Romanian, values verbatim with units.",
                "additionalProperties": {"type": "string"},
            },
            "axes": {
                "type": "object",
                "description": "Typed numeric/categorical axes for filtering, e.g. {\"pressure_bar\": 160, \"flow_l_h\": 500}. Omit anything not clearly present.",
                "additionalProperties": True,
            },
        },
        "required": [
            "short_description",
            "st1_label", "st1_value", "st2_label", "st2_value", "st3_label", "st3_value",
            "c1_title", "c1_details", "c2_title", "c2_details", "c3_title", "c3_details",
            "app_01_title", "app_01_details", "app_02_title", "app_02_details", "app_03_title", "app_03_details",
            "specs", "axes",
        ],
    },
}


def empty_product() -> dict:
    """A canonical product dict with every column present and None/default-filled."""
    row = {col: None for col in PRODUCT_COLUMNS}
    row["status"] = "active"
    row["featured"] = False
    row["images_migrated"] = False
    row["enriched"] = False
    row["specs"] = {}
    row["axes"] = {}
    return row


def validate(row: dict) -> list[str]:
    """Return a list of problems with a normalized row (empty list = valid)."""
    problems: list[str] = []
    unknown = set(row) - set(PRODUCT_COLUMNS)
    if unknown:
        problems.append(f"unknown columns: {sorted(unknown)}")
    if not row.get("name"):
        problems.append("missing required field: name")
    if not row.get("sku") and not row.get("ean"):
        problems.append("missing both sku and ean (need at least one dedupe key)")
    if not row.get("slug"):
        problems.append("missing slug")
    return problems
