import Link from 'next/link'
import Image from 'next/image'
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
  subcategoryGroups: ApplicationGroup[]
  totalProductCount: number
}

export default function BrandLandingTemplate({
  config,
  subcategories,
  applicationGroups,
  subcategoryGroups,
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
        /* Taller than a typical section hero on purpose — this is a single
           flagship page per brand, not a dense listing, so it can afford to
           breathe before the eyebrow/logo/title stack even starts.
           position:relative + z-index:1 keeps this content stacked above
           the absolutely-positioned watermark logo below (positioned
           elements paint above static ones regardless of DOM order, so
           without this the watermark — despite coming first in markup —
           would sit on top of and obscure the actual copy). */
        .bp-hero-inner { position: relative; z-index: 1; padding: 136px 12px 100px; max-width: 1440px; margin: 0 auto; }
        .bp-hero-copy { max-width: 1120px; }
        /* Giant, near-invisible echo of the brand mark bleeding off the
           right edge — fills the empty white space in the hero without
           competing with the sharp, small logo above the headline or the
           copy itself (z-index below .bp-hero-inner, pointer-events off).
           Hidden below ~900px where there's no spare width for it anyway. */
        .bp-hero-watermark {
          position: absolute; top: 50%; right: -6%; transform: translateY(-50%);
          width: clamp(320px, 36vw, 620px); opacity: 0.05; pointer-events: none;
          user-select: none;
        }
        .bp-hero-watermark img { width: 100%; height: auto; display: block; }
        @media (max-width: 900px) { .bp-hero-watermark { display: none; } }
        /* Brand wordmark/icon sits above the eyebrow — deliberately sized to
           dominate the top of the hero (bigger than the eyebrow, bigger
           than a typical "as seen on" partner badge) so it reads as THE
           visual anchor of the page, not a small credential. Height-capped,
           width auto, so square icon marks (PFERD, OSBORN) and wide
           wordmarks (Milwaukee, RUKO, Kärcher) all land at the same visual
           weight regardless of native aspect ratio. */
        .bp-hero-logo { display: block; height: clamp(64px, 9vw, 140px); width: auto; margin-bottom: 32px; }
        /* Eyebrow + S.E.A.P. badge share one row — the badge is a
           credential ("this page is legit"), not a third call to action, so
           it sits quietly next to "Partener oficial X" instead of in the
           button row where it competed visually with the two real CTAs. */
        .bp-hero-eyebrow-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
        .bp-hero .bp-eyebrow { color: rgba(0,0,0,0.5); }
        .bp-hero-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(38px, 5.6vw, 74px);
          line-height: 1.02; text-transform: uppercase; color: rgb(20,20,20);
          margin-bottom: 20px;
        }
        .bp-hero-title em { color: var(--brand-accent); font-style: normal; }
        /* Darker + slightly heavier than a typical body paragraph — this is
           reading against a busy dot-grid hero background, not a plain
           white card, so it needs the extra contrast to stay legible. */
        .bp-hero-sub {
          font-family: 'Recursive', sans-serif; font-weight: 500;
          font-size: 16px; line-height: 1.6; color: rgba(0,0,0,0.72);
          max-width: 620px; margin-bottom: 32px;
        }
        /* Two primary actions only now (S.E.A.P. moved up to the eyebrow
           row) — tighter gap groups them as one clear "next step" cluster. */
        .bp-hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 40px; }
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

        /* Trust bar — plain number+label stats separated by a thin divider,
           matching the site's other hero stat rows (see .sv-stat on
           /produse/superview) rather than an icon-led card style. */
        .bp-trust { display: flex; gap: 24px; flex-wrap: wrap; align-items: center; }
        .bp-trust-stat { display: flex; align-items: baseline; gap: 8px; }
        .bp-trust-div { width: 1px; height: 20px; background: rgba(0,0,0,0.12); }
        .bp-trust-n { font-family: 'Bungee', sans-serif; font-size: 20px; line-height: 1.1; color: rgb(0,0,0); }
        .bp-trust-l { font-family: 'Inter', sans-serif; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(0,0,0,0.45); }

        /* Anchor targets sit just behind the main site nav (top: 52px). */
        #ghid-tehnic, #categorii, #descopera, #explorare, #specialist, #faq { scroll-margin-top: 68px; }

        /* Toggle "+" icon — shared by the glossary and FAQ <details> toggles
           (no brand currently uses hero-level intent chips, so only those
           two consumers remain). */
        .bp-intent-plus {
          width: 22px; height: 22px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; border: 1px solid rgba(0,0,0,0.2);
          color: rgba(0,0,0,0.6);
          transition: transform 220ms cubic-bezier(0.22,1,0.36,1), background 150ms;
        }

        @media (max-width: 768px) {
          .bp-hero-inner { padding: 88px 12px 64px; }
        }

        /* ══════════════════ CATEGORY RAIL ══════════════════ */
        /* Same horizontal-scroll pill carousel as the /produse catalog's
           SubcategoryBar (see app/produse/SubcategoryBar.tsx) — kept as a
           local copy rather than importing that (server) component here,
           since this template doesn't have an "active" subcategory to
           highlight the way a filtered listing page does. */
        /* border-top marks the handoff back to white after the gray
           glossary block — this and every other plain white section below
           get the same thin divider so a long page reads as a stack of
           distinct sections instead of one unbroken scroll. */
        .bp-rail-section { padding: 48px 12px 16px; border-top: 1px solid rgba(0,0,0,0.06); }
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
        .bp-usecase-section { padding: 72px 12px; border-top: 1px solid rgba(0,0,0,0.06); }
        .bp-usecase-group { margin-bottom: 64px; }
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
        .bp-pillars-section { padding: 72px 12px; border-top: 1px solid rgba(0,0,0,0.06); }
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
        /* No horizontal padding here deliberately — this section's gray
           background must run full-bleed edge to edge. Horizontal
           centering/gutter comes from the inner .bp-section wrapper divs
           instead (same 1440px/12px convention as every other section).
           Putting bp-section directly on THIS element (as every other
           section does) would cap the background itself at 1440px instead
           of the viewport — that was the full-bleed-background bug. */
        .bp-glossary-section { background: rgb(236,236,236); padding: 72px 0; }
        .bp-glossary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        /* Subtle counter-rotate + lift + border reveal on hover — makes the
           grid feel alive without disturbing the underlying layout (the
           card's own box model doesn't change, just its transform/shadow). */
        .bp-gloss-card {
          background: rgb(255,255,255); border-radius: 10px; overflow: hidden;
          border: 1px solid transparent;
          transition: transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms, border-color 220ms;
        }
        .bp-gloss-card:hover {
          transform: rotate(-1deg) translateY(-3px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.09);
          border-color: rgba(0,0,0,0.1);
        }
        .bp-gloss-summary {
          list-style: none; cursor: pointer; padding: 16px 18px;
          display: flex; flex-direction: column; justify-content: center; gap: 10px;
          min-height: 92px;
        }
        .bp-gloss-summary::-webkit-details-marker { display: none; }
        .bp-gloss-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        /* Softened from solid black — the code pill is a label, not the
           focal point, and pure black was pulling more visual weight than
           the title beneath it. */
        .bp-gloss-code { font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; color: rgb(255,255,255); background: rgb(42,42,42); padding: 4px 9px; border-radius: 4px; }
        .bp-gloss-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .bp-gloss-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .bp-gloss-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13.5px; color: rgb(0,0,0); }
        .bp-gloss-card[open] .bp-gloss-plus { transform: rotate(45deg); }
        .bp-gloss-desc { padding: 0 18px 16px; font-family: 'Recursive', sans-serif; font-size: 12.5px; line-height: 1.55; color: rgba(0,0,0,0.55); }
        @media (max-width: 1024px) { .bp-glossary-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .bp-glossary-grid { grid-template-columns: 1fr; } }

        /* ══════════════════ SPECIALIST ══════════════════ */
        .bp-specialist-wrap { padding: 72px 12px; max-width: 1440px; margin: 0 auto; border-top: 1px solid rgba(0,0,0,0.06); }
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
        .bp-faq-section { padding: 72px 12px 88px; border-top: 1px solid rgba(0,0,0,0.06); }
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
        .bp-faq-item[open] .bp-intent-plus { transform: rotate(45deg); }
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
        {config.logo && (
          <div className="bp-hero-watermark" aria-hidden="true">
            <Image src={config.logo.src} alt="" width={config.logo.width} height={config.logo.height} />
          </div>
        )}
        <div className="bp-hero-inner">
        <div className="bp-hero-copy">
          {config.logo && (
            <Image
              src={config.logo.src}
              alt={config.logo.alt}
              width={config.logo.width}
              height={config.logo.height}
              className="bp-hero-logo"
              priority
            />
          )}
          <div className="bp-hero-eyebrow-row">
            <span className="bp-eyebrow">{config.eyebrow}</span>
            {config.seapEligible && (
              <span className="badge badge-seap">Eligibil S.E.A.P.</span>
            )}
          </div>
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
              <span className="bp-trust-n">{totalProductCount.toLocaleString('ro-RO')}</span>
              <span className="bp-trust-l">Produse</span>
            </div>
            <div className="bp-trust-div" />
            <div className="bp-trust-stat">
              <span className="bp-trust-n">{subcategories.length}</span>
              <span className="bp-trust-l">Subcategorii</span>
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* ══════════════════ TECHNICAL GLOSSARY ══════════════════ */}
      {/* First section after the hero on every brand page — the technical
          cheat-sheet is what a professional buyer scans for before anything
          else (category browsing, curated pillars, use-case carousels). */}
      {config.glossary && (
        <section id="ghid-tehnic" className="bp-glossary-section">
          {/* Single bp-section wrapper around BOTH the head and the grid —
              not one bp-section per child. Stacking bp-section (which sets
              margin: 0 auto) with bp-section-head (which overrides
              max-width to 900px but doesn't touch margin) on the SAME
              element let bp-section-head's narrower max-width win while
              bp-section's auto margins still applied, centering the
              section head as a 900px island instead of left-aligning it
              like every other section's head. Applying bp-section exactly
              once, as a pure wrapper, avoids that clash — head/grid below
              are plain children with no competing margin rules. */}
          <div className="bp-section">
          <div className="bp-section-head">
            <span className="bp-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Ghid tehnic</span>
            <h2 className="bp-section-title">{config.glossaryTitle}</h2>
            <p className="bp-section-sub">{config.glossarySub}</p>
          </div>
          <div className="bp-glossary-grid">
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
          </div>
        </section>
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

      {/* ══════════════════ SUBCATEGORY CAROUSELS ══════════════════ */}
      {/* Same visual pattern as the use-case carousels above (reuses the
          .bp-usecase-* CSS as-is), but grouped by subcategory_text instead
          of app_01_title — see getSubcategoryGroupsByBrand in lib/supabase.ts.
          Every brand has subcategory_text populated, so this section is the
          universal "browse by catalog structure" counterpart to the
          job-based use-case carousels, which only a couple of enriched
          brands (Karcher, Milwaukee) have real data for. A brand can render
          both, either, or neither. */}
      {config.useSubcategoryCarousels && subcategoryGroups.length > 0 && (
        <section id="explorare" className="bp-usecase-section bp-section">
          <div className="bp-section-head">
            <span className="bp-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Explorează gama</span>
            <h2 className="bp-section-title">{config.subcategorySectionTitle ?? 'Descoperă pe subcategorii'}</h2>
            <p className="bp-section-sub">{config.subcategorySectionSub ?? 'Produsele grupate exact cum sunt organizate în catalog.'}</p>
          </div>
          {subcategoryGroups.map(group => (
            <div key={group.title} className="bp-usecase-group">
              <div className="bp-usecase-head">
                <span className="bp-usecase-title">{group.title}</span>
                <Link
                  href={`/produse?brand=${encodeURIComponent(config.brandName)}&subcategorie=${encodeURIComponent(group.title)}`}
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
