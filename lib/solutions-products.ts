import type { Solution } from './solutions'

// Product stories: one catalog product presented in depth, on the same
// template. Spec values are copied from the manufacturer's data sheet as
// stored in the catalog (products.specs); image, short description, key
// features and application photos are read live from the product.

export const PRODUCT_SOLUTIONS: Solution[] = [
  {
    slug: 'bosch-gds-18v-1050-h-prezentare',
    type: 'produs',
    product: 'bosch-4059952564654',
    profession: 'GDS 18V-1050 H',
    title: 'Bosch GDS 18V-1050 H Professional: prezentare detaliată',
    domain: 'Produs · Mașină de înșurubat cu impact 3/4″',
    headline: '1 050 Nm la strângere, 1 700 Nm la desfacere — pe acumulator.',
    excerpt: 'Mașina de înșurubat cu impact de 3/4″ cu motor BITURBO fără perii, pentru structuri metalice, montaj de țevi, camioane și construcții din lemn.',
    metaTitle: 'Bosch GDS 18V-1050 H Professional — specificații și prezentare | Zona Scule',
    metaDescription: 'Bosch GDS 18V-1050 H Professional: cuplu de 1 050 Nm, cuplu de desfacere 1 700 Nm, 3 trepte, prindere 3/4″, șuruburi M14–M24. Specificații complete, puncte forte și accesorii.',
    heroStats: [['1 050 Nm', 'cuplu de strângere'], ['1 700 Nm', 'cuplu de desfacere'], ['2,9 kg', 'fără acumulator']],
    sections: [
      { kind: 'product' },
      {
        kind: 'intro',
        lead: 'Pentru îmbinările mari — șuruburi M14–M24 în structuri de oțel, flanșe, roți de camion sau grinzi de lemn — o mașină de impact de 3/4″ face în câteva secunde ce o cheie cu braț lung face în minute. GDS 18V-1050 H aduce asta pe platforma de 18 V, fără cablu și fără compresor.',
        steps: [
          { title: 'BITURBO fără perii', text: 'Motorul și mecanismul de percuție livrează puterea unei scule cu fir când sunt alimentate de acumulatori ProCORE18V.' },
          { title: 'Trei trepte', text: 'Până la 350, 750 și 1 050 Nm — alegi forța potrivită îmbinării, fără să rupi șurubul.' },
          { title: 'Făcută pentru șantier', text: 'Lumină LED, clemă de agățare pe scară, prindere 3/4″ cu inel de fricțiune și gaură de trecere.' },
        ],
      },
      { kind: 'gallery', title: 'În lucru' },
      {
        kind: 'specs',
        title: 'Specificații tehnice',
        groups: [
          { name: 'Performanță', rows: [
            ['Tensiune acumulator', '18 V'],
            ['Prindere', 'Pătrat 3/4″'],
            ['Cuplu maxim', '1 050 Nm'],
            ['Cuplu de desfacere maxim', '1 700 Nm'],
            ['Domeniu șuruburi', 'M14 – M24'],
            ['Trepte de cuplu', '3'],
          ] },
          { name: 'Trepte', rows: [
            ['Treapta 1', '0–350 Nm · 0–800 rot/min · 0–1 600 percuții/min'],
            ['Treapta 2', '0–750 Nm · 0–1 200 rot/min · 0–2 400 percuții/min'],
            ['Treapta 3', '0–1 050 Nm · 0–1 750 rot/min · 0–2 600 percuții/min'],
          ] },
          { name: 'Dimensiuni și ergonomie', rows: [
            ['Greutate fără acumulator', '2,9 kg'],
            ['Dimensiuni (L × l × Î)', '222 × 86 × 240 mm'],
            ['Presiune / putere sonoră', '95 / 106 dB(A)'],
            ['Vibrații (strângere la cuplu maxim)', '13,5 m/s²'],
          ] },
        ],
        note: 'Valori din fișa tehnică a producătorului.',
      },
      {
        kind: 'proscons',
        pros: [
          'Cuplu de 1 050 Nm și 1 700 Nm la desfacere — suficient pentru șuruburi gripate de structură.',
          'Trei trepte de cuplu: nu rupi șuruburile mici și nu strângi excesiv.',
          'Pe platforma Bosch 18 V, compatibilă cu alianța AMPShare.',
          'Clemă pentru scară și lumină LED — util la montaj la înălțime.',
        ],
        cons: [
          'Pentru putere maximă cere acumulatori ProCORE18V de cel puțin 5,5 Ah.',
          '2,9 kg fără acumulator — obositoare la lucru deasupra capului.',
          '95 dB(A) și vibrații mari la cuplu maxim: antifoane și mănuși obligatorii.',
          'Prinderea de 3/4″ cere tubulare de impact de 3/4″ (sau adaptoare).',
        ],
      },
      { kind: 'carousel', title: 'Chei tubulare', text: 'Tubulare de impact pentru prinderea de 3/4″ și adaptoare.', subs: ['Chei tubulare'] },
      { kind: 'carousel', title: 'Acumulatori și încărcătoare', text: 'ProCORE18V de mare capacitate pentru cuplu maxim.', subs: ['Baterii & încărcătoare', 'Acumulatori'] },
      {
        kind: 'verdict',
        text: 'O mașină de impact pentru îmbinări mari, care înlocuiește cheia cu braț lung și, pe multe șantiere, pneumaticul. Merită acolo unde se strâng și se desfac zilnic șuruburi M16–M24; pentru montaj ușor, o mașină de 1/2″ e mai potrivită.',
        forWho: ['Construcții metalice', 'Montaj conducte și instalații industriale', 'Service de camioane și utilaje', 'Construcții grele din lemn'],
      },
      { kind: 'carousel', title: 'Alte mașini de înșurubat cu impact', text: 'Pentru prinderi de 1/4″ și 1/2″ și cupluri mai mici.', subs: ['Șurubelnițe cu impact cu acumulator'] },
    ],
  },
  {
    slug: 'bosch-gws-18v-15-p-prezentare',
    type: 'produs',
    product: 'bosch-4059952609980',
    profession: 'GWS 18V-15 P',
    title: 'Bosch GWS 18V-15 P Professional: prezentare detaliată',
    domain: 'Produs · Polizor unghiular 125 mm',
    headline: 'Puterea unui polizor de 1 500 W, fără cablu — și oprire imediată la eliberare.',
    excerpt: 'Polizorul unghiular de 125 mm cu motor BITURBO fără perii, comutator PROtection, frână și KickBack Control — pentru tăiere și șlefuire în metal și construcții.',
    metaTitle: 'Bosch GWS 18V-15 P Professional — specificații și prezentare | Zona Scule',
    metaDescription: 'Bosch GWS 18V-15 P Professional: polizor unghiular 125 mm pe 18 V, echivalent 1 500 W, 9 800 rot/min, comutator PROtection, frână, KickBack și Drop Control. Specificații și accesorii.',
    heroStats: [['125 mm', 'diametru disc'], ['9 800', 'rot/min'], ['2,2 kg', 'fără acumulator']],
    sections: [
      { kind: 'product' },
      {
        kind: 'intro',
        lead: 'Polizorul unghiular e scula care se folosește cel mai des — și care produce cele mai multe accidente. GWS 18V-15 P combină puterea unui polizor cu fir de 1 500 W cu un set complet de funcții de siguranță: se oprește în momentul în care dai drumul comutatorului și frânează discul.',
        steps: [
          { title: 'BITURBO', text: 'Motor fără perii care, cu acumulatori ProCORE18V, livrează performanța unui polizor de 1 500 W cu fir.' },
          { title: 'PROtection switch', text: 'Comutator de tip „om mort”: scula se oprește imediat când e eliberat, iar frâna oprește discul.' },
          { title: 'Control', text: 'KickBack Control, Drop Control, pornire lină, Vibration Control și piuliță de strângere rapidă.' },
        ],
      },
      { kind: 'gallery', title: 'Șlefuire, tăiere de armătură, debitare' },
      {
        kind: 'specs',
        title: 'Specificații tehnice',
        groups: [
          { name: 'Performanță', rows: [
            ['Tensiune acumulator', '18 V'],
            ['Diametru disc', '125 mm'],
            ['Orificiu disc', '22,2 mm'],
            ['Arbore', 'M14'],
            ['Turație la mers în gol', '9 800 rot/min'],
          ] },
          { name: 'Dimensiuni și ergonomie', rows: [
            ['Greutate fără acumulator', '2,2 kg'],
            ['Dimensiuni (L × l × Î)', '330 × 265 × 119 mm'],
            ['Presiune / putere sonoră', '89 / 97 dB(A)'],
            ['Vibrații — degroșare', '4,9 m/s²'],
            ['Vibrații — șlefuire cu foaie abrazivă', '2,5 m/s²'],
          ] },
        ],
        note: 'Valori din fișa tehnică a producătorului.',
      },
      {
        kind: 'proscons',
        pros: [
          'Putere echivalentă cu 1 500 W cu fir, pe acumulator.',
          'Comutator PROtection și frână: discul se oprește imediat.',
          'KickBack Control oprește scula dacă discul se blochează.',
          'Piuliță de strângere rapidă — schimbi discul fără cheie.',
        ],
        cons: [
          'Comutatorul trebuie ținut apăsat tot timpul — nu are blocare pe poziția pornit.',
          'Pentru putere maximă cere acumulatori ProCORE18V, care adaugă greutate.',
          'La 125 mm, adâncimea de tăiere e limitată — pentru beton gros, un polizor de 230 mm.',
        ],
      },
      { kind: 'carousel', title: 'Discuri de tăiere', text: 'Pentru oțel, inox, armătură.', subs: ['Discuri de tăiere'] },
      { kind: 'carousel', title: 'Discuri lamelare', text: 'Degroșare și finisaj în aceeași trecere.', subs: ['Discuri Lamelare', 'Discuri evantai'] },
      {
        kind: 'verdict',
        text: 'Un polizor pe acumulator care nu cere compromis la putere, cu cele mai complete funcții de siguranță din clasă. Potrivit ca polizor principal pe șantier și în atelier, oriunde un cablu încurcă.',
        forWho: ['Lăcătuși și sudori', 'Instalatori', 'Constructori și montatori', 'Echipe de mentenanță'],
      },
      { kind: 'carousel', title: 'Acumulatori și încărcătoare', text: 'ProCORE18V pentru putere maximă.', subs: ['Baterii & încărcătoare', 'Acumulatori'] },
    ],
  },
  {
    slug: 'bosch-gcm-18v-305-gdc-prezentare',
    type: 'produs',
    product: 'bosch-3165140965545',
    profession: 'GCM 18V-305 GDC',
    title: 'Bosch GCM 18V-305 GDC Professional: prezentare detaliată',
    domain: 'Produs · Ferăstrău circular staționar 305 mm',
    headline: 'Tăieturi de 104 × 341 mm, cu puterea unui ferăstrău de 2 000 W — fără priză.',
    excerpt: 'Ferăstrăul staționar cu brațe culisante, pânză de 305 mm și motor BITURBO fără perii, pentru tâmplărie, montaj de pardoseli, lambriuri și profile de aluminiu.',
    metaTitle: 'Bosch GCM 18V-305 GDC Professional — specificații și prezentare | Zona Scule',
    metaDescription: 'Bosch GCM 18V-305 GDC Professional: ferăstrău circular staționar pe 18 V cu pânză de 305 mm, capacitate de tăiere 104 × 341 mm, înclinare 47°/47° și 52°/60°. Specificații și accesorii.',
    heroStats: [['305 mm', 'pânză'], ['104 × 341', 'mm tăiere la 0°'], ['47° / 60°', 'înclinare / rotire max.']],
    sections: [
      { kind: 'product' },
      {
        kind: 'intro',
        lead: 'Un ferăstrău staționar mare era, până de curând, o sculă de atelier: greu de mutat și legat de o priză. GCM 18V-305 GDC aduce capacitatea unui ferăstrău de 305 mm cu fir pe platforma de 18 V, cu un braț culisant care ocupă puțin spațiu în spate.',
        steps: [
          { title: 'Putere de 2 000 W', text: 'Motorul fără perii, cu acumulatori ProCORE18V, egalează un ferăstrău staționar cu fir de 2 000 W.' },
          { title: 'Tăieturi mari', text: '104 × 341 mm la 0°, 120 mm înălțime cu distanțier — grinzi, pervazuri, profile.' },
          { title: 'Siguranță și control', text: 'Frână de motor, schimbarea pânzei fără cheie, selectarea turației cu mod ECO și indicator de încărcare.' },
        ],
      },
      { kind: 'gallery', title: 'Lemn, aluminiu, profile' },
      {
        kind: 'specs',
        title: 'Specificații tehnice',
        groups: [
          { name: 'Pânză și turație', rows: [
            ['Tensiune acumulator', '18 V'],
            ['Diametru pânză / alezaj', '305 mm / 30 mm'],
            ['Turație la mers în gol', '2 550 – 4 000 rot/min'],
          ] },
          { name: 'Capacitate de tăiere', rows: [
            ['La 0°', '104 × 341 mm'],
            ['La 0° cu distanțier (vertical)', '120 × 200 mm'],
            ['La 0° cu distanțier (orizontal)', '45 × 400 mm'],
            ['La 45° înclinare verticală', '40 × 341 mm'],
            ['La 45° rotire orizontală', '104 × 240 mm'],
          ] },
          { name: 'Unghiuri', rows: [
            ['Înclinare în plan vertical', '47° stânga / 47° dreapta'],
            ['Rotire în plan orizontal', '52° stânga / 60° dreapta'],
          ] },
          { name: 'Dimensiuni', rows: [
            ['Dimensiuni (l × L × Î)', '565 × 630 × 790 mm'],
            ['Greutate', '26,8 kg'],
            ['Presiune / putere sonoră', '93 / 106 dB(A)'],
          ] },
        ],
        note: 'Valori din fișa tehnică a producătorului.',
      },
      {
        kind: 'proscons',
        pros: [
          'Capacitate de ferăstrău de 305 mm cu fir, fără priză.',
          'Braț culisant compact — se poate lipi mai aproape de perete.',
          'Schimbarea pânzei fără cheie și frână de motor.',
          'Se montează pe cadrele Bosch GTA.',
        ],
        cons: [
          '26,8 kg — se mută, dar nu e o sculă de purtat des.',
          'Pentru tăieri grele continue cere acumulatori ProCORE18V de capacitate mare.',
          '106 dB(A): protecție auditivă obligatorie.',
        ],
      },
      { kind: 'carousel', title: 'Pânze de ferăstrău circular', text: 'Pentru lemn, laminat și aluminiu.', subs: ['Pânze de ferăstrău circular', 'Pânze de ferăstrău circular pentru lemn'] },
      {
        kind: 'verdict',
        text: 'Pentru echipele care taie pe șantier — montaj de parchet și tâmplărie, construcții din lemn, profile — și vor capacitatea unui ferăstrău de atelier fără generator sau prelungitoare. Pentru lucrări mici, un model de 216 mm e mai ușor de purtat.',
        forWho: ['Tâmplari și montatori', 'Echipe de construcții din lemn', 'Montaj pardoseli și lambriuri', 'Ateliere mobile'],
      },
      { kind: 'carousel', title: 'Alte ferăstraie staționare', text: 'Ferăstraie de retezat și bancuri de lucru.', subs: ['Ferăstraie circulare staționare și bancuri de lucru'] },
    ],
  },
  {
    slug: 'bosch-gsr-12v-35-hx-prezentare',
    type: 'produs',
    product: 'bosch-4059952514031',
    profession: 'GSR 12V-35 HX',
    title: 'Bosch GSR 12V-35 HX Professional: prezentare detaliată',
    domain: 'Produs · Mașină de găurit-înșurubat 12 V',
    headline: 'Cea mai rapidă mașină de 12 V cu două trepte din clasa ei — și încape oriunde.',
    excerpt: 'Mașina de găurit-înșurubat compactă, fără perii, cu prindere hexagonală de 1/4″, 1 750 rot/min și 35 Nm — pentru montaj, instalații și mobilier.',
    metaTitle: 'Bosch GSR 12V-35 HX Professional — specificații și prezentare | Zona Scule',
    metaDescription: 'Bosch GSR 12V-35 HX Professional: mașină de găurit-înșurubat 12 V fără perii, prindere hexagonală 1/4″, 0–460 / 0–1 750 rot/min, 35 Nm, 0,57 kg. Specificații și accesorii.',
    heroStats: [['1 750', 'rot/min'], ['35 Nm', 'cuplu (înșurubare dură)'], ['0,57 kg', 'fără acumulator']],
    sections: [
      { kind: 'product' },
      {
        kind: 'intro',
        lead: 'Pentru montaj, un gram în minus contează mai mult decât un newton-metru în plus. GSR 12V-35 HX e o mașină de 12 V fără perii, cu prindere hexagonală pentru biți, care ajunge în dulapuri, doze și spații înguste unde o mașină de 18 V nu încape.',
        steps: [
          { title: 'Compactă', text: 'Prindere hexagonală de 1/4″ în loc de mandrină — mai scurtă și mai ușoară.' },
          { title: 'Rapidă', text: 'Două trepte, până la 1 750 rot/min — cea mai rapidă din clasa de 12 V cu două trepte, după producător.' },
          { title: 'Precisă', text: '20 de trepte de cuplu plus găurire, pentru înșurubat fără să rupi șuruburi mici.' },
        ],
      },
      { kind: 'gallery', title: 'Pe centură, în dulapuri, pe șantier' },
      {
        kind: 'specs',
        title: 'Specificații tehnice',
        groups: [
          { name: 'Performanță', rows: [
            ['Tensiune acumulator', '12 V (compatibilă și cu 10,8 V)'],
            ['Prindere', 'Hexagonală 1/4″, cu blocare'],
            ['Turație la mers în gol', '0–460 / 0–1 750 rot/min'],
            ['Cuplu (înșurubare moale / dură)', '20 / 35 Nm'],
            ['Trepte de cuplu', '20 + 1'],
          ] },
          { name: 'Capacitate', rows: [
            ['Găurire în oțel, max.', '10 mm'],
            ['Găurire în lemn, max.', '32 mm'],
            ['Diametru șuruburi, max.', '8 mm'],
          ] },
          { name: 'Dimensiuni și ergonomie', rows: [
            ['Greutate fără acumulator', '0,57 kg'],
            ['Lungime', '160 mm'],
            ['Presiune / putere sonoră', '73 / 84 dB(A)'],
            ['Vibrații (găurire în metal / înșurubare)', '1,5 m/s²'],
          ] },
        ],
        note: 'Valori din fișa tehnică a producătorului.',
      },
      {
        kind: 'proscons',
        pros: [
          'Foarte compactă și ușoară — lucru deasupra capului fără oboseală.',
          'Turație mare pentru clasa de 12 V.',
          'Motor fără perii: mai multă autonomie din același acumulator.',
          'Merge cu acumulatorii Bosch Professional de 12 V și 10,8 V.',
        ],
        cons: [
          '35 Nm — nu e pentru șuruburi lungi în lemn sau găuri mari.',
          'Prinderea hexagonală cere burghie cu coadă hexagonală (sau un adaptor cu mandrină).',
          'Fără percuție — nu găurește zidărie.',
        ],
      },
      { kind: 'carousel', title: 'Biți și adaptoare', text: 'Biți, prelungitoare și adaptoare de 1/4″.', subs: ['Biți și adaptoare', 'Capete de șurubelniță'] },
      {
        kind: 'verdict',
        text: 'Mașina a doua ideală pentru orice profesionist — sau prima, pentru cei care montează toată ziua. Pentru găuri mari sau zidărie, rămâne nevoie de o mașină de 18 V.',
        forWho: ['Electricieni', 'Instalatori', 'Montatori de mobilier și uși', 'Montaj HVAC'],
      },
      { kind: 'carousel', title: 'Alte scule pe 12 V', text: 'Aceeași platformă, aceiași acumulatori.', subs: ['Maşini de găurit/înşurubat cu acumulator', 'Şurubelniţe cu acumulator'] },
    ],
  },
  {
    slug: 'bosch-gtc-12v-450-13-prezentare',
    type: 'produs',
    product: 'bosch-4053423322361',
    profession: 'GTC 12V-450-13',
    title: 'Bosch GTC 12V-450-13 Professional: prezentare detaliată',
    domain: 'Produs · Cameră de termoviziune',
    headline: 'Vezi temperatura: țevi în pardoseală, conexiuni încinse, pierderi de căldură.',
    excerpt: 'Camera de termoviziune compactă, cu senzor de 256 × 192 px, de la −20 la +450 °C, IP54 și rezistență la căderi de 2 m — pentru instalatori, electricieni și mentenanță.',
    metaTitle: 'Bosch GTC 12V-450-13 Professional — cameră termică, specificații | Zona Scule',
    metaDescription: 'Bosch GTC 12V-450-13 Professional: cameră de termoviziune 256 × 192 px, −20 … +450 °C, ±2 °C, NETD ≤ 50 mK, IP54, căderi de 2 m, 500 de imagini. Specificații și utilizări.',
    heroStats: [['256 × 192', 'pixeli senzor IR'], ['−20…450 °C', 'domeniu de măsură'], ['IP54', 'praf și stropi']],
    sections: [
      { kind: 'product' },
      {
        kind: 'intro',
        lead: 'Multe defecte nu se văd, dar se simt: o conexiune care se încălzește, o țeavă de încălzire în pardoseală, o punte termică în perete. O cameră de termoviziune le arată dintr-o privire, fără să desfaci nimic.',
        steps: [
          { title: 'Imagine clară', text: 'Senzor de 256 × 192 px (49 152 de puncte de măsură) pe un ecran de 2,8″.' },
          { title: 'Rapidă', text: 'Pornește în aproximativ 3 secunde; laser, lampă de lucru și cameră foto integrate.' },
          { title: 'Robustă', text: 'IP54, rezistentă la căderi de 2 m, cu clapetă de protecție pentru senzor.' },
        ],
      },
      { kind: 'gallery', title: 'Încălzire în pardoseală, producție, auto' },
      {
        kind: 'specs',
        title: 'Specificații tehnice',
        groups: [
          { name: 'Imagine și măsurare', rows: [
            ['Senzor IR', '256 × 192 px (49 152 puncte)'],
            ['Domeniu de măsurare', '−20 °C … +450 °C'],
            ['Precizie IR', '± 2,0 °C'],
            ['Sensibilitate termică (NETD)', '≤ 50 mK'],
            ['Câmp vizual', '56° × 42°'],
            ['Rată de reîmprospătare', '9 Hz'],
            ['Distanță minimă de vizare', '0,5 m'],
            ['Ecran', '2,8″'],
          ] },
          { name: 'Date și alimentare', rows: [
            ['Memorie', 'internă, 500 de imagini (.jpg)'],
            ['Transfer', 'USB-C'],
            ['Alimentare', '4 × AA (≈ 4 ore) sau acumulator 12 V (≈ 8 ore)'],
          ] },
          { name: 'Construcție', rows: [
            ['Protecție', 'IP54, căderi de la 2 m'],
            ['Greutate', '0,48 kg'],
            ['Dimensiuni', '79 × 89 × 209 mm'],
            ['Temperatură de funcționare', '−10 … +50 °C'],
          ] },
        ],
        note: 'Valori din fișa tehnică a producătorului.',
      },
      {
        kind: 'proscons',
        pros: [
          'Rezoluție de 256 × 192 px — detalii clare pentru o cameră compactă.',
          'Funcționează cu baterii AA sau cu acumulatorul de 12 V.',
          'Robustă pentru șantier: IP54 și căderi de 2 m.',
          'Laser și lampă integrate — știi exact unde măsori.',
        ],
        cons: [
          '9 Hz — pentru obiecte în mișcare rapidă imaginea poate întârzia.',
          'Fără Bluetooth — imaginile se descarcă prin USB-C.',
          'Precizia de ± 2 °C e pentru diagnostic; pentru valori exacte, un termometru de contact.',
        ],
      },
      {
        kind: 'verdict',
        text: 'O cameră termică de lucru, nu de laborator: pornește repede, rezistă pe șantier și arată clar diferențele de temperatură. Pentru electricieni, instalatori și echipele de mentenanță, scurtează diagnosticul de la ore la minute.',
        forWho: ['Instalatori (încălzire, încălzire în pardoseală)', 'Electricieni (tablouri, conexiuni)', 'Mentenanță industrială', 'Service auto și HVAC'],
      },
      { kind: 'carousel', title: 'Detectare și inspecție', text: 'Detectoare, camere de inspecție și alte aparate de diagnostic.', subs: ['Diagnosticare și inspecție', 'Detectoare', 'Camere termice şi termodetectoare'] },
      { kind: 'carousel', title: 'Sistemul de 12 V', text: 'Acumulatori și scule pe aceeași platformă.', subs: ['Maşini de găurit/înşurubat cu acumulator', 'Baterii & încărcătoare'] },
    ],
  },
]

