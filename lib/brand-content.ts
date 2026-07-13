// ─────────────────────────────────────────────────────────────────────────
// Brand landing page content config
//
// One config object per flagship brand (Karcher, Milwaukee, PFERD, FFGroup +
// whichever 2-3 join them). This file is the thing Călin/content edits to
// add or update a brand page — components/BrandLandingTemplate.tsx renders
// whatever's here plus live Supabase data (subcategories, application
// groups, brand row). Adding brand #7 means adding an entry here, not
// building a new page.
//
// Every section is optional except heroTitle/heroSub/eyebrow — different
// brands lean on different strengths:
//   - PFERD has no structured `applications` data, so it leans on curated
//     `pillars` + `intentGroups` (hand-built from the nomenclature blueprint).
//   - Karcher has real `app_01_title` data from the enrichment pipeline, so
//     it leans on the live use-case carousels (see getApplicationGroupsByBrand)
//     instead of hardcoded chips/pillars.
// See TECHNICAL_SPEC.md §4 for which fields are actually populated per brand.
// ─────────────────────────────────────────────────────────────────────────

export type HeroToken = { text: string; em?: boolean }
export type HeroLine = HeroToken[]

export type IntentChip = { label: string; q: string }
export type IntentGroup = { label: string; chips: IntentChip[] }

export type Pillar = {
  code: string
  title: string
  desc: string
  bullets: string[]
  q: string
}

export type GlossaryItem = {
  code: string
  title: string
  desc: string
  badges?: { label: string; cls: 'badge-inox' | 'badge-alu' | 'badge-cast' | 'badge-steel' }[]
}

export type FaqItem = { q: string; a: string }

export type Specialist = {
  name: string
  role: string
  photoUrl?: string
  note: string // one line on why this person specifically, e.g. category expertise
}

export type CrossSell = {
  title: string
  body: string // plain text; template wraps key phrases, no HTML needed
  ctaLabel: string
  q: string
}

export type BrandPageConfig = {
  slug: string
  brandName: string // must match products.brand_name exactly (case-sensitive per lib/supabase.ts normalization notes)
  metaTitle: string
  metaDescription: string

  eyebrow: string
  heroTitle: HeroLine[]
  heroSub: string

  /** Hand-curated discovery chips — omit for brands with real `applications` data (use useCaseCarousels instead). */
  intentGroups?: IntentGroup[]

  /** Curated product-family cards — best for brands with complex nomenclature (PFERD-style), not needed if use-case carousels cover discovery well. */
  pillars?: Pillar[]

  /** Whether to render live "find the right tool for your job" carousels from app_01_title data (see getApplicationGroupsByBrand). */
  useUseCaseCarousels: boolean
  useCaseSectionTitle: string
  useCaseSectionSub: string

  /** Technical glossary / code cheat-sheet — optional, PFERD-style nomenclature brands only. */
  glossary?: GlossaryItem[]
  glossaryTitle?: string
  glossarySub?: string

  /** Named human expertise — the actual differentiator distributors have over marketplaces. Falls back to a shared team block if omitted. */
  specialist?: Specialist

  /** S.E.A.P. (Romanian public-procurement platform) eligibility — small badge, big trust signal for institutional buyers. */
  seapEligible: boolean

  /** Answer-first FAQ, rendered with FAQPage JSON-LD for AI-search/AEO visibility (TECHNICAL_SPEC.md SEO-1/SEO-2). */
  faq: FaqItem[]

  crossSell?: CrossSell
}

const SHARED_SEAP_FAQ: FaqItem = {
  q: 'Puteți emite ofertă pentru achiziții publice (S.E.A.P.)?',
  a: 'Da — Zona Scule este furnizor înregistrat pentru achiziții publice prin S.E.A.P. Contactați-ne cu specificațiile tehnice și cantitatea, iar echipa noastră pregătește oferta conform cerințelor instituției dvs.',
}

