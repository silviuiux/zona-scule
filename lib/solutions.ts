/**
 * Zona Soluții — one story per profession, all rendered by the same template
 * (app/zona-solutii/[slug]/page.tsx). A story is an ordered list of
 * sections, so stories share the look but vary in what they show and in
 * which order. Product numbers are never written here: the hero stats and
 * every carousel are read live from the catalog through the subcategory
 * names each carousel lists (products.subcategory_text, exact spelling).
 */

export type SolutionSection =
  /** Lead paragraph + the job in three steps. */
  | { kind: 'intro'; lead: string; steps: { title: string; text: string }[] }
  /** Full-bleed manufacturer application photo from the story's products. */
  | { kind: 'image'; caption?: string }
  /** A product carousel over one or more subcategories. */
  | { kind: 'carousel'; title: string; text: string; subs: string[] }
  /** The essentials, each linking to a catalog search. */
  | { kind: 'checklist'; title: string; text?: string; items: { name: string; why: string; q: string }[] }
  /** A short expert tip, set large. */
  | { kind: 'tip'; text: string; by: string }
  /** Answer-first FAQ (also emitted as FAQPage JSON-LD). */
  | { kind: 'faq'; items: { q: string; a: string }[] }
  /** A comparison table: first column is the row label. */
  | { kind: 'compare'; title: string; text?: string; head: string[]; rows: string[][]; note?: string }
  /** "Dacă… → …" rules of thumb. */
  | { kind: 'rules'; title: string; items: { when: string; then: string }[] }
  /** Step-by-step how-to (also emitted as HowTo JSON-LD). */
  | { kind: 'howto'; title: string; steps: { title: string; text: string }[] }
  /** A call to action (B2B: offers, S.E.A.P., visits). */
  | { kind: 'cta'; title: string; text: string; label: string; href: string }
  /** Product stories: the product itself — image, short description, key
   *  features (all live from the catalog) and a link to its page. */
  | { kind: 'product' }
  /** Product stories: the manufacturer's application photos. */
  | { kind: 'gallery'; title: string }
  /** Product stories: a curated spec sheet, in groups. */
  | { kind: 'specs'; title: string; groups: { name: string; rows: [string, string][] }[]; note?: string }
  /** Strengths and things to know. */
  | { kind: 'proscons'; pros: string[]; cons: string[] }
  /** The verdict, and who the product is for. */
  | { kind: 'verdict'; text: string; forWho: string[] }

export type SolutionType = 'meserie' | 'ghid' | 'proiect' | 'produs'
export const SOLUTION_TYPES: { id: SolutionType; label: string; eyebrow: string }[] = [
  { id: 'meserie', label: 'Meserii și industrii', eyebrow: 'Soluții pe domenii' },
  { id: 'ghid', label: 'Cum alegi', eyebrow: 'Ghiduri de alegere' },
  { id: 'proiect', label: 'Proiecte', eyebrow: 'Liste de scule pe proiect' },
  { id: 'produs', label: 'Produse în detaliu', eyebrow: 'Prezentări de produs' },
]

export type Solution = {
  slug: string
  type: SolutionType
  /** Shown first and large on /zona-solutii. */
  featured?: boolean
  /** A sub-story: the slug of the story it belongs to (shown with it,
   *  not in the index groups). */
  parent?: string
  /** Short name — the hero's big word ("Zona Electricieni") on domain
   *  stories, the card title everywhere. */
  profession: string
  /** Full hero title instead of "Zona {profession}" — guides and projects,
   *  whose H1 should read like the search it answers. */
  title?: string
  /** Product stories: the catalog product (products.slug) they present. */
  product?: string
  /** Hero numbers instead of the catalog counts: [value, label]. */
  heroStats?: [string, string][]
  /** Eyebrow / card label. */
  domain: string
  headline: string
  excerpt: string
  metaTitle: string
  metaDescription: string
  sections: SolutionSection[]
}

/** Every subcategory a story's carousels draw on (hero stats, image). */
export const solutionSubs = (s: Solution) =>
  [...new Set(s.sections.flatMap(x => (x.kind === 'carousel' ? x.subs : [])))]

import { MORE_SOLUTIONS } from './solutions-more'
import { PRODUCT_SOLUTIONS } from './solutions-products'

const TEAM = 'Echipa tehnică Zona Scule'

