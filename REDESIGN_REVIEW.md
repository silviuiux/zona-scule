# Branch `redesign/test` — ce s-a schimbat si de ce
*2026-06-10 · 6 commits peste baseline · build + lint + typecheck: verde*

## Cum testezi (5 minute)

```bash
# pe Mac, in folderul zona-scule:
git fetch "redesign-test.bundle" redesign/test:redesign/test
git checkout redesign/test
git push -u origin redesign/test     # → Vercel creeaza automat un Preview URL
```
Apoi, **inainte de merge in main**:
1. Adauga in Vercel (si .env.local): `ADMIN_USER`, `ADMIN_PASS` (alegi tu valorile).
2. Ruleaza `supabase/setup.sql` in Supabase SQL Editor (RLS + tabela contact_messages).

> Nota: primul commit din branch ("baseline") contine modificarile tale locale ne-commit-ate (search API, ScrollAnimations, VariationPills etc.) — erau doar pe disc, acum sunt in git.

---

## 1. Securitate (cel mai important)

| Problema (era live) | Fix |
|---|---|
| **/api/update-product-category era public**, folosea cheia service — oricine de pe internet putea re-categoriza tot catalogul cu un simplu POST | Ruta cere acum cookie de admin; fara el → 401 |
| **Editorul de categorii era vizibil oricarui vizitator** pe pagina de produs (EditableBreadcrumb) | Vizitatorii vad breadcrumb normal; editorul apare doar dupa login admin |
| **/admin era complet public** — redenumire/mutare subcategorii fara nicio autentificare | Basic Auth (proxy.ts) + verificare in fiecare server action |
| **Scrierile mergeau cu cheia anon** → inseamna ca RLS permite scrieri publice direct in DB | Scrierile folosesc cheia service pe server; `supabase/setup.sql` face tabelele read-only pentru public — **de rulat manual** |
| `images.remotePatterns: '**'` — optimizatorul de imagini Vercel era proxy gratuit pentru orice URL (cost + abuz) | Lista explicita de hosturi |
| Lipsa headere de securitate | nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy pe toate rutele |

## 2. Formularul de contact TRIMITEA IN NEANT
Butonul "Trimite mesajul" doar afisa "MESAJ TRIMIS!" — **niciun lead nu era salvat nicaieri**. Acum: validare + honeypot anti-bot + salvare in `contact_messages` (Supabase) + mesaj de eroare cu telefonul daca DB pica.

## 3. Curatenie
Sterse din repo: `sync.py` (sync Airtable — retras), `logs/` (7 fisiere), `KARCHER-Grid_view.csv` (1.9MB), `scrape_ruko_full.py`, `/api/brand-categories` (zero consumatori), 5 SVG-uri default Next/Vercel. `_snap.mjs` → `scripts/db-snapshot.mjs`. README rescris (era complet depasit). `.gitignore` acopera acum logs/ si CSV-uri.

## 4. Accesibilitate
Cautarea din nav e acum combobox real (sageti/Enter/Escape + screen-reader); sugestiile sunt linkuri adevarate. Lightbox-urile (imagine produs + galerie) sunt dialoguri cu Escape, sageti si focus gestionat. Elementele clickabile false (div-uri) au devenit butoane: copiere SKU, galerie, imagine hero. Skip-link "Sari la continut", focus vizibil pe toate elementele, `aria-current` pe filtrele active, landmark-uri (`main`, `nav`) si un singur `h1` real pe fiecare pagina. Contrastul textelor gri a fost ridicat la nivel AA pastrand estetica. `prefers-reduced-motion` opreste acum TOATE animatiile (cuvantul rotativ din hero, caruselul auto, reveal-urile din PDP — inainte continutul ramanea invizibil fara JS; acum exista si fallback noscript). Linkurile moarte din footer (`#`) au destinatii reale: pagini /termeni si /retur (schelet, de completat) + linkuri oficiale ANPC SAL si SEAP.

## 5. Viteza
- **Homepage: ISR 10 min** in loc de render dinamic la fiecare vizita (4 query-uri DB/vizitator → o data la 10 min).
- **Listare: ~60% mai putin JSON** — cardurile cereau toate ~50 de coloane; acum doar cele 20 afisate. Acelasi lucru in sessionStorage (restaurarea "incarca mai multe").
- **Stilurile cardului de produs erau duplicate de 100× pe pagina** (un `<style>` in fiecare card) — mutate o singura data in globals.css.
- Shuffle-ul listei e acum **stabil pe zi** (seed determinist): nu se mai amesteca produsele la fiecare refresh/back, crawlerele vad o ordine coerenta, si cache-ul devine posibil.
- API-urile publice au cache CDN (s-maxage) si limite de paginare.
- Imaginile din PDP (hero + galerie) trec prin optimizatorul Next cand vin din Supabase storage (AVIF/WebP redimensionat); cardurile raman neoptimizate intentionat (31k imagini unice ar exploda quota Vercel).
- Caruselul auto se opreste cand nu e vizibil / tab inactiv (mai putin CPU, baterie).
- Sageata produs anterior/urmator navigheaza acum **in aceeasi subcategorie** (inainte: tot catalogul alfabetic).
- Fix: cuvantul animat "ACCESORIILE" din hero ducea la o categorie inexistenta ("Accesorii & Abrazive") → ducea la 0 produse; acum duce la "Accesorii".
- SEO: metadata per produs (titlu/descriere/OpenGraph), sitemap.xml (categorii + 10k produse), robots.txt (blocheaza /admin), pagina 404 brandata.

## 6. Ce NU s-a schimbat
Identitatea vizuala (Bungee/Recursive, rosu/negru, noise, parallax, view-transitions la navigare intre produse) — totul pastrat, doar reglat fin. Fonturile raman pe Google Fonts (sandbox-ul de build nu a putut descarca fisierele pentru self-hosting; trecerea la next/font e pregatita — variabilele CSS sunt deja peste tot).

## Limitari / de verificat la review
- Nu am putut testa runtime cu DB-ul real din sandbox (doar build/lint/typecheck + revizie manuala). Preview-ul Vercel e testul real.
- `supabase/setup.sql` netestat pe baza ta — ruleaza-l si verifica ca admin-ul functioneaza dupa (foloseste service key, deci da).
- Paginile /termeni si /retur au text generic marcat TODO — au nevoie de textul juridic real.
- Optional dupa merge: self-hosting fonturi (next/font), CSP, rate-limiting pe /api.
