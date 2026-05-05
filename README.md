# Zona Scule — Next.js + Supabase

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy to Vercel

```bash
npx vercel
```

Set these env vars in Vercel dashboard (or they're already in .env.local):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with categories + sample products |
| `/produse` | Catalog with sidebar filters (brand, categorie) |
| `/produse?categorie=Perii` | Filtered by category |
| `/produse?brand=Milwaukee` | Filtered by brand |
| `/produse?p=2` | Pagination |
| `/produse/[slug]` | Product detail page |

## Structure

```
app/
  page.tsx              ← Homepage
  produse/
    page.tsx            ← Catalog listing
    [slug]/page.tsx     ← Product detail
components/
  Nav.tsx               ← Sticky navbar
  ProductCard.tsx       ← Product card
lib/
  supabase.ts           ← Client + types + query helpers
```

## Data

- 31,167 products in Supabase
- 28 brands, 38 categories, 80 subcategories
- Images mostly in Supabase Storage (main_image_storage_url)
- RLS: public anon SELECT enabled on all tables
