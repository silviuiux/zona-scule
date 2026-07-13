# Blueprint de Nomenclatură PFERD (August Rüggeberg) & Master Catalog Guide
## Document de Referință Tehnică pentru Catalogul Comercial și Baza de Date B2B

Acest document reprezintă ghidul tehnic complet pentru înțelegerea, decodificarea și optimizarea nomenclaturii tuturor produselor, consumabilelor și pieselor de schimb **PFERD** prezente în catalogul oficial. Structura este concepută pentru a asigura o mapare corectă în site-ul e-commerce, optimizarea filtrelor tehnice și traducerea exactă a specificațiilor pentru piața din România.

---

## 1. Pilonul Strategic: Liniile de Performanță (Codul de Culori PFERD)

Orice sculă abrazivă sau așchietoare PFERD este clasificată în trei mari linii de performanță. Această clasificare definește productivitatea sculei și determină prețul de listă al produsului.

### 🟧 Linia Universală PSF (PS-FORTE)
* **Tipul de aplicație:** Utilizare generală, mentenanță curentă, ateliere medii, lăcătușărie standard și aplicații semi-profesionale.
* **Comportament economic:** Reprezintă linia de intrare (*entry-level*). Oferă cel mai bun raport cost-beneficiu pentru utilizare intermitentă, având o rată stabilă de îndepărtare a materialului.
* **Exemple din CSV:** `POLIFAN PFF 115 Z80 PSF STEELOX`, `C/O WHL EHT 125-1,0 PSF STEELOX`.

### ⬜ Linia de Performanță SG (SG-ELASTIC)
* **Tipul de aplicație:** Utilizare industrială intensivă, fluxuri continue de producție, confecții metalice grele, șantiere navale și turnătorii.
* **Comportament economic:** Este standardul industrial de top din catalog. Oferă o durată de viață maximă a sculei (uzură foarte lentă) și o rată foarte mare de îndepărtare a metalului, reducând timpii morți.
* **Exemple din CSV:** `POLIFAN PFF 125 A40 SG STEELOX`, `CUT-OFF WHEEL EHT 125-2,0 SG STEELOX`.

### 🟦 Linia Specială / Înaltă Performanță SGP (SG-PLUS)
* **Tipul de aplicație:** Nișe industriale ultra-specializate, materiale dificil de prelucrat (Titan, aliaje cu nichel, oțeluri tratate termic de duritate extremă) sau cerințe extreme de viteză de tăiere.
* **Comportament economic:** Reprezintă gama de vârf. Deși prețul pe unitate este cel mai mare, costul total per operațiune este cel mai scăzut în regim de fabrică datorită randamentului extrem.
* **Exemple din CSV:** `BLUEDEALS BONUSPACK - 125 M SGP CURVE`, `PFF 115 Z60 SGP FORCE STEEL`.

---

## 2. Decodificarea Categoriilor Principale (Structura din CSV)

Pe baza analizei celor peste 16.000 de repere din fișierul de prețuri, produsele PFERD sunt grupate în următoarele mari familii tehnice:

### 2.1. Discuri Abrazive de Debitare și Degroșare (`CUT-OFF WHEEL` / `EH` / `EHT`)
Discurile clasice folosite pe polizoarele unghiulare urmează o sintaxă geometrică strictă:
* **EHT:** Disc complet **plat** de debitare (Tip 41). Conceput pentru tăieri adânci, rapide și curate.
* **EH:** Disc cu **centru depresat** (Tip 42). Ofera o rigiditate laterală superioară în timpul tăierii.
* **E:** Disc gros (6.0 - 7.0 mm) destinat exclusiv **degroșării** și rectificării cordoanelor de sudură.
* **Decodificare dimensiuni (ex: `EHT 125-2,0`):** Diametru exterior $125	ext{ mm}$, grosime disc $2.0	ext{ mm}$.
* **Specificul Materialului (Liajul chimic):**
  * **STEEL:** Abraziv special din corindon (oxid de aluminiu) optimizat pentru oțel carbon.
  * **INOX:** Abraziv fără adaosuri de fier, sulf sau clor (previne apariția ruginii pe structurile din oțel inoxidabil).
  * **STEELOX:** Indicator universal (compatibil atât pentru Oțel, cât și pentru Inox).
  * **ALU:** Liant special care previne încărcarea și colmatarea discului cu aluminiu topit.

