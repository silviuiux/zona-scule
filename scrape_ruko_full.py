"""
scrape_ruko_full.py  (v4 — text-based spec parser)
------------------------------------------------------
Reads RUKO_001.csv, visits each unique Ruko product-family page ONCE,
extracts every variant's specs in a single pass, and outputs
RUKO_001_full.csv with all Supabase 'products' columns filled.

WHY ONE FETCH PER FAMILY:
  Ruko is a Gatsby (React SSG) site. Every variant (e.g. each drill diameter)
  is a different URL anchor on the SAME page. All variant spec blocks are
  present in the static HTML. Fetching the page once and parsing all sections
  is ~10× faster than fetching it once per variant.

MATCHING VARIANT → ROW:
  Primary:  each variant section has an id="<catalog_number>" (e.g. id="259180").
            We match that directly to the SKU extracted from ITEM_SUP_LINK anchor.
  Fallback: sort variant DL blocks by Diameter value, sort CSV rows for the
            same family by their SKU anchor, zip them together positionally.

COLUMNS POPULATED:
  name, brand_name, model (RO), sku, manufacturer_url,
  short_description,
  st1_label / st1_value / st1_details  ← Diameter
  st2_label / st2_value / st2_details  ← Length
  st3_label / st3_value / st3_details  ← Spiral length
  c1_title / c1_details  ← description para 1
  c2_title / c2_details  ← description para 2
  c3_title / c3_details  ← description para 3
  app_01_title / app_01_details  ← advantage 1
  app_02_title / app_02_details  ← advantage 2
  app_03_title / app_03_details  ← advantage 3
  gallery_url_1 … gallery_url_4

INSTALL (one-time):
  pip3 install playwright beautifulsoup4 deep-translator
  python3 -m playwright install chromium

RUN:
  python3 scrape_ruko_full.py

OUTPUT: RUKO_001_full.csv
"""

import asyncio
import csv
import json
import logging
import re
import time
from collections import defaultdict
from pathlib import Path
from urllib.parse import urldefrag

from playwright.async_api import async_playwright, TimeoutError as PWTimeout

# ── Optional translation ──────────────────────────────────────────────────────
try:
    from deep_translator import GoogleTranslator
    TRANSLATE_ENABLED = True
except ImportError:
    TRANSLATE_ENABLED = False
    print("WARNING: deep-translator not installed — 'model' field won't be translated.")
    print("  Fix: pip3 install deep-translator\n")

# ── CONFIG ────────────────────────────────────────────────────────────────────
INPUT_CSV   = "RUKO_001.csv"
OUTPUT_CSV  = "RUKO_001_full.csv"
WORKERS     = 6         # parallel workers — one fetch per base URL
NAV_TIMEOUT = 25_000    # ms
WAIT_FOR    = 5_000     # ms after load for JS to finish rendering
MAX_IMAGES  = 4
BRAND_NAME  = "RUKO"

CLOUDINARY_RE = re.compile(
    r"https://res\.cloudinary\.com/ruko-www/image/fetch/[^\s\"'<>\]]+",
    re.IGNORECASE,
)

# Romanian label map for Ruko spec field names
LABEL_RO: dict[str, str] = {
    "diameter":       "Diametru",
    "length":         "Lungime totală",
    "total length":   "Lungime totală",
    "overall length": "Lungime totală",
    "spiral length":  "Lungime spirală",
    "flute length":   "Lungime spirală",
    "shank diameter": "Diametru coadă",
    "working length": "Lungime activă",
    "cutting length": "Lungime tăiere",
    "point angle":    "Unghi vârf",
    "helix angle":    "Unghi elicoidal",
    "net weight":     "Greutate netă",
    "drilling depth": "Adâncime găurire",
}

# Ordered preference for which specs to map to st1/st2/st3
SPEC_PRIORITY = [
    "diameter", "length", "total length", "overall length",
    "spiral length", "flute length",
]

