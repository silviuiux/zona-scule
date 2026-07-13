# Blueprint de Nomenclatură PFERD (August Rüggeberg) & Master Catalog Guide
## Document de Referință Tehnică pentru Automatizare AI, Catalog Comercial și Baze de Date B2B

Acest document reprezintă ghidul tehnic complet de sistem pentru înțelegerea, decodificarea și optimizarea nomenclaturii tuturor produselor, consumabilelor și pieselor de schimb **PFERD** prezente în catalogul oficial. Structura este concepută pentru a asigura o mapare corectă în site-ul e-commerce, optimizarea filtrelor tehnice și traducerea exactă a specificațiilor pentru piața din România prin intermediul modelelor LLM (Agenți AI).

---

## 1. Pilonul Strategic: Liniile de Performanță (Codul de Culori PFERD)

Orice sculă abrazivă sau așchietoare PFERD este clasificată în trei mari linii de performanță. Această clasificare definește productivitatea sculei și determină prețul de listă al produsului.

### 1.1. 🟧 Linia Universală PSF (PS-FORTE)
* **Tipul de aplicație:** Utilizare generală, mentenanță curentă, ateliere medii, lăcătușărie standard și aplicații semi-profesionale.
* **Comportament economic:** Reprezintă linia de intrare (*entry-level*). Oferă cel mai bun raport cost-beneficiu pentru utilizare intermitentă, având o rată stabilă de îndepărtare a materialului.
* **Exemple din CSV:** `POLIFAN PFF 115 Z80 PSF STEELOX`, `C/O WHL EHT 125-1,0 PSF STEELOX`.

### 1.2. ⬜ Linia de Performanță SG (SG-ELASTIC)
* **Tipul de aplicație:** Utilizare industrială intensivă, fluxuri continue de producție, confecții metalice grele, șantiere navale și turnătorii.
* **Comportament economic:** Este standardul industrial de top din catalog. Oferă o durată de viață maximă a sculei (uzură foarte lentă) și o rată foarte mare de îndepărtare a metalului, reducând timpii morți.
* **Exemple din CSV:** `POLIFAN PFF 125 A40 SG STEELOX`, `CUT-OFF WHEEL EHT 125-2,0 SG STEELOX`.

### 1.3. 🟦 Linia Specială / Înaltă Performanță SGP (SG-PLUS)
* **Tipul de aplicație:** Nișe industriale ultra-specializate, materiale dificil de prelucrat (Titan, aliaje cu nichel, oțeluri tratate termic de duritate extremă) sau cerințe extreme de viteză de tăiere.
* **Comportament economic:** Reprezintă gama de vârf. Deși prețul pe unitate este cel mai mare, costul total per operațiune este cel mai scăzut în regim de fabrică datorită randamentului extrem.
* **Exemple din CSV:** `BLUEDEALS BONUSPACK - 125 M SGP CURVE`, `PFF 115 Z60 SGP FORCE STEEL`.

---

## 2. Decodificarea Categoriilor Principale (Structura din CSV)

Pe baza analizei complete a celor 16.220 de repere din fișierul de prețuri, produsele PFERD sunt grupate în următoarele mari familii tehnice:

### 2.1. Discuri Abrazive de Debitare și Degroșare (`CUT-OFF WHEEL` / `EH` / `EHT`)
Discurile clasice folosite pe polizoarele unghiulare urmează o sintaxă geometrică strictă:
* **EHT:** Disc complet **plat** de debitare (Tip 41). Conceput pentru tăieri adânci, rapide și curate.
* **EH:** Disc cu **centru depresat** (Tip 42). Oferă o rigiditate laterală superioară în timpul tăierii.
* **E:** Disc gros (6.0 - 7.0 mm) destinat exclusiv **degroșării** și rectificării cordoanelor de sudură.
* **Decodificare dimensiuni (ex: `EHT 125-2,0`):** Diametru exterior 125 mm, grosime disc 2.0 mm.
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
* **Decodificarea dimensiunilor (ex: `1225/6`):** Diametru cap activ 12 mm, lungime parte activă 25 mm, diametru tijă de prindere în mandrină 6 mm.
* **Danturi Speciale prezente în CSV:**
  * **TOUGH / TOUGH-S:** Dantură ultra-robustă rezistentă la șocuri mecanice mari, ideală pentru utilizarea manuală unde utilizatorul poate scăpa scula accidental.
  * **NON FERROUS / ALU:** Dantură cu spații extrem de mari între dinți pentru evacuarea metalelor neferoase moi.
  * **STEEL / INOX / CAST:** Geometrii dedicate pentru randament maxim pe materialele respective.

