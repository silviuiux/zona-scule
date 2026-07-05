# DECISIONS — /depozit warehouse experience (Phase 1 prototype)

Branch: `feature/warehouse-experience` · Route: `/depozit` (`app/(experience)/depozit/`) · Unlinked, `noindex`.

## Navigation model
Guided/snap navigation (the brief's recommended safer option): one aisle per real category, camera glides down the active aisle. Scroll wheel / W–S / vertical touch-drag move along the aisle; A–D / left-right arrows / horizontal swipe switch aisles; clicking an overhead category sign or the "Culoare" jump overlay teleports. Pointer position adds a subtle look-around offset. Free-roam was rejected: unpredictable perf, motion-sickness risk, and harder mobile input.

## Data-fetch strategy
Server-side in the route's server component (`page.tsx`, `revalidate = 3600`), passed to the client as one serialized `WarehouseData` payload. Rationale: consistent anon-key usage with the rest of the app, zero client round-trips, and the payload is small (≤6 aisles × ≤4 shelves × ≤10 slim product rows). New helpers: `getProductsForShelf()` in `lib/supabase.ts` (mirrors `getProducts()`'s `product_listing_mv` querying — image OR-filter, featured-first, hard cap 16) and `lib/warehouse-data.ts` (aisle/shelf assembly, best-effort: failures degrade to empty shelves, never a throw).

## Libraries
- `three` + `@react-three/fiber` ^9 (React-19-compatible). 
- `zustand` — tiny store shared between canvas, camera rig, and DOM HUD.
- `@react-three/drei` was planned but ended up **unused** and was dropped — signage is done with canvas textures, camera easing with plain lerp/damping in `useFrame`, so no gsap either. Dependency footprint: 3 packages.
- **Note:** npm's registry was unreachable from the build sandbox, so `npm install` and the final `tsc --noEmit` / `lint` / `build` verification must be run on a developer machine (see Verification below). Code was reviewed line-by-line against r3f v9 / TS-strict semantics in lieu of compilation.

## In-scene typography
Aisle/shelf signage uses `CanvasTexture`s drawn with **Bungee** (already loaded by the root layout), rather than drei/troika SDF text — keeps the Zona Scule identity in-scene with no extra font assets or CDN fetch at render time. DOM HUD (exit, jump overlay, tooltip, detail panel, loader) uses Bungee/Inter/Recursive directly.

## Performance techniques
- Products are flat photo cards (2 tris each), not 3D models.
- Texture budget: a card only fetches its image when its aisle is the active aisle ± 1; textures are pooled in a module-level cache (same URL never fetched/decoded twice); failures resolve to a deterministic tinted fallback card.
- Bounded scene: ≤6 aisles × ≤4 shelves × ≤10 products = ≤240 cards max; simple box/plane geometry; 2 point lights per aisle; fog culls distant detail; `dpr` capped at 1.75.
- Loader gates on the *first aisle's* texture batch only (real progress), with a 2.5 s grace path if no textures register.

## Fallback behavior
Capability check on mount: `prefers-reduced-motion`, WebGL context creation, and `navigator.deviceMemory ≤ 2` → DOM-only 2.5D fallback (`Fallback.tsx`): same art direction, same real data, shelf rows with product cards linking to real PDPs, plus a catalog link. Empty-data responses also route to the fallback (reason `no-data`) — never a blank canvas. Reduced-motion users who reach the 3D path get an instant cut instead of the dolly and no ambient drift.

## Entry sequence
6.5 s dolly from high over the dock (y≈10, z≈30) settling to eye height at aisle 0's entrance; skippable via Esc/Space/Enter/click/tap or the visible "Sari intro" button; skipped automatically under reduced motion.

## Known limitations (prototype)
- Ambient audio not implemented (brief marked it optional; would need a user-gesture-gated, off-by-default toggle).
- No in-experience product search (category jump only); search lives in the real site.
- Screen-reader parity for the 3D scene not attempted (per brief); exit + fallback paths are accessible.
- Hover tooltip is a fixed bottom HUD card, not a 3D-tracked label.
- `experimental-webgl` fallback covers very old browsers, but IE-era devices land in the DOM fallback anyway.
- Lenis is mounted globally by the root layout; the route is a fixed-viewport page with no document scroll, so they don't conflict, but Phase 2 should consider disabling Lenis on this route explicitly.

## Verification (run on a dev machine — sandbox had no npm registry access)
```
npm install
npx tsc --noEmit
npm run lint
npm run build
```

## Phase-2 promotion notes (NOT implemented)
- Wire into Nav/Footer + homepage teaser; remove `robots: noindex`; add OG image and metadata.
- Consider `sitemap.ts` inclusion only if the route gets server-rendered textual content for crawlers (the fallback DOM could double as that).
- Perf pass on real devices: instancing for shelf boards/uprights (currently plain meshes — fine at this scale), KTX2/compressed textures, image proxying through `/_next/image` for resized shelf textures.
- Analytics events (aisle visits, product clicks) via the existing Vercel Analytics.
- Product search inside the experience (reuse `/api/search`, teleport to the product's aisle).
- Session-cookie "skip intro on repeat visit".