# Specs too generic/useless for st fields
SPEC_SKIP = {
    "sap item number", "gtin", "customs tariff number", "copiado",
    "drilling depth", "type", "tolerance", "din", "material", "coating",
    "cutting direction", "shaft", "groove profile", "core", "net weight",
}

# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

_translate_cache: dict[str, str] = {}


def translate_ro(text: str) -> str:
    if not text or not TRANSLATE_ENABLED:
        return text
    key = text.strip()
    if key in _translate_cache:
        return _translate_cache[key]
    try:
        result = GoogleTranslator(source="en", target="ro").translate(key)
        _translate_cache[key] = result or key
        time.sleep(0.35)
        return _translate_cache[key]
    except Exception as e:
        log.warning(f"Translation error: {e}")
        return key


def normalise_url(url: str) -> str:
    base, _ = urldefrag(url)
    return base.rstrip("/") + "/"


def sku_from_url(url: str) -> str:
    _, anchor = urldefrag(url)
    return anchor.strip()


def clean_value(raw: str) -> tuple[str, str]:
    """
    Split '18 mm' → ('18', 'mm'),  '191.0 mm' → ('191', 'mm'),
    '13,5 mm' → ('13.5', 'mm'),  '130°' → ('130', '°').
    """
    raw = raw.strip()
    m = re.match(r"^([\d.,]+)\s*(.*)$", raw)
    if m:
        val = m.group(1).replace(",", ".")
        if val.endswith(".0"):
            val = val[:-2]
        return val, m.group(2).strip()
    return raw, ""


def _is_product_image(url: str) -> bool:
    if "res.cloudinary.com/ruko-www" not in url:
        return False
    skip = ["logo", "icon", "favicon", "banner", "placeholder", "sprite"]
    return not any(k in url.lower() for k in skip)


# ── Lightweight DOM extractor ─────────────────────────────────────────────────
#
# Ruko is Gatsby (React SSG). Specs are NOT in <dl>/<dt>/<dd> — they're just
# plain text lines in alternating label/value pairs inside a div.
# Instead of trying to parse DOM structure, we grab the full body innerText
# and parse it in Python where it's much easier.
#
_EXTRACTOR_JS = """
() => {
    const result = {
        name: '',
        paragraphs: [],
        bullets: [],
        images: [],
        bodyText: '',
    };

    // ── Title ──────────────────────────────────────────────────────────────
    const h1 = document.querySelector('h1');
    result.name = h1 ? h1.innerText.trim() : '';

    // ── Body text (used in Python to parse spec blocks) ────────────────────
    // Use textContent (not innerText) so hidden / collapsed spec panels are
    // included. Strip <script> and <style> first to avoid JS/CSS noise.
    if (document.body) {
        const clone = document.body.cloneNode(true);
        clone.querySelectorAll('script, style, noscript, svg').forEach(el => el.remove());
        result.bodyText = clone.textContent || '';
    }

    // ── Images ─────────────────────────────────────────────────────────────
    const cloudRe = /res\\.cloudinary\\.com\\/ruko-www/i;
    const badImgs = ['logo','icon','favicon','banner','placeholder','sprite'];
    const imgSet = new Set();
    document.querySelectorAll('img').forEach(img => {
        [img.src, img.dataset && img.dataset.src].forEach(s => {
            if (s && cloudRe.test(s) && !badImgs.some(k => s.toLowerCase().includes(k)))
                imgSet.add(s);
        });
        if (img.srcset) {
            img.srcset.split(',').forEach(part => {
                const u = part.trim().split(' ')[0];
                if (cloudRe.test(u) && !badImgs.some(k => u.toLowerCase().includes(k)))
                    imgSet.add(u);
            });
        }
    });
    result.images = [...imgSet];

    // ── Description paragraphs ─────────────────────────────────────────────
    result.paragraphs = [...document.querySelectorAll('p')]
        .map(p => p.innerText.trim())
        .filter(t => t.length > 40);

    // ── Bullet points (advantages / applications) ──────────────────────────
    result.bullets = [...document.querySelectorAll('li')]
        .map(li => li.innerText.trim())
        .filter(t => t.length > 15 && t.length < 500);

    return result;
}
"""

