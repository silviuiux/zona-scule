import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// ─────────────────────────────────────────────────────────────────────────
// Brand Landing Page — PFERD
// First implementation of the reusable "brand landing" template. Deliberately
// left OUT of <Nav /> / sitemap for now — no entry point is wired up yet.
// Reachable only by direct URL (/brand/pferd) until we decide where it hooks
// into the main nav / brand index.
//
// Copy + nomenclature (Corinox, TOUGH/ALLROUND/STEEL, ZYA/KUD/TRE, HICOAT,
// STB, KES/UGT, J5V/O5V, PH/FH) sourced from the PFERD nomenclature blueprint.
// Every CTA links into the real /produse catalog filtered to brand=Pferd —
// there's no dedicated "aplicație" / "material" filter column yet, so those
// searches ride the existing free-text `q` param. Swap for a real
// categorie/subcategorie/attribute filter once PFERD's subcategory tree is
// mapped in the DB (placeholder comments mark each spot below).
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'PFERD — Scule Industriale de Precizie | Zona Scule',
  description: 'Descoperă gama completă PFERD: pile, freze rotative, carote și corpuri abrazive pentru profesioniști și amatori pasionați.',
}

type AppChip = { label: string; q: string }
const APP_CHIPS: AppChip[] = [
  { label: 'Ascuțire lanț drujbă', q: 'ascutire lant drujba' },
  { label: 'Debavurare', q: 'debavurare' },
  { label: 'Finisare', q: 'finisare' },
  { label: 'Găurire / Carote', q: 'carote' },
  { label: 'Șlefuire', q: 'slefuire' },
  { label: 'Perii industriale', q: 'perii industriale' },
]

type MatChip = { label: string; q: string; badge: string }
const MAT_CHIPS: MatChip[] = [
  { label: 'Inox', q: 'inox', badge: 'badge-inox' },
  { label: 'Oțel / Steel', q: 'otel', badge: 'badge-steel' },
  { label: 'Aluminiu', q: 'aluminiu', badge: 'badge-alu' },
  { label: 'Fontă / Cast', q: 'fonta', badge: 'badge-cast' },
  { label: 'Lemn', q: 'lemn', badge: '' },
]

type Pillar = {
  code: string
  title: string
  desc: string
  bullets: string[]
  q: string
}
const PILLARS: Pillar[] = [
  {
    code: '01',
    title: 'Pile, Răspe și Accesorii',
    desc: 'Ascuțire manuală de precizie — de la ateliere de lăcătușărie la sculărie fină.',
    bullets: [
      'Ascuțire lanțuri Classic & Premium',
      'Pile de precizie CORINOX',
      'Mânere ergonomice FH / PH',
    ],
    q: 'pile',
  },
  {
    code: '02',
    title: 'Freze Rotative (Carbură & HSS)',
    desc: 'Debavurare și prelucrare de detaliu, pe orice material — de la oțel la plastic.',
    bullets: [
      'Geometrii ZYA, KUD, TRE',
      'Linii TOUGH, ALLROUND, STEEL',
      'Carbură metalică & HSS',
    ],
    q: 'freze rotative',
  },
  {
    code: '03',
    title: 'Găurire, Carote și Adâncitoare',
    desc: 'De la prima gaură pilot la teșirea finală — un sistem complet, nu scule izolate.',
    bullets: [
      'Pânze bi-metal LS',
      'Burghie în trepte STB',
      'Adâncitoare KES / UGT cu HICOAT',
    ],
    q: 'carote adancitoare',
  },
  {
    code: '04',
    title: 'Corpuri Abrazive (Pietre polizoare)',
    desc: 'Șlefuire și degroșare controlată, cu liant potrivit pentru fiecare suprafață.',
    bullets: [
      'Forme ZY, WR, KU',
      'Liant J5V / O5V',
      'Dornuri suport compatibile',
    ],
    q: 'pietre polizoare',
  },
]

type GlossaryItem = {
  code: string
  title: string
  desc: string
  badges?: { label: string; cls: string }[]
}
const GLOSSARY: GlossaryItem[] = [
  {
    code: 'C3 / C5',
    title: 'Dantură',
    desc: 'Dantură încrucișată pentru îndepărtare optimă de material și finisare controlată a suprafeței.',
  },
  {
    code: 'TOUGH / STEEL',
    title: 'Linie constructivă',
    desc: 'TOUGH — construcție ultra-robustă pentru aplicații grele. STEEL — geometrie optimizată special pentru oțel.',
  },
  {
    code: 'INOX / CAST / ALU',
    title: 'Optimizare pe material',
    desc: 'Geometrie specială care previne încărcarea frezei și supraîncălzirea materialului respectiv.',
    badges: [
      { label: 'INOX', cls: 'badge-inox' },
      { label: 'CAST', cls: 'badge-cast' },
      { label: 'ALU', cls: 'badge-alu' },
    ],
  },
  {
    code: 'J5V / O5V',
    title: 'Liant piatră polizoare',
    desc: 'Tipul de liant al pietrei — moale sau dur — optimizat pentru suprafețe plane sau pentru muchii.',
  },
  {
    code: 'HICOAT / DLC',
    title: 'Acoperire premium',
    desc: 'Acoperiri speciale pentru durată de viață dublă a sculei și frecare redusă în timpul lucrului.',
  },
]

