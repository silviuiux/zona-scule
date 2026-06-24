Paste everything below into a fresh Claude project (alongside uploading `REBUILD.md` from this same folder) to kick off an autonomous rebuild.

---

I'm rebuilding my company's e-commerce/catalog website, Zona Scule, from scratch in this new project. I've attached `REBUILD.md` — read it fully before doing anything. It documents the current live site's pages, filtering system, and full Supabase schema (tables, the `product_listing` view, RPC functions, env vars by name only). The new build must reconnect to the *same* Supabase project using those same env var names — I'll provide the real values separately/securely, never put real keys in chat or in files.

**Hard constraints (do not deviate):**
1. Overall color scheme stays white/light.
2. Brand red stays `#D92C2B` / `rgb(217, 44, 43)` — use it as the accent/CTA color.
3. No Airtable anywhere — it's fully retired, don't reference it, don't build integration for it.
4. Don't carry over the old scraping/enrichment scripts described in REBUILD.md §6 — they're dev tooling, not part of the app.
5. Preserve the underlying catalog *behavior* described in REBUILD.md §4–§5: brand/category/subcategory/search filtering, the family/variant rollup via `product_listing`, full-text search via `search_vector`, and RPC-based counts (don't replace these with naive client-side counting — that's what they were built to avoid).

**Everything else is open:** layout, typography, component design, motion, page structure, information architecture. I want a genuinely new visual direction, not a clone of the old layout repainted red-on-white. Use your own design judgment — pick a style direction and commit to it rather than asking me to choose from a menu up front.

**Fix, don't just preserve, these known issues from REBUILD.md §3.5–§3.7 and §6:**
- Wire the contact form to actually persist submissions (Supabase insert into a `contact_messages` table, create it if it doesn't exist) instead of being cosmetic-only.
- Put real authentication in front of `/admin` and the product-category-write API route before they're reachable.
- Use ISR (`revalidate`) instead of `force-dynamic` on pages that don't need a fresh DB hit on every request, and drop the `unoptimized` flag on images unless there's a specific reason to keep it — both are flagged as real, fixable performance issues, not stylistic choices.

**How I want you to work:**
- Work autonomously in long stretches. Don't stop to ask me approval-seeking questions about implementation details you can reasonably decide yourself (component structure, naming, exact spacing, animation choices, etc.). Use your judgment and keep moving.
- Only interrupt me for things you genuinely can't decide without me: which real env var values to use, whether to keep or drop a specific piece of legacy content, or a question where guessing wrong would mean significant rework.
- Work in checkpoints: scaffold the project and get a blank Next.js app talking to Supabase first (prove the connection works against real tables before building UI on top of it), then build pages roughly in this order: homepage → catalog listing → product detail → contact → zona-solutii → admin. Tell me briefly when each checkpoint is done rather than narrating every file you touch.
- After each checkpoint, do a quick self-check: does it build, does it match the white/light + red constraint, does it actually query Supabase (not mock data)?
- If you hit a genuine ambiguity in REBUILD.md (something underspecified or contradictory), make the most reasonable call yourself and note what you decided and why, rather than blocking on it.

Start by reading REBUILD.md in full, then propose a brief plan (stack confirmation, page order, and your chosen visual direction in a couple of sentences) before you start writing code. Once I confirm the plan, keep going autonomously through the checkpoints above.
