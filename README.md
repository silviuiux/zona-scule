# Zona Scule — zonascule.online

Catalog de scule profesionale (31k+ produse). **Next.js 16 (App Router) + Supabase**, deploy pe Vercel. Supabase este singura baza de date (Airtable a fost retras).

## Quick start

```bash
npm install
npm run dev   # http://localhost:3000
```

## Env vars (`.env.local` local, Settings → Environment Variables pe Vercel)

| Var | Rol |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL proiect Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cheie publica (doar citire — vezi `supabase/setup.sql`) |
| `SUPABASE_SERVICE_KEY` | cheie service-role, doar server (admin + formular contact) |
| `ADMIN_USER` / `ADMIN_PASS` | Basic Auth pentru `/admin` si editorul de categorii din PDP |
| `ANTHROPIC_API_KEY` | doar pentru scripturile de enrichment din `scripts/` (nu e necesar la runtime) |

## Prima instalare: securizare Supabase

Ruleaza `supabase/setup.sql` in Supabase SQL Editor. Activeaza RLS (public = read-only) si creeaza tabela `contact_messages` pentru formularul de contact.

## Pagini

| Ruta | Descriere |
|---|---|
| `/` | Homepage (ISR 10 min) |
| `/produse` | Catalog + filtre (categorie, subcategorie, brand, cautare) |
| `/produse/[slug]` | Pagina produs (ISR 1h) |
| `/contact` | Formular oferta → `contact_messages` |
| `/admin` | Gestionare subcategorii (Basic Auth) |
| `/termeni`, `/retur` | Pagini legale (placeholder — de completat) |

## Structura

```
app/            pagini + API routes
components/     Nav, Footer, ProductCard, hero, carusele
lib/            clienti Supabase (anon + service), auth admin
scripts/        enrichment Kärcher, verificari, snapshot DB (offline)
supabase/       setup.sql — RLS + contact_messages
proxy.ts        Basic Auth /admin (Next 16 "proxy", fost middleware)
```