const SHARED_WARRANTY_FAQ: FaqItem = {
  q: 'Ce se întâmplă dacă un echipament are nevoie de service?',
  a: 'Ca partener autorizat, oferim intervenții prin tehnicieni certificați și acces la piese originale. Contactați-ne cu seria produsului pentru a stabili cel mai rapid traseu de reparație.',
}

export const BRAND_PAGES: Record<string, BrandPageConfig> = {
  // ── PFERD ──────────────────────────────────────────────────────────────
  pferd: {
    slug: 'pferd',
    brandName: 'Pferd',
    metaTitle: 'PFERD — Scule Industriale de Precizie | Zona Scule',
    metaDescription:
      'Descoperă gama completă PFERD: pile, freze rotative, carote și corpuri abrazive pentru profesioniști și amatori pasionați.',

    eyebrow: 'Partener oficial PFERD',
    heroTitle: [
      [{ text: 'Rezistență care ' }, { text: 'nu cedează.', em: true }],
      [{ text: 'Precizie care ' }, { text: 'nu iartă.', em: true }],
    ],
    heroSub:
      'Peste 150 de ani de inginerie germană — pile, freze, carote și corpuri abrazive pentru orice atelier, de la primul șantier la flux industrial continuu.',

    intentGroups: [
      {
        label: 'Caută după Aplicație',
        chips: [
          { label: 'Ascuțire lanț drujbă', q: 'ascutire lant drujba' },
          { label: 'Debavurare', q: 'debavurare' },
          { label: 'Finisare', q: 'finisare' },
          { label: 'Găurire / Carote', q: 'carote' },
          { label: 'Șlefuire', q: 'slefuire' },
          { label: 'Perii industriale', q: 'perii industriale' },
        ],
      },
      {
        label: 'Caută după Material',
        chips: [
          { label: 'Inox', q: 'inox' },
          { label: 'Oțel / Steel', q: 'otel' },
          { label: 'Aluminiu', q: 'aluminiu' },
          { label: 'Fontă / Cast', q: 'fonta' },
          { label: 'Lemn', q: 'lemn' },
        ],
      },
    ],

    pillars: [
      {
        code: '01',
        title: 'Pile, Răspe și Accesorii',
        desc: 'Ascuțire manuală de precizie — de la ateliere de lăcătușărie la sculărie fină.',
        bullets: ['Ascuțire lanțuri Classic & Premium', 'Pile de precizie CORINOX', 'Mânere ergonomice FH / PH'],
        q: 'pile',
      },
      {
        code: '02',
        title: 'Freze Rotative (Carbură & HSS)',
        desc: 'Debavurare și prelucrare de detaliu, pe orice material — de la oțel la plastic.',
        bullets: ['Geometrii ZYA, KUD, TRE', 'Linii TOUGH, ALLROUND, STEEL', 'Carbură metalică & HSS'],
        q: 'freze rotative',
      },
      {
        code: '03',
        title: 'Găurire, Carote și Adâncitoare',
        desc: 'De la prima gaură pilot la teșirea finală — un sistem complet, nu scule izolate.',
        bullets: ['Pânze bi-metal LS', 'Burghie în trepte STB', 'Adâncitoare KES / UGT cu HICOAT'],
        q: 'carote adancitoare',
      },
      {
        code: '04',
        title: 'Corpuri Abrazive (Pietre polizoare)',
        desc: 'Șlefuire și degroșare controlată, cu liant potrivit pentru fiecare suprafață.',
        bullets: ['Forme ZY, WR, KU', 'Liant J5V / O5V', 'Dornuri suport compatibile'],
        q: 'pietre polizoare',
      },
    ],

    useUseCaseCarousels: false,
    useCaseSectionTitle: 'Găsește scula potrivită pentru lucrarea ta',
    useCaseSectionSub: 'Produse PFERD grupate după aplicația reală, nu după codul din catalog.',

    glossaryTitle: 'Descifrează codul PFERD',
    glossarySub: 'Cheat-sheet rapid pentru codurile de pe etichetă — fără să deschizi catalogul.',
    glossary: [
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
    ],

    specialist: {
      name: 'Echipa tehnică PFERD',
      role: 'Consultanță nomenclatură & alegere sculă',
      note: 'Cunosc pe dinafară codurile PFERD (ZYA, TOUGH, J5V) — spune-le materialul și aplicația, primești varianta corectă din prima.',
    },
    seapEligible: true,
    faq: [
      SHARED_SEAP_FAQ,
      SHARED_WARRANTY_FAQ,
      {
        q: 'Cum aleg diametrul de tijă corect pentru freze/pietre?',
        a: 'Cele mai comune diametre de tijă PFERD sunt 3mm, 6mm și 8mm — verificați specificația mandrinei mașinii dvs. înainte de a alege dornul suport (cod BO). Echipa tehnică vă poate confirma compatibilitatea dacă ne trimiteți modelul mașinii.',
      },
    ],

    crossSell: {
      title: 'Potrivire inteligentă de accesorii',
      body: 'Ai ales o freză sau o piatră polizoare? Verifică diametrul tijei (3mm, 6mm, 8mm) pentru a alege dornul suport potrivit (BO) sau mânerul ergonomic (PH / FH) pentru pile.',
      ctaLabel: 'Vezi Accesorii Compatibile',
      q: 'dorn suport',
    },
  },

  // ── KARCHER ────────────────────────────────────────────────────────────
  karcher: {
    slug: 'karcher',
    brandName: 'Karcher',
    metaTitle: 'Karcher — Curățare Industrială Profesională | Zona Scule',
    metaDescription:
      'Măturătoare, aparate de curățat cu presiune și echipamente industriale Karcher pentru aeroporturi, șantiere, depozite și centre de producție.',

    eyebrow: 'Partener autorizat Karcher',
    heroTitle: [
      [{ text: 'Curățare la scară ' }, { text: 'industrială.', em: true }],
      [{ text: 'Fără compromis pe ' }, { text: 'durabilitate.', em: true }],
    ],
    heroSub:
      'De la aeroporturi și porturi la turnătorii și hale de producție — gama Karcher acoperă orice suprafață, orice volum, orice murdărie industrială.',

    // No hand-curated intent chips for Karcher — the real app_01_title data
    // (already populated by scripts/enrich-karcher.mjs) drives discovery
    // instead, via the use-case carousels below.
    useUseCaseCarousels: true,
    useCaseSectionTitle: 'Găsește scula potrivită pentru lucrarea ta',
    useCaseSectionSub:
      'Produse Karcher grupate după domeniul real de utilizare — exact cum întreabă un procurement manager, nu cum e organizat un catalog.',

    specialist: {
      name: 'Echipa tehnică Karcher',
      role: 'Consultanță echipamente industriale de curățare',
      note: 'Vă ajutăm să alegeți între variantele Bp (baterie), D (diesel) și LPG în funcție de suprafața și mediul de lucru.',
    },
    seapEligible: true,
    faq: [
      SHARED_SEAP_FAQ,
      SHARED_WARRANTY_FAQ,
      {
        q: 'Care este diferența dintre variantele Bp, D și LPG?',
        a: 'Bp rulează pe acumulator (potrivit pentru spații închise, fără emisii), D pe motorină (autonomie mare, exterior), iar LPG pe gaz petrolier lichefiat (echilibru între autonomie și emisii reduse pentru spații semi-închise). Alegerea corectă depinde de suprafața de curățat și de mediul de lucru — echipa tehnică vă poate recomanda varianta potrivită.',
      },
      {
        q: 'Oferiți piese de schimb și consumabile pentru echipamentele Karcher?',
        a: 'Da, ca partener autorizat avem acces la piese originale Karcher și la rețeaua de service a producătorului — contactați-ne cu seria echipamentului pentru disponibilitate și termen.',
      },
    ],
  },
}

export function getBrandPageConfig(slug: string): BrandPageConfig | null {
  return BRAND_PAGES[slug] ?? null
}
