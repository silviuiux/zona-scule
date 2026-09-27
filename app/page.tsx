import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { getCategoriesWithCount, getBrands, getFeaturedSubcategoriesWithImage, getRawProductCount } from '@/lib/supabase'
import AnimatedHero from '@/components/AnimatedHero'
import HeroSearch from '@/components/HeroSearch'
import CountUp from '@/components/CountUp'
import CategoryGrid from '@/components/CategoryGrid'
import SubcategoryCarousel from '@/components/SubcategoryCarousel'
import ServicesGrid from '@/components/ServicesGrid'

// Homepage data (categories, brands, featured subcategories, total count)
// changes rarely and never depends on the request — ISR instead of a fresh
// DB hit on every load (REBUILD.md §3.5/§6). Revalidates hourly; admin edits
// also call revalidatePath('/') for instant refresh.
export const revalidate = 3600

// Services section icons — replace the old photo tiles with a plain-color
// card + line icon, so the section reads "friendly/informational" instead
// of relying on stock photography. currentColor so each icon inherits its
// card's text color (dark on the white card, white on the red/black ones).
const IconChat = (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path pathLength={100} d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)
const IconWrench = (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path pathLength={100} d="M14.7 6.3a4 4 0 0 0-5.6 5.6L2 19l3 3 7.1-7.1a4 4 0 0 0 5.6-5.6l-2.8 2.8-2-2z" />
  </svg>
)
const IconShield = (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path pathLength={100} d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z" />
    <path pathLength={100} d="m9 12 2 2 4-4" />
  </svg>
)


