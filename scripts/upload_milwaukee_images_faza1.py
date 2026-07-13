#!/usr/bin/env python3
"""
Faza 1 - upload imagini Milwaukee in Supabase Storage + update products.

De ce ruleaza local, nu in Cowork:
Cowork/Claude nu are (si nu ar trebui sa aiba) acces la SUPABASE_SERVICE_ROLE_KEY
si nu poate modifica policy-urile de acces (RLS) din motive de securitate.
Upload-ul de fisiere in bucket necesita service_role key, asa ca acest script
trebuie rulat de tine, local, cu cheia ta.

Pregatire:
  1. pip install supabase
  2. export SUPABASE_URL="https://dfbhgnbqwoinujnzfxsl.supabase.co"
  3. export SUPABASE_SERVICE_ROLE_KEY="<cheia ta service_role, din Supabase Dashboard > Project Settings > API>"
  4. Dezarhiveaza milwaukee_images_faza1.zip intr-un folder, ex: ./milwaukee_images/
     (structura asteptata: milwaukee_images/milwaukee-<SKU>/main.jpg)

Rulare:
  python3 upload_milwaukee_images_faza1.py ./milwaukee_images

Ce face:
  - Pentru fiecare folder milwaukee-<SKU>/main.jpg, urca fisierul in bucket-ul
    "product-images" la path-ul milwaukee-<SKU>/main.jpg (upsert=True).
  - Seteaza main_image_storage_url, main_image_url si images_migrated=true
    in tabela products, pentru randul cu acel sku si brand_name ilike 'milwaukee'.
  - Afiseaza un raport final (succes / esec per SKU).
"""

import os
import sys
from pathlib import Path

try:
    from supabase import create_client
except ImportError:
    sys.exit("Lipseste pachetul 'supabase'. Ruleaza: pip install supabase")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = "product-images"

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    sys.exit(
        "Seteaza variabilele de mediu SUPABASE_URL si SUPABASE_SERVICE_ROLE_KEY inainte de a rula scriptul."
    )

if len(sys.argv) != 2:
    sys.exit("Utilizare: python3 upload_milwaukee_images_faza1.py <folder_cu_imagini>")

images_root = Path(sys.argv[1])
if not images_root.is_dir():
    sys.exit(f"Folderul {images_root} nu exista.")

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

ok, failed = [], []

folders = sorted(p for p in images_root.iterdir() if p.is_dir() and p.name.startswith("milwaukee-"))
print(f"Gasite {len(folders)} foldere de procesat.\n")

for folder in folders:
    sku = folder.name.replace("milwaukee-", "", 1)
    img_path = folder / "main.jpg"
    if not img_path.exists():
        failed.append((sku, "lipseste main.jpg"))
        continue

    storage_path = f"milwaukee-{sku}/main.jpg"

    try:
        with open(img_path, "rb") as f:
            client.storage.from_(BUCKET).upload(
                storage_path,
                f.read(),
                file_options={"content-type": "image/jpeg", "upsert": "true"},
            )

        public_url = client.storage.from_(BUCKET).get_public_url(storage_path)

        result = (
            client.table("products")
            .update(
                {
                    "main_image_storage_url": public_url,
                    "main_image_url": public_url,
                    "images_migrated": True,
                }
            )
            .eq("sku", sku)
            .ilike("brand_name", "milwaukee")
            .execute()
        )

        if result.data:
            ok.append(sku)
        else:
            failed.append((sku, "upload ok, dar niciun rand actualizat in products (sku negasit?)"))

    except Exception as e:
        failed.append((sku, str(e)))

print(f"\nSucces: {len(ok)} / {len(folders)}")
if failed:
    print(f"Esuate: {len(failed)}")
    for sku, reason in failed:
        print(f"  - {sku}: {reason}")
