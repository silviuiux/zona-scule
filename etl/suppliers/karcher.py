"""Kärcher supplier — the reference template. Clone this file per supplier.

To add a new supplier you only edit THIS kind of file: declare which feed column
maps to which canonical field, how galleries are laid out, and how families group.
Everything else (normalize / enrich / load) is shared and untouched.
"""

from __future__ import annotations

import re

from core.normalize import SupplierConfig
from core.slug import clean

# Group variants of the same machine into a family. Kärcher model codes look like
# "K 5 Premium Full Control Plus" — we roll up on the leading series token ("K 5")
# so sizes/bundles of the same washer collapse into one catalog card (REBUILD.md §5.2).
_FAMILY_RE = re.compile(r"^([A-Z]{1,3}\s?\d+)")


def _family_id(row: dict) -> str | None:
    model = clean(row.get("model")) or ""
    m = _FAMILY_RE.match(model)
    return f"KARCHER-{m.group(1).replace(' ', '')}" if m else None


def _enrich_source(row: dict) -> str:
    """The raw blob Claude turns into structured fields. Pull in everything messy:
    the long description + the supplier's raw technical-data dump live here."""
    return "\n".join(p for p in [
        f"Brand: Kärcher",
        f"Model: {row.get('model')}",
        f"Produs: {row.get('name')}",
        f"Categorie: {row.get('category_text')} / {row.get('subcategory_text')}",
        f"Descriere: {row.get('long_description') or ''}",
        f"Date tehnice brute: {row.get('special_features') or ''}",
    ] if p)


CONFIG = SupplierConfig(
    name="karcher",
    brand_name="Kärcher",
    reader="csv",
    # canonical_field : source CSV column (or a callable(raw)->value)
    column_map={
        "sku": "Articol",
        "ean": "EAN",
        "model": "Model",
        "name": lambda r: clean(r.get("Denumire")) or f"Kärcher {clean(r.get('Model')) or ''}".strip(),
        "category_text": "Categorie",
        "subcategory_text": "Subcategorie",
        "long_description": "Descriere",
        # Raw technical-data dump parked here so the enricher can structure it.
        "special_features": "DateTehnice",
        "main_image_url": "ImagineURL",
        "manufacturer_url": "LinkProdus",
        "datasheet_url_1": "FisaTehnica",
        "variant_label": "Variant",
    },
    gallery_columns=["Galerie1", "Galerie2", "Galerie3", "Galerie4"],
    family_key=_family_id,
    enrich_source=_enrich_source,
)