# ── Text-based spec block parser ──────────────────────────────────────────────
#
# Ruko pages contain all variant specs as plain text:
#   "SAP item number\n1000042140\nCopiado\nNet weight\n110 g\n
#    Diameter\n13,5 mm\nLength\n160.0 mm\nSpiral length\n108.0 mm\n
#    Diameter\n14,0 mm\n..."
#
# Each new variant block starts when "Diameter" appears again.
# We collect {label, value} pairs by reading pairs of lines where the first
# line matches a known spec label.
#
_ALL_SPEC_LABELS: set[str] = {
    "diameter", "length", "total length", "overall length",
    "spiral length", "flute length", "shank diameter", "working length",
    "cutting length", "point angle", "helix angle", "net weight",
    "drilling depth", "sap item number", "gtin", "customs tariff number",
    "type", "tolerance", "din", "material", "coating",
    "cutting direction", "shaft", "groove profile", "core",
    "number of flutes", "number of teeth", "number of cutting edges",
    "shank", "application", "thread", "pitch",
}

# Lines that appear in the text but are not spec labels/values
_NOISE_LINES: set[str] = {
    "copiado", "copied", "copy", "—", "-",
}


def parse_spec_blocks_from_text(body_text: str) -> list[list[dict]]:
    """
    Parse Ruko's body innerText into per-variant spec block lists.
    Returns a list of blocks; each block is [{label, value}, ...].
    A new block starts each time 'Diameter' appears in the text.
    """
    lines = [l.strip() for l in body_text.splitlines() if l.strip()]

    blocks: list[list[dict]] = []
    current: list[dict] = []
    i = 0

    while i < len(lines):
        line = lines[i]
        ll = line.lower()

        # Skip noise / button labels / SAP copy-button text
        if ll in _NOISE_LINES or ll in ("", "copied"):
            i += 1
            continue

        if ll == "diameter":
            # Start of a new variant block
            if current:
                blocks.append(current)
            current = []

        if ll in _ALL_SPEC_LABELS and i + 1 < len(lines):
            next_line = lines[i + 1]
            nl = next_line.lower()
            # The value should not itself be a known label or noise
            if nl not in _ALL_SPEC_LABELS and nl not in _NOISE_LINES and len(next_line) < 60:
                current.append({"label": line, "value": next_line})
                i += 2
                continue

        i += 1

    if current:
        blocks.append(current)

    return blocks


# ── Parsing helpers ───────────────────────────────────────────────────────────

def pick_specs(raw_specs: list[dict]) -> list[dict]:
    """
    From a raw [{label, value}] list, pick the 3 most useful specs
    (Diameter first, then lengths) and return as [{label_ro, value, unit}].
    """
    by_label = {s["label"].lower().strip(): s for s in raw_specs}
    chosen: list[dict] = []
    seen: set[str] = set()

    def add(label_lower: str, s: dict) -> None:
        if label_lower in seen or len(chosen) >= 3:
            return
        seen.add(label_lower)
        value, unit = clean_value(s["value"])
        label_ro = LABEL_RO.get(label_lower, s["label"].title())
        chosen.append({"label_ro": label_ro, "value": value, "unit": unit})

    # Priority order
    for prio in SPEC_PRIORITY:
        for k, s in by_label.items():
            if prio in k and k not in seen:
                add(k, s)
                break

    # Fill remaining from whatever else is there (skip useless ones)
    for k, s in by_label.items():
        if len(chosen) >= 3:
            break
        if k in seen or any(skip in k for skip in SPEC_SKIP):
            continue
        add(k, s)

    return chosen


NOISE_PATTERNS = [
    "cookie", "copyright", "newsletter", "privacy", "händlersuche",
    "find a retailer", "comprar", "reclamation", "gestionar las cookies",
    "we are here", "questions on the product", "tel.:", "working days",
    "specialized retailer", "retailer search",
]


