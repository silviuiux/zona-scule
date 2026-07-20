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

  /** Whether to render "browse by subcategory" carousels from subcategory_text data (see getSubcategoryGroupsByBrand) — the universal counterpart to useUseCaseCarousels, since every brand has subcategory_text populated. */
  useSubcategoryCarousels: boolean
  subcategorySectionTitle?: string
  subcategorySectionSub?: string

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
      [{ text: 'Rezistență ' }, { text: 'imbatabilă.', em: true }],
      [{ text: 'Precizie care ' }, { text: 'nu iartă.', em: true }],
    ],
    heroSub:
      'Peste 150 de ani de inginerie germană — pile, freze, carote și corpuri abrazive pentru orice atelier.',

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

    useSubcategoryCarousels: true,
    subcategorySectionTitle: 'Descoperă gama PFERD pe subcategorii',
    subcategorySectionSub: 'Pile, freze, carote și corpuri abrazive — organizate exact cum le găsești în catalog.',

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
      [{ text: 'Curățenie ' }, { text: 'industrială.', em: true }],
      [{ text: 'Fără ' }, { text: 'compromis.', em: true }],
    ],
    heroSub:
      'De la aeroporturi la hale de producție — curățare industrială pentru orice suprafață și volum.',

    // No hand-curated intent chips for Karcher — the real app_01_title data
    // (already populated by scripts/enrich-karcher.mjs) drives discovery
    // instead, via the use-case carousels below.
    useUseCaseCarousels: true,
    useCaseSectionTitle: 'Găsește scula potrivită pentru lucrarea ta',
    useCaseSectionSub:
      'Produse Karcher grupate după domeniul real de utilizare — exact cum întreabă un procurement manager, nu cum e organizat un catalog.',

    useSubcategoryCarousels: true,
    subcategorySectionTitle: 'Explorează gama Karcher pe subcategorii',
    subcategorySectionSub: 'De la aspiratoare industriale la mașini de spălat cu presiune — organizate pe tip de echipament.',

    glossaryTitle: 'Descifrează codul Karcher',
    glossarySub: 'Ce înseamnă literele de pe carcasă — cheat-sheet rapid înainte de a alege modelul.',
    glossary: [
      {
        code: 'Bp / D / LPG',
        title: 'Sursă de alimentare',
        desc: 'Bp rulează pe acumulator (fără emisii, potrivit pentru spații închise), D pe motorină (autonomie mare, exterior), LPG pe gaz petrolier lichefiat (echilibru între autonomie și emisii reduse).',
      },
      {
        code: 'HD / HDS',
        title: 'Aparate de curățat cu presiune',
        desc: 'HD lucrează cu apă rece — pentru curățare generală de murdărie și noroi. HDS încălzește apa — necesar pentru grăsimi, uleiuri și dezinfectare.',
      },
      {
        code: 'NT / T',
        title: 'Aspiratoare industriale',
        desc: 'NT (umed-uscat) aspiră atât lichide cât și praf/moloz. T (uscat) e destinat exclusiv prafului și resturilor solide.',
      },
      {
        code: 'KM',
        title: 'Măturătoare (Kehrmaschine)',
        desc: 'Măturătoare industriale cu condus manual sau cu conducător la bord, pentru hale, depozite și spații exterioare mari.',
      },
      {
        code: 'BD / BR',
        title: 'Mașini de spălat pardoseli',
        desc: 'BD — mașini cu condus manual (walk-behind), pentru suprafețe medii. BR — mașini cu conducător la bord (ride-on), pentru suprafețe industriale foarte mari.',
      },
      {
        code: 'eco!efficiency',
        title: 'Mod economic',
        desc: 'Setare care reduce consumul de apă și energie fără o pierdere semnificativă a puterii de curățare — util pentru volum mare de utilizare zilnică.',
      },
    ],

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

  // ── OSBORN ─────────────────────────────────────────────────────────────
  // No app_01_title data at all (0/131 rows) — leans entirely on curated
  // pillars/glossary from the nomenclature blueprint, same pattern as PFERD.
  // Subcategory spread is thin (6 subcategories, "Perii Industriale" alone is
  // ~75% of the catalog) so useSubcategoryCarousels is enabled but won't
  // carry the page on its own — the pillars + glossary do the heavy lifting.
  osborn: {
    slug: 'osborn',
    brandName: 'Osborn',
    metaTitle: 'OSBORN — Perii Industriale și Freze din Carbură | Zona Scule',
    metaDescription:
      'Perii circulare, perii oală, perii de precizie, freze rotative din carbură și corpuri abrazive lamelare OSBORN pentru debavurare, curățare și finisare industrială.',

    eyebrow: 'Partener oficial OSBORN',
    heroTitle: [
      [{ text: 'Precizie ' }, { text: 'germană.', em: true }],
      [{ text: 'Perii care ' }, { text: 'nu cedează.', em: true }],
    ],
    heroSub:
      'Perii industriale, freze din carbură și corpuri abrazive — pentru debavurare, curățare și finisare pe orice metal.',

    pillars: [
      {
        code: '01',
        title: 'Perii Circulare & Perii Oală',
        desc: 'Montate pe polizoare unghiulare sau de banc — pentru curățare rapidă a suprafețelor mari sau acces în colțuri și canale de sudură.',
        bullets: ['Sârmă ondulată (crimped)', 'Sârmă împletită (knotted)', 'Miez ranforsat Ringlock'],
        q: 'perie circulara',
      },
      {
        code: '02',
        title: 'Perii de Precizie & Perii pentru Interior',
        desc: 'Perii pe tijă (6mm) pentru mașini de găurit și polizoare drepte, plus perii tip țevară pentru curățarea interioară a alezajelor.',
        bullets: ['Perie tip pensulă (End Brush)', 'Perie cilindrică interior (Tube Brush)', 'Situft & Helituf'],
        q: 'perie de precizie',
      },
      {
        code: '03',
        title: 'Freze Rotative din Carbură',
        desc: 'Debavurare și prelucrare de detaliu pe orice material, cu geometrii standardizate german pentru fiecare formă de tăiș.',
        bullets: ['Forme ZYA, WRC, KUD, TRE', 'Forme SKM, KEL, SPG', 'Carbură metalică sinterizată'],
        q: 'freza rotativa',
      },
      {
        code: '04',
        title: 'Corpuri Abrazive Lamelare & Fetru',
        desc: 'Discuri lamelare, filamente abrazive Novofil și produse din fetru pentru finisare și lustruire controlată.',
        bullets: ['Discuri lamelare (Flap Wheel)', 'Filamente Novofil SIC / AO', 'Produse din fetru & paste de lustruit'],
        q: 'disc lamelar',
      },
    ],

    useUseCaseCarousels: false,
    useCaseSectionTitle: 'Găsește scula potrivită pentru lucrarea ta',
    useCaseSectionSub: 'Produse OSBORN grupate după aplicația reală.',

    useSubcategoryCarousels: true,
    subcategorySectionTitle: 'Explorează gama OSBORN pe subcategorii',
    subcategorySectionSub: 'Perii industriale, freze din carbură, discuri lamelare și produse din fetru — organizate exact cum sunt în catalog.',

    glossaryTitle: 'Descifrează codul OSBORN',
    glossarySub: 'Sârmă, geometrie și acoperire — cheat-sheet rapid pentru eticheta periei sau frezei.',
    glossary: [
      {
        code: 'crimped / knotted',
        title: 'Dispunerea sârmei',
        desc: 'Ondulată (crimped) — flexibilă, pentru curățare fină și debavurare ușoară. Împletită/torsionată (knotted) — agresivă, pentru zgură de sudură, rugină severă și decopertări masive.',
      },
      {
        code: 'steel / brass coated / inox',
        title: 'Compoziția sârmei',
        desc: 'Oțel carbon pentru uz universal, oțel alămit (anticorosiv, rezistență la tracțiune mărită), alamă pură pentru piese moi fără zgâriere, inox pentru evitarea contaminării feroase încrucișate.',
        badges: [{ label: 'INOX', cls: 'badge-inox' }],
      },
      {
        code: 'ZYA / WRC / KUD / TRE',
        title: 'Geometrie freză',
        desc: 'Cod german standardizat pentru forma capului: ZYA cilindrică, WRC cilindro-sferică, KUD sferică (bilă), TRE formă de picătură.',
      },
      {
        code: 'SKM / KEL / SPG',
        title: 'Geometrie conică/parabolică',
        desc: 'SKM conică cu cap ascuțit, KEL conică cu cap rotund, SPG parabolică cu cap ascuțit — pentru acces în unghiuri și cavități înguste.',
      },
      {
        code: 'Novofil SIC / AO',
        title: 'Filament abraziv',
        desc: 'Filamente de nylon încărcate cu granule abrazive — Carbură de Siliciu (SIC) sau Oxid de Aluminiu (AO) — pentru perii abrazive Novomaster.',
      },
      {
        code: 'GL',
        title: 'Lungime totală',
        desc: 'Gesamtlänge — lungimea totală a frezei (cap + gât + tijă), esențială pentru verificarea accesului în alezaje adânci.',
      },
    ],

    specialist: {
      name: 'Echipa tehnică OSBORN',
      role: 'Consultanță alegere perie/freză după material și agresivitate',
      note: 'Vă ajutăm să alegeți între sârmă ondulată sau împletită, și între oțel, alamă sau inox, în funcție de material și de cât de agresivă trebuie să fie curățarea.',
    },
    seapEligible: true,
    faq: [
      SHARED_SEAP_FAQ,
      SHARED_WARRANTY_FAQ,
      {
        q: 'Ce diferență e între sârma ondulată (crimped) și cea împletită (knotted)?',
        a: 'Sârma ondulată e mai flexibilă și potrivită pentru curățare fină, debavurare ușoară și suprafețe neregulate. Sârma împletită (torsionată) e mult mai agresivă și rezistentă la forțe centrifuge — se folosește la îndepărtarea zgurii de sudură, ruginii severe și decopertări masive pe șantier.',
      },
    ],
  },

  // ── MILWAUKEE ──────────────────────────────────────────────────────────
  // The one brand with BOTH rich app_01_title data (3597/4669 rows) AND a
  // wide subcategory spread (~100 distinct subcategories) — so it's the only
  // brand config with useUseCaseCarousels AND useSubcategoryCarousels both
  // true. Glossary covers the platform/tech-ecosystem vocabulary from the
  // nomenclature blueprint (M12/M18/MX FUEL, FUEL/PACKOUT/ONE-KEY etc.) since
  // that's real differentiation a buyer needs decoded, not something a
  // product-grid carousel communicates on its own.
  milwaukee: {
    slug: 'milwaukee',
    brandName: 'Milwaukee',
    metaTitle: 'Milwaukee — Scule Electrice cu Acumulator Profesionale | Zona Scule',
    metaDescription:
      'Scule electrice cu acumulator Milwaukee: platformele M12, M18 și MX FUEL, tehnologie FUEL, sisteme PACKOUT și scule hidraulice FORCE LOGIC pentru profesioniști.',

    eyebrow: 'Partener oficial Milwaukee',
    heroTitle: [
      [{ text: 'Un întreg ' }, { text: 'ecosistem.', em: true }],
      [{ text: 'Nu o ' }, { text: 'simplă sculă.', em: true }],
    ],
    heroSub:
      'De la platforma compactă M12 la echipamentele industriale MX FUEL — un singur ecosistem de acumulatori.',

    useUseCaseCarousels: true,
    useCaseSectionTitle: 'Găsește scula potrivită pentru lucrarea ta',
    useCaseSectionSub: 'Produse Milwaukee grupate după aplicația reală de pe șantier sau din atelier.',

    useSubcategoryCarousels: true,
    subcategorySectionTitle: 'Explorează gama Milwaukee pe subcategorii',
    subcategorySectionSub: 'De la scule de găurit și înșurubat la organizare PACKOUT — organizate exact cum sunt în catalog.',

    glossaryTitle: 'Descifrează ecosistemul Milwaukee',
    glossarySub: 'Platforme, tehnologii și sub-branduri — ce înseamnă codurile de pe cutie.',
    glossary: [
      {
        code: 'M12 / M18 / MX FUEL',
        title: 'Platforme de tensiune',
        desc: 'M12 — platforma compactă de 12V pentru precizie și spații înguste. M18 — standardul industrial de 18V pentru putere și autonomie. MX FUEL — platforma industrială grea, pentru echipamente ce înlocuiesc utilaje pe benzină sau aer comprimat.',
      },
      {
        code: 'FUEL™',
        title: 'Tehnologie premium',
        desc: 'Combină motorul fără perii POWERSTATE™, acumulatorii REDLITHIUM™ și electronica inteligentă REDLINK PLUS™ — indică gama premium de top, cu performanță și durabilitate maxime.',
      },
      {
        code: 'HIGH OUTPUT (HO)',
        title: 'Celule acumulator avansate',
        desc: 'Livrează până la 50% mai multă putere și rulează cu 50% mai rece comparativ cu acumulatorii REDLITHIUM™ standard.',
      },
      {
        code: 'FORCE LOGIC™',
        title: 'Scule hidraulice inteligente',
        desc: 'Sertizatoare, pompe și tăietoare de cabluri de înaltă presiune, cu monitorizare electronică a ciclului de presiune.',
      },
      {
        code: 'PACKOUT™',
        title: 'Sistem de organizare',
        desc: 'Sistemul modular de depozitare, organizare și transport, rezistent la impact — cutii, sertare și rucsacuri compatibile între ele.',
      },
      {
        code: 'ONE-KEY™',
        title: 'Platformă digitală',
        desc: 'Urmărire, securizare și calibrare electronică a sculelor prin Bluetooth, direct din aplicația ONE-KEY.',
      },
    ],

    specialist: {
      name: 'Echipa tehnică Milwaukee',
      role: 'Consultanță alegere platformă (M12 / M18 / MX FUEL)',
      note: 'Vă ajutăm să alegeți platforma potrivită pentru volumul de lucru — de la precizia M12 la autonomia M18 FUEL sau puterea industrială MX FUEL.',
    },
    seapEligible: true,
    faq: [
      SHARED_SEAP_FAQ,
      SHARED_WARRANTY_FAQ,
      {
        q: 'Acumulatorii M18 sunt compatibili cu toate sculele M18?',
        a: 'Da — orice acumulator M18™ (inclusiv HIGH OUTPUT™) funcționează cu orice sculă M18™, indiferent de generație. M12™ și MX FUEL™ sunt platforme separate, cu acumulatori dedicați, necompatibili între ele sau cu M18.',
      },
    ],
  },

  // ── RUKO ───────────────────────────────────────────────────────────────
  // Subcategory data is essentially flat (the "Burghie" subcategory alone
  // covers virtually the entire catalog), and app_01_title coverage is thin
  // (47/470) — so this page leans on curated pillars built from real product-
  // name patterns (burghie elicoidale, zencuitoare, tarozi, carote) rather
  // than either data-driven section carrying the page. useSubcategoryCarousels
  // stays enabled per the "all brand pages" instruction, it just won't have
  // much to show beyond the one dominant subcategory.
  ruko: {
    slug: 'ruko',
    brandName: 'Ruko',
    metaTitle: 'RUKO — Scule Așchietoare de Precizie | Zona Scule',
    metaDescription:
      'Burghie elicoidale și în trepte, zencuitoare, tarozi, filiere și carote RUKO — oțel rapid, cobalt și carbură metalică, cu acoperiri TiN, TiAlN și RUnaTEC.',

    eyebrow: 'Partener oficial RUKO',
    heroTitle: [
      [{ text: 'Oțel ' }, { text: 'german,', em: true }],
      [{ text: 'găurire de ' }, { text: 'precizie.', em: true }],
    ],
    heroSub:
      'Burghie, zencuitoare, tarozi și filiere din oțel rapid sau carbură metalică, cu acoperiri TiN, TiAlN și RUnaTEC.',

    pillars: [
      {
        code: '01',
        title: 'Burghie Elicoidale & în Trepte',
        desc: 'Găurire universală sau centrată, cu debavurare simultană — în HSS standard sau HSS-Co5 pentru inox.',
        bullets: ['HSS / HSS-Co 5', 'FLOWSTEP® pentru trepte', 'Versiuni TiN / TiAlN'],
        q: 'burghie elicoidale',
      },
      {
        code: '02',
        title: 'Zencuitoare & Freze Biax',
        desc: 'Teșire și îngropare șuruburi, plus freze biax din carbură pentru debavurare de detaliu.',
        bullets: ['ULTIMATECUT 4S', 'Unghiuri 75°/90°/120°', 'Forme C, D (biax)'],
        q: 'zencuitor',
      },
      {
        code: '03',
        title: 'Tarozi & Filiere (Filetare)',
        desc: 'Filetare de mașină sau manuală, în seturi complete sau ca scule individuale.',
        bullets: ['DIN 371 / DIN 376 / DIN 2182', 'HSS / HSSE-Co 5', 'Seturi complete de filetat'],
        q: 'tarod',
      },
      {
        code: '04',
        title: 'Carote & Seturi Accesorii',
        desc: 'Carote bimetal și din carbură pentru tablă și profile, cu suporturi și accesorii compatibile.',
        bullets: ['Carote bimetal HSS-Co 8', 'Carote pentru tablă (carbură)', 'Suporturi multigrad'],
        q: 'carote',
      },
    ],

    useUseCaseCarousels: false,
    useCaseSectionTitle: 'Găsește scula potrivită pentru lucrarea ta',
    useCaseSectionSub: 'Produse RUKO grupate după aplicația reală.',

    useSubcategoryCarousels: true,
    subcategorySectionTitle: 'Explorează gama RUKO',
    subcategorySectionSub: 'Scule așchietoare organizate exact cum sunt în catalog.',

    glossaryTitle: 'Descifrează codul RUKO',
    glossarySub: 'Material, acoperire și abreviere ERP — cheat-sheet rapid pentru eticheta sculei.',
    glossary: [
      {
        code: 'HSS',
        title: 'Oțel rapid superior',
        desc: 'Destinat găuririi și prelucrării universale în metale neferoase, oțeluri moi și materiale plastice.',
      },
      {
        code: 'HSS-Co 5 / HSSE',
        title: 'Oțel rapid cu Cobalt',
        desc: 'Rezistență termică la cald excepțională și duritate ridicată — strict obligatoriu pentru inox, oțeluri aliate de mare rezistență și materiale turnate.',
        badges: [{ label: 'INOX', cls: 'badge-inox' }],
      },
      {
        code: 'TCT',
        title: 'Carbură de Tungsten (Vidiam)',
        desc: 'Dinți placați cu carbură metalică pentru performanțe de străpungere extremă în materiale puternic abrazive și oțeluri dure structurale.',
        badges: [{ label: 'STEEL', cls: 'badge-steel' }],
      },
      {
        code: 'TiN',
        title: 'Acoperire Nitrură de Titan',
        desc: 'Strat protector auriu — mărește duritatea la suprafață și rezistența la temperatură, crescând viteza de avans cu până la 50%.',
      },
      {
        code: 'TiAlN',
        title: 'Acoperire Titan-Aluminiu-Nitrură',
        desc: 'Strat violet-negru, ideal pentru așchiere uscată sau materiale ultra-dure, cu izolare termică superioară.',
      },
      {
        code: 'RUnaTEC',
        title: 'Acoperire brevetată RUKO',
        desc: 'Coeficient de frecare minim și rezistență la uzură extremă — acoperire de înaltă performanță proprie RUKO.',
      },
    ],

    specialist: {
      name: 'Echipa tehnică RUKO',
      role: 'Consultanță alegere material și acoperire sculă așchietoare',
      note: 'Vă ajutăm să alegeți între HSS, HSS-Co5 și TCT, și între acoperirile TiN, TiAlN sau RUnaTEC, în funcție de materialul prelucrat.',
    },
    seapEligible: true,
    faq: [
      SHARED_SEAP_FAQ,
      SHARED_WARRANTY_FAQ,
      {
        q: 'Ce diferență e între HSS, HSS-Co5 și TCT?',
        a: 'HSS e oțelul rapid standard, potrivit pentru metale neferoase și oțeluri moi. HSS-Co5 adaugă 5% cobalt pentru rezistență termică și duritate mărite — obligatoriu pentru inox și oțeluri aliate. TCT (carbură de tungsten) e cea mai dură variantă, pentru materiale puternic abrazive și oțeluri structurale dure.',
      },
    ],
  },
}

export function getBrandPageConfig(slug: string): BrandPageConfig | null {
  return BRAND_PAGES[slug] ?? null
}