### 2.2. Discuri Abrazive cu Lamele (`POLIFAN®` / `PFF` / `PFC`)
Sunt discuri cu lamele abrazive suprapuse, folosite pentru șlefuirea suprafețelor metalice:
* **PFF:** Formă complet **plată**. Excelentă pentru șlefuirea suprafețelor plane și a finisajelor de suprafață.
* **PFC / PFR:** Formă **conică/înclinată**. Permite lucrul sub un unghi optim și este ideală pentru cordoane de sudură și șlefuiri de margini.
* **Decodificare abraziv (ex: `A40`, `Z60`, `CO80`):**
  * **A (Corindon):** Pentru oțeluri moi și finisaje intermediare.
  * **Z (Zirconiu):** Abraziv auto-ascuțitor, foarte agresiv, excelent pentru oțel și inox în regim industrial.
  * **CO (Ceramic):** Granulă ceramică premium. Oferă cea mai mare rată de îndepărtare și tăiere rece.
  * **Cifrele (40, 60, 80, 120):** Granulația abrazivă (cu cât numărul e mai mic, cu atât discul e mai grosier).
* **CO-FREEZE / A-COOL:** Tehnologii de acoperire top-coat care reduc masiv temperatura în zona de contact, prevenind decolorarea termică (albăstrirea) inoxului.

### 2.3. Freze Rotative din Carbură Metalică (`TC-BURRS`)
Frezele industriale pentru debavurare și rectificare urmează standardul DIN 8032/8033:
* **Codificarea formei capului:**
  * **ZYA:** Formă cilindrică fără tăiș frontal.
  * **ZYAS:** Formă cilindrică **cu tăiș frontal** (permite frezarea în unghi drept).
  * **WRC:** Formă cilindrică cu cap semirotund (rândunică).
  * **KUD:** Formă sferică (ball).
  * **RBF:** Formă de arbore cu cap semirotund.
  * **SPG:** Formă de arbore cu cap ascuțit.
  * **KEL:** Formă conică rotundă.
  * **SKM:** Formă conică ascuțită.
* **Decodificarea dimensiunilor (ex: `1225/6`):** Diametru cap active $12	ext{ mm}$, lungime parte active $25	ext{ mm}$, diametru tijă de prindere în mandrină $6	ext{ mm}$.
* **Danturi Speciale prezente în CSV:**
  * **TOUGH / TOUGH-S:** Dantură ultra-robustă rezistentă la șocuri mecanice mari, ideală pentru utilizarea manuală unde utilizatorul poate scăpa scula accidental.
  * **NON FERROUS / ALU:** Dantură cu spații extrem de mari între dinți pentru evacuarea metalelor neferoase moale.
  * **STEEL / INOX / CAST:** Geometrii dedicate pentru randament maxim pe materialele respective.

### 2.4. Pietre Polizoare cu Tijă (`MTD.POINT` / Corpuri de Șlefuit)
* **Sintaxă standard din CSV (ex: `ZY 0306 3 AWCO 80 J5V STEEL`):**
  * **ZY:** Formă geometrică cilindrică.
  * **0306:** Diametru cap active $3	ext{ mm}$ și lungime active $6	ext{ mm}$.
  * **3:** Diametrul tijei metalice de prindere ($3	ext{ mm}$ sau $6	ext{ mm}$).
  * **AWCO / ADW / AR:** Tipul de granulă abrazivă (AWCO = Corindon ceramic roz premium; ADW = Corindon alb/nobil; AR = Corindon regulat).
  * **80 / 100:** Granulația pietrei.
  * **J5V / M5V / O5V:** Combinația dintre duritatea liantului (J = moale, O = dur) și structura poroasă vitroasă (V).
  * **STEEL EDG / TOUGH:** Aplicația optimizată (Prelucrare margini oțel / Aplicații cu șocuri).

### 2.5. Perii Industriale de Sârmă (`BRUSH`)
* **Sintaxă standard din CSV (ex: `RBUIT 7015/6 INOX 0,30`):**
  * **RBU / RBG / HBF:** Tipul periei. `RBU` = Perie circulară cu sârmă ondulată (*Radial Brush*); `RBG` = Perie circulară cu sârmă împletită/înnodată (*Heavy-duty*); `HBF` = Perie tip pensulă pentru zone greu accesibile.
  * **IT / POS:** IT = Versiune industrială premium.
  * **7015/6:** Diametru exterior perie $70	ext{ mm}$, lățime parte activă $15	ext{ mm}$, prindere pe tijă de $6	ext{ mm}$.
  * **INOX / ST / MES:** Materialul sârmei. `INOX` = Oțel inoxidabil; `ST` = Oțel carbon (*Steel*); `MES` = Alamă (*Brass*).
  * **0,30:** Grosimea firului de sârmă în milimetri ($0.30	ext{ mm}$). Firul mai gros ($0.35-0.50	ext{ mm}$) este extrem de agresiv pentru curățarea sudurilor; firul subțire ($0.15-0.20	ext{ mm}$) este fin, pentru finisaje ușoare.

