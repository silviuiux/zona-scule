#!/usr/bin/env python3
"""
enrich-karcher-playwright.py
==============================
Uses Playwright to render Kärcher pages (JS-heavy), find product URLs from
search results, then extract descriptions + specs + caracteristici + aplicatii.
Updates Supabase directly.

Requirements:
  pip install playwright python-dotenv requests
  playwright install chromium

Usage:
  python3 scripts/enrich-karcher-playwright.py --limit 5 --dry-run
  python3 scripts/enrich-karcher-playwright.py --sku "1.528-133.0"
  python3 scripts/enrich-karcher-playwright.py --resume
  python3 scripts/enrich-karcher-playwright.py  # all products
"""

import os, re, sys, json, time, argparse, requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ['NEXT_PUBLIC_SUPABASE_ANON_KEY']
ANTHROPIC_KEY = os.environ['ANTHROPIC_API_KEY']

# ── Supabase helpers ──────────────────────────────────────────────────────────

def sb_get(path):
    r = requests.get(f'{SUPABASE_URL}/rest/v1/{path}',
        headers={'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}'})
    return r.json()

def sb_update(sku, data):
    r = requests.patch(
        f'{SUPABASE_URL}/rest/v1/products?sku=eq.{requests.utils.quote(sku)}',
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
        },
        json=data
    )
    return r.status_code in (200, 204)

# ── Claude extraction ─────────────────────────────────────────────────────────

def clean_page_text(text, max_chars=3500):
    """Strip non-printable chars, collapse whitespace, truncate."""
    import re as _re
    text = _re.sub(r'\n{3,}', '\n\n', text)
    text = _re.sub(r' {2,}', ' ', text)
    # Keep only printable ASCII + Romanian diacritics + newlines
    cleaned = ''.join(c for c in text if c.isprintable() or c == '\n')
    return cleaned[:max_chars].strip()

def extract_with_claude(sku, product_name, page_text):
    """Send page text to Claude, get structured JSON back."""
    page_clean = clean_page_text(page_text)

    system = "Ești expert în produse industriale. Răspunzi DOAR cu JSON valid, fără text suplimentar, fără markdown."
    user = (
        f'SKU: {sku}\nProdus: {product_name}\n\n'
        f'Extrage din textul următor și returnează JSON cu exact aceste chei '
        f'(pune null dacă nu găsești):\n'
        f'model, short_description, '
        f'st1_label, st1_value, st1_details, '
        f'st2_label, st2_value, st2_details, '
        f'st3_label, st3_value, st3_details, '
        f'c1_title, c1_details, c2_title, c2_details, c3_title, c3_details, '
        f'app_01_title, app_01_details, app_02_title, app_02_details, app_03_title, app_03_details\n\n'
        f'Reguli:\n'
        f'- model: titlul oficial al produsului, cu majuscule\n'
        f'- short_description: 2-3 propoziții, max 250 caractere, în română\n'
        f'- st*_label/value/details: specificații tehnice cheie cu valori și unități\n'
        f'- c*_title/details: caracteristici și beneficii cheie\n'
        f'- app_*: aplicații recomandate\n\n'
        f'TEXT PAGINA:\n{page_clean}'
    )

    r = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers={
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        json={
            'model': 'claude-sonnet-4-5',
            'max_tokens': 800,
            'system': system,
            'messages': [{'role': 'user', 'content': user}]
        },
        timeout=30
    )

    if not r.ok:
        raise Exception(f"Claude API error: {r.status_code} — {r.text[:200]}")

    text = r.json()['content'][0]['text'].strip()
    # Strip markdown fences if model added them
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    match = re.search(r'\{[\s\S]*\}', text)
    if not match:
        raise Exception("No JSON in Claude response")
    return json.loads(match.group(0))

# ── Playwright scraper ────────────────────────────────────────────────────────

