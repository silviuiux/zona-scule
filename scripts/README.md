# Scripts de îmbogățire produse

## Setup

```bash
# Adaugă în .env.local:
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_SERVICE_KEY=eyJ...   # service_role key din Supabase (Settings → API) — necesar pentru orice script care SCRIE în DB (products e select-only pentru anon/authenticated)

# Instalează dependențele script
npm install @anthropic-ai/sdk
npm install csv-parse ws
```

## sync-prices-from-og-pricelists.mjs

Sincronizează `products.price` cu prețurile din listele de preț ale furnizorilor
(`extras/OG PRICE LIST/*.csv`). Match strict pe SKU — NU pe brand, pentru că
fișierele sunt grupate pe distribuitor/export, nu pe brandul real al produsului.

Reguli:
1. Pentru fiecare SKU găsit într-un CSV, prețul e convertit în EUR (RON ÷ 5.2337,
   sau păstrat dacă deja e EUR) și **suprascrie** price-ul curent din DB.
2. Produsele cu preț deja "real" în DB (≠ 1.00, valoarea placeholder) care NU
   apar în niciun CSV sunt presupuse a fi în RON și convertite RON→EUR la fel
   (afectează în practică aproape exclusiv Milwaukee).
3. Conflicte (același SKU, prețuri diferite în fișiere diferite) nu sunt
   suprascrise silențios — prima valoare câștigă, restul e logat separat.

```bash
# Preview — arată exact ce s-ar schimba, nu scrie nimic
node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --dry-run

# Test pe un subset mic înainte de rularea completă
node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --dry-run --limit 50

# Rulare completă (live) — actualizează products.price + refresh product_listing_mv
node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs

# Sari peste conversia RON→EUR a prețurilor deja existente (regula #2)
node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --skip-legacy

# Alt curs valutar / alt folder sursă
node --env-file=.env.local scripts/sync-prices-from-og-pricelists.mjs --rate 5.24 --dir "extras/OG PRICE LIST"
```

Output (în `logs/`):
- `price-sync-report-<timestamp>.json` — raport complet: toate update-urile, conflictele, statisticile
- `price-sync-conflicts-<timestamp>.csv` — doar dacă există conflicte de preț între fișiere, pentru verificare manuală

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

---

## verify-products.mjs

Auditează și verifică corectitudinea datelor față de site-ul producătorului.
Detectează cross-contamination (specs de la alt produs), URL-uri de search eșuate,
specificații lipsă. Generează rapoarte detaliate și o listă de SKU-uri de re-îmbogățit.

### Clasificare automată (fără apeluri web)

| Categorie | Semnificație |
|---|---|
| `REAL_WITH_DATA` | URL real + specs → de verificat cu Claude |
| `REAL_NO_SPECS` | URL real dar fără specificații → extracție parțială |
| `SEARCH_URL` | URL de search (`cautare-rezultate`) → niciodată îmbogățit corect |
| `NO_DATA` | Fără URL și fără descriere → complet neîmbogățit |

### Comenzi

```bash
# Audit rapid Karcher (fără fetch pagini, doar clasificare)
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --audit-only

# Eșantion rapid de 50 produse (estimare rată erori)
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --sample 50

# Verificare completă primele 200 produse
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --limit 200

# Verificare completă toate produsele Karcher (~2h)
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher

# Un singur SKU
node --env-file=.env.local scripts/verify-products.mjs --sku "1.528-133.0"

# Verificare + reset automat pentru produsele greșite (le pregătește pt re-îmbogățire)
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --reset-wrong

# Toate brandurile
node --env-file=.env.local scripts/verify-products.mjs
```

### Output (în folderul `logs/`)

- `verify-report-<brand>-<timestamp>.json` — raport complet cu toate detaliile
- `to-fix-<brand>-<timestamp>.csv` — lista SKU-urilor de re-îmbogățit
- `verify-summary-<brand>-<timestamp>.txt` — sumar text cu comenzile de urmărit

### Flux recomandat

```bash
# 1. Audit rapid pentru a vedea câte produse sunt în fiecare categorie
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --audit-only

# 2. Eșantion de 100 produse pentru a estima rata de erori
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --sample 100

# 3. Dacă rata de erori e mare (>20%), run complet cu reset
node --env-file=.env.local scripts/verify-products.mjs --brand Karcher --reset-wrong

# 4. Re-îmbogățire pentru toate produsele resetate/fără date
node --env-file=.env.local scripts/enrich-karcher.mjs --resume
```

### Rate și timpi estimativi

- Audit-only: instant (fără fetch)
- Verificare completă: ~1.5s/produs
  - 100 produse ≈ 3 minute
  - 500 produse ≈ 13 minute
  - 3000 produse (tot Kärcher) ≈ 75 minute

### Model Claude folosit

Folosește `claude-haiku-4-5-20251001` (rapid și ieftin) pentru verificare.
Schimbă în `claude-sonnet-4-6` în cod dacă vrei mai multă precizie.