### 2.6. Burghie Elicoidale (`TWIST DRILL`)
* **Sintaxă standard din CSV (ex: `SPB DIN338 HSSG N 4,1 STEEL`):**
  * **SPB:** Sistemul de sortare PFERD (*Twist Drill bit*).
  * **DIN338 / DIN1897:** Standardul industrial de lungime (DIN 338 = Burghiu lungime standard de atelier; DIN 1897 = Burghiu extra-scurt/stub pentru table subțiri).
  * **HSSG / HSSE:** Materialul burghiului. `HSSG` = Oțel rapid rectificat (pentru oțeluri standard); `HSSE` = Oțel rapid aliat cu Cobalt (de regulă $5\%$ Co), esențial pentru tăierea în oțel inoxidabil (INOX).
  * **N:** Profilul canalului (Tip N = Unghi normal de atac pentru materiale cu așchiere standard).
  * **4,1:** Diametrul exact al burghiului în milimetri ($4.1	ext{ mm}$).

### 2.7. Scrole Nețesute și Abrazivi Tridimensionali (`POLINOX` / `NON-WOVEN`)
* **PNL / PNZ / PNER:** Denumiri de structuri tridimensionale din nailon impregnate cu granule abrazive. Sunt folosite pentru curățarea oxidării, matisare și satinarea metalelor (finisaje decorative pe inox) fără a deforma geometric piesa.

---

## 3. Matricea de Accesorii Industriale și Piese de Schimb

Aproximativ 20% din fișierul tău CSV conține componente structurale și piese de schimb originale pentru mașinile de antrenare (Manualul 8). Acestea pot fi identificate instantaneu după prefixele lor din trei litere:

### ⚙️ Sistemul de Prindere și Fixare
* **`SPZ` (Spannzange) ➔ Pensete de prindere:** Bucșe elastice conice folosite pentru fixarea frezelor și pietrelor cu tijă în mandrina polizoarelor drepte.
  * *Exemplu din CSV:* `COLLET SPZ 95203402 6MM` (Pensetă de 6mm pentru mașină pneumatică).
* **`SPF` (Spannflansch) ➔ Flanșe de strângere:** Discuri metalice de fixare pentru montarea periilor circulare sau discurilor speciale pe axul filetat al utilajelor.
  * *Exemplu din CSV:* `FLANGE SPF 95209601`, `FLANGE SPF 87101602 28/10`.
* **`SPV` (Spannspindelve Verlängerung) ➔ Prelungitoare de ax:** Adaptoare lungi folosite pentru a extinde raza de acțiune a frezelor în interiorul țevilor sau pieselor adânci turnate.
  * *Exemplu din CSV:* `EXTENSION SPV 150-8 S8`.

### 🔀 Identificarea Pieselor după Numărul de Articol (`PDT_SUP_REF`)
Dacă denumirea în engleză din fișier este generică (ex: `O-RING`, `BALL BEARING`, `VANES`), prima cifră a codului de articol oferă segmentarea corectă în catalog:
* **Gama `871xxxxx`:** Piese de schimb destinate exclusiv **Mașinilor cu Ax Flexibil** (*Flexible Shaft Drives*).
* **Gama `900xxxxx` / `952xxxxx`:** Piese de schimb originale pentru **Sculele Pneumatice PFERD** (motoare cu aer comprimat, palete de motor `VANES`, pistoane, supape `VALVE`).

---

## 4. Ghid de Optimizare a Catalogului pentru Vânzarea în România

Pentru a transforma acest fișier CSV brut într-o platformă e-commerce industrială de succes, aplică următoarele reguli de structurare a datelor:

1. **Curățarea Denumirilor Scurte:** Textul din `ITEM_LABEL` folosește adesea abrevieri industriale rigide (ex: `C/O WHL` sau `ABRAS.`). La import, folosește scripturi de înlocuire automată:
   * `C/O WHL` sau `CUT-OFF WHEEL` ➔ Înlocuiește cu **Disc debitare**
   * `MTD.POINT` ➔ Înlocuiește cu **Piatră polizoare cu tijă**
   * `TC-BURRS` ➔ Înlocuiește cu **Freză rotativă din carbură metalică**
   * `FLAP WH.` ➔ Înlocuiește cu **Perie abrazivă cu lamele**
2. **Activarea Filtrelor Tehnice cheie:**
   * **Material prelucrat:** Pune filtre dedicate pentru `STEEL`, `INOX`, `ALU`, `CAST` extrase din coada etichetelor.
   * **Tip Prindere:** Filtrează produsele care conțin prindere `M14` (standard polizor unghiular), `/16` sau `/22,23` (alezaj standard) și tije de `3mm` sau `6mm`.
   * **Sistemul X-LOCK:** Creează un tag sau o categorie separată pentru toate reperele care au modificatorul `/ X-LOCK` în denumire, deoarece este o tehnologie modernă foarte căutată.
3. **Cross-Selling Automat:** 
   * La orice mașină pneumatică afișată (coduri din clasa 8 și 9), afișează automat ca produse asociate pensetele `SPZ` și flanșele `SPF` care împart aceeași serie numerică în codul de articol.
