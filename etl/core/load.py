"""Stage 5 — load: safe match-by-SKU refresh into Supabase `products`.

Why not a plain PostgREST upsert? The live `products` table has **no unique index
on `sku`** (and a few existing duplicates), so `ON CONFLICT (sku)` is impossible.
The catalog is also already ~76% populated from this same supplier, so most rows
are UPDATES, not inserts. This loader therefore:

  1. looks up existing rows by sku (the natural key),
  2. UPDATEs matches in place by their primary key `id`,
  3. INSERTs only genuinely new skus,

which is idempotent and never duplicates existing rows. Writes use the service-role
key (bypasses RLS); never the anon key.

Overwrite policy (default = fill-empty, the non-destructive choice):
  - fill-empty: only set columns that are currently NULL/empty on the existing row,
    so any manual curation already in the catalog is preserved.
  - overwrite=True: replace existing values with freshly-resolved ones (still never
    writes a NULL over an existing value).
New rows are always inserted in full regardless of policy.
"""

from __future__ import annotations

import json
import os

from .schema import PRODUCT_COLUMNS

_JSONB = ("specs", "axes")
# Columns we never touch on an UPDATE (identity / DB-managed).
_IMMUTABLE = {"id", "created_at"}


class Loader:
    def __init__(self, dry_run: bool = False, overwrite: bool = False, key: str = "sku"):
        self.dry_run = dry_run
        self.overwrite = overwrite
        self.key = key
        self.client = None if dry_run else _make_client()

    def upsert(self, rows: list[dict]) -> int:
        rows = [r for r in rows if r.get(self.key)]
        keys = [r[self.key] for r in rows]

        existing = self._fetch_existing(keys)  # sku -> existing row (or list)
        to_insert, to_update = [], []
        for r in rows:
            match = existing.get(r[self.key])
            if match:
                patch = self._build_patch(r, match)
                if patch:
                    to_update.append((match["id"], patch))
            else:
                to_insert.append(self._insert_payload(r))

        if self.dry_run:
            print(f"  [load] DRY RUN — {len(to_update)} update / {len(to_insert)} insert "
                  f"(policy={'overwrite' if self.overwrite else 'fill-empty'})")
            return len(to_update) + len(to_insert)

        for pk, patch in to_update:
            self.client.table("products").update(patch).eq("id", pk).execute()
        for i in range(0, len(to_insert), 500):
            self.client.table("products").insert(to_insert[i:i + 500]).execute()
        print(f"  [load] {len(to_update)} updated, {len(to_insert)} inserted")
        return len(to_update) + len(to_insert)

    # ---- helpers ----------------------------------------------------------
    def _fetch_existing(self, keys: list[str]) -> dict:
        if self.client is None or not keys:
            return {}
        found: dict = {}
        for i in range(0, len(keys), 200):
            chunk = keys[i:i + 200]
            res = self.client.table("products").select(",".join(PRODUCT_COLUMNS + ("id",))) \
                .in_(self.key, chunk).execute()
            for row in (res.data or []):
                found.setdefault(row[self.key], row)  # first wins on dupes
        return found

    def _build_patch(self, new: dict, existing: dict) -> dict:
        patch = {}
        for col in PRODUCT_COLUMNS:
            if col in _IMMUTABLE:
                continue
            val = new.get(col)
            if val in (None, "", {}):
                continue  # never write a null/empty over anything
            cur = existing.get(col)
            cur_empty = cur in (None, "", {})
            if self.overwrite or cur_empty:
                if val != cur:
                    patch[col] = val
        return patch

    @staticmethod
    def _insert_payload(row: dict) -> dict:
        out = {c: row.get(c) for c in PRODUCT_COLUMNS}
        for j in _JSONB:
            if out.get(j) is None:
                out[j] = {}
        return out


def _make_client():
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError(
            "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY (load reads the "
            "same .env.local the app uses). Use --dry-run to skip the DB entirely."
        )
    try:
        from supabase import create_client
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("pip install supabase  (see requirements.txt)") from exc
    return create_client(url, key)


def dump_jsonl(rows: list[dict], path: str) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        for r in rows:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")