### 2.4. Pietre Polizoare cu Tijă (`MTD.POINT` / Corpuri de Șlefuit)
* **Sintaxă standard din CSV (ex: `ZY 0306 3 AWCO 80 J5V STEEL`):**
  * **ZY:** Formă geometrică cilindrică.
  * **0306:** Diametru cap activ 3 mm și lungime activă 6 mm.
  * **3:** Diametrul tijei metalice de prindere (3 mm sau 6 mm).
  * **AWCO / ADW / AR:** Tipul de granulă abrazivă (AWCO = Corindon ceramic roz premium; ADW = Corindon alb/nobil; AR = Corindon regulat).
  * **80 / 100:** Granulația pietrei.
  * **J5V / M5V / O5V:** Combinația dintre duritatea liantului (J = moale, O = dur) și structura poroasă vitroasă (V).
  * **STEEL EDG / TOUGH:** Aplicația optimizată (Prelucrare margini oțel / Aplicații cu șocuri).

### 2.5. Perii Industriale de Sârmă (`BRUSH`)
* **Sintaxă standard din CSV (ex: `RBUIT 7015/6 INOX 0,30`):**
  * **RBU / RBG / HBF:** Tipul periei. `RBU` = Perie circulară cu sârmă ondulată (*Radial Brush*); `RBG` = Perie circulară cu sârmă împletită/înnodată (*Heavy-duty*); `HBF` = Perie tip pensulă pentru zone greu accesibile.
  * **IT / POS:** IT = Versiune industrială premium.
  * **7015/6:** Diametru exterior perie 70 mm, lățime parte activă 15 mm, prindere pe tijă de 6 mm.
  * **INOX / ST / MES:** Materialul sârmei. `INOX` = Oțel inoxidabil; `ST` = Oțel carbon (*Steel*); `MES` = Alamă (*Brass*).
  * **0,30:** Grosimea firului de sârmă în milimetri (0.30 mm). Firul mai gros (0.35-0.50 mm) este extrem de agresiv pentru curățarea sudurilor; firul subțire (0.15-0.20 mm) este fin, pentru finisaje ușoare.

### 2.6. Burghie Elicoidale (`TWIST DRILL`)
* **Sintaxă standard din CSV (ex: `SPB DIN338 HSSG N 4,1 STEEL`):**
  * **SPB:** Sistemul de sortare PFERD (*Twist Drill bit*).
  * **DIN338 / DIN1897:** Standardul industrial de lungime (DIN 338 = Burghiu lungime standard de atelier; DIN 1897 = Burghiu extra-scurt/stub pentru table subțiri).
  * **HSSG / HSSE:** Materialul burghiului. `HSSG` = Oțel rapid rectificat (pentru oțeluri standard); `HSSE` = Oțel rapid aliat cu Cobalt (de regulă 5% Co), esențial pentru tăierea în oțel inoxidabil (INOX).
  * **N:** Profilul canalului (Tip N = Unghi normal de atac pentru materiale cu așchiere standard).
  * **4,1:** Diametrul exact al burghiului în milimetri (4.1 mm).

### 2.7. Scări Nețesute și Abrazivi Tridimensionali (`POLINOX` / `NON-WOVEN`)
* **PNL / PNZ / PNER:** Denumiri de structuri tridimensionale din nailon impregnate cu granule abrazive. Sunt folosite pentru curățarea oxidării, matisare și satinarea metalelor (finisaje decorative pe inox) fără a deforma geometric piesa.

### 2.8. Corpuri Abrazive Lamelare cu Tijă (`FAN GRINDER`)
* **Ce sunt:** Perii cilindrice cu lamele radiale de șmirghel sau pâslă fixate pe o tijă centrală, destinate polizării și finisării structurilor metalice concave sau tubulare.
* **Sintaxă (ex: `FAN GRINDER F 3015/6 A120`):** `F` = Formă standard lamelară; `3015` = Diametru 30 mm x Lățime 15 mm; `/6` = Tijă de prindere de 6 mm; `A120` = Granulă de corindon, granulație 120.
* **Versiuni din pâslă (`FELT FAN GRINDERS`):** Codificate cu `FLS SOFT` sau `FLS HARD`, destinate exclusiv operațiunilor de lustruire cu paste abrazive.

