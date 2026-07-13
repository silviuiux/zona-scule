import Link from 'next/link'
import type { Brand, ApplicationGroup } from '@/lib/supabase'
import type { SubcategoryWithCount } from '@/lib/supabase'
import type { BrandPageConfig } from '@/lib/brand-content'
import ProductCard from './ProductCard'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — shared template
//
// Generalized from the original app/brand/pferd/page.tsx (the first
// flagship brand page, built before this template existed). Every visual
// pattern below (hero, intent chips, pillars, glossary, cross-sell) is
// unchanged from that original — this file just parameterizes it via
// `config` (lib/brand-content.ts) and real Supabase data instead of
// hardcoding one brand's copy inline.
//
// Theming: brand.brand_color drives every accent color via the
// --brand-accent CSS variable + color-mix() for tints, so a new brand needs
// a hex code in the `brands` table, not a CSS rewrite.
//
// Sections are conditional on what each brand actually has:
//   - intentGroups / pillars / glossary → hand-curated brands (PFERD-style
//     nomenclature that has no structured DB field to query)
//   - useUseCaseCarousels + applicationGroups → data-driven brands (Karcher-
//     style, real app_01_title values from the enrichment pipeline)
// A brand can use both, either, or neither — see lib/brand-content.ts.
// ─────────────────────────────────────────────────────────────────────────

type Props = {
  brand: Brand
  config: BrandPageConfig
  subcategories: SubcategoryWithCount[]
  applicationGroups: ApplicationGroup[]
  totalProductCount: number
}