def is_noise(text: str) -> bool:
    tl = text.lower()
    return any(p in tl for p in NOISE_PATTERNS)


def parse_description(paragraphs: list[str], bullets: list[str]) -> tuple[str, list[dict], list[dict]]:
    """
    Returns:
      short_description (str)
      content (list of {title, details})  → c1/c2/c3
      advantages (list of {title, details}) → app_01/02/03
    """
    clean_p = [p for p in paragraphs if not is_noise(p) and len(p) > 40]
    short_desc = clean_p[0][:600] if clean_p else ""

    content_titles = ["Descriere produs", "Caracteristici principale", "Informații suplimentare"]
    content = [{"title": content_titles[i], "details": p} for i, p in enumerate(clean_p[:3])]

    # Advantages: filter noise bullets, split title from detail on em-dash or first sentence
    clean_b = [b for b in bullets if not is_noise(b) and len(b) > 20][:5]
    advantages = []
    for b in clean_b[:3]:
        parts = re.split(r"\s*[–—]\s*", b, maxsplit=1)
        if len(parts) == 2:
            title, details = parts[0].strip(), parts[1].strip()
        elif ". " in b[10:]:
            cut = b.index(". ", 10) + 1
            title, details = b[:cut].strip(), b[cut:].strip()
        else:
            title, details = b[:100].strip(), b[100:].strip()
        advantages.append({"title": title, "details": details})

    return short_desc, content, advantages


# ── Page scraper — one fetch covers the whole product family ──────────────────

async def scrape_family(playwright_page, base_url: str) -> dict:
    """
    Fetch `base_url` once and return a dict containing:
      name, paragraphs, bullets, images,
      variants      → {} (not used in v4 — positional only)
      allSpecBlocks → list of per-variant spec lists (parsed from body text)
    Returns {} on failure.
    """
    try:
        await playwright_page.goto(base_url, timeout=NAV_TIMEOUT, wait_until="domcontentloaded")
        await playwright_page.wait_for_timeout(WAIT_FOR)
        await playwright_page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        await playwright_page.wait_for_timeout(1_500)
    except PWTimeout:
        log.warning(f"TIMEOUT: {base_url}")
        return {}
    except Exception as e:
        log.warning(f"NAV ERROR {base_url}: {e}")
        return {}

    try:
        raw = await playwright_page.evaluate(_EXTRACTOR_JS)
    except Exception as e:
        log.warning(f"JS ERROR {base_url}: {e}")
        return {}

    # Parse spec blocks from body text in Python (much more reliable than DOM parsing)
    body_text = raw.get("bodyText", "")
    spec_blocks = parse_spec_blocks_from_text(body_text) if body_text else []

    return {
        "name":          raw.get("name", ""),
        "paragraphs":    raw.get("paragraphs", []),
        "bullets":       raw.get("bullets", []),
        "images":        raw.get("images", []),
        "variants":      {},           # not used in v4
        "allSpecBlocks": spec_blocks,  # positional: block[0] = first variant, etc.
    }


def get_specs_for_sku(family_data: dict, sku: str, position_in_family: int) -> list[dict]:
    """
    Retrieve the raw spec list for a specific variant SKU.
    Falls back to positional matching if ID-based lookup fails.
    """
    variants = family_data.get("variants", {})

    # Primary: exact ID match
    if sku in variants:
        return variants[sku]

    # Secondary: positional match using allSpecBlocks
    all_blocks = family_data.get("allSpecBlocks", [])
    if all_blocks and 0 <= position_in_family < len(all_blocks):
        return all_blocks[position_in_family]

    # Last resort: first block
    if all_blocks:
        return all_blocks[0]

    return []


# ── Row builder ───────────────────────────────────────────────────────────────