### 2.9. Sistemul de Capace Abrazive POLICAP® (`POLICAP`)
* **Ce sunt:** Manșoane / capace abrazive de formă cilindrică sau conică, fără îmbinare, utilizate în matrițerii pentru finisarea formelor complexe.
* **Componente asociate:** `POLICAP ABR. CONES` (Capacele abrazive consumabile) și `PC-HOLDER` / `PCT` (Suporturile extensibile din cauciuc pe care se montează capacele).

### 2.10. Pile Ac și Pile de Precizie (`NEEDLE FILE`)
* **Ce sunt:** Pile miniaturale folosite în mecanica fină, bijuterie și retușuri de matrițe.
* **Sintaxă (ex: `NEEDLE FILE 2401P 140 C2`):** `2401P` = Tipul profilului (plat, rotund, semirotund, triunghiular); `140` = Lungimea pilei în milimetri (140 mm); `C2` = Dantură medie (*Cut 2*).

### 2.11. Discuri pentru Polizor de Banc (`BENCH WHEEL`)
* **Ce sunt:** Pietre polizoare circulare de dimensiuni mari pentru utilaje staționare de banc.
* **Sintaxă (ex: `BENCH WHEEL BW 15016-32 AN 60 HSS`):** `BW` = *Bench Wheel*; `15016-32` = Diametru 150 mm x Lățime 16 mm x Alezaj interior de 32 mm (livrat cu inele de reducție); `AN 60` = Granulă abrazivă medie; `HSS` / `CARBIDE` = Materialul sculelor pentru care este optimizat discul la ascuțire.

### 2.12. Discuri Staționare de Ascuțit Lanțuri (`SC CS-G`)
* **Ce sunt:** Discuri abrazive subțiri utilizate pe mașini staționare pentru ascuțirea dintelui de lanț de drujbă.
* **Sintaxă (ex: `SC CS-G 145x4,7x22,2 AD 60J7V`):** `145x4,7x22,2` = Diametru x Grosime x Alezaj în mm.

### 2.13. Scule de Debavurat Manual (`DEBURRING BLADE` / `DEBURRING HANDLE`)
* **Ce sunt:** Lame de schimb din oțel special (`DEBURRING BLADE`) și mânere ergonomice (`DEBURRING HANDLE`) destinate eliminării manuale a bavurilor rămase pe marginile de tablă sau țevi tăiate.

### 2.14. Micro-burghie Industriale CNC Monobloc (`SCD-...`)
* **Ce sunt:** Micro-burghie monobloc de înaltă precizie din carbură metalică dură (*Solid Carbide Drills*) folosite pe mașini CNC pentru găurirea rapidă a oțelurilor aliate.

---

## 3. Matricea de Accesorii Industriale și Piese de Schimb

Aproximativ 20% din fișierul CSV conține piese hardware structurale și componente originale de schimb pentru mașinile de antrenare (Manualul 8). Acestea sunt identificate prin prefixe de 3 litere:

* **`SPZ` (Spannzange) ➔ Pensete de prindere:** Bucșe elastice conice pentru prinderea sculelor cu tijă în polizoarele drepte.
* **`SPF` (Spannflansch) ➔ Flanșe de strângere:** Discuri de fixare axială pentru prinderea periilor sau discurilor speciale pe axul filetat.
* **`SPV` (Spannspindelve Verlängerung) ➔ Prelungitoare de ax:** Adaptoare pentru extinderea razei de acțiune a frezelor în spații adânve.
* **`SPSH` ➔ Dornuri de fixare:** Suporturi tip ax metalic destinate prinderii pietrelor sau barelor lungi de finisat în mașinile drepte.
* **`Red.-Ringe` ➔ Inele de reducție:** Bucșe/inele concentrice din plastic sau metal pentru reducerea alezajului central al discurilor abrazive mari.

### 3.1. Identificarea Pieselor după Numărul de Articol (`PDT_SUP_REF`)
Dacă denumirea în engleză din fișier este generică (ex: `BOLT`, `O-RING`, `BALL BEARING`, `VANES`), prima cifră a codului oferă segmentarea corectă:
* **Gama `871xxxxx`:** Piese de schimb destinate exclusiv **Mașinilor cu Ax Flexibil** (*Flexible Shaft Drives*).
* **Gama `900xxxxx` / `952xxxxx`:** Piese de schimb originale pentru **Sculele Pneumatice PFERD** (carcase `HOUSING`, palete `VANES`, supape `VALVE`).

