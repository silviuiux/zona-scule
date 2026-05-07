# Scripts de îmbogățire produse

## Setup

```bash
# Adaugă în .env.local:
ANTHROPIC_API_KEY=sk-ant-...

# Instalează dependențele script
npm install @anthropic-ai/sdk
```

## enrich-karcher.mjs

Citește produse Kärcher din Supabase, găsește pagina pe kaercher.com/ro, 
extrage cu Claude descrierea + specs, updatează DB.

```bash
# Test pe un singur produs
node --env-file=.env.local scripts/enrich-karcher.mjs --sku "1.004-062.0" --dry-run

# Rulează pe un singur produs (live)
node --env-file=.env.local scripts/enrich-karcher.mjs --sku "1.004-062.0"

# Primele 20 produse (test batch)
node --env-file=.env.local scripts/enrich-karcher.mjs --limit 20

# Toate produsele, skip cele deja procesate
node --env-file=.env.local scripts/enrich-karcher.mjs --resume

# Toate produsele (2639, durează ~2h la 2s/produs)
node --env-file=.env.local scripts/enrich-karcher.mjs
```

## Ce face scriptul

1. Caută produsul pe kaercher.com/ro după SKU
2. Dacă nu găsește via API, caută via search page
3. Trimite HTML-ul (curat, fără JS/CSS) la Claude
4. Claude extrage:
   - `short_description` — descriere reală a produsului
   - `st1/2/3_label + value + details` — specificații tehnice
   - `c1/2/3_title + details` — caracteristici cheie
   - `app_01/02/03_title + details` — aplicații recomandate
5. Updatează Supabase

## Rata de procesare

~2 secunde/produs (delay anti-rate-limit)
- 50 produse ≈ 2 minute
- 500 produse ≈ 17 minute  
- 2639 produse (tot Kärcher) ≈ 90 minute

## Alte branduri

Scriptul poate fi adaptat pentru Milwaukee, PFERD, Krause:
- Milwaukee: https://www.milwaukeetool.eu/products/{sku}
- PFERD: https://www.pferd.com/ro/products/search?q={sku}
- Krause: https://www.krause-systems.ro/produse/{sku}