export default function PferdBrandPage() {
  return (
    <>
      <Nav />
      <style>{`
        /* ══════════════════ SHARED ══════════════════ */
        .pf-section { max-width: 1440px; margin: 0 auto; padding: 0 12px; }
        .pf-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .pf-eyebrow::before {
          content: ''; width: 6px; height: 6px; border-radius: 1px;
          background: rgb(217,44,43); flex-shrink: 0;
        }

        /* Material badge system — color-coded so users match tool ↔ material at a glance */
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
        .badge-steel { background: rgba(217,44,43,0.1);    color: rgb(190,35,34);   border-color: rgba(217,44,43,0.28); }

        /* ══════════════════ HERO ══════════════════ */
        .pf-hero {
          position: relative;
          background-color: rgb(17,17,17);
          background-image:
            radial-gradient(circle at 92% -10%, rgba(217,44,43,0.22), transparent 42%),
            radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: auto, 27px 27px;
          padding-top: 52px; /* clears fixed nav */
          overflow: hidden;
        }
        .pf-hero-inner {
          padding: 96px 12px 72px;
          max-width: 1120px;
        }
        .pf-hero .pf-eyebrow { color: rgba(255,255,255,0.55); margin-bottom: 22px; }
        .pf-hero-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(38px, 5.6vw, 74px);
          line-height: 1.02;
          text-transform: uppercase;
          color: rgb(255,255,255);
          margin-bottom: 20px;
        }
        .pf-hero-title em { color: rgb(217,44,43); font-style: normal; }
        .pf-hero-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 16px; line-height: 1.6;
          color: rgba(255,255,255,0.55);
          max-width: 620px;
          margin-bottom: 44px;
        }

        /* Intent toggles — two large <details> "cards" side by side */
        .pf-intent-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pf-intent {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .pf-intent-summary {
          list-style: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.05em; text-transform: uppercase;
          color: rgb(255,255,255);
          transition: background 150ms;
        }
        .pf-intent-summary::-webkit-details-marker { display: none; }
        .pf-intent-summary:hover { background: rgba(255,255,255,0.03); }
        .pf-intent-plus {
          width: 22px; height: 22px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
          transition: transform 220ms cubic-bezier(0.22,1,0.36,1), background 150ms;
        }
        .pf-intent[open] .pf-intent-plus {
          transform: rotate(45deg);
          background: rgb(217,44,43); border-color: rgb(217,44,43); color: rgb(255,255,255);
        }
        .pf-intent-body {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 0 22px 20px;
        }
        .pf-chip {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; font-weight: 500;
          color: rgb(255,255,255);
          text-decoration: none;
          padding: 8px 14px;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 100px;
          display: inline-flex; align-items: center; gap: 7px;
          transition: border-color 150ms, background-color 150ms;
        }
        .pf-chip:hover { border-color: rgb(217,44,43); background: rgba(217,44,43,0.12); }
        .pf-chip .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.5; }

        @media (max-width: 768px) {
          .pf-hero-inner { padding: 64px 12px 48px; }
          .pf-intent-row { grid-template-columns: 1fr; }
        }

        /* ══════════════════ PILLARS ══════════════════ */
        .pf-pillars-section { padding: 72px 12px; }
        .pf-section-head { margin-bottom: 36px; max-width: 640px; }
        .pf-section-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(28px, 3.6vw, 44px);
          text-transform: uppercase; line-height: 1.05;
          color: rgb(0,0,0); margin: 10px 0 10px;
        }
        .pf-section-sub {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; color: rgba(0,0,0,0.5);
        }
        .pf-pillars-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .pf-pillar-card {
          background: rgb(255,255,255);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
          transition: box-shadow 220ms, transform 220ms, border-color 220ms;
        }
        .pf-pillar-card:hover {
          box-shadow: 0 20px 48px rgba(0,0,0,0.1);
          transform: translateY(-3px);
          border-color: rgba(217,44,43,0.25);
        }
        .pf-pillar-code {
          font-family: 'Bungee', sans-serif;
          font-size: 13px; color: rgba(0,0,0,0.18);
          letter-spacing: 0.05em;
        }
        .pf-pillar-title {
          font-family: 'Bungee', sans-serif;
          font-size: 18px; line-height: 1.2;
          text-transform: uppercase;
          color: rgb(0,0,0);
        }
        .pf-pillar-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 13px; line-height: 1.55;
          color: rgba(0,0,0,0.5);
        }
        .pf-pillar-bullets {
          list-style: none; display: flex; flex-direction: column; gap: 8px;
          margin-top: 2px;
        }
        .pf-pillar-bullets li {
          font-family: 'Recursive', sans-serif;
          font-size: 12.5px; color: rgba(0,0,0,0.7);
          display: flex; align-items: flex-start; gap: 8px; line-height: 1.4;
        }
        .pf-pillar-bullets li::before {
          content: ''; width: 5px; height: 5px; margin-top: 6px; flex-shrink: 0;
          background: rgb(217,44,43); border-radius: 1px;
        }
        .pf-pillar-cta {
          margin-top: auto; padding-top: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: rgb(217,44,43);
          text-decoration: none;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pf-pillar-cta svg { transition: transform 220ms cubic-bezier(0.22,1,0.36,1); }
        .pf-pillar-card:hover .pf-pillar-cta svg { transform: translateX(4px); }

        @media (max-width: 1024px) {
          .pf-pillars-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .pf-pillars-grid { grid-template-columns: 1fr; }
        }

        /* ══════════════════ GLOSSARY ══════════════════ */
        .pf-glossary-section {
          background: rgb(236,236,236);
          padding: 72px 12px;
        }
        .pf-glossary-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;
        }
        .pf-gloss-card {
          background: rgb(255,255,255);
          border-radius: 10px;
          padding: 20px 22px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .pf-gloss-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .pf-gloss-code {
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
          color: rgb(255,255,255); background: rgb(0,0,0);
          padding: 4px 10px; border-radius: 4px;
        }
        .pf-gloss-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .pf-gloss-title {
          font-family: 'Recursive', sans-serif;
          font-weight: 600; font-size: 14px; color: rgb(0,0,0);
        }
        .pf-gloss-desc {
          font-family: 'Recursive', sans-serif;
          font-size: 12.5px; line-height: 1.55; color: rgba(0,0,0,0.55);
        }
        @media (max-width: 768px) {
          .pf-glossary-grid { grid-template-columns: 1fr; }
        }

        /* ══════════════════ CROSS-SELL BANNER ══════════════════ */
        .pf-crosssell-wrap { padding: 72px 12px; max-width: 1440px; margin: 0 auto; }
        .pf-crosssell {
          position: relative;
          background-color: rgb(17,17,17);
          background-image:
            radial-gradient(circle at 6% 110%, rgba(217,44,43,0.2), transparent 45%),
            radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: auto, 27px 27px;
          border-radius: 12px;
          padding: 48px 52px;
          display: flex; align-items: center; gap: 40px; justify-content: space-between;
        }
        .pf-crosssell-icon {
          flex-shrink: 0;
          width: 76px; height: 76px; border-radius: 50%;
          background: rgba(217,44,43,0.12);
          border: 1px solid rgba(217,44,43,0.3);
          display: flex; align-items: center; justify-content: center;
          color: rgb(217,44,43);
        }
        .pf-crosssell-title {
          font-family: 'Bungee', sans-serif;
          font-size: clamp(20px, 2.4vw, 30px);
          text-transform: uppercase; line-height: 1.15;
          color: rgb(255,255,255); margin-bottom: 10px;
        }
        .pf-crosssell-body {
          font-family: 'Recursive', sans-serif;
          font-size: 14px; line-height: 1.6;
          color: rgba(255,255,255,0.55);
          max-width: 640px;
        }
        .pf-crosssell-body strong { color: rgb(255,255,255); font-weight: 600; }
        .pf-crosssell-btn {
          flex-shrink: 0;
          display: inline-flex; align-items: center; gap: 8px;
          background: rgb(217,44,43); color: rgb(255,255,255);
          padding: 15px 32px; border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: background 150ms;
        }
        .pf-crosssell-btn:hover { background: rgb(190,35,34); }

        @media (max-width: 900px) {
          .pf-crosssell { flex-direction: column; align-items: flex-start; padding: 36px 24px; gap: 24px; }
          .pf-crosssell-btn { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="pf-hero noise-dark">
        <div className="pf-hero-inner">
          <span className="pf-eyebrow">Partener oficial PFERD</span>
          <h1 className="pf-hero-title">
            Rezistență care <em>nu cedează.</em><br />
            Precizie care <em>nu iartă.</em>
          </h1>
          <p className="pf-hero-sub">
            Peste 150 de ani de inginerie germană în pile, freze, carote și corpuri abrazive.
            Fie că ești meseriaș la primul șantier sau atelier industrial cu flux continuu,
            gama PFERD are scula potrivită — găsește-o în câteva secunde.
          </p>

          {/* Intent toggles — zero-JS accordion via <details>, styled as cards */}
          <div className="pf-intent-row">
            <details className="pf-intent">
              <summary className="pf-intent-summary">
                Caută după Aplicație
                <span className="pf-intent-plus">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
              </summary>
              <div className="pf-intent-body">
                {/* Real app filter param TBD — currently rides the free-text `q` search scoped to brand=Pferd */}
                {APP_CHIPS.map(c => (
                  <Link key={c.q} href={`/produse?brand=Pferd&q=${encodeURIComponent(c.q)}`} className="pf-chip">
                    <span className="dot" />{c.label}
                  </Link>
                ))}
              </div>
            </details>

            <details className="pf-intent">
              <summary className="pf-intent-summary">
                Caută după Material
                <span className="pf-intent-plus">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                </span>
              </summary>
              <div className="pf-intent-body">
                {MAT_CHIPS.map(c => (
                  <Link key={c.q} href={`/produse?brand=Pferd&q=${encodeURIComponent(c.q)}`} className="pf-chip">
                    <span className="dot" />{c.label}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ══════════════════ PRODUCT PILLARS ══════════════════ */}
      <section className="pf-pillars-section pf-section">
        <div className="pf-section-head">
          <span className="pf-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Pilonii de gamă</span>
          <h2 className="pf-section-title">Patru familii. O singură logică.</h2>
          <p className="pf-section-sub">Toată nomenclatura PFERD organizată pe uz, nu pe cod de catalog.</p>
        </div>

        <div className="pf-pillars-grid">
          {/* PRODUCT LOOP — replace with real PFERD subcategory query once mapped in DB */}
          {PILLARS.map(p => (
            <div key={p.code} className="pf-pillar-card">
              <span className="pf-pillar-code">{p.code}</span>
              <div>
                <h3 className="pf-pillar-title">{p.title}</h3>
                <p className="pf-pillar-desc" style={{ marginTop: 6 }}>{p.desc}</p>
              </div>
              <ul className="pf-pillar-bullets">
                {p.bullets.map(b => <li key={b}>{b}</li>)}
              </ul>
              <Link href={`/produse?brand=Pferd&q=${encodeURIComponent(p.q)}`} className="pf-pillar-cta">
                Vezi Produsele
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ TECHNICAL GLOSSARY ══════════════════ */}
      <section className="pf-glossary-section">
        <div className="pf-section pf-section-head">
          <span className="pf-eyebrow" style={{ color: 'rgba(0,0,0,0.4)' }}>Ghid tehnic</span>
          <h2 className="pf-section-title">Descifrează codul PFERD</h2>
          <p className="pf-section-sub">Cheat-sheet rapid pentru codurile de pe etichetă — fără să deschizi catalogul.</p>
        </div>
        <div className="pf-section pf-glossary-grid">
          {GLOSSARY.map(g => (
            <div key={g.code} className="pf-gloss-card">
              <div className="pf-gloss-top">
                <span className="pf-gloss-code">{g.code}</span>
                {g.badges && (
                  <div className="pf-gloss-badges">
                    {g.badges.map(b => <span key={b.label} className={`badge ${b.cls}`}>{b.label}</span>)}
                  </div>
                )}
              </div>
              <span className="pf-gloss-title">{g.title}</span>
              <p className="pf-gloss-desc">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ CROSS-SELL BANNER ══════════════════ */}
      <div className="pf-crosssell-wrap">
        <div className="pf-crosssell noise-dark">
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div className="pf-crosssell-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/>
              </svg>
            </div>
            <div>
              <h2 className="pf-crosssell-title">Potrivire inteligentă de accesorii</h2>
              <p className="pf-crosssell-body">
                Ai ales o freză sau o piatră polizoare? Nu uita să verifici <strong>diametrul tijei
                (3mm, 6mm, 8mm)</strong> pentru a alege dornul suport potrivit (<strong>BO</strong>) sau
                mânerul ergonomic (<strong>PH / FH</strong>) pentru pile.
              </p>
            </div>
          </div>
          <Link href="/produse?brand=Pferd&q=dorn+suport" className="pf-crosssell-btn">
            Vezi Accesorii Compatibile
          </Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