---

## 4. Ghid de Optimizare E-commerce pentru România

1. **Curățarea Denumirilor Scurte:** La import, se vor elimina complet abrevierile ERP (`C/O WHL` ➔ *Disc debitare*, `MTD.POINT` ➔ *Piatră polizoare cu tijă*, `TC-BURRS` ➔ *Freză rotativă din carbură*).
2. **Activarea Filtrelor Tehnice:** Filtre separate pentru `Material` (STEEL, INOX, ALU), `Prindere` (M14, tijă 3/6 mm) și `X-LOCK` (sistem rapid Bosch).

---

## 5. Ghid de Traducere și Reguli Sterile de Prompting pentru Agenți AI (Bulk Batch)

Aceste reguli constituie **System Prompt-ul de siguranță** care blochează modurile de eșec lingvistic descoperite anterior.

### 🛑 Reguli de Cenzură pentru Engleza Reziduală și Eliminarea Anti-Tiparelor

#### 5.1. Regula Ștergerii Complete a Prefixului de Clasă (Eliminarea Redundanței)
Cuvintele în engleză de tip categorie de la începutul etichetelor (`TC-BURRS`, `MTD.POINT`, `CUT-OFF WHEEL`, `FAN GRINDER`, `NEEDLE FILE`, `BENCH WHEEL`) **NU** trebuie lăsate în titlul comercial în limba română sub nicio formă! Rolul lor este preluat integral de traducerea românească de la începutul titlului.
* ❌ **ANTI-TIPAR GREȘIT:** `Piatra de polizat cu tija PFERD MTD.POINT ZY 1025...`
* ─ **FORMAT CORECT RECOMANDAT:** `Piatră polizoare cu tijă PFERD ZY 1025 6 ADW 80 M5V Steel, cap Ø10 mm x 25 mm, tija Ø6 mm`
* ❌ **ANTI-TIPAR GREȘIT:** `Freză rotativă din carbură metalică PFERD TC-BURRS WRC 1225...`
* ─ **FORMAT CORECT RECOMANDAT:** `Freză rotativă din carbură metalică PFERD WRC 1225/6 C4, cap Ø12 mm x 25 mm, tija Ø6 mm`

#### 5.2. Regula Inversării Topicii pentru Piese Hardware Compuse (Substantiv + Determinator)
Când traduci termeni compuși din două sau mai multe cuvinte care definesc piese de schimb mecanice mici sau carcase (`PLASTIC COVER`, `RETAINING RING`, `SPACER WASHER`, `BEARING HOUSING`, `VALVE HOUSING`, `CLAMPING PIECE`), ordinea din engleză trebuie **inversată obligatoriu**. Al doilea cuvânt devine substantivul principal în română plasat la început, iar primul devine determinant.
* ❌ **ANTI-TIPAR GREȘIT:** `Plastic capac PFERD` sau `Rulment PFERD HOUSING`
* ─ **FORMAT CORECT RECOMANDAT:** `Capac din plastic PFERD` sau `Carcasă de rulment PFERD`
* ❌ **ANTI-TIPAR GREȘIT:** `De retinere inel...` sau `Retinere inel...`
* ─ **FORMAT CORECT RECOMANDAT:** `Inel de retenție PFERD`
* ❌ **ANTI-TIPAR GREȘIT:** `De strangere PFERD PIECE...`
* ─ **FORMAT CORECT RECOMANDAT:** `Piesă de strângere PFERD...`

#### 5.3. Regula Ștergerii Absolute a Cuvintelor Reziduale de la Coada Traducerii
Este strict interzisă duplicarea sau păstrarea cuvântului original în engleză la finalul textului tradus în română (ex: `PFERD WASHER`, `PFERD RING`, `PFERD PIECE`, `PFERD PLUG`). Dacă ai tradus deja conceptul la început (`Șaibă distanțieră`, `Garnitură de etanșare`), cuvântul rezidual de la final se elimină complet.
* ❌ **ANTI-TIPAR GREȘIT:** `Piesa distantiera PFERD WASHER`
* ─ **FORMAT CORECT RECOMANDAT:** `Șaibă distanțieră PFERD`
* ❌ **ANTI-TIPAR GREȘIT:** `Garnitura de etansare PFERD RING`
* ─ **FORMAT CORECT RECOMANDAT:** `Garnitură de etanșare PFERD`