export default function BrandLandingTemplate({
  config,
  subcategories,
  applicationGroups,
  totalProductCount,
}: Props) {
  // Accent is the site's own red, not brand.brand_color — brand pages stay
  // on the same white/black/red look as the rest of zonascule.online rather
  // than reskinning per brand.
  const accent = 'rgb(217,44,43)'
  const contactHref = `/contact?brand=${encodeURIComponent(config.brandName)}`
  const catalogHref = `/produse?brand=${encodeURIComponent(config.brandName)}`

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: config.faq.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  // In-page quick nav — lets someone landing on a long, section-heavy page
  // jump straight to the part they need instead of scrolling past
  // everything else. Built conditionally so it never links to a section a
  // given brand doesn't render (see file header: sections are optional).
  const quickNav: { label: string; href: string }[] = []
  if (subcategories.length > 0) quickNav.push({ label: 'Categorii', href: '#categorii' })
  if (config.useUseCaseCarousels && applicationGroups.length > 0) quickNav.push({ label: 'Recomandări', href: '#descopera' })
  if (config.pillars) quickNav.push({ label: 'Gama de produse', href: '#descopera' })
  if (config.glossary) quickNav.push({ label: 'Ghid tehnic', href: '#ghid-tehnic' })
  quickNav.push({ label: 'Specialist', href: '#specialist' })
  if (config.faq.length > 0) quickNav.push({ label: 'Întrebări', href: '#faq' })

  return (
    <div style={{ ['--brand-accent' as string]: accent }}>
      <style>{`
        /* ══════════════════ SHARED ══════════════════ */
        .bp-section { max-width: 1440px; margin: 0 auto; padding: 0 12px; }
        .bp-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .bp-eyebrow::before {
          content: ''; width: 6px; height: 6px; border-radius: 1px;
          background: var(--brand-accent); flex-shrink: 0;
        }
        .badge {
          display: inline-flex; align-items: center;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 100px;
          border: 1px solid transparent;
        }
        .badge-inox  { background: rgba(59,130,246,0.12);  color: rgb(37,99,235);   border-color: rgba(59,130,246,0.25); }
        .badge-alu   { background: rgba(148,163,184,0.16); color: rgb(71,85,105);   border-color: rgba(148,163,184,0.35); }
        .badge-cast  { background: rgba(120,79,42,0.14);   color: rgb(120,63,24);   border-color: rgba(120,79,42,0.3); }
        .badge-steel { background: color-mix(in srgb, var(--brand-accent) 10%, transparent); color: var(--brand-accent); border-color: color-mix(in srgb, var(--brand-accent) 28%, transparent); }
        .badge-seap  { background: rgba(21,128,61,0.08); color: rgb(21,128,61); border-color: rgba(21,128,61,0.22); }

        /* ══════════════════ HERO ══════════════════ */
        .bp-hero {
          position: relative;
          background-color: rgb(255,255,255);
          background-image:
            radial-gradient(circle at 92% -10%, color-mix(in srgb, var(--brand-accent) 8%, transparent), transparent 42%),
            radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px);
          background-size: auto, 27px 27px;
          padding-top: 52px;
          overflow: hidden;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .bp-hero-inner { padding: 96px 12px 72px; max-width: 1440px; margin: 0 auto; }
        .bp-hero-copy { max-width: 1120px; }
        .bp-hero .bp-eyebrow { color: rgba(0,0,0,0.5); margin-bottom: 22px; }
        .bp-hero-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(38px, 5.6vw, 74px);
          line-height: 1.02; text-transform: uppercase; color: rgb(0,0,0);
          margin-bottom: 20px;
        }
        .bp-hero-title em { color: var(--brand-accent); font-style: normal; }
        .bp-hero-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 16px; line-height: 1.6; color: rgba(0,0,0,0.6);
          max-width: 620px; margin-bottom: 32px;
        }
        .bp-hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
        .bp-btn-primary, .bp-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 13px 24px; border-radius: 4px; text-decoration: none;
          transition: background 150ms, border-color 150ms;
        }
        .bp-btn-primary { background: var(--brand-accent); color: rgb(255,255,255); }
        .bp-btn-primary:hover { filter: brightness(0.9); }
        .bp-btn-secondary { color: rgb(0,0,0); border: 1px solid rgba(0,0,0,0.18); }
        .bp-btn-secondary:hover { border-color: var(--brand-accent); background: color-mix(in srgb, var(--brand-accent) 8%, transparent); }

        /* Trust bar — icon + number pairs read as a glance-able strip rather
           than a sentence; the icon gives each stat a distinct silhouette
           so the row scans instantly instead of needing to be read word by
           word. */
        .bp-trust { display: flex; gap: 28px; flex-wrap: wrap; align-items: center; }
        .bp-trust-stat { display: flex; align-items: center; gap: 10px; }
        .bp-trust-icon {
          width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: color-mix(in srgb, var(--brand-accent) 8%, transparent);
          color: var(--brand-accent);
        }
        .bp-trust-text { display: flex; flex-direction: column; gap: 0; }
        .bp-trust-n { font-family: 'Bungee', sans-serif; font-size: 20px; line-height: 1.1; color: rgb(0,0,0); }
        .bp-trust-l { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(0,0,0,0.45); }

        /* ══════════════════ QUICK NAV ══════════════════ */
        /* Sticky in-page contents strip — sits right under the main site
           nav (top: 52px, same offset SubcategoryBar.tsx uses) so a visitor
           can jump straight to the section they need on a long page instead
           of scrolling past everything else. */
        .bp-quicknav-wrap {
          position: sticky; top: 52px; z-index: 40;
          background: rgba(255,255,255,0.92); backdrop-filter: blur(6px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .bp-quicknav {
          display: flex; gap: 8px; overflow-x: auto; padding: 12px 12px;
          max-width: 1440px; margin: 0 auto;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .bp-quicknav::-webkit-scrollbar { display: none; }
        .bp-quicknav-link {
          font-family: 'Inter', sans-serif; font-size: 12.5px; font-weight: 600;
          color: rgba(0,0,0,0.65); text-decoration: none; flex-shrink: 0; white-space: nowrap;
          padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.1);
          transition: border-color 150ms, background-color 150ms, color 150ms;
        }
        .bp-quicknav-link:hover { border-color: var(--brand-accent); color: rgb(0,0,0); background: color-mix(in srgb, var(--brand-accent) 6%, transparent); }

        /* Anchor targets sit behind the main nav + quick-nav strip unless
           offset — clears both (52px + ~58px). */
        #categorii, #descopera, #ghid-tehnic, #specialist, #faq { scroll-margin-top: 112px; }

        /* Intent toggles */
        .bp-intent-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
        .bp-intent { background: rgb(250,250,249); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden; }
        .bp-intent-summary {
          list-style: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase; color: rgb(0,0,0);
          transition: background 150ms;
        }
        .bp-intent-summary::-webkit-details-marker { display: none; }
        .bp-intent-summary:hover { background: rgba(0,0,0,0.02); }
        .bp-intent-plus {
          width: 22px; height: 22px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; border: 1px solid rgba(0,0,0,0.2);
          color: rgba(0,0,0,0.6);
          transition: transform 220ms cubic-bezier(0.22,1,0.36,1), background 150ms;
        }
        .bp-intent[open] .bp-intent-plus { transform: rotate(45deg); background: var(--brand-accent); border-color: var(--brand-accent); color: rgb(255,255,255); }
        .bp-intent-body { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 22px 20px; }
        .bp-chip {
          font-family: 'Recursive', sans-serif; font-size: 13px; font-weight: 500;
          color: rgb(0,0,0); text-decoration: none; padding: 8px 14px;
          border: 1px solid rgba(0,0,0,0.14); border-radius: 100px;
          display: inline-flex; align-items: center; gap: 7px;
          transition: border-color 150ms, background-color 150ms;
        }
        .bp-chip:hover { border-color: var(--brand-accent); background: color-mix(in srgb, var(--brand-accent) 8%, transparent); }
        .bp-chip .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.4; }

        @media (max-width: 768px) {
          .bp-hero-inner { padding: 64px 12px 48px; }
          .bp-intent-row { grid-template-columns: 1fr; }
        }

        /* ══════════════════ CATEGORY RAIL ══════════════════ */
        /* Same horizontal-scroll pill carousel as the /produse catalog's
           SubcategoryBar (see app/produse/SubcategoryBar.tsx) — kept as a
           local copy rather than importing that (server) component here,
           since this template doesn't have an "active" subcategory to
           highlight the way a filtered listing page does. */
        .bp-rail-section { padding: 40px 12px 8px; }
        .bp-rail {
          display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .bp-rail::-webkit-scrollbar { display: none; }
        .bp-rail-chip {
          font-family: 'Recursive', sans-serif; font-size: 13px; font-weight: 400;
          color: rgba(0,0,0,0.7); text-decoration: none; flex-shrink: 0;
          padding: 9px 16px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.08);
          display: inline-flex; align-items: center; gap: 8px;
          background: rgb(255,255,255); white-space: nowrap;
          transition: border-color 150ms, background-color 150ms, color 150ms;
        }
        .bp-rail-chip:hover { border-color: rgba(0,0,0,0.25); color: rgb(0,0,0); }
        .bp-rail-chip .cnt { color: rgba(0,0,0,0.4); font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.02em; }

        /* ══════════════════ SECTION HEADS ══════════════════ */
        .bp-section-head { margin-bottom: 28px; max-width: 900px; text-align: left; }
        .bp-section-title {
          font-family: 'Bungee', sans-serif; font-size: clamp(22px, 2.6vw, 34px);
          text-transform: uppercase; line-height: 1.1; color: rgb(0,0,0); margin: 10px 0 10px;
          white-space: nowrap; text-align: left;
        }
        .bp-section-sub { font-family: 'Recursive', sans-serif; font-size: 14px; color: rgba(0,0,0,0.5); text-align: left; }
        @media (max-width: 640px) {
          .bp-section-title { white-space: normal; }
        }

        /* ══════════════════ USE-CASE CAROUSELS ══════════════════ */
        .bp-usecase-section { padding: 56px 12px; }
        .bp-usecase-group { margin-bottom: 56px; }
        .bp-usecase-group:last-child { margin-bottom: 0; }
        .bp-usecase-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; padding: 0 2px; }
        .bp-usecase-title { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; color: rgb(0,0,0); }
        .bp-usecase-count { font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(0,0,0,0.4); }
        .bp-usecase-scroll {
          display: flex; gap: 14px; overflow-x: auto; padding-bottom: 6px;
          scroll-snap-type: x mandatory; scrollbar-width: thin;
        }
        .bp-usecase-scroll > * { flex: 0 0 240px; scroll-snap-align: start; }

        /* ══════════════════ PILLARS ══════════════════ */
        .bp-pillars-section { padding: 56px 12px; }
        .bp-pillars-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .bp-pillar-card {
          background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px;
          padding: 24px; display: flex; flex-direction: column; gap: 16px;
          transition: box-shadow 220ms, transform 220ms, border-color 220ms;
        }
        .bp-pillar-card:hover { box-shadow: 0 20px 48px rgba(0,0,0,0.1); transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand-accent) 25%, transparent); }
        .bp-pillar-code { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 12px; color: rgba(0,0,0,0.22); letter-spacing: 0.08em; }
        .bp-pillar-title { font-family: 'Inter', sans-serif; font-weight: 800; font-size: 16px; line-height: 1.3; text-transform: uppercase; letter-spacing: 0.01em; color: rgb(0,0,0); }
        .bp-pillar-desc { font-family: 'Recursive', sans-serif; font-size: 13px; line-height: 1.5; color: rgba(0,0,0,0.5); }
        /* Compact tags instead of a bulleted sentence list — same
           information, scannable in one sweep instead of read line by
           line. */
        .bp-pillar-tags { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
        .bp-pillar-tags li {
          font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600;
          color: rgba(0,0,0,0.6); background: rgba(0,0,0,0.045);
          padding: 5px 10px; border-radius: 6px; line-height: 1.3;
        }
        .bp-pillar-cta {
          margin-top: auto; padding-top: 14px; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase; color: var(--brand-accent); text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
        }
        .bp-pillar-cta svg { transition: transform 220ms cubic-bezier(0.22,1,0.36,1); }
        .bp-pillar-card:hover .bp-pillar-cta svg { transform: translateX(4px); }
        @media (max-width: 1024px) { .bp-pillars-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 640px) { .bp-pillars-grid { grid-template-columns: 1fr; } }

        /* ══════════════════ GLOSSARY ══════════════════ */
        /* Glance-then-dive pattern: code + term + material badges are
           visible closed (that's the "cheat sheet" — often enough on its
           own), the full explanation is one click away via <details> rather
           than a permanent paragraph on every card. */
        .bp-glossary-section { background: rgb(236,236,236); padding: 56px 12px; }
        .bp-glossary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .bp-gloss-card { background: rgb(255,255,255); border-radius: 10px; overflow: hidden; }
        .bp-gloss-summary {
          list-style: none; cursor: pointer; padding: 16px 18px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .bp-gloss-summary::-webkit-details-marker { display: none; }
        .bp-gloss-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .bp-gloss-code { font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; color: rgb(255,255,255); background: rgb(0,0,0); padding: 4px 9px; border-radius: 4px; }
        .bp-gloss-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .bp-gloss-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .bp-gloss-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13.5px; color: rgb(0,0,0); }
        .bp-gloss-card[open] .bp-gloss-plus { transform: rotate(45deg); }
        .bp-gloss-desc { padding: 0 18px 16px; font-family: 'Recursive', sans-serif; font-size: 12.5px; line-height: 1.55; color: rgba(0,0,0,0.55); }
        @media (max-width: 1024px) { .bp-glossary-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .bp-glossary-grid { grid-template-columns: 1fr; } }

        /* ══════════════════ SPECIALIST ══════════════════ */
        .bp-specialist-wrap { padding: 56px 12px; max-width: 1440px; margin: 0 auto; }
        .bp-specialist {
          background: rgb(250,250,249); border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
          padding: 40px 44px; display: flex; align-items: center; gap: 32px; justify-content: space-between; flex-wrap: wrap;
        }
        .bp-specialist-photo {
          width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
          background: color-mix(in srgb, var(--brand-accent) 14%, transparent);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-accent); font-family: 'Bungee', sans-serif; font-size: 20px;
        }
        .bp-specialist-name { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: rgb(0,0,0); }
        .bp-specialist-role { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--brand-accent); margin: 2px 0 8px; }
        .bp-specialist-note { font-family: 'Recursive', sans-serif; font-size: 13.5px; line-height: 1.55; color: rgba(0,0,0,0.6); max-width: 560px; }
        @media (max-width: 900px) { .bp-specialist { flex-direction: column; align-items: flex-start; } }

        /* ══════════════════ FAQ ══════════════════ */
        .bp-faq-section { padding: 56px 12px 72px; }
        /* Two columns on desktop — uses the full container width the way a
           single centered text column can't, without stretching each Q&A
           row to an unreadable ~1400px line length. */
        .bp-faq-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; align-items: start; }
        @media (max-width: 800px) { .bp-faq-list { grid-template-columns: 1fr; } }
        .bp-faq-item { background: rgb(255,255,255); border: 1px solid rgba(0,0,0,0.08); border-radius: 10px; overflow: hidden; }
        .bp-faq-q {
          list-style: none; cursor: pointer; padding: 18px 20px;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: rgb(0,0,0);
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .bp-faq-q::-webkit-details-marker { display: none; }
        .bp-faq-a { padding: 0 20px 18px; font-family: 'Recursive', sans-serif; font-size: 13.5px; line-height: 1.6; color: rgba(0,0,0,0.6); }

        /* ══════════════════ CROSS-SELL ══════════════════ */
        .bp-crosssell-wrap { padding: 56px 12px; max-width: 1440px; margin: 0 auto; }
        .bp-crosssell {
          position: relative; background-color: rgb(17,17,17);
          background-image: radial-gradient(circle at 6% 110%, color-mix(in srgb, var(--brand-accent) 20%, transparent), transparent 45%), radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: auto, 27px 27px; border-radius: 12px; padding: 48px 52px;
          display: flex; align-items: center; gap: 40px; justify-content: space-between; flex-wrap: wrap;
        }
        .bp-crosssell-title { font-family: 'Bungee', sans-serif; font-size: clamp(20px, 2.4vw, 30px); text-transform: uppercase; line-height: 1.15; color: rgb(255,255,255); margin-bottom: 10px; }
        .bp-crosssell-body { font-family: 'Recursive', sans-serif; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.55); max-width: 640px; }
        .bp-crosssell-btn {
          flex-shrink: 0; display: inline-flex; align-items: center; gap: 8px;
          background: var(--brand-accent); color: rgb(255,255,255); padding: 15px 32px; border-radius: 4px;
          font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none; white-space: nowrap; transition: filter 150ms;
        }
        .bp-crosssell-btn:hover { filter: brightness(0.9); }
        @media (max-width: 900px) { .bp-crosssell { flex-direction: column; align-items: flex-start; padding: 36px 24px; } .bp-crosssell-btn { width: 100%; justify-content: center; } }
      `}</style>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="bp-hero">
        <div className="bp-hero-inner">
        <div className="bp-hero-copy">
          <span className="bp-eyebrow">{config.eyebrow}</span>
          <h1 className="bp-hero-title">
            {config.heroTitle.map((line, i) => (
              <span key={i}>
                {line.map((tok, j) =>
                  tok.em ? <em key={j}>{tok.text}</em> : <span key={j}>{tok.text}</span>
                )}
                {i < config.heroTitle.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="bp-hero-sub">{config.heroSub}</p>

          <div className="bp-hero-ctas">
            <Link href={catalogHref} className="bp-btn-primary">Vezi Catalogul</Link>
            <Link href={contactHref} className="bp-btn-secondary">Vorbește cu un Specialist</Link>
          </div>

          <div className="bp-trust">
            <div className="bp-trust-stat">
              <span className="bp-trust-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </span>
              <span className="bp-trust-text">
                <span className="bp-trust-n">{totalProductCount.toLocaleString('ro-RO')}</span>
                <span className="bp-trust-l">Produse</span>
              </span>
            </div>
            <div className="bp-trust-stat">
              <span className="bp-trust-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </span>
              <span className="bp-trust-text">
                <span className="bp-trust-n">{subcategories.length}</span>
                <span className="bp-trust-l">Subcategorii</span>
              </span>
            </div>
            {config.seapEligible && (
              <span className="badge badge-seap">Eligibil S.E.A.P.</span>
            )}
          </div>

          {config.intentGroups && (
            <div className="bp-intent-row">
              {config.intentGroups.map(group => (
                <details key={group.label} className="bp-intent">
                  <summary className="bp-intent-summary">
                    {group.label}
                    <span className="bp-intent-plus">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </span>
                  </summary>
                  <div className="bp-intent-body">
                    {group.chips.map(c => (
                      <Link key={c.q} href={`${catalogHref}&q=${encodeURIComponent(c.q)}`} className="bp-chip">
                        <span className="dot" />{c.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
        </div>
      </section>

      {/* ══════════════════ QUICK NAV ══════════════════ */}
      {quickNav.length > 0 && (
        <div className="bp-quicknav-wrap">
          <nav className="bp-quicknav" aria-label="Navigare rapidă în pagină">
            {quickNav.map(item => (
              <a key={item.label + item.href} href={item.href} className="bp-quicknav-link">{item.label}</a>
            ))}
          </nav>
        </div>
      )}

      {/* ══════════════════ CATEGORY / SUBCATEGORY RAIL ══════════════════ */}
      {subcategories.length > 0 && (
        <section id="categorii" className="bp-rail-section bp-section">
          <div className="bp-rail">
            <Link href={catalogHref} className="bp-rail-chip">
              Toate <span className="cnt">{totalProductCount.toLocaleString('ro-RO')}</span>
            </Link>
            {subcategories.map(s => (
              <Link
                key={s.id}
                href={`/produse?brand=${encodeURIComponent(config.brandName)}&subcategorie=${encodeURIComponent(s.name)}`}
                className="bp-rail-chip"
              >
                {s.name} <span className="cnt">{s.product_count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════ USE-CASE CAROUSELS ══════════════════ */}
      {config.useUseCaseCarousels && applicationGroups.length > 0 && (
        <section id="descopera" className="bp-usecase-section bp-section">
          <div className="bp-section-head">
            <span className="bp-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Recomandare pe context</span>
            <h2 className="bp-section-title">{config.useCaseSectionTitle}</h2>
            <p className="bp-section-sub">{config.useCaseSectionSub}</p>
          </div>
          {applicationGroups.map(group => (
            <div key={group.title} className="bp-usecase-group">
              <div className="bp-usecase-head">
                <span className="bp-usecase-title">{group.title}</span>
                <Link
                  href={`${catalogHref}&q=${encodeURIComponent(group.title)}`}
                  className="bp-usecase-count"
                >
                  {group.count} produse →
                </Link>
              </div>
              <div className="bp-usecase-scroll">
                {group.products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ══════════════════ PRODUCT PILLARS ══════════════════ */}
      {config.pillars && (
        <section id="descopera" className="bp-pillars-section bp-section">
          <div className="bp-section-head">
            <span className="bp-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Pilonii de gamă</span>
            <h2 className="bp-section-title">Toată gama, organizată pe uz.</h2>
          </div>
          <div className="bp-pillars-grid">
            {config.pillars.map(p => (
              <div key={p.code} className="bp-pillar-card">
                <span className="bp-pillar-code">{p.code}</span>
                <div>
                  <h3 className="bp-pillar-title">{p.title}</h3>
                  <p className="bp-pillar-desc" style={{ marginTop: 6 }}>{p.desc}</p>
                </div>
                <ul className="bp-pillar-tags">
                  {p.bullets.map(b => <li key={b}>{b}</li>)}
                </ul>
                <Link href={`${catalogHref}&q=${encodeURIComponent(p.q)}`} className="bp-pillar-cta">
                  Vezi Produsele
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════ TECHNICAL GLOSSARY ══════════════════ */}
      {config.glossary && (
        <section id="ghid-tehnic" className="bp-glossary-section">
          <div className="bp-section bp-section-head">
            <span className="bp-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Ghid tehnic</span>
            <h2 className="bp-section-title">{config.glossaryTitle}</h2>
            <p className="bp-section-sub">{config.glossarySub}</p>
          </div>
          <div className="bp-section bp-glossary-grid">
            {config.glossary.map(g => (
              <details key={g.code} className="bp-gloss-card">
                <summary className="bp-gloss-summary">
                  <div className="bp-gloss-top">
                    <span className="bp-gloss-code">{g.code}</span>
                    {g.badges && (
                      <div className="bp-gloss-badges">
                        {g.badges.map(b => <span key={b.label} className={`badge ${b.cls}`}>{b.label}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="bp-gloss-bottom">
                    <span className="bp-gloss-title">{g.title}</span>
                    <span className="bp-intent-plus bp-gloss-plus" style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.5)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </span>
                  </div>
                </summary>
                <p className="bp-gloss-desc">{g.desc}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════ ASK A SPECIALIST ══════════════════ */}
      <div id="specialist" className="bp-specialist-wrap">
        <div className="bp-specialist">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="bp-specialist-photo">
              {(config.specialist?.name ?? 'Echipa tehnică Zona Scule').split(' ').map(w => w[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="bp-specialist-name">{config.specialist?.name ?? 'Echipa tehnică Zona Scule'}</div>
              <div className="bp-specialist-role">{config.specialist?.role ?? `Consultanță produse ${config.brandName}`}</div>
              <p className="bp-specialist-note">
                {config.specialist?.note ??
                  `Nu ești sigur ce variantă ${config.brandName} se potrivește proiectului tău? Scrie-ne — răspundem cu recomandarea tehnică, nu doar cu un link către catalog.`}
              </p>
            </div>
          </div>
          <Link href={contactHref} className="bp-btn-primary" style={{ flexShrink: 0 }}>
            Vorbește cu un Specialist
          </Link>
        </div>
      </div>

      {/* ══════════════════ FAQ (with FAQPage JSON-LD) ══════════════════ */}
      {config.faq.length > 0 && (
        <section id="faq" className="bp-faq-section bp-section">
          <div className="bp-section-head">
            <span className="bp-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Întrebări frecvente</span>
            <h2 className="bp-section-title">Ce întreabă alți profesioniști</h2>
          </div>
          <div className="bp-faq-list">
            {config.faq.map(item => (
              <details key={item.q} className="bp-faq-item">
                <summary className="bp-faq-q">
                  {item.q}
                  <span className="bp-intent-plus" style={{ borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.5)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </summary>
                <p className="bp-faq-a">{item.a}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        </section>
      )}

      {/* ══════════════════ CROSS-SELL BANNER ══════════════════ */}
      {config.crossSell && (
        <div className="bp-crosssell-wrap">
          <div className="bp-crosssell noise-dark">
            <div>
              <h2 className="bp-crosssell-title">{config.crossSell.title}</h2>
              <p className="bp-crosssell-body">{config.crossSell.body}</p>
            </div>
            <Link href={`${catalogHref}&q=${encodeURIComponent(config.crossSell.q)}`} className="bp-crosssell-btn">
              {config.crossSell.ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