const BASE_SOLUTIONS: Solution[] = [
  // ── Electricieni ──────────────────────────────────────────────────────────
  {
    slug: 'scule-pentru-electricieni',
    type: 'meserie',
    profession: 'Electricieni',
    domain: 'Lucrări electrice',
    headline: 'De la traseu la tablou, fără surprize la recepție.',
    excerpt: 'Trasare, șlițuire, doze curate și conexiuni sigure — sculele care fac o instalație electrică să arate și să funcționeze ca la carte.',
    metaTitle: 'Scule pentru electricieni — șurubelnițe VDE, clești, detectoare | Zona Scule',
    metaDescription: 'Scule profesionale pentru electricieni: șurubelnițe și clești izolați VDE 1000 V, detectoare, ciocane rotopercutoare, carote pentru doze și nivele laser.',
    sections: [
      {
        kind: 'intro',
        lead: 'O instalație electrică bună se vede abia când nu mai e nevoie de ea: fără doze refăcute, fără prize strâmbe, fără retușuri după recepție. Jumătate din treabă o fac sculele — trasare precisă, găuri curate și izolație certificată.',
        steps: [
          { title: 'Trasare și detectare', text: 'Înainte de primul șliț: nivelă laser pentru trasee drepte și un detector pentru țevi, armături și cabluri sub tensiune ascunse în perete.' },
          { title: 'Șlițuire și doze', text: 'Ciocan rotopercutor SDS-plus și carote pentru doze — găuri rotunde, la cotă, fără tencuială spartă în jur.' },
          { title: 'Conectare în siguranță', text: 'Șurubelnițe și clești izolați VDE, testați la 10 000 V pentru lucru până la 1 000 V — o cerință, nu un moft.' },
        ],
      },
      { kind: 'carousel', title: 'Șurubelnițe izolate și de precizie', text: 'VDE 1 000 V pentru tablou și prize, profile PH, PZ și plat pentru cleme și aparataj.', subs: ['Șurubelnițe VDE', 'Șurubelnițe'] },
      { kind: 'carousel', title: 'Clești pentru cablu', text: 'Dezizolare, sertizare, tăiere — cleștele potrivit pentru fiecare secțiune de conductor.', subs: ['Clești', 'Clește', 'Clești - Dispozitive de tăiat - Lanterne pivotante'] },
      { kind: 'image' },
      { kind: 'carousel', title: 'Detectare, măsură și inspecție', text: 'Detectoare de materiale, telemetre și camere termice care arată conexiunile supraîncălzite înainte să devină o problemă.', subs: ['Detectoare', 'Aparate de măsură', 'Diagnosticare și inspecție', 'Camere termice şi termodetectoare'] },
      {
        kind: 'checklist',
        title: 'Trusa de bază a electricianului',
        items: [
          { name: 'Set șurubelnițe VDE', why: 'Izolate 1 000 V, profile PH, PZ și plat.', q: 'surubelnite VDE' },
          { name: 'Clește de dezizolat', why: 'Dezizolare curată, fără crestarea firului.', q: 'cleste dezizolat' },
          { name: 'Detector de materiale', why: 'Cabluri, țevi și armături, înainte de găurit.', q: 'detector' },
          { name: 'Ciocan rotopercutor SDS-plus', why: 'Șlițuri și găuri de trecere prin beton și zidărie.', q: 'ciocan rotopercutor' },
          { name: 'Carotă pentru doze', why: 'Ø 68 mm pentru doze standard Ø 60 mm.', q: 'carota 68' },
          { name: 'Nivelă laser cu linii în cruce', why: 'Prize și întrerupătoare la aceeași cotă, în toată casa.', q: 'nivela laser' },
        ],
      },
      { kind: 'carousel', title: 'Găurire și șlițuire', text: 'Ciocane rotopercutoare și mașini cu percuție pentru trasee prin beton, cărămidă și BCA.', subs: ['Ciocane rotopercutoare', 'Găurire și spargere', 'Maşini de găurit cu percuţie'] },
      { kind: 'carousel', title: 'Carote pentru doze', text: 'Carote diamantate pentru zidărie — găuri de doză exacte, la prima încercare.', subs: ['Carote diamantate pentru zidărie'] },
      { kind: 'tip', text: 'O șurubelniță VDE își pierde certificarea la prima fisură în izolație. Verifică mânerele înainte de fiecare lucrare la tablou.', by: TEAM },
      {
        kind: 'faq',
        items: [
          { q: 'Ce înseamnă VDE pe o șurubelniță sau un clește?', a: 'Scula este izolată și testată individual la 10 000 V, pentru lucru sub tensiune de până la 1 000 V c.a., conform standardului EN 60900. Se recunoaște după simbolul dublului triunghi și mențiunea 1000 V.' },
          { q: 'Ce carotă folosesc pentru doze?', a: 'Pentru dozele standard de Ø 60 mm se folosește o carotă de 68 mm. În beton, alege carote diamantate; în BCA și cărămidă merg și carotele cu dinți din carbură.' },
          { q: 'Ciocan rotopercutor sau mașină de găurit cu percuție?', a: 'Pentru șlițuri și găuri repetate în beton, ciocanul rotopercutor SDS-plus — lovește pneumatic, nu mecanic, și obosește mult mai puțin mâna. Mașina cu percuție e suficientă pentru găuri ocazionale în zidărie.' },
        ],
      },
    ],
  },

  // ── Instalatori ───────────────────────────────────────────────────────────
  {
    slug: 'scule-pentru-instalatori',
    type: 'meserie',
    profession: 'Instalatori',
    domain: 'Instalații sanitare și termice',
    headline: 'Îmbinări etanșe la prima probă de presiune.',
    excerpt: 'Chei pentru racorduri, filetare, găuri prin gresie și desfundare — trusa care te scutește de a doua vizită la același client.',
    metaTitle: 'Scule pentru instalatori — chei, tarozi, burghie pentru gresie | Zona Scule',
    metaDescription: 'Scule profesionale pentru instalații sanitare și termice: chei reglabile și fixe, tarozi și filiere, burghie pentru plăci ceramice, carote, desfundare și pompe.',
    sections: [
      {
        kind: 'intro',
        lead: 'Un instalator bun se cunoaște după calitatea îmbinărilor și după geanta pe care o poartă. Sculele potrivite nu sunt neapărat cele mai scumpe — sunt cele care te lasă să lucrezi rapid, curat și fără să revii la același client.',
        steps: [
          { title: 'Strângere fără urme', text: 'Chei reglabile cu fălci frezate și chei fixe care nu rotunjesc piulițele de alamă.' },
          { title: 'Treceri curate', text: 'Burghie diamantate pentru gresie și faianță, carote pentru treceri prin pereți și plăci.' },
          { title: 'Proba și mentenanța', text: 'Filetare, desfundare și pompe — pentru lucrările noi și pentru intervențiile de urgență.' },
        ],
      },
      { kind: 'carousel', title: 'Chei pentru țevi și racorduri', text: 'Reglabile, fixe, inelare și combinate — pentru racorduri, robineți și baterii.', subs: ['Chei reglabile', 'Chei fixe și inelare', 'Chei combinate'] },
      { kind: 'carousel', title: 'Găuri prin gresie și faianță', text: 'Burghie cu vârf diamantat și pentru plăci ceramice — fără ciobire, fără crăpături.', subs: ['Burghie pentru plăci ceramice', 'Burghie diamantate'] },
      { kind: 'image' },
      { kind: 'carousel', title: 'Filetare: tarozi și filiere', text: 'Pentru filete refăcute pe șantier și racorduri pe țeavă de oțel.', subs: ['Tarozi și filiere', 'Tarozi'] },
      { kind: 'carousel', title: 'Carote și ferăstraie de găurit', text: 'Treceri pentru țevi și scurgeri prin lemn, metal și plăci.', subs: ['Ferăstraie de găurit - Dispozitive de tăiat de bază', 'Carote din Carbură'] },
      { kind: 'tip', text: 'Pune teflonul și garniturile de rezervă într-un compartiment fix al trusei — le cauți mereu exact când ai mâinile ude.', by: TEAM },
      { kind: 'carousel', title: 'Desfundare și curățarea scurgerilor', text: 'Spirale și accesorii pentru canalizări și scurgeri înfundate.', subs: ['Accesorii curățarea canalizărilor și a scurgerilor'] },
      { kind: 'carousel', title: 'Pompe', text: 'Pentru golirea instalațiilor, a subsolurilor și pentru transferul de apă.', subs: ['Pompe', 'Pompe de apă'] },
      {
        kind: 'faq',
        items: [
          { q: 'Ce cheie reglabilă să aleg?', a: 'Una cu fălci frezate (nu turnate) și fără joc lateral — nu alunecă pe piulițe și nu le rotunjește. O cheie de 250 mm și una de 300 mm acoperă majoritatea situațiilor.' },
          { q: 'Cum găuresc gresia fără să o crăp?', a: 'Cu un burghiu cu vârf diamantat, fără percuție, la turație mică la început și cu răcire (apă sau pastă). Pentru găuri mari, carote diamantate.' },
        ],
      },
    ],
  },

  // ── Construcții ───────────────────────────────────────────────────────────
  {
    slug: 'scule-pentru-constructii',
    type: 'meserie',
    profession: 'Constructori',
    domain: 'Construcții și renovări',
    headline: 'Beton, zidărie și finisaje — la cotă și la termen.',
    excerpt: 'Demolare, găurire în beton, tăiere cu diamant, trasare și lucru la înălțime — sculele care țin ritmul unui șantier.',
    metaTitle: 'Scule pentru construcții — rotopercutoare, burghie SDS, discuri diamantate | Zona Scule',
    metaDescription: 'Scule profesionale pentru construcții și renovări: ciocane rotopercutoare și de demolare, burghie SDS, dălți, discuri diamantate, nivele laser, schele și gletiere.',
    sections: [
      {
        kind: 'intro',
        lead: 'Pe șantier, timpul pierdut costă mai mult decât orice sculă. Ciocanul potrivit, burghiul potrivit și o nivelă care nu minte fac diferența dintre o zi productivă și una de refăcut.',
        steps: [
          { title: 'Spargere și găurire', text: 'Ciocane rotopercutoare și de demolare, cu burghie și dălți SDS-plus și SDS-max.' },
          { title: 'Tăiere', text: 'Discuri diamantate pentru beton, zidărie și piatră — segmentate, turbo sau continue.' },
          { title: 'Trasare și finisaj', text: 'Nivele laser pentru cote, schele pentru acces și gletiere pentru suprafețe drepte.' },
        ],
      },
      { kind: 'image' },
      { kind: 'carousel', title: 'Ciocane rotopercutoare și de demolare', text: 'SDS-plus pentru găurire, SDS-max pentru spargere și demolări.', subs: ['Ciocane rotopercutoare', 'Găurire și spargere', 'Construcţii', 'Beton'] },
      { kind: 'carousel', title: 'Burghie SDS pentru beton și zidărie', text: 'Vârfuri din carbură, cu 2 sau 4 tăișuri, pentru găuri precise prin armături.', subs: ['Burghie pentru zidărie și beton', 'Burghie pentru beton', 'Burghie pentru zidărie'] },
      { kind: 'carousel', title: 'Dălți', text: 'Ascuțite, plate și late — pentru spargere, șlițuri și îndepărtat faianță.', subs: ['Dălți ascuțite', 'Dălți plate', 'Dălți late', 'Dăltuire', 'Alte dălți și accesorii'] },
      { kind: 'carousel', title: 'Discuri diamantate', text: 'Tăiere uscată sau umedă prin beton, zidărie, gresie și piatră.', subs: ['Discuri de tăiere diamantate'] },
      {
        kind: 'checklist',
        title: 'Esențialele de șantier',
        items: [
          { name: 'Ciocan rotopercutor SDS-plus', why: 'Găuri până la ~28 mm în beton, zi de zi.', q: 'ciocan rotopercutor' },
          { name: 'Set burghie SDS-plus', why: 'Diametrele uzuale 6–14 mm, cu 4 tăișuri.', q: 'burghie SDS' },
          { name: 'Disc diamantat Ø 230', why: 'Pentru polizorul mare: beton, zidărie, borduri.', q: 'disc diamantat 230' },
          { name: 'Nivelă laser', why: 'Cote de pardoseală, tavane și faianță.', q: 'nivela laser' },
          { name: 'Gletieră și spaclu', why: 'Pentru tencuieli și gleturi drepte.', q: 'gletiera' },
        ],
      },
      { kind: 'carousel', title: 'Nivele și lasere', text: 'Nivele cu bulă, lasere cu linii în cruce și instrumente de măsură.', subs: ['Nivele laser', 'Nivele laser cu linii în cruce', 'Nivele', 'Instrumente masura'] },
      { kind: 'carousel', title: 'Schele și scări', text: 'Acces sigur la înălțime, pentru interior și exterior.', subs: ['Schele si scari'] },
      { kind: 'carousel', title: 'Gletiere, spacluri și mistrii', text: 'Pentru tencuieli, gleturi și finisaje.', subs: ['Gletiere și spacluri', 'Spatule - Mistrii - Mașini de șlefuit manuale'] },
      {
        kind: 'faq',
        items: [
          { q: 'SDS-plus sau SDS-max?', a: 'SDS-plus pentru găuri de până la ~30 mm și ciocane de 2–4 kg; SDS-max pentru găuri mari, carote și demolări cu ciocane de peste 5 kg. Prinderile nu sunt compatibile între ele.' },
          { q: 'Ce disc diamantat pentru beton armat?', a: 'Un disc segmentat sau turbo, cu liant pentru beton dur, marcat pentru beton armat. Discurile continue sunt pentru gresie și faianță, nu pentru beton.' },
        ],
      },
    ],
  },

  // ── Tâmplărie ─────────────────────────────────────────────────────────────
  {
    slug: 'scule-pentru-tamplarie',
    type: 'meserie',
    profession: 'Tâmplari',
    domain: 'Tâmplărie și prelucrarea lemnului',
    headline: 'Tăieturi curate, îmbinări strânse, suprafețe fine.',
    excerpt: 'Pânze, freze, burghie și abrazive pentru lemn masiv, PAL și MDF — de la debitare la finisaj.',
    metaTitle: 'Scule pentru tâmplărie — pânze, freze, burghie pentru lemn | Zona Scule',
    metaDescription: 'Scule și accesorii pentru prelucrarea lemnului: mașini de șlefuit, pânze pentru ferăstrău circular și pendular, freze, burghie pentru lemn și abrazive.',
    sections: [
      {
        kind: 'intro',
        lead: 'În tâmplărie, calitatea se vede în muchii: o pânză tocită rupe fibra, o freză ieftină arde lemnul, un abraziv greșit lasă zgârieturi sub lac. Accesoriul potrivit contează cât mașina.',
        steps: [
          { title: 'Debitare', text: 'Pânze circulare cu numărul de dinți potrivit — puțini pentru spintecare, mulți pentru tăieturi fine în PAL.' },
          { title: 'Profilare și îmbinări', text: 'Freze pentru muchii, lambă și uluc, burghie cu vârf de centrare pentru dibluri.' },
          { title: 'Finisaj', text: 'Șlefuire în trepte de granulație, cu discuri și benzi potrivite mașinii.' },
        ],
      },
      { kind: 'carousel', title: 'Pânze de ferăstrău circular', text: 'Pentru spintecare, retezare și tăieturi fine în plăci melaminate.', subs: ['Pânze de ferăstrău circular', 'Pânze de ferăstrău circular pentru lemn'] },
      { kind: 'carousel', title: 'Pânze pentru pendular și sabie', text: 'Tăieturi curbe, decupaje și demontări.', subs: ['Pânze de ferăstrău vertical', 'Pânze de ferăstrău vertical pentru lemn', 'Pânze de ferăstrău sabie'] },
      { kind: 'image' },
      { kind: 'carousel', title: 'Freze pentru lemn', text: 'Drepte, pentru muchii, pentru lambă și seturi complete.', subs: ['Freze drepte', 'Freze pentru realizarea muchiilor', 'Freze de profilat canturi pentru frezare coplanară la nivel', 'Freze pentru lambă', 'Seturi de freze de profilat canturi'] },
      { kind: 'carousel', title: 'Burghie pentru lemn', text: 'Cu vârf de centrare, spirale lungi și burghie Forstner.', subs: ['Burghie pentru lemn'] },
      { kind: 'tip', text: 'Pentru PAL melaminat, o pânză cu dinți trapezoidali-plați (TF) și peste 48 de dinți pe Ø 216 elimină aproape complet ciupirea muchiei.', by: TEAM },
      { kind: 'carousel', title: 'Șlefuire', text: 'Foi, discuri și benzi abrazive, plus talpa potrivită mașinii.', subs: ['Foi abrazive', 'Discuri de șlefuit', 'Benzi de șlefuit', 'Disc-suport pentru șlefuitor orbital'] },
      { kind: 'carousel', title: 'Mașini pentru lemn', text: 'Mașini de șlefuit cu excentric și scule dedicate prelucrării lemnului.', subs: ['Prelucrarea lemnului', 'Şlefuitoare cu excentric', 'Șlefuire'] },
      {
        kind: 'faq',
        items: [
          { q: 'Câți dinți trebuie să aibă pânza circulară?', a: 'Pe un disc de Ø 216–254 mm: 24–40 de dinți pentru spintecare rapidă în lemn masiv, 48–80 pentru tăieturi fine transversale și plăci melaminate.' },
          { q: 'În ce ordine folosesc granulațiile la șlefuit?', a: 'Pornește de la granulația care scoate defectul (de obicei 80–120) și urcă fără să sari trepte mari: 120 → 150 → 180 → 240 înainte de lac.' },
        ],
      },
    ],
  },

  // ── Prelucrarea metalelor ─────────────────────────────────────────────────
  {
    slug: 'scule-pentru-prelucrarea-metalelor',
    type: 'meserie',
    profession: 'Lăcătuși',
    domain: 'Prelucrarea metalelor',
    headline: 'Tăiere, polizare și găurire în oțel și inox.',
    excerpt: 'Polizoare, discuri de tăiere și lamelare, burghie pentru metal, freze din carbură, pile și perii industriale.',
    metaTitle: 'Scule pentru prelucrarea metalelor — discuri, burghie, freze | Zona Scule',
    metaDescription: 'Scule și abrazive pentru lăcătușerie și prelucrarea metalelor: polizoare, discuri de tăiere și lamelare, burghie pentru metal, freze din carbură, pile, perii și menghine.',
    sections: [
      {
        kind: 'intro',
        lead: 'Metalul iartă puțin: un disc nepotrivit se încinge, un burghiu la turație greșită se tocește în câteva găuri. Abrazivul și geometria potrivite fac lucrul mai rapid, mai curat și mai sigur.',
        steps: [
          { title: 'Tăiere și degroșare', text: 'Discuri subțiri de tăiere și discuri de degroșare pentru polizorul unghiular.' },
          { title: 'Găurire și filetare', text: 'Burghie HSS și HSS-Co, burghie în trepte pentru tablă, tarozi pentru filete.' },
          { title: 'Finisare', text: 'Discuri lamelare, freze din carbură, pile și perii pentru muchii și suduri.' },
        ],
      },
      { kind: 'image' },
      { kind: 'carousel', title: 'Polizoare', text: 'Unghiulare, drepte și pneumatice.', subs: ['Polizoare și mașini de lustruit', 'Polizoare unghiulare mici', 'Polizoare Pneumatice'] },
      { kind: 'carousel', title: 'Discuri de tăiere și degroșare', text: 'Subțiri pentru tăieri rapide, groase pentru degroșare, lamelare pentru finisaj.', subs: ['Discuri de tăiere', 'Discuri de degroșare', 'Discuri Lamelare', 'Discuri evantai'] },
      { kind: 'carousel', title: 'Burghie pentru metal', text: 'HSS, HSS-Co și în trepte — pentru oțel, inox și tablă.', subs: ['Burghie pentru metal', 'Burghie Elicoidale', 'Seturi de burghie pentru metal', 'Burghie Treptate'] },
      { kind: 'tip', text: 'La inox, lucrează la turație mică și presiune constantă, cu răcire. Un burghiu care „fluieră” pe inox s-a încins deja — și își pierde tăișul.', by: TEAM },
      { kind: 'carousel', title: 'Freze din carbură', text: 'Pentru debavurare, ajustaj și prelucrarea sudurilor.', subs: ['Freze din Carbură'] },
      { kind: 'carousel', title: 'Pile', text: 'Plate, semirotunde, rotunde și ac — pentru ajustaj de precizie.', subs: ['Pile', 'Pile Plate', 'Pile Semirounde', 'Pile Rotunde', 'Pile Ac'] },
      { kind: 'carousel', title: 'Perii industriale', text: 'Pentru curățarea sudurilor, a ruginii și pregătirea suprafețelor.', subs: ['Perii Industriale', 'Perii de sârmă pentru polizoare unghiulare și mașini de găurit/înșurubat rotative'] },
      { kind: 'carousel', title: 'Menghine', text: 'Prindere sigură pentru tăiere, pilire și găurire.', subs: ['Menghine'] },
      {
        kind: 'faq',
        items: [
          { q: 'Ce disc folosesc pentru inox?', a: 'Un disc marcat INOX, fără fier, sulf și clor — altfel suprafața ruginește ulterior. Pentru tăieri rapide, discuri subțiri de 1 mm.' },
          { q: 'Disc lamelar sau disc de degroșare?', a: 'Discul de degroșare scoate material rapid, dar lasă zgârieturi adânci; discul lamelar degroșează mai blând și finisează în aceeași trecere. Pentru suduri vizibile, lamelar.' },
        ],
      },
    ],
  },

  // ── Curățenie profesională ────────────────────────────────────────────────
  {
    slug: 'echipamente-curatenie-profesionala',
    type: 'meserie',
    profession: 'Curățenie',
    domain: 'Curățenie profesională',
    headline: 'Suprafețe mari, timp puțin, rezultate care se văd.',
    excerpt: 'Aspiratoare umed-uscat, aparate de spălat cu presiune, mașini de spălat pardoseli, măturătoare și detergenți pentru firme de curățenie și facility management.',
    metaTitle: 'Echipamente de curățenie profesională — aspiratoare, aparate cu presiune | Zona Scule',
    metaDescription: 'Echipamente profesionale de curățenie: aspiratoare umed-uscat și industriale, aparate de spălat cu presiune, mașini de spălat-uscat pardoseli, măturătoare, aparate cu abur și detergenți.',
    sections: [
      {
        kind: 'intro',
        lead: 'În curățenia profesională, echipamentul decide câți metri pătrați faci într-o tură. O mașină potrivită suprafeței și murdăriei înseamnă mai puțină muncă manuală, mai puțină apă și un rezultat constant.',
        steps: [
          { title: 'Aspirare', text: 'Aspiratoare umed-uscat pentru șantiere și ateliere, industriale pentru praf fin și volume mari.' },
          { title: 'Spălare', text: 'Aparate cu presiune pentru exterior și mașini de spălat-uscat pentru pardoseli interioare.' },
          { title: 'Întreținere', text: 'Măturătoare, aparate cu abur și detergenți potriviți fiecărei suprafețe.' },
        ],
      },
      { kind: 'carousel', title: 'Aspiratoare umed-uscat și industriale', text: 'De la ateliere și șantiere la hale de producție.', subs: ['Aspiratoare umed-uscat (NT)', 'Aspiratoare uscate (T)', 'Aspiratoare industriale'] },
      { kind: 'image' },
      { kind: 'carousel', title: 'Aparate de spălat cu presiune', text: 'Cu apă rece pentru utilizare generală, cu apă caldă pentru grăsimi și uleiuri.', subs: ['Apă rece', 'Apă caldă și abur'] },
      { kind: 'carousel', title: 'Mașini de spălat pardoseli', text: 'Spălat-uscat într-o singură trecere, monodiscuri pentru tratamente.', subs: ['Mașini de spălat-uscat', 'Mașini de frecat & monodisc'] },
      { kind: 'tip', text: 'Pentru pardoseli mari, o mașină de spălat-uscat cu lățime de lucru de 50 cm face în 20 de minute cât o echipă cu mopuri într-o oră — și lasă suprafața uscată imediat.', by: TEAM },
      { kind: 'carousel', title: 'Măturătoare și aparate cu abur', text: 'Pentru curți, parcări, hale — și igienizare fără chimicale.', subs: ['Măturătoare', 'Aparate cu abur'] },
      { kind: 'carousel', title: 'Detergenți și consumabile', text: 'Detergenți industriali, discuri, paduri și perii pentru mașini.', subs: ['Detergenți industriali', 'Discuri, paduri & perii'] },
      {
        kind: 'faq',
        items: [
          { q: 'Aspirator umed-uscat sau aspirator industrial?', a: 'Umed-uscat pentru lichide, murdărie grosieră și praf obișnuit; industrial (cu clasă de filtrare M sau H) pentru praf fin, periculos sau pentru funcționare continuă.' },
          { q: 'Apă rece sau apă caldă la aparatul cu presiune?', a: 'Apa rece acoperă majoritatea murdăriei; apa caldă (sau aburul) dizolvă mult mai repede grăsimile și uleiurile — pentru service-uri auto, industrie alimentară și ateliere.' },
        ],
      },
    ],
  },
]

export const SOLUTIONS: Solution[] = [...BASE_SOLUTIONS, ...MORE_SOLUTIONS, ...PRODUCT_SOLUTIONS]

export const getSolution = (slug: string) => SOLUTIONS.find(s => s.slug === slug) ?? null
