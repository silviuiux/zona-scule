"""NOVALIA — supplier price-list feed (.xlsx) + live-site enrichment.

The price-list xlsx is essentially a list of product codes (PDT_SUP_REF) plus a
short description. Everything the catalog actually needs — image, gallery, real
manufacturer brand, category/subcategory, EAN — lives on the public product page
at novaliaromania.ro, which is server-rendered and resolves from the code alone:

    https://novaliaromania.ro/ro/produse/{CODE}/x/   ->  redirects to the product

So the supplier `resolver` (runs after normalize, before LLM enrich) fetches that
page per product and fills those fields. Variants share one page, so the fetcher's
cache keeps the number of real downloads down.

Decisions (noted for the rebuild):
- brand_name comes from the page's brand logo (e.g. Bessey, Peddinghaus, Mob),
  falling back to "Novalia". This is the "extract sub-brands" choice.
- category_text / subcategory_text come from the page breadcrumb (Novalia's own
  taxonomy). If you'd rather map these onto an existing ZonaScule taxonomy, do it
  as a lookup in `_CATEGORY_REMAP` once that taxonomy is known.
"""

from __future__ import annotations

import re
from typing import Callable

from core.normalize import SupplierConfig
from core.slug import clean, slugify

SITE = "https://novaliaromania.ro"

# Logo-slug -> display brand name. Title-case is the default; overrides for acronyms.
_BRAND_OVERRIDES = {"ius": "IUS"}
# Logos that are chrome, never a product's brand.
_NON_BRAND_LOGOS = {"novalia-logo", "novalia", "seap", "sal", "sol", "netopia"}

# Optional: map Novalia category/subcategory -> your taxonomy. Empty = use as-is.
_CATEGORY_REMAP: dict[str, str] = {}
_SUBCATEGORY_REMAP: dict[str, str] = {}


def _keep(raw: dict) -> bool:
    return bool(clean(raw.get("PDT_SUP_REF")) and clean(raw.get("PDT_SUMMARY")))


def _family_id(row: dict) -> str | None:
    name = clean(row.get("name"))
    return f"NOVALIA-{slugify(name)}" if name else None


def _titleize_slug(s: str) -> str:
    return " ".join(w.upper() if w.lower() in _BRAND_OVERRIDES else w.capitalize()
                    for w in s.replace("-", " ").split())


def _meta(html: str, prop: str) -> str | None:
    m = re.search(rf'<meta[^>]+property=["\']{re.escape(prop)}["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    if not m:
        m = re.search(rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']{re.escape(prop)}["\']', html, re.I)
    return m.group(1).strip() if m else None


def _abs(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("http"):
        return url
    return SITE + url if url.startswith("/") else url


def parse_product_html(html: str) -> dict:
    """Pure HTML -> field dict. No network here, so it's unit-testable offline."""
    out: dict = {}

    # Main image (og:image is the canonical product shot).
    out["main_image_url"] = _abs(_meta(html, "og:image"))

    # Description (og:description is a clean summary of the page copy).
    desc = _meta(html, "og:description")
    if desc:
        out["long_description"] = desc

    # EAN — appears as "Cod EAN: <digits>" in the page body.
    ean = re.search(r"Cod\s*EAN[:\s]*([0-9]{8,14})", html, re.I)
    if ean:
        out["ean"] = ean.group(1)

    # Brand — first product brand logo at /static/shop/logos/<slug>.<hash>.png,
    # skipping chrome logos. (Footer repeats some logos, but the product's appears
    # first in document order.)
    for m in re.finditer(r"/static/shop/logos/([a-z0-9\-]+)\.[a-z0-9]+\.png", html, re.I):
        slug = m.group(1).lower()
        if slug not in _NON_BRAND_LOGOS:
            out["brand_name"] = _BRAND_OVERRIDES.get(slug, _titleize_slug(slug))
            break

    # Category / subcategory — from the breadcrumb hrefs.
    sub = re.search(r"/products/category/\d+/([a-z0-9\-]+)/subcategory/\d+/([a-z0-9\-]+)/", html, re.I)
    if sub:
        out["category_text"] = _CATEGORY_REMAP.get(sub.group(1), _titleize_slug(sub.group(1)))
        out["subcategory_text"] = _SUBCATEGORY_REMAP.get(sub.group(2), _titleize_slug(sub.group(2)))
    else:
        cat = re.search(r"/ro/categories/\d+/([a-z0-9\-]+)/", html, re.I)
        if cat:
            out["category_text"] = _CATEGORY_REMAP.get(cat.group(1), _titleize_slug(cat.group(1)))

    # Gallery — product images under /media/images/, excluding the main shot and
    # certification/badge images (TÜV, GS, logos, SEAP pictos). Up to 4.
    main = out.get("main_image_url")
    _badge = re.compile(r"(logo|tuv|rheinland|_gs_|^gs_|seap|picto)", re.I)
    seen, gallery = set(), []
    for m in re.finditer(r"/media/images/([A-Za-z0-9_\-\.]+\.(?:jpg|jpeg|png|webp))", html, re.I):
        fname = m.group(1)
        u = _abs(m.group(0))
        if u and u != main and u not in seen and not _badge.search(fname):
            seen.add(u)
            gallery.append(u)
    for i, u in enumerate(gallery[:4], start=1):
        out[f"gallery_url_{i}"] = u

    return {k: v for k, v in out.items() if v}


def make_resolver() -> Callable[[dict, Callable[[str], str | None]], dict]:
    def resolve(row: dict, fetch: Callable[[str], str | None]) -> dict:
        code = clean(row.get("sku"))
        if not code:
            return {}
        html = fetch(f"{SITE}/ro/produse/{code}/x/")
        if not html:
            return {}
        return parse_product_html(html)
    return resolve


CONFIG = SupplierConfig(
    name="novalia",
    brand_name="Novalia",            # fallback; real brand comes from the page
    reader="xlsx",
    row_filter=_keep,
    column_map={
        "sku": "PDT_SUP_REF",
        "name": "PDT_SUMMARY",
        "long_description": "PDT_DESCRIPTION",
        "manufacturer_url": "ITEM_SUP_LINK",
        "variant_label": "PDT_SUP_REF",
    },
    family_key=_family_id,
    resolver=make_resolver(),
)
