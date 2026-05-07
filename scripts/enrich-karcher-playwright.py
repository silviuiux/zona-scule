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

def extract_with_claude(sku, product_name, page_text):
    """Send page text to Claude, get structured JSON back."""
    prompt = f"""Ești expert în produse industriale Kärcher. Analizează textul de mai jos de pe pagina produsului cu SKU "{sku}" ({product_name}).

Extrage datele și returnează DOAR JSON valid, fără alt text:

{{
  "model": "Titlul oficial al produsului în română, cu majuscule (ex: SET DE FILTRE AF 20, ASPIRATOR T 9/1 Bp). Exact cum apare pe pagina Kärcher.",
  "short_description": "2-3 propoziții care descriu exact ce face produsul. MAX 300 caractere. În română.",
  "st1_label": "Prima specificație tehnică (ex: Putere motor, Debit aer, Presiune)",
  "st1_value": "Valoarea cu unitate (ex: 1200 W, 120 bar)",
  "st1_details": "Explicație scurtă în română",
  "st2_label": "A doua specificație",
  "st2_value": "Valoarea",
  "st2_details": "Explicație",
  "st3_label": "A treia specificație",
  "st3_value": "Valoarea",
  "st3_details": "Explicație",
  "c1_title": "Prima caracteristică cheie (max 5 cuvinte)",
  "c1_details": "Descriere în română (max 100 caractere)",
  "c2_title": "A doua caracteristică",
  "c2_details": "Descriere",
  "c3_title": "A treia caracteristică",
  "c3_details": "Descriere",
  "app_01_title": "Prima aplicație recomandată",
  "app_01_details": "Descriere aplicație (max 100 caractere)",
  "app_02_title": "A doua aplicație",
  "app_02_details": "Descriere",
  "app_03_title": "A treia aplicație",
  "app_03_details": "Descriere"
}}

Dacă nu găsești o valoare, pune null. Nu inventa date.

TEXT PAGINA (primele 6000 caractere):
{page_text[:6000]}"""

    r = requests.post(
        'https://api.anthropic.com/v1/messages',
        headers={
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        json={
            'model': 'claude-sonnet-4-5',
            'max_tokens': 1000,
            'messages': [{'role': 'user', 'content': prompt}]
        },
        timeout=30
    )
    
    if not r.ok:
        raise Exception(f"Claude API error: {r.status_code}")
    
    text = r.json()['content'][0]['text'].strip()
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
