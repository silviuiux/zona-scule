export type Profession = {
  id: string
  label: string
}

export const PROFESSIONS: Profession[] = [
  { id: 'instalatori',     label: 'Instalatori' },
  { id: 'electricieni',    label: 'Electricieni' },
  { id: 'gradina',         label: 'Grădinărit' },
  { id: 'spalat-presiune', label: 'Spălat cu presiune' },
]

export type ProductFilter = {
  brandName?:       string
  categoryText?:    string
  subcategoryText?: string
  search?:          string
}

export type Article = {
  slug:          string
  profession:    string
  title:         string
  excerpt:       string
  coverGradient: string
  body:          string
  productFilter: ProductFilter
  publishedAt:   string
  readMinutes:   number
  featured?:     boolean
}

export const ARTICLES: Article[] = [
  {
    slug:          'trusa-ideala-instalatori',
    profession:    'instalatori',
    featured:      true,
    title:         'Trusa ideală pentru instalatori: ce nu poate lipsi',
    excerpt:       'De la chei reglabile la detectoare de scurgeri — descoperă uneltele care fac diferența între un job bun și unul cu adevărat profesionist.',
    coverGradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #0ea5e9 100%)',
    readMinutes:   6,
    publishedAt:   '2026-06-10',
    productFilter: { categoryText: 'Instalații' },
    body: `
<p>Un instalator bun se cunoaște după calitatea lucrării, dar și după geanta pe care o poartă. Uneltele potrivite nu înseamnă neapărat cele mai scumpe — ci pe cele care te lasă să lucrezi rapid, curat și fără să revii a doua oară la același client.</p>

<h2>Cheia reglabilă — clasicul de neînlocuit</h2>
<p>Indiferent câte chei fixe ai în trusă, o cheie reglabilă de calitate rămâne indispensabilă. Caută modele cu bacuri frezate (nu turnate) care nu alunecă pe piulițe și cu mecanism de strângere rapid. O cheie de 250 mm și una de 300 mm acoperă 90% din situații.</p>
<p>Sfat: evită cheile ieftine cu joc lateral mare — distrug piulițele și îți obosesc mâna. O cheie Bahco sau Gedore ține 10–15 ani cu întreținere minimă.</p>

<h2>Cleștele de presare și de țeavă</h2>
<p>Pentru instalații cu țevi de cupru, PPR sau multicouche, un clește de presare de bună calitate este investiția care se amortizează la primul șantier. Modelele cu cap interschimbabil sunt mai versatile și economisesc spațiu în geantă.</p>
<p>Cleștii cu role pentru țevi (tip Rothenberger sau Ridgid) sunt obligatorii pentru lucrările la coloane sau țevi de diametru mare. Fălcile cu role protejează suprafața țevii și îți dau un moment de torsiune mai bun decât modelele clasice.</p>

<h2>Tăietorul de țevi — curățenie la fiecare tăietură</h2>
<p>Un tăietor de țevi de cupru sau multicouche face tăieturi drepte și fără bavuri, fără deformare. Față de fierăstrău, elimină bavurile și îți dă un rost net pentru fitinguri. Ține cont de diametrul maxim al modelului — un tăietor până la 35 mm acoperă instalațiile rezidențiale obișnuite.</p>
<p>Dacă lucrezi frecvent cu țevi PPR, un aparat de sudură cu cap teflonat de bună calitate face diferența între îmbinări care țin decenii și cele care cedează la primul test de presiune.</p>

<h2>Detectorul de scurgeri și manometrul</h2>
<p>Testul de presiune este obligatoriu după orice instalație. Un manometru cu racord rapid (0–6 bar) îți permite să verifici etanșeitatea înainte de a acoperi cu gresie sau rigips. Nu lăsa niciodată un șantier fără acest test.</p>
<p>Detectoarele de umiditate electronice sunt un plus pentru diagnosticul rapid în pereți sau sub parchet — economisesc ore de desfacere inutilă.</p>

<h2>Sfaturi rapide de organizare a trusei</h2>
<ul>
  <li>Organizează uneltele pe frecvență de folosire, nu pe mărime — ce iei de 10 ori pe zi stă la mână.</li>
  <li>O trusă cu buzunare exterioare transparente îți arată dintr-o privire ce ai și ce lipsește.</li>
  <li>Teflon, clești de etanșare și fitinguri de urgență merită un compartiment fix — le cauți mereu când ai mâinile ude.</li>
</ul>
<p>Calitatea uneltelor se reflectă în calitatea lucrării. Un instalator care investește în trusa sa câștigă în viteză, precizie și reputație.</p>
`,
  },

  {
    slug:          'uneltele-electricianului-profesionist',
    profession:    'electricieni',
    featured:      true,
    title:         'Kit-ul esențial al electricianului modern',
    excerpt:       'Cleșți, multimetre, testere de tensiune — ce trebuie să ai la tine pe orice șantier și de ce contează calitatea fiecărei unelte.',
    coverGradient: 'linear-gradient(135deg, #78350f 0%, #d97706 60%, #fbbf24 100%)',
    readMinutes:   5,
    publishedAt:   '2026-06-05',
    productFilter: { categoryText: 'Electronice și electricitate' },
    body: `
<p>Electricianul modern lucrează în condiții tot mai variate — de la renovări rezidențiale la tablouri industriale complexe. Uneltele pe care le alegi îți influențează nu doar viteza de lucru, ci și siguranța ta și a beneficiarului.</p>

<h2>Multimetrul — ochiul tău electronic</h2>
<p>Un multimetrul bun este piesa centrală a oricărei truse electrice. Caută modele cu categoria de siguranță CAT III 600V sau CAT IV 300V — nu face economii aici. Modele precum Fluke 117, Brymen BM235 sau UNI-T UT61E oferă precizie, robustețe și protecție la supratensiuni.</p>
<p>Funcțiile minime utile: tensiune AC/DC, rezistență, continuitate audibilă, diodă. Funcțiile bonus valoroase: capacitanță, frecvență, True RMS (indispensabil pentru sarcinile nesinusoidale).</p>

<h2>Testerul de tensiune fără contact</h2>
<p>Înainte de orice intervenție, verifici că nu e tensiune. Un tester non-contact (tip Fluke 1AC-A1 sau Klein Tools NCVT) se folosește cu o singură mână, nu necesită contact direct și te avertizează auditiv și vizual. Este probabil unelta pe care o folosești cel mai des pe șantier.</p>
<p>Nu confunda testerele ieftine cu LED fără specificații cu modelele calibrate — diferența poate fi viața ta.</p>

<h2>Cleșți de sertizat și dezizolat</h2>
<p>Îmbinările de calitate se fac cu cleșți corespunzători. Un clește de dezizolat automat (tip Jokari, Knipex) îți economisește timp și nu deteriorează conductorul. Cleștii de sertizat pentru papuci și mufe trebuie să aibă matriță potrivită pentru secțiunile cu care lucrezi.</p>

<h2>Trusa de șurubelnițe izolate 1000V</h2>
<p>Șurubelnițele izolate VDE (1000V) nu sunt un lux — sunt obligatorii pentru orice intervenție în tablouri electrice sub tensiune. Verifică că poartă marcajul VDE, nu doar că sunt acoperite cu plastic.</p>
<p>Un set complet include cel puțin: PH0, PH1, PH2, PZ2, șurubelniță plată mică și medie, și una tip Torx dacă lucrezi cu echipamente moderne.</p>

<h2>Organizarea trusei electrice</h2>
<ul>
  <li>Separă uneltele izolate (VDE) de cele neizolate — confuzia în grabă poate fi fatală.</li>
  <li>Consumabilele (bride, mufe, papuci, bandă izolatoare) merită o pungă separată sortată pe tip.</li>
  <li>Ține baterii de rezervă AAA/AA pentru testere — tocmai când ai mai mare nevoie, se descarcă.</li>
</ul>
`,
  },

  {
    slug:          'unelte-gradinarit-profesional',
    profession:    'gradina',
    featured:      false,
    title:         'Grădina profesională: unelte care economisesc timp',
    excerpt:       'Fie că lucrezi în amenajare peisagistică sau întreținere, aceste unelte îți reduc efortul fizic și îți cresc productivitatea cu cel puțin 30%.',
    coverGradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #86efac 100%)',
    readMinutes:   5,
    publishedAt:   '2026-06-01',
    productFilter: { categoryText: 'Grădinărit' },
    body: `
<p>Profesioniștii în grădinărit și amenajare peisagistică știu că uneltele proaste costă mai mult pe termen lung — prin oboseală, timp pierdut și rezultate slabe. Iată ce merită să ai în dotare dacă lucrezi profesional cu grădini, parcuri sau terenuri.</p>

<h2>Foarfecele de grădinărit — precizie la fiecare tăiere</h2>
<p>Un foarfece de tăiat ramuri bun (secătoare) face tăieturi nete care se cicatrizează rapid și nu infectează planta. Caută modele cu lame din oțel inoxidabil sau titan, cu mecanism bypass (nu cu nicovală pentru ramuri vii) și cu mâner ergonomic anti-oboseală.</p>
<p>Felco și Bahco sunt standardele industriei — scumpe, dar se ascute și se repară în loc să fie aruncate. Pe termen lung, sunt mai economice decât modelele ieftine înlocuite anual.</p>

<h2>Sistemele modulare cu cap interschimbabil</h2>
<p>Un sistem modular (mâner + cap interschimbabil) reduce spațiul de depozitare și costul pe termen lung. Fiskars, Gardena și Wolf-Garten au sisteme compatibile cu zeci de capete: greble, sape, răzuitoare, plivitoare — totul pe același mâner.</p>
<p>Mânerele din fibră de sticlă sau aluminiu anodizat sunt mai ușoare și mai rezistente decât lemnul, fără să obosească spatele la folosire îndelungată.</p>

<h2>Mașina de tuns gazon — alegerea face diferența</h2>
<p>Pentru suprafețe profesionale (> 500 mp), o mașină de tuns cu tracțiune proprie economisește efort considerabil. Roboții de tuns gazon sunt soluția pentru contractele de întreținere recurentă — investiția inițială se amortizează în 1–2 sezoane față de manopera repetată.</p>

<h2>Atomizorul și pompa de stropit</h2>
<p>Tratamentele fitosanitare și fertilizarea foliară necesită o distribuire uniformă. O pompă de stropit cu rezervor de 15–20L cu pompare de presiune sau electrică îți permite să acoperi suprafețe mari fără oboseală.</p>

<h2>Protecție și ergonomie</h2>
<ul>
  <li>Mănuși de grădinărit rezistente la spini — calitatea contează pentru muncă zilnică.</li>
  <li>Genunchiere cu spumă EVA dacă lucrezi mult pe sol — spatele îți va mulțumi peste 10 ani.</li>
  <li>Ochelari de protecție pentru toaletare și tundere cu utilaje — deseori ignorați, mereu necesari.</li>
</ul>
<p>O dotare profesională adecvată îți permite să preiei mai mulți clienți fără să pierzi din calitate.</p>
`,
  },

  {
    slug:          'ghid-spalat-presiune-profesionisti',
    profession:    'spalat-presiune',
    featured:      true,
    title:         'Ghid complet: spălat cu presiune pentru profesioniști',
    excerpt:       'Cum alegi aparatul potrivit, ce accesorii sunt indispensabile și de ce presiunea nu e singurul criteriu care contează.',
    coverGradient: 'linear-gradient(135deg, #164e63 0%, #0891b2 60%, #67e8f9 100%)',
    readMinutes:   7,
    publishedAt:   '2026-05-28',
    productFilter: { brandName: 'Kärcher' },
    body: `
<p>Aparatele de spălat cu presiune sunt printre cele mai versatile unelte de curățenie pentru profesioniști — de la firme de curățenie la constructori, fermieri și administratori de proprietăți. Alegerea greșită înseamnă fie sub-performanță, fie un aparat care se strică repede sub utilizare intensă.</p>

<h2>Presiunea și debitul — ce contează mai mult</h2>
<p>Cel mai comun mit: presiunea mai mare înseamnă curățare mai bună. În realitate, <strong>debitul (l/h)</strong> este la fel de important ca presiunea (bar). Un aparat cu 150 bar și 500 l/h curăță mai bine și mai rapid decât unul cu 200 bar și 300 l/h, pentru suprafețe mari.</p>
<p>Regula practică: presiunea înaltă (> 150 bar) pentru murdărie aderentă (uleiuri, vopsea, mușchi pe piatră), debit mare pentru suprafețe extinse.</p>

<h2>Aparat de apă rece vs. apă caldă</h2>
<p>Aparatele de apă caldă (60–155°C) dezgresează de 3–5 ori mai eficient decât cele cu apă rece, fără detergent suplimentar. Sunt ideale pentru curățarea utilajelor agricole, dezinfecție în ferme sau curățarea motorinei și bitumului.</p>
<p>Costul inițial mai mare se amortizează rapid prin economie la detergenți și timp mai scurt per job.</p>

<h2>Alegerea pompei — inima aparatului</h2>
<p>Pompele cu piston triplu din alamă sau ceramică sunt standardul pentru uz profesional. Evită pompele cu piston din plastic sau cu cap de aluminiu neprotejat — se uzează rapid cu apă dură sau în utilizare intensivă.</p>
<p>Kärcher HD și HDS, Nilfisk Poseidon și Kranzle sunt mărci cu pompe robuste gândite pentru 500–1000 ore anual. Aparatele consumer (K2–K5) sunt proiectate pentru 50–100 ore/an — diferența se simte după primul sezon de utilizare intensă.</p>

<h2>Accesorii indispensabile pentru profesioniști</h2>
<p><strong>Lanca rotativă (turbobuse):</strong> Creează un jet rotativ de înaltă presiune care curăță de 3–4 ori mai rapid decât buseta standard. Indispensabilă pentru terase, alei, curți.</p>
<p><strong>Suprafața de curățare (disc):</strong> Pentru pardoseli orizontale extinse — distribuie presiunea uniform, elimină stropii și reduce oboseala.</p>
<p><strong>Furtunul de înaltă presiune > 10m:</strong> Mobilitate pe șantier fără să muți aparatul. Furtunuri cu armare dublu-spiralată rezistă la presiune și la răsucire.</p>

<h2>Întreținerea care îți prelungește aparatul cu ani</h2>
<ul>
  <li>Golește pompa de apă după folosire pe temperaturi sub 0°C — înghețul distruge pompele.</li>
  <li>Curăță regulat filtrul de admisie — presiunea scăzută brusc este primul simptom al unui filtru înfundat.</li>
  <li>Folosește ulei de pompă compatibil la intervalele recomandate.</li>
  <li>Depozitează furtunele încolăcite larg, fără noduri — microfisurile apar la încolăcire strânsă.</li>
</ul>
<p>Un aparat ales corect și întreținut regulat poate dura 10–15 ani în utilizare intensivă.</p>
`,
  },

  {
    slug:          'scule-acumulator-vs-fir',
    profession:    'electricieni',
    featured:      false,
    title:         'Scule cu acumulator vs. cu fir: când alegi ce',
    excerpt:       'Nu mai există un câștigător universal — depinde de job. Iată cum să decizi corect ce pui în geantă înainte de fiecare șantier.',
    coverGradient: 'linear-gradient(135deg, #1c1917 0%, #78350f 50%, #c2410c 100%)',
    readMinutes:   4,
    publishedAt:   '2026-05-20',
    productFilter: { search: 'acumulator bormasina' },
    body: `
<p>Acum zece ani răspunsul era simplu: sculele cu fir pentru putere, cele cu acumulator pentru mobilitate. Astăzi, acumulatorii de 18–40V cu celule Li-Ion de nouă generație au schimbat echilibrul — dar nu l-au eliminat.</p>

<h2>Când acumulatorul câștigă clar</h2>
<p>Munca în spații fără prize, pe schele, la înălțime sau la distanță de tabloul electric face din sculele cu acumulator alegerea evidentă. Libertatea de mișcare reduce semnificativ timpul de setup și riscul de accidentare prin cabluri.</p>
<p>Sistemele de acumulatori compatibili (Bosch 18V, Milwaukee M18, DeWalt 20V MAX) îți permit să cumperi un singur tip de baterie pentru 15–20 scule diferite — fierăstrău, bormaşină, șurubelnița, lanternă, radio de șantier.</p>

<h2>Când firul rămâne superior</h2>
<p>Pentru utilizare intensivă și continuă (tăierea unui număr mare de profile, frezare continuă, polizor unghiular în regim greu), sculele cu fir oferă putere constantă fără pauze de încărcare. La putere egală, o sculă cu fir este mai ușoară și mai ieftină decât echivalentul cu acumulator.</p>

<h2>Platforma de acumulatori — decizia cu cel mai mare impact</h2>
<p>Dacă începi sau îți reînnoiești dotarea, alegerea platformei de acumulatori este mai importantă decât alegerea primei scule. Odată intrat în ecosistemul unui brand, migrarea costă dublu.</p>

<h2>Concluzie practică</h2>
<p>Un profesionist modern are ambele categorii în dotare. Regula simplă: dacă faci același lucru mai mult de 2 ore continuu, ia fir. Dacă te miști frecvent sau lucrezi fără acces la prize, ia acumulator. Dublul nu e redundanță — e flexibilitate.</p>
`,
  },
]

export function getArticles(professionId?: string): Article[] {
  if (!professionId) return ARTICLES
  return ARTICLES.filter(a => a.profession === professionId)
}

export function getArticleBySlug(slug: string): Article | null {
  return ARTICLES.find(a => a.slug === slug) ?? null
}