def find_and_scrape_product(page, sku):
    """
    Uses a Playwright page to:
    1. Search for SKU on kaercher.com/ro
    2. Find the product URL in results (JS-rendered)
    3. Navigate to product page
    4. Extract all text content
    Returns (product_url, page_text) or (None, None)
    """
    numeric = re.sub(r'[.\-]', '', sku)
    
    # Go to search page
    search_url = f"https://www.kaercher.com/ro/cautare-rezultate.html?query={sku}"
    page.goto(search_url, wait_until='networkidle', timeout=30000)
    
    # Wait for JS to render search results
    time.sleep(3)
    
    # Get the full HTML after JS renders
    html = page.content()
    
    # Look for product URL containing the numeric slug
    match = re.search(
        rf'href="(/ro/[^"]+{numeric}[^"]*\.html)"',
        html
    )
    
    if not match:
        # Also try JSON data embedded in page
        json_match = re.search(
            rf'"url"\s*:\s*"(/ro/[^"]+{numeric}[^"]*\.html)"',
            html
        )
        if json_match:
            match = json_match
            # Reconstruct as href match
    
    if not match:
        return None, None
    
    product_path = match.group(1)
    product_url = f"https://www.kaercher.com{product_path}"
    
    # Navigate to product page
    page.goto(product_url, wait_until='networkidle', timeout=30000)
    time.sleep(2)
    
    # Extract text content (remove scripts/styles)
    page_text = page.evaluate("""() => {
        // Remove script and style elements
        document.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
        return document.body.innerText;
    }""")
    
    return product_url, page_text

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sku', help='Process single SKU')
    parser.add_argument('--limit', type=int, help='Max products to process')
    parser.add_argument('--resume', action='store_true', help='Skip already processed')
    parser.add_argument('--dry-run', action='store_true', help='Show results without saving')
    args = parser.parse_args()

    print(f"🔧 Kärcher Playwright Enrichment Script")
    print(f"Mode: {'DRY RUN' if args.dry_run else 'LIVE'} | Resume: {args.resume}")

    # Fetch products from Supabase
    if args.sku:
        products = sb_get(f'products?select=id,sku,name&sku=eq.{requests.utils.quote(args.sku)}')
    elif args.resume:
        products = sb_get('products?select=id,sku,name&brand_name=eq.Karcher&manufacturer_url=is.null&limit=2000')
    else:
        products = sb_get('products?select=id,sku,name&brand_name=eq.Karcher&limit=2000')

    if args.limit:
        products = products[:args.limit]

    print(f"\nFound {len(products)} products to process\n")
    if not products:
        return

    # Import Playwright here (so error is clear if not installed)
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Playwright not installed. Run: pip install playwright && playwright install chromium")
        sys.exit(1)

    results = {'success': 0, 'not_found': 0, 'failed': 0}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            locale='ro-RO',
            extra_http_headers={'Accept-Language': 'ro-RO,ro;q=0.9'}
        )
        page = ctx.new_page()

        for i, product in enumerate(products):
            sku = product['sku']
            name = product.get('name', '')
            print(f"\n[{i+1}/{len(products)}] {sku} — {name[:50]}")

            try:
                # 1. Find product URL via search + extract page text
                product_url, page_text = find_and_scrape_product(page, sku)
                
                if not product_url:
                    print(f"  ⚠ Not found on kaercher.com/ro")
                    results['not_found'] += 1
                    continue
                
                print(f"  ✓ Found: {product_url.split('/ro/')[-1][:60]}")
                
                # 2. Extract structured data with Claude
                data = extract_with_claude(sku, name, page_text)
                print(f"  ✓ Extracted: {data.get('short_description', '')[:60]}...")
                
                if args.dry_run:
                    print(f"  [DRY RUN] Would update with: {json.dumps(data, ensure_ascii=False, indent=2)[:200]}")
                    results['success'] += 1
                    continue
                
                # 3. Update Supabase
                data['manufacturer_url'] = product_url
                ok = sb_update(sku, data)
                if ok:
                    print(f"  ✓ DB updated")
                    results['success'] += 1
                else:
                    print(f"  ✗ DB update failed")
                    results['failed'] += 1

            except Exception as e:
                print(f"  ✗ Error: {e}")
                results['failed'] += 1

            # Polite delay
            if i < len(products) - 1:
                time.sleep(2)

        browser.close()

    print(f"\n── Summary ──────────────────────────────")
    print(f"✓ Success:   {results['success']}")
    print(f"⚠ Not found: {results['not_found']}")
    print(f"✗ Failed:    {results['failed']}")
    print(f"Total:       {len(products)}")

if __name__ == '__main__':
    main()
