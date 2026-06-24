"""Slug + small string helpers, Romanian-diacritic aware."""

from __future__ import annotations

import re
import unicodedata

_RO_MAP = str.maketrans({
    "ă": "a", "â": "a", "î": "i", "ș": "s", "ş": "s", "ț": "t", "ţ": "t",
    "Ă": "a", "Â": "a", "Î": "i", "Ș": "s", "Ş": "s", "Ț": "t", "Ţ": "t",
})


def slugify(*parts: str | None) -> str:
    """Join non-empty parts and turn them into a URL-safe slug.

    slugify('Kärcher', 'K 5 Premium') -> 'karcher-k-5-premium'
    """
    text = " ".join(p for p in parts if p)
    text = text.translate(_RO_MAP)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return re.sub(r"-{2,}", "-", text)


def clean(value) -> str | None:
    """Trim whitespace; turn empty / NaN-ish values into None."""
    if value is None:
        return None
    s = str(value).strip()
    if s == "" or s.lower() in {"nan", "none", "null", "n/a", "-"}:
        return None
    return s