def build_row(original_row: dict, family_data: dict, sku: str,
              position_in_family: int, base_url: str) -> dict:
    """Merge scraped family data + per-variant specs into one output row."""

    def g(lst: list, i: int, key: str) -> str:
        try: return lst[i].get(key, "") or ""
        except IndexError: return ""

    name     = family_data.get("name", "")
    model_ro = translate_ro(name) if name else ""

    raw_specs  = get_specs_for_sku(family_data, sku, position_in_family)
    specs      = pick_specs(raw_specs)

    paragraphs = family_data.get("paragraphs", [])
    bullets    = family_data.get("bullets", [])
    short_desc, content, advantages = parse_description(paragraphs, bullets)

    images     = [img for img in family_data.get("images", []) if _is_product_image(img)][:MAX_IMAGES]
    padded     = (images + [""] * MAX_IMAGES)[:MAX_IMAGES]

    row = dict(original_row)
    row.update({
        # Core identity
        "name":              name,
        "brand_name":        BRAND_NAME,
        "model":             model_ro,
        "sku":               sku,
        "manufacturer_url":  base_url,
        "short_description": short_desc,

        # Technical specs (Diameter, Length, Spiral length)
        "st1_label":   g(specs, 0, "label_ro"),
        "st1_value":   g(specs, 0, "value"),
        "st1_details": g(specs, 0, "unit"),
        "st2_label":   g(specs, 1, "label_ro"),
        "st2_value":   g(specs, 1, "value"),
        "st2_details": g(specs, 1, "unit"),
        "st3_label":   g(specs, 2, "label_ro"),
        "st3_value":   g(specs, 2, "value"),
        "st3_details": g(specs, 2, "unit"),

        # Caracteristici
        "c1_title":   g(content, 0, "title"),
        "c1_details": g(content, 0, "details"),
        "c2_title":   g(content, 1, "title"),
        "c2_details": g(content, 1, "details"),
        "c3_title":   g(content, 2, "title"),
        "c3_details": g(content, 2, "details"),

        # Aplicatii
        "app_01_title":   g(advantages, 0, "title"),
        "app_01_details": g(advantages, 0, "details"),
        "app_02_title":   g(advantages, 1, "title"),
        "app_02_details": g(advantages, 1, "details"),
        "app_03_title":   g(advantages, 2, "title"),
        "app_03_details": g(advantages, 2, "details"),

        # Gallery
        "gallery_url_1": padded[0],
        "gallery_url_2": padded[1],
        "gallery_url_3": padded[2],
        "gallery_url_4": padded[3],
    })
    return row


# ── Worker — handles one base URL (entire product family) at a time ───────────

async def worker(
    worker_id: int,
    browser,
    queue: asyncio.Queue,   # items: (base_url, [(row_index, sku, original_row), ...])
    results: dict,
    lock: asyncio.Lock,
) -> None:
    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
    )
    page = await context.new_page()
    # Block non-essential resources
    await page.route("**/*.{woff,woff2,ttf,otf,pdf,zip,mp4,webm,gif}", lambda r: r.abort())
    await page.route("**/*google*analytics*", lambda r: r.abort())
    await page.route("**/*hotjar*", lambda r: r.abort())
    await page.route("**/*facebook*", lambda r: r.abort())

    while True:
        try:
            base_url, family_rows = queue.get_nowait()
        except asyncio.QueueEmpty:
            break

        family_data = await scrape_family(page, base_url)

        name  = family_data.get("name", "")
        imgs  = len([u for u in family_data.get("images", []) if _is_product_image(u)])
        blks  = len(family_data.get("allSpecBlocks", []))
        rows_n = len(family_rows)
        matched = "✓" if blks >= rows_n else f"⚠ {blks}/{rows_n}"

        if name:
            log.info(
                f"[W{worker_id}] ✓ '{name[:40]}' | "
                f"{imgs} imgs | {blks} spec-blocks {matched} | "
                f"{rows_n} rows"
            )
        else:
            log.warning(f"[W{worker_id}] ✗ no name — {base_url[:65]}")

        # Build one output row per CSV row in this family
        for pos, (row_index, sku, original_row) in enumerate(family_rows):
            mapped = build_row(original_row, family_data, sku, pos, base_url)
            async with lock:
                results[row_index] = mapped

        queue.task_done()

    await context.close()