#### 5.4. Regula Specială pentru Etichete de Identificare (`LABEL` / `LABLE`)
În fișier există repere de tipul `LABEL PFERD 40x12 209` sau `LABLE WITHOUT OIL 50X12`. Acestea reprezintă etichete fizice autocolante sau plăcuțe de marcaj folosite în fabrică sau ambalare. Ele trebuie curățate de typo-uri (din `LABLE` în `Etichetă`) și traduse curat.
* ❌ **ANTI-TIPAR GREȘIT:** `LABLE WITHOUT OIL 50X12 209 PFERD`
* ─ **FORMAT CORECT RECOMANDAT:** `Etichetă de marcaj PFERD, fără ulei, dimensiuni 50 x 12 mm`

#### 5.5. Regula Traducerii Ansamblurilor Complexe și Furtunurilor (`CPL.` / `AIR SUP.HOSE`)
* `CPL.` / `CPL.M.GEW.` se extinde întotdeauna ca: `complet echipat` sau `complet asamblat cu mufe filetate`.
* `AIR SUP.HOSE` se traduce ca: `Furtun de alimentare cu aer pneumatic`.

#### 5.6. Regula Atributelor de Ambalare și Acoperiri de Nișă (`BULK` / `HC-FEP`)
* `BULK-P.` / `BULK` devine: `(ambalare industrială vrac)`.
* `HC-FEP` / `HICOAT` devine: `cu acoperire premium HICOAT`.

---

### 🔍 Dicționar Universal de Mapare pentru Agentul AI

| Termen Brut în `ITEM_LABEL` | Traducere și Extindere Standardizată în Română |
| :--- | :--- |
| `SCD-...` | Microburghiu din carbură metalică PFERD SCD-... |
| `DEBURRING BLADE` | Lamă de schimb pentru debavurător manual PFERD |
| `DEBURRING HANDLE` | Mâner pentru debavurător manual PFERD |
| `STEP DRILL` / `STB` | Burghiu în trepte PFERD |
| `DRESSING STONE` | Piatră de corecție și îndreptare discuri abrazive PFERD |
| `Finishing stones arbor` / `SPSH` | Dorn de fixare PFERD SPSH pentru pietre de finisat |
| `Red.-Ringe` | Inele de reducție PFERD pentru discuri abrazive |
| `SANDING STICK` | Pilă abrazivă manuală elastică PFERD |
| `POLIFLEX BLOCKS` / `PFB` | Bloc abraziv elastic PFERD POLIFLEX |
| `CBN-GRINDING` | Disc abraziv CBN PFERD |
| `MOUNT.POINT SET` / `SET/` | Set corpuri abrazive PFERD |
| `CHAIN SAW SHARPENER` | Dispozitiv manual de ascuțit lanț drujbă |
| `CHAIN SHARP MULTITOOL` | Dispozitiv multifuncțional de ascuțit lanț drujbă |
| `FINISH.CUTTER` | Freză de finisare și debavurare |
| `TC-BURRS` / `TC-BURR` | Freză rotativă din carbură metalică |
| `FLANGE SPF` | Flanșă de strângere PFERD SPF |
| `SPACER FLANGE` | Flanșă distanțieră |
| `MTD.POINT` | Piatră polizoare cu tijă |
| `CUT-OFF WHEEL` / `C/O WHL` | Disc abraziv de debitare |
| `GRINDING WHEEL` / `GRIND WHL`| Disc abraziv de degroșare |
| `TWIST DRILL` | Burghiu elicoidal |
| `FLAP WH.` / `FLAP WHEEL` | Perie abrazivă cu lamele |
| `ABRAS. SPIRAL BANDS` | Inele abrazive cilindrice (Spirale) |
| `COLLET SPZ` | Pensetă de prindere PFERD SPZ |
| `EXTENSION SPV` | Prelungitor de ax PFERD SPV |
| `BALL BEARING` | Rulment cu bile |
| `BEARING HOUSING` | Carcasă de rulment |
| `VALVE HOUSING` | Carcasă pentru supapă |

---

### 🛠️ Matrice Complexă de Exemple Few-Shot (Injecție Directă în Prompt)

1. **Input:** `CHAIN SAW SHARPENER CS-SL-5,5MM`
   * **Output:** `Dispozitiv manual de ascuțit lanț drujbă PFERD Chain Sharp CS-SL, diametru 5.5 mm`
2. **Input:** `CHAIN SAW SHARPENER CS-X-4,0mm`
   * **Output:** `Dispozitiv manual de ascuțit lanț drujbă PFERD Chain Sharp CS-X, diametru 4.0 mm`