export default async function HomePage() {
  const [categoriesRaw, brands, featuredSubs, totalCount] = await Promise.all([
    getCategoriesWithCount(),
    getBrands(),
    getFeaturedSubcategoriesWithImage(),
    getRawProductCount(),
  ])

  // Hide the catch-all "Necategorizat" bucket from the homepage categories grid
  const categories = categoriesRaw.filter(c => c.name.toLowerCase() !== 'necategorizat')

  // Enrich subcategories with their parent category name for correct deep-link URLs
  const enrichedSubs = featuredSubs.map(s => ({
    ...s,
    category_name: s.parent_category_id
      ? (categories.find(c => c.id === s.parent_category_id)?.name ?? null)
      : null,
  }))

  return (
    <>
      <Nav />
      <style>{`
        /* ─── HERO ─────────────────────────────── */
        .hero {
          /* Viewport-height responsive top padding. The non-padding hero
             content (chips + title + subtitle + search row) is
             ~410px tall, so pinning padding-top to (100vh - ~540px) keeps
             the hero bottom ~130px short of the fold — guaranteeing a peek
             of the first category row on short/laptop screens (fixes cards
             not showing at all). Capped at 280px so tall screens keep the
             roomy composition and simply reveal MORE of the cards below. */
          padding-top: clamp(88px, calc(100vh - 540px), 280px);
          padding-bottom: 24px;
          background: transparent;
          min-height: max(320px, calc(100vh - 395px));
          display: flex; align-items: center;
          overflow: hidden;
        }
        .hero-inner {
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px;
          width: 100%;
          display: flex; flex-direction: column;
          gap: 26px;
          transform: translate3d(0, var(--hero-y, 0px), 0);
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-inner { transform: none; }
        }

        /* ─── Hero entrance ── */
        @keyframes hero-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .hero-inner .brand-chips,
        .hero-inner .hero-title,
        .hero-inner .hero-sub,
        .hero-inner .hero-cta-row {
          opacity: 0;
          animation: hero-in 720ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .hero-inner .brand-chips  { animation-delay:  80ms; }
        .hero-inner .hero-title   { animation-delay: 220ms; }
        .hero-inner .hero-sub     { animation-delay: 360ms; }
        .hero-inner .hero-cta-row { animation-delay: 500ms; }
        @media (prefers-reduced-motion: reduce) {
          .hero-inner .brand-chips,
          .hero-inner .hero-title,
          .hero-inner .hero-sub,
          .hero-inner .hero-cta-row {
            animation: none; opacity: 1;
          }
        }

        /* ─── STATS — full-width instrument band after the category bento:
           three equal cells split by hairlines, a mono label on top and a
           huge mono readout at the bottom (ticks up via CountUp once in
           view). ── */
        .stats-section {
          display: grid; grid-template-columns: repeat(3, 1fr);
          min-height: 50vh;
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          margin: 56px 0 0;
        }
        .stat-cell {
          display: flex; flex-direction: column; justify-content: space-between;
          gap: 48px;
          padding: 40px clamp(20px, 3vw, 48px) 48px;
          border-right: 1px solid rgba(0,0,0,0.08);
        }
        .stat-cell:last-child { border-right: none; }
        .stat-n {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: clamp(56px, 7.5vw, 128px); font-weight: 500; line-height: 0.9;
          color: rgb(0,0,0); letter-spacing: -0.05em;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        /* Live-dot beside the product count — a quiet "this is real,
           current data" signal, pulsing slowly like a status LED. */
        .stat-live {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          background: var(--red); margin-left: 4px; vertical-align: middle;
          box-shadow: 0 0 0 0 rgba(217,44,43,0.5);
          animation: stat-live 2.4s ease-out infinite;
        }
        @keyframes stat-live {
          0%   { box-shadow: 0 0 0 0 rgba(217,44,43,0.45); }
          70%  { box-shadow: 0 0 0 8px rgba(217,44,43,0); }
          100% { box-shadow: 0 0 0 0 rgba(217,44,43,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .stat-live { animation: none; }
        }
        .hero-sub {
          font-family: 'Recursive', sans-serif;
          font-weight: 400;
          font-size: 18px; color: rgba(0,0,0,0.5);
          line-height: 1.4;
          max-width: 50%;
        }
        @media (max-width: 768px) {
          /* Full width instead of the desktop 50% cap — lets the subtitle
             wrap onto ~2 lines instead of 5 in the narrow mobile column. */
          .hero-sub { max-width: 100%; }
        }
        .hero-cta-row {
          display: flex; align-items: stretch; gap: 0;
          width: 50%;
          min-width: 320px;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 10px;
          overflow: hidden;
        }
        /* ── Hero search input ── */
        .hero-search-box {
          display: flex; align-items: center; gap: 14px;
          background: rgb(255,255,255);
          padding: 0 1px 0 32px;
          flex: 1;
          min-width: 0;
          height: 48px;
        }
        .hero-search-icon {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; padding: 0;
          color: rgba(0,0,0,0.3); flex-shrink: 0;
          transition: color 150ms;
        }
        .hero-search-icon:hover { color: rgb(217,44,43); }
        .hero-search-input-wrap {
          position: relative; flex: 1; min-width: 0;
          display: flex; align-items: center; height: 100%;
        }
        .hero-search-input-wrap input {
          position: relative; z-index: 1;
          width: 100%; border: none; outline: none;
          background: transparent;
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgb(0,0,0);
          text-align: left;
        }
        .hero-search-placeholder {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          pointer-events: none; white-space: nowrap;
          overflow: hidden; max-width: 100%;
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.35);
        }
        .hero-search-placeholder-count { color: rgb(0,0,0); }
        .hero-catalog-cta {
          display: flex; align-items: center;
          background: rgb(217, 44, 43); color: rgb(255,255,255);
          padding: 0 32px; height: 48px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500;
          text-transform: uppercase;
          border: none; white-space: nowrap;
          transition: background 150ms;
        }
        .hero-catalog-cta:hover { background: rgb(190, 35, 34); }

        /* ─── CATEGORIES ── */
        .cats-section {
          background: transparent;
          max-width: 1440px; margin: 0 auto;
          padding: 0 12px 64px;
        }
        .cats-masonry {
          position: relative;
          /* height set inline per-render (CategoryGrid.tsx) to match the
             packed masonry content, since every child below is absolutely
             positioned and would otherwise collapse this to 0.
             --destagger (0→1) is written here once per scroll tick and
             inherited by every card below — see CategoryGrid.tsx. */
          --destagger: 0;
        }
        .cat-card {
          position: absolute; overflow: hidden;
          border-radius: 8px; background: rgb(200,200,200);
          text-decoration: none; display: block;
          height: 400px;
          /* top/left/width come from the row grid builder (CategoryGrid.tsx)
             — a padded, staggered starting position, not the final resting
             grid row.
             Two independent motions layer on top of that static position:
             1. De-stagger (scroll-driven, instant) — shifts the card up by
                --col-stagger (a fixed px-as-a-number set per card — bundles
                both this card's own cosmetic stagger AND its row's share of
                the safety padding between rows) scaled by the section's
                shared --destagger progress. At --destagger:0 the card sits
                at its padded, staggered position (transform: 0); at :1 it's
                shifted up by that whole amount, landing on a genuinely
                tight grid row (no leftover padding) — same-row cards across
                every column arrive together since they all read the same
                --destagger.
             2. Entrance (in-view-triggered) — opacity/translate, 700ms eased
                transition, plays once when the card first appears. */
          transform: translate3d(0, calc(var(--col-stagger, 0) * var(--destagger, 0) * -1px), 0);
          opacity: 0;
          translate: 0 var(--cat-enter, 24px);
          transition: opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
                      translate  700ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, translate, opacity;
        }
        .cat-card.in-view { opacity: 1; translate: 0 0; }
        @media (prefers-reduced-motion: reduce) {
          .cat-card { opacity: 1; translate: 0 0; transition: none; transform: none; }
        }
        .cat-card-img-wrap {
          position: absolute; inset: 0; overflow: hidden;
          transform: scale(1.1);
          transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .cat-card-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center; display: block;
        }
        .cat-card:hover .cat-card-img-wrap { transform: scale(1.0); }
        @media (prefers-reduced-motion: reduce) {
          .cat-card-img-wrap { transition: none; }
        }
        /* Hover video — sits over the static image, only visible (and only
           playing, via CategoryGrid.tsx's mouseenter/leave handlers) once
           hovered. Categories without a hero_video_url yet just never
           render this element, so nothing changes for them. */
        .cat-card-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center; display: block;
          opacity: 0;
          transition: opacity 300ms ease;
          pointer-events: none;
        }
        .cat-card:hover .cat-card-video { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .cat-card-video { display: none; }
        }
        .cat-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 75%);
        }
        .cat-card-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 16px;
        }
        .cat-card-count {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.6);
          display: block; margin-bottom: 6px;
        }
        .cat-card-label {
          font-family: 'Neuton', serif;
          font-size: 26px; font-weight: 400;
          color: rgb(255,255,255); letter-spacing: -0.005em;
          line-height: 1.05; display: block;
        }
        .cat-card-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 12px; color: rgba(255,255,255,0.75); line-height: 1.5;
          display: block; max-height: 0; overflow: hidden;
          opacity: 0; margin-top: 0;
          transition: max-height 300ms ease-in-out, opacity 250ms ease-in-out, margin-top 300ms ease;
        }
        .cat-card:hover .cat-card-desc { max-height: 80px; opacity: 1; margin-top: 6px; }

        /* ─── SERVICES ── */
        .services-section {
          max-width: 1440px; margin: 0 auto;
          padding: 120px 12px 64px;
          display: flex; flex-direction: column; gap: 64px;
        }
        /* Section head: mono numbered eyebrow → Neuton title → muted sub.
           Shared .eyebrow-mono/.display-title live in globals.css. */
        .section-head { display: flex; flex-direction: column; gap: 14px; }
        .section-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 16px; color: rgba(0,0,0,0.5); line-height: 1.5;
          max-width: 52ch;
        }
        .services-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
          /* Clips any still-settling (offset) card to the grid's own box,
             so it crops to a peek instead of spilling into the carousel
             section below — see the long settle range in ServicesGrid.tsx.
             The padding+negative-margin pair below cancels itself out for
             layout purposes (siblings see the exact same effective box —
             margin fully offsets the padding, so nothing shifts) but gives
             the clip boundary enough room that the hover scale() AND its
             box-shadow (offset 20px + blur 48px ≈ 68px reach) don't get
             guillotined against it. 80px comfortably covers both. */
          overflow: hidden;
          padding: 80px;
          margin: -80px;
        }
        .service-card {
          border-radius: 4px; overflow: hidden;
          display: flex; flex-direction: column;
          aspect-ratio: 3 / 4;
          padding: 36px;
          position: relative; isolation: isolate;
          /* Scroll-stagger (continuous, no transition — would lag the scroll)
             lives on transform/--svc-offset. Hover lift lives on the separate
             scale property below, so the two never fight over transform. */
          transform: translate3d(0, var(--svc-offset, 0px), 0);
          will-change: transform;
        }
        .service-card > * { position: relative; z-index: 2; }
        .service-icon {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: auto;
          opacity: 0.92;
        }
        /* Icon "draw-in": paths use pathLength="100" so a flat 100/100
           dasharray works regardless of each icon's actual geometry.
           Undrawn by default; .revealed (added once the card has mostly
           settled into place, see ServicesGrid.tsx) flips all three at
           once, but each card's icon carries its own transition-delay so
           they draw in sequence left→right instead of simultaneously —
           first card earliest, third card latest. Multi-stroke icons (the
           shield's checkmark) draw their second stroke a beat after their
           own card's delay, once the outline is mostly done. */
        .service-icon svg path,
        .service-icon svg circle {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          transition: stroke-dashoffset 800ms cubic-bezier(0.22,1,0.36,1);
        }
        .services-grid > a:nth-child(1) .service-icon svg path { transition-delay: 0ms; }
        .services-grid > a:nth-child(2) .service-icon svg path { transition-delay: 350ms; }
        .services-grid > a:nth-child(3) .service-icon svg path { transition-delay: 700ms; }
        .services-grid > a:nth-child(3) .service-icon svg path:nth-of-type(2) { transition-delay: 1000ms; }
        .service-card.revealed .service-icon svg path,
        .service-card.revealed .service-icon svg circle {
          stroke-dashoffset: 0;
        }
        .service-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: 40px; letter-spacing: -0.01em;
          line-height: 1; margin-top: 28px; margin-bottom: 12px;
        }
        .service-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; line-height: 1.65; margin-bottom: 0;
          max-width: 34ch;
        }
        /* Service card hover — whole card grows a touch.
           Uses the standalone scale property (not transform) so it can
           have its own transition without animating the scroll-stagger. */
        .service-card {
          transition: scale 500ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 500ms cubic-bezier(0.22,1,0.36,1);
        }
        .services-grid a:hover .service-card {
          scale: 1.025;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
        }
        .services-grid a:hover .service-icon { transform: translateY(-3px) scale(1.06); }
        .service-icon { transition: transform 300ms cubic-bezier(0.22,1,0.36,1); }
        @media (prefers-reduced-motion: reduce) {
          .service-card { transform: none; }
          .service-icon svg path, .service-icon svg circle {
            transition: none; stroke-dashoffset: 0;
          }
        }

        .service-cta {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
          width: 100%;
          margin-top: 24px;
          padding-top: 20px;
        }
        .service-cta-arrow {
          transition: transform 250ms cubic-bezier(0.22,1,0.36,1);
        }
        .services-grid a:hover .service-cta-arrow { transform: translateX(5px); }

        /* ─── CAROUSEL ── */
        .carousel-section {
          background-color: rgb(18, 18, 18);
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          padding: 120px 0 120px;
        }
        .carousel-inner {
          max-width: 1440px; margin: 0 auto; padding: 0 12px;
        }
        .carousel-header { margin-bottom: 48px; }
        .carousel-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 16px; color: rgba(255,255,255,0.4); line-height: 1.5;
        }
        /* ─── CONTACT BANNER ── */
        .contact-banner-wrap {
          padding: 64px 12px 120px;
          max-width: 1440px; margin: 0 auto;
        }
        .contact-banner {
          background: rgb(18, 18, 18);
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
          border-radius: 10px;
          padding: 52px 64px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 40px;
        }
        .contact-banner .eyebrow-mono { margin-bottom: 18px; }
        .contact-banner-title {
          font-family: 'Neuton', serif; font-weight: 400;
          font-size: clamp(32px, 3.6vw, 52px); letter-spacing: -0.01em;
          color: rgb(255,255,255);
          line-height: 1.02; margin-bottom: 14px;
        }
        .contact-banner-title em { font-style: normal; color: rgb(237,90,89); }
        .contact-banner-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 15px; color: rgba(255,255,255,0.45);
        }
        .contact-banner-btn {
          display: inline-flex; align-items: center; gap: 12px;
          background: rgb(217, 44, 43); color: rgb(255,255,255);
          padding: 13px 32px; border-radius: 4px;
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500;
          text-transform: uppercase; text-decoration: none;
          white-space: nowrap; flex-shrink: 0;
          transition: background 150ms;
        }
        .contact-banner-btn:hover { background: rgb(190, 35, 34); }
        .contact-banner-btn-arrow { transition: transform 250ms cubic-bezier(0.22,1,0.36,1); }
        .contact-banner-btn:hover .contact-banner-btn-arrow { transform: translateX(4px); }

        /* footer styles live in components/Footer.tsx */

        /* ══ RESPONSIVE ══ */
        @media (max-width: 768px) {
          /* Nav is fixed at 52px tall — padding-top must clear it before
             adding the actual breathing room, or content sits flush/under
             the nav (was 48px total, less than the nav's own height). */
          .hero { min-height: 75vh; padding-top: 84px; padding-bottom: 48px; }
          .hero-inner { gap: 20px; padding: 0 12px; }
          .stats-section { grid-template-columns: 1fr; min-height: 0; margin-top: 32px; }
          .stat-cell { border-right: none; border-bottom: 1px solid rgba(0,0,0,0.08); gap: 28px; padding: 28px 12px 32px; }
          .stat-cell:last-child { border-bottom: none; }
          .hero-cta-row {
            flex-direction: column; width: 100%;
            border: none; border-radius: 0; box-shadow: none;
            gap: 12px;
          }
          .hero-search-box {
            min-width: 0; width: 100%;
            height: auto; padding: 9px 16px;
            border: 1px solid rgba(0,0,0,0.08);
            border-radius: 8px;
          }
          .hero-catalog-cta {
            justify-content: center;
            height: auto; padding: 9px 24px;
            border-radius: 8px;
          }

          .cats-section { padding: 0 12px 64px; }
          /* Desktop uses an absolutely-positioned masonry (see .cat-card's
             inline top/left/width, set in CategoryGrid.tsx). That doesn't
             suit mobile, so drop back to a plain 2-column grid: !important
             overrides the inline position/top/left/width per card. Featured
             categories still carry an inline gridColumn:'span 2' — ignored
             on desktop (position:absolute), but here it spans the full
             2-column width instead of forcing every card full-width. */
          .cats-masonry {
            position: static; height: auto !important;
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
          }
          .cat-card {
            position: static !important;
            top: auto !important; left: auto !important; width: auto !important;
            /* The desktop de-stagger transform still applies to static-
               positioned elements — kill it here so mobile cards don't get
               shifted by a leftover --col-stagger amount. */
            transform: none !important;
            height: 220px;
          }

          .services-section { padding: 64px 0 64px; gap: 40px; }
          .services-section .section-head { padding: 0 12px; }
          .services-grid {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            padding: 0 12px;
            margin: 0;
            scrollbar-width: none; -ms-overflow-style: none;
          }
          .services-grid::-webkit-scrollbar { display: none; }
          .services-grid > a { flex-shrink: 0; width: 75vw; align-self: stretch; }
          .service-card { aspect-ratio: 3 / 4; height: auto; width: 100%; padding: 28px; }
          .service-desc { margin-bottom: 16px; }

          .carousel-section { padding: 64px 0 64px; }
          .carousel-inner { padding: 0 12px; }

          .contact-banner-wrap { padding: 64px 12px; }
          .contact-banner { padding: 36px 24px; flex-direction: column; align-items: flex-start; gap: 28px; }
          .contact-banner-btn { width: 100%; justify-content: center; }

        }

      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <AnimatedHero brands={brands} />
          <p className="hero-sub">Lider in furnizarea de scule electrice<br />industriale si de constructii de peste 26 de ani</p>
          <div className="hero-cta-row">
            <HeroSearch totalCount={totalCount} />
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="cats-section">
        <CategoryGrid categories={categories} />
      </section>

      {/* ── STATS ── */}
      {totalCount > 0 && (
        <section className="stats-section" aria-label="Zona Scule în cifre">
          <div className="stat-cell">
            <span className="eyebrow-mono">Produse în catalog<span className="stat-live" aria-hidden="true" /></span>
            <span className="stat-n"><CountUp value={totalCount} onView delay={0} /></span>
          </div>
          <div className="stat-cell">
            <span className="eyebrow-mono">Branduri</span>
            <span className="stat-n"><CountUp value={brands.length} onView delay={150} /></span>
          </div>
          <div className="stat-cell">
            <span className="eyebrow-mono">Ani de experiență</span>
            <span className="stat-n"><CountUp value={26} suffix="+" onView delay={300} /></span>
          </div>
        </section>
      )}

      {/* ── CAROUSEL — Featured subcategories (before services) ── */}
      {enrichedSubs.length > 0 && (
        <section className="carousel-section noise-dark">
          <div className="carousel-inner">
            <div className="carousel-header section-head on-dark">
              <span className="eyebrow-mono">Din catalogul nostru</span>
              <h2 className="display-title">Explorează catalogul</h2>
              <p className="carousel-sub">Categorii de produse din catalogul nostru</p>
            </div>
          </div>
          <SubcategoryCarousel subs={enrichedSubs} />
        </section>
      )}

      {/* ── SERVICES ── */}
      <section className="services-section">
        <div className="section-head">
          <span className="eyebrow-mono">Dincolo de vânzare</span>
          <h2 className="display-title">Servicii complete</h2>
          <p className="section-sub">Scule profesionale, consultanta, achizitii, garantie si service</p>
        </div>
        <ServicesGrid
          items={[
            { bg: '#f4f4f4', color: 'rgb(30,30,30)', title: 'Consultanta', body: 'Expertiză tehnică pentru alegerea sculei potrivite proiectului tău. Intri cu întrebări, pleci cu soluții', cta: 'HAI IN SHOWROOM', ctaColor: 'rgb(30,30,30)', href: '/contact', icon: IconChat },
            { bg: 'rgb(217,44,43)', color: 'rgb(255,255,255)', title: 'Service', body: 'Echipa noastră de tehnicieni menține motoarele turate. Intervenții prompte pentru ca tu să nu te oprești din lucru.', cta: 'SOLICITA O REPARATIE', ctaColor: 'rgb(255,255,255)', href: '/contact', icon: IconWrench },
            { bg: 'rgb(30,30,30)', color: 'rgb(255,255,255)', title: 'Garantie', body: 'Acoperire extinsă și proceduri simplificate. Prioritatea noastră este funcționarea echipamentului tău.', cta: 'VEZI ACOPERIREA', ctaColor: 'rgb(255,255,255)', href: '/contact', icon: IconShield },
          ]}
        />
      </section>

      {/* ── CONTACT BANNER ── */}
      <div className="contact-banner-wrap">
        <div className="contact-banner noise-dark">
          <div className="on-dark">
            <span className="eyebrow-mono">Hai să vorbim</span>
            <h2 className="contact-banner-title">Răspundem rapid.<br /><em>Livrăm în toată țara.</em></h2>
            <p className="contact-banner-sub">Consultanța specializata</p>
          </div>
          <Link href="/contact" className="contact-banner-btn">
            Contact
            <svg className="contact-banner-btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
