#!/usr/bin/env python3
"""
resolve-karcher-urls.py
========================
Reads KARCHER-Grid_view.csv, finds the real product URL on kaercher.com/ro
for each SKU using Bing search, saves manufacturer_url to Supabase.

Usage:
  python3 scripts/resolve-karcher-urls.py KARCHER-Grid_view.csv
  python3 scripts/resolve-karcher-urls.py KARCHER-Grid_view.csv --limit 20
  python3 scripts/resolve-karcher-urls.py KARCHER-Grid_view.csv --resume
  python3 scripts/resolve-karcher-urls.py KARCHER-Grid_view.csv --dry-run
"""

import csv, sys, os, re, time, argparse, requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ['NEXT_PUBLIC_SUPABASE_ANON_KEY']

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
}

def sku_to_slug(sku):
    return re.sub(r'[.\-]', '', sku)

def find_product_url(sku):
    numeric = sku_to_slug(sku)
    
    # Strategy 1: Bing search — site:kaercher.com/ro {numeric}
    try:
        res = requests.get(
            f'https://www.bing.com/search?q=site:kaercher.com/ro+{numeric}&setlang=ro',
            headers=HEADERS, timeout=12
        )
        if res.ok:
            # Find kaercher.com/ro URL containing the numeric slug
            match = re.search(
                rf'https://www\.kaercher\.com/ro/[^"\'<>\s]+{numeric}[^"\'<>\s]*\.html',
                res.text
            )
            if match:
                return match.group(0).split('"')[0]  # clean any trailing chars
    except Exception as e:
        pass
    
    # Strategy 2: DuckDuckGo
    try:
        res = requests.get(
            f'https://html.duckduckgo.com/html/?q=site:kaercher.com/ro+{numeric}',
            headers=HEADERS, timeout=12
        )
        if res.ok:
            match = re.search(
                rf'https://www\.kaercher\.com/ro/[^"\'<>\s]+{numeric}[^"\'<>\s]*\.html',
                res.text
            )
            if match:
                return match.group(0).split('"')[0]
    except:
        pass

    # Strategy 3: Try kaercher.com/ro/search directly
    try:
        res = requests.get(
            f'https://www.kaercher.com/ro/search/?q={numeric}',
            headers=HEADERS, timeout=12
        )
        if res.ok:
            match = re.search(
                rf'href="(/ro/[^"]+{numeric}[^"]*\.html)"',
                res.text
            )
            if match:
                return f'https://www.kaercher.com{match.group(1)}'
    except:
        pass

    # Strategy 4: Try common flat paths
    for base in ['accesorii', 'professional', 'home-garden']:
        try:
            url = f'https://www.kaercher.com/ro/{base}/{numeric}.html'
            r = requests.head(url, headers=HEADERS, timeout=8, allow_redirects=True)
            if r.status_code == 200:
                return r.url
        except:
            pass
    
    return None

def supabase_get(path):
    r = requests.get(
        f'{SUPABASE_URL}/rest/v1/{path}',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
        }
    )
    return r.json()

def supabase_update(sku, manufacturer_url):
    r = requests.patch(
        f'{SUPABASE_URL}/rest/v1/products?sku=eq.{requests.utils.quote(sku)}',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        json={'manufacturer_url': manufacturer_url}
    )
    return r.status_code in (200, 204)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('csv_file')
    parser.add_argument('--limit', type=int)
    parser.add_argument('--resume', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    # Read CSV
    with open(args.csv_file, encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))
    print(f'📊 {len(rows)} rows in CSV')

    # Get already resolved SKUs if resume
    resolved = set()
    if args.resume:
        data = supabase_get('products?select=sku&brand_name=eq.Karcher&manufacturer_url=not.is.null')
        resolved = {r['sku'] for r in data}
        print(f'⏭  Skipping {len(resolved)} already resolved')

    to_process = [r for r in rows if r['SKU'] and r['SKU'] not in resolved]
    if args.limit:
        to_process = to_process[:args.limit]
    
    print(f'🔍 Processing {len(to_process)} products\n')
    
    found = not_found = errors = 0

    for i, row in enumerate(to_process):
        sku = row['SKU']
        print(f'[{i+1}/{len(to_process)}] {sku}... ', end='', flush=True)
        
        url = find_product_url(sku)
        
        if url:
            if args.dry_run:
                print(f'✓ DRY: {url.split("/ro/")[1][:60]}')
            else:
                ok = supabase_update(sku, url)
                if ok:
                    print(f'✓ {url.split("/ro/")[1][:60]}')
                    found += 1
                else:
                    print(f'✗ DB error')
                    errors += 1
        else:
            print('⚠ not found')
            not_found += 1
        
        # Polite delay between requests
        if i < len(to_process) - 1:
            time.sleep(1.5)

    print(f'\n── Summary ───────────────────────────')
    print(f'✓ Found:     {found}')
    print(f'⚠ Not found: {not_found}')
    print(f'✗ Errors:    {errors}')

if __name__ == '__main__':
    main()