3. **Input:** `FINISH.CUTTER HSS 953 3S SP`
   * **Output:** `Freză de finisare și debavurare HSS PFERD 953, cu 3 tăișuri`
4. **Input:** `FLANGE SPF 95209601`
   * **Output:** `Flanșă de strângere PFERD SPF 95209601 pentru scule pneumatice`
5. **Input:** `FLANGE SPF 87101602 28/10`
   * **Output:** `Flanșă de strângere PFERD SPF 87101602, 28 mm / interior 10 mm`
6. **Input:** `CUT-OFF WHEEL EHT 125-2,0 SG STEELOX`
   * **Output:** `Disc abraziv de debitare PFERD EHT 125-2.0 SG STEELOX, 125 x 2.0 mm`
7. **Input:** `TWIST DRILL SPB DIN338 HSSG N 4,1 STEEL`
   * **Output:** `Burghiu elicoidal HSSG PFERD SPB, conform DIN 338, diametru 4.1 mm pentru oțel`
8. **Input:** `BRUSH RBUIT 7015/6 INOX 0,30`
   * **Output:** `Perie industrială de sârmă circulară PFERD RBUIT 7015/6 INOX, sârmă 0.30 mm, prindere tijă 6 mm`
9. **Input:** `FAN GRINDER F 3015/6 A120`
   * **Output:** `Corp abraziv lamelar cu tijă PFERD F 3015/6, granulație A120, 30 x 15 mm, tijă 6 mm`
10. **Input:** `BENCH WHEEL BW 15016-32 AN 24 UNIVERSAL`
    * **Output:** `Disc abraziv pentru polizor de banc PFERD BW 15016-32 Universal, 150 x 16 mm, alezaj 32 mm`
11. **Input:** `NEEDLE FILE 2401P 140 C2 HAND`
    * **Output:** `Pilă ac de precizie PFERD 2401P, lungime 140 mm, tăietură Cut 2`
12. **Input:** `POLICAP ABR. CONES PC ZYA 0510 A 80`
    * **Output:** `Capac abraziv cilindric POLICAP PFERD ZYA 0510, granulație A80, 5 x 10 mm`
13. **Input:** `PLASTIC COVER`
    * **Output:** `Capac din plastic PFERD`
14. **Input:** `RETAINING RING SW HA 10 G28`
    * **Output:** `Inel de retenție PFERD SW HA 10 G28`
15. **Input:** `SPACER WASHER`
    * **Output:** `Șaibă distanțieră PFERD`
16. **Input:** `CLAMPING PIECE KL-ST 7205`
    * **Output:** `Piesă de strângere PFERD KL-ST 7205`
17. **Input:** `STEP DRILL STB HSSE 04-39/10`
    * **Output:** `Burghiu în trepte HSSE PFERD STB, plajă găurire 4-39 mm, prindere 10 mm`
18. **Input:** `DRESSING STONE SE 702212 CU 46 M5V`
    * **Output:** `Piatră de corecție și îndreptare discuri abrazive PFERD SE, 70 x 22 x 12 mm`
19. **Input:** `SC CS-G 145x4,7x22,2 AD 60J7V`
    * **Output:** `Disc staționar PFERD SC CS-G pentru ascuțit lanț drujbă, 145 x 4.7 x 22.2 mm`
20. **Input:** `Red.-Ringe 51/32/25,4/19,05/15,875/12,7`
    * **Output:** `Set inele de reducție PFERD pentru discuri abrazive, diametru exterior 51 mm`
21. **Input:** `SCM-UC4-M030C-M57HB6 AL40`
    * **Output:** `Material abraziv nețesut pentru finisare PFERD SCM-UC4-M030C-M57HB6 AL40`
22. **Input:** `SCD-U-3D-M03.000-14IC LA40`
    * **Output:** `Microburghiu din carbură metalică PFERD SCD-U-3D-M03.000-14IC LA40`
23. **Input:** `DEBURRING BLADE BS 1010`
    * **Output:** `Lamă de schimb pentru debavurător manual PFERD BS 1010`
24. **Input:** `BEARING HOUSING`
    * **Output:** `Carcasă de rulment PFERD`
25. **Input:** `4M AIR SUP.HOSE PLS 16HD CPL.`
    * **Output:** `Furtun de alimentare cu aer pneumatic PFERD PLS 16HD, lungime 4 m, complet echipat`