# ── Output columns ────────────────────────────────────────────────────────────

NEW_COLS = [
    "name", "brand_name", "model", "sku", "manufacturer_url",
    "short_description",
    "st1_label", "st1_value", "st1_details",
    "st2_label", "st2_value", "st2_details",
    "st3_label", "st3_value", "st3_details",
    "c1_title", "c1_details",
    "c2_title", "c2_details",
    "c3_title", "c3_details",
    "app_01_title", "app_01_details",
    "app_02_title", "app_02_details",
    "app_03_title", "app_03_details",
    "gallery_url_1", "gallery_url_2", "gallery_url_3", "gallery_url_4",
]


# ── Main ──────────────────────────────────────────────────────────────────────

async def main_async() -> None:
    input_path  = Path(INPUT_CSV)
    output_path = Path(OUTPUT_CSV)

    if not input_path.exists():
        log.error(f"Input file not found: {input_path.resolve()}")
        return

    log.info(f"Reading {input_path}")
    with open(input_path, newline="", encoding="utf-8-sig") as f:
        reader     = csv.DictReader(f)
        orig_header: list[str] = list(reader.fieldnames or [])
        rows: list[dict]       = list(reader)

    if "ITEM_SUP_LINK" not in orig_header:
        log.error(f"ITEM_SUP_LINK column not found. Columns available: {orig_header}")
        return

    # Group rows by base URL — one queue item per product family
    families: dict[str, list[tuple[int, str, dict]]] = defaultdict(list)
    for i, row in enumerate(rows):
        url = row.get("ITEM_SUP_LINK", "").strip()
        if url:
            base = normalise_url(url)
            sku  = sku_from_url(url)
            families[base].append((i, sku, row))

    log.info(
        f"{len(rows)} rows → {len(families)} unique product pages → {WORKERS} workers\n"
        f"  (was 5542 fetches in v1, now {len(families)} — much faster)"
    )

    queue: asyncio.Queue = asyncio.Queue()
    for base_url, family_rows in families.items():
        queue.put_nowait((base_url, family_rows))

    results: dict[int, dict] = {}
    lock = asyncio.Lock()

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)

        tasks = [
            asyncio.create_task(
                worker(wid, browser, queue, results, lock)
            )
            for wid in range(WORKERS)
        ]

        total_pages = len(families)
        total_rows  = len(rows)
        while not queue.empty() or any(not t.done() for t in tasks):
            done_rows  = len(results)
            done_pages = total_pages - queue.qsize()
            named      = sum(1 for r in results.values() if r.get("name"))
            log.info(
                f"Progress: {done_pages}/{total_pages} pages | "
                f"{done_rows}/{total_rows} rows | {named} with names"
            )
            await asyncio.sleep(15)

        await asyncio.gather(*tasks)
        await browser.close()

    log.info("Writing output CSV…")
    all_cols = list(orig_header) + [c for c in NEW_COLS if c not in orig_header]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=all_cols, extrasaction="ignore")
        writer.writeheader()
        for i in range(len(rows)):
            row_data = results.get(i, rows[i])
            writer.writerow({col: row_data.get(col, "") for col in all_cols})

    named    = sum(1 for r in results.values() if r.get("name"))
    with_st  = sum(1 for r in results.values() if r.get("st1_value"))
    with_desc = sum(1 for r in results.values() if r.get("short_description"))
    log.info(
        f"Done!\n"
        f"  {named}/{len(rows)} rows with product name\n"
        f"  {with_st}/{len(rows)} rows with specs (Diameter etc.)\n"
        f"  {with_desc}/{len(rows)} rows with description\n"
        f"  Output: {output_path.resolve()}"
    )


def main() -> None:
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
