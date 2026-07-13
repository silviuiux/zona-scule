# Blueprint de Nomenclatură PFERD (August Rüggeberg) & Master Catalog Guide
## Document Tehnic Suprem pentru Automatizare AI și Curățare Baze de Date E-commerce

Acest document reprezintă ghidul tehnic de sistem conceput pentru a instrui, ghida și corecta Agenții AI (LLM) în procesul de traducere, curățare și optimizare în masă (*bulk batch processing*) a nomenclaturii produselor **PFERD**. Ghidul acoperă integral toate cele 16.220 de repere din catalog (consumabile abrazive, scule așchietoare, pile de precizie, dispozitive de ascuțit și cele peste 2.000 de piese hardware mecanice de schimb din Manualul 8/9).

---

## 1. Pilonul Strategic: Liniile de Performanță (Codul de Culori PFERD)

Orice sculă abrazivă sau așchietoare PFERD este clasificată în trei mari linii de performanță care definesc randamentul industrial și nivelul de preț:

### 1.1. 🟧 Linia Universală PSF (PS-FORTE)
* **Aplicație:** Utilizare generală, mentenanță curentă, lăcătușărie standard și ateliere medii. Raport optim preț-calitate pentru utilizare intermitentă.
* **Codificare în ERP:** Conține acronimul `PSF` (ex: `POLIFAN PFF 115 Z80 PSF STEELOX`).

### 1.2. ⬜ Linia de Performanță SG (SG-ELASTIC)
* **Aplicație:** Utilizare industrială intensivă, fluxuri continue de producție, șantiere navale și confecții metalice grele.
* **Codificare în ERP:** Conține acronimul `SG` (ex: `CUT-OFF WHEEL EHT 125-2,0 SG STEELOX`).

### 1.3. 🟦 Linia Specială / Înaltă Performanță SGP (SG-PLUS)
* **Aplicație:** Aplicații critice în regim de fabrică, materiale ultra-dure (Titan, Inconel, oțeluri călite), viteză maximă de procesare.
* **Codificare în ERP:** Conține acronimul `SGP` (ex: `PFF 115 Z60 SGP FORCE STEEL`).

---

## 2. Decodificarea și Clasificarea Tuturor Categoriilor de Scule PFERD

### 2.1. Pile Industriale, Raspe și Mânere (Manualul Tehnic 1)
Această gamă conține cele mai grave anomalii din traducerile vechi (cum ar fi interpretarea cuvântului `KEY` ca „cheie” sau `CHAIN` ca „lanț”). Agentul AI trebuie să folosească următoarele denumiri tehnice românești standardizate:

* **`HAND FILE` / `FLAT FILE`:** Pilă plată de mână (uz general).
* **`HALFROUND FILE` / `HLFR. FILE`:** Pilă semirotundă.
* **`SQUARE FILE` / `SQ. FILE` / `THSQ.`:** Pilă pătrată / Pilă pătrată subțire.
* **`THREE SQ. FILE` / `TRIANGULAR`:** Pilă triunghiulară.
* **`ROUND FILE` / `RD. FILE`:** Pilă rotundă.
* **`KEY FILE` / `HAND 1117` / `KFH`:** **Pilă fină pentru lăcătușărie** (sau pilă pentru profile/chei).
  * 🛑 *NOTĂ CRITICĂ:* Traducerea ca „Cheie” este o eroare grosolană. Se referă la pilele mici folosite istoric la ajustarea butucilor.
* **`NEEDLE FILE` / `CORINOX NEEDLE F.`:** **Pilă de precizie tip ac** (sau Pilă de precizie CORINOX tip ac). Termenul simplu „pilă ac” nu este acceptat comercial.
* **`RIFFLER` / `RIFFLER FILE` / `RIFFLER RASP`:** Pilă curbată pentru matrițerii (sau Raspă curbată pentru sculptură).
* **`HAND RASP` / `WOOD RASP` / `WOOD FILE`:** Raspă pentru lemn (Rindea manuală pentru lemn).
* **`STAIRCASE-M.FILE RASP`:** Raspă specială pentru trepte de lemn (scări).
* **`HORSE SHOE FILE` / `HOOF PLANE`:** Pilă/Rindea pentru potcovit (îngrijirea copitelor).
* **`BRAKE CALIPER FILES` (`BSF`):** Pilă specială pentru curățat etrieri de frână.
* **`CAR BODY FILES` / `Auto corp pila`:** Pilă pentru caroserie auto (tinichigerie).
* **`LATHE FILE`:** Pilă pentru strung (geometrie specială pentru finisarea pieselor în rotație).
* **`TUNGSTEN POINT FILE`:** Pilă pentru contacte electrice de tungsten/platină (miniatură ultra-îngustă).
* **`MILLED TO.BLADE` / `ED TO.BLADE`:** Lamă de freză manuală (lame frezate speciale).
* **`SAW FILE` / `BAND SAW FILE` / `CANTSAW FILE` / `MILL SAW FILE`:** Pilă pentru ascuțit pânze de ferăstrău.

### 2.2. Discuri de Debitare, Degroșare și Finisare (Manualele 4 și 6)
* **`EHT`:** Disc plat de debitare (Tip 41).
* **`EH`:** Disc cu centru depresat de debitare (Tip 42).
* **`E`:** Disc abraziv gros pentru degroșare (Tip 27).
* **`POLIFAN®` (`PFF` / `PFC`):** Discuri abrazive cu lamele (PFF = Plat, PFC = Conic).
* **`CC-GRIND®` / `COMBICLICK`:** Discuri abrazive rigide silențioase / Sistem modular COMBICLICK.
* **`VELCRO DISCS`:** Discuri abrazive cu prindere autoadezivă (Velcro / arici).
* **`FIBRE DISC`:** Disc abraziv pe suport de fibră vulcanizată.
* **`ABRAS. SPIRAL BANDS`:** Inele abrazive cilindrice (Spirale abrazive pe suport textil).
* **`FAN GRINDER` / `FELT FAN`:** Corp abraziv lamelar cu tijă (șmirghel) / Perie lamelară din pâslă pentru lustruire.
* **`POLICAP` / `POLICAP ABR. CONES`:** Capace abrazive POLICAP (consumabile cilindrice/conice fără sfârșit).

### 2.3. Dispozitive de Ascuțit Lanțuri de Drujbă (Gama Forestieră)
* **`CHAIN SAW SHARPENER` / `CHAIN SHARP` / `KSSG 90` / `KSSG 91`:** Dispozitiv manual pentru ascuțit lanțuri de drujbă.
  * 🛑 *NOTĂ CRITICĂ:* Baza veche punea prefixul eronat „Lant”. Aceste repere sunt **dispozitive metalice de ghidaj**, NU lanțuri! Textul corect este: *Dispozitiv manual de ascuțit lanț drujbă PFERD KSSG...*
* **`CHAIN SHARPENING GAUGE` / `KSSL` / `DEPTH GAUGE`:** Șablon / Limitator de adâncime pentru ascuțire lanț drujbă.
* **`SC CS-G`:** Disc abraziv staționar pentru mașini electrice de ascuțit lanțuri de drujbă.

### 2.4. Scule Așchietoare Industriale și Teșitoare (Manualul 2)
* **`TC-BURRS` / `TC-BURR`:** Freză rotativă din carbură metalică (Tungsten Carbide).
* **`FINISH.CUTTER` / `CUTTER HSS`:** Freză de finisare și debavurare din oțel rapid HSS.
* **`STEP DRILL` / `STB`:** Burghiu în trepte PFERD (pentru table).
* **`SCD-...`:** Microburghiu monobloc din carbură metalică pentru CNC.
* **`ENGRAV.CUTTER` / `ALUMINIUM CUTTER`:** Freză HSS pentru gravare / Freză HSS pentru aluminiu.
* **`COUNTERSINKER` / `COUNTERS.SET` / `KES HSS`:** Adâncitor (Teșitor) HSS / Set adâncitoare HSS.
* **`FLAT COUNTERS.` / `FLS HSS`:** Lamator HSS (burghiu/sculă de zencuit plat conform DIN 373).
* **`HOLE SAW`:** Carotă industrială PFERD.

### 2.5. Perii Industriale de Sârmă (Manualul 7)
* **`RBU` / `RBG` / `HBF` / `IBU`:** Perie industrială de sârmă (Circulară / Împletită heavy-duty / Tip pensulă / Perie cilindrică de interior).
* **`ST` / `INOX` / `MES`:** Sârmă din oțel carbon / Oțel inoxidabil / Alamă.

### 2.6. Corpuri Tehnice de Corecție, Finisaj Manual și Superabrazivi
* **`DRESSING STONE`:** Piatră de corecție, îndreptare și decolmatare discuri abrazive.
* **`SANDING STICK` / `PVSK`:** Pilă abrazivă manuală elastică / Burete abraziv neteșut POLINOX.
* **`POLIFLEX BLOCKS` / `PFB`:** Bloc abraziv elastic PFERD POLIFLEX (material poliuretanic PUR).
* **`DIA.POINT` / `CBN-GRINDING` / `DZY/S`:** Corp polizor diamantat / Disc abraziv CBN / Pilă de precizie diamantată tip ac.
* **`DIA-CUP-WHL` / `DCW 2R` / `DIAMOND CORE DRILL`:** Disc oală diamantat / Carotă diamantată.

---

## 3. Matricea de Accesorii Mașini, Hardware și Cele 2.000 de Piese de Schimb

Grupul de ~2.000 de repere pur mecanice din Manualul 8/9 (piese de schimb originale pentru mașinile pneumatice, electrice și axuri flexibile PFERD) va fi mapat integral conform acestui set rigid de conversie:

### 3.1. Suporturi, Mandrine și Mânere (Tool Accessories)
* **`COLLET SPZ`:** Pensetă de prindere PFERD SPZ.
* **`FLANGE SPF` / `FRONT FLANGE VFL`:** Flanșă de strângere PFERD SPF / Flanșă frontală.
* **`EXTENSION SPV` / `SPVH`:** Prelungitor de ax PFERD SPV.
* **`Finishing stones arbor` / `SPSH`:** Dorn de fixare PFERD SPSH pentru pietre de finisat.
* **`TOOL HOLDERS` / `TOOL HOLDER` / `PVR`:** Dorn suport / Portsculă PFERD.
* **`NEEDLE F. HOLD.` / `NFH` / `KSSL`:** Mâner / Mandrină de prindere pentru pile ac / Set suporturi.
* **`Red.-Ringe`:** Set inele de reducție pentru discuri abrazive.
* **`QUICK MOUNTING TYPE SH`:** Sistem de montare rapidă PFERD SH.
* **`BACKING PAD`:** Pad de sprijin / Suport pentru discuri abrazive.
* **`PLASTIC HANDLE FH` / `WOODEN HANDLE`:** Mâner din plastic / Mâner din lemn pentru pile.
* **`PLASTIC CASE KH` / `ROLL CASE`:** Casetă din plastic pentru depozitare / Trusă (husă) rulabilă din plastic.

### 3.2. Componente Mecanice Interne Industriale (Piese Pure Manual 8)
* **`BEARING HOUSING` / `R.BEAR.HOUSING`:** Carcasă de rulment PFERD.
* **`VALVE HOUSING` / `MOTOR HOUSING`:** Carcasă pentru supapă PFERD / Carcasă de motor pneumatic.
* **`OUTER/INNER CONTROLLER HOUSING`:** Carcasă exterioară/interioară de control PFERD.
* **`ANGELED HEAD HOUSING`:** Carcasă pentru cap unghiular pneumatic PFERD.
* **`VALVE BODY`:** Corp pentru supapă PFERD.
* **`GEAR WHEEL` / `BEVEL GEAR SET` / `BEVEL GEARING`:** Roată dințată / Set angrenaj conic / Angrenaj conic PFERD.
* **`PLANETARY CAGE`:** Colivie planetară (suport sateliți) PFERD.
* **`LOCK RING` / `RETAINING RING`:** Inel de blocare PFERD / Inel de retenție (Circlip).
* **`SPACER WASHER` / `SPACER RING` / `SPACER SLEEVE`:** Șaibă distanțieră / Inel distanțier / Bucșă distanțieră PFERD.
* **`VALVE SCREW` / `FLANGE SCREW` / `BOLT` / `PISTON`:** Șurub pentru supapă / Șurub de flanșă / Bolț / Piston PFERD.
* **`AIR SUP.HOSE` / `HOSE COUPLING`:** Furtun de alimentare cu aer pneumatic PFERD / Cuplaj furtun.
* **`ANGLE HEAD` / `AIR INLET` / `SEAL PLATE` / `VANES`:** Cap unghiular / Admisie de aer / Placă de etanșare (Garnitură) / Palete pentru motor pneumatic.

---

## 4. Reguli Sterile de Curățare și Prompting pentru Agenți AI (Bulk Batch)

Aceste reguli constituie **Garda de Corp lingvistică** obligatorie pentru a opri defectele detectate în rulările anterioare:

### 🛑 Reguli de Eliminare a Anti-Tiparelor Relansate

#### 4.1. Regula Ignorării Complete a Baseline-ului Vechi (Sterilizare Sursă)
Agentul AI trebuie să ignore complet traducerile defectuoase introduse în bazele de date intermediare (`Lant...`, `Cheie...`, `Patrat pila...`, `Rulment PFERD HOUSING`). Sursa exclusivă și suverană de adevăr tehnic este coloana originală în limba engleză **`ITEM_LABEL`** sau **`PDT_SUMMARY`**!

#### 4.2. Regula Ștergerii Complete a Prefixului de Sortare ERP
Cuvintele în engleză de tip categorie de la începutul etichetelor (`TC-BURRS`, `MTD.POINT`, `CUT-OFF WHEEL`, `FAN GRINDER`, `NEEDLE FILE`, `BENCH WHEEL`) **NU** trebuie lăsate în titlul comercial în limba română! Rolul lor este preluat de traducerea extinsă românească.
* ❌ **ANTI-TIPAR:** `Piatra de polizat cu tija PFERD MTD.POINT ZY...`
* ─ **CORECT:** `Piatră polizoare cu tijă PFERD ZY...`

#### 4.3. Regula Inversării Topicii pentru Piese Hardware Compuse (Substantiv + Determinator)
Toate piesele mecanice, carcasele și subansamblurile se traduc obligatoriu inversând structura engleză (`VALVE BODY` ➔ `Corp pentru supapă PFERD`, nu `Supapa PFERD BODY`; `BEARING HOUSING` ➔ `Carcasă de rulment PFERD`, nu `Rulment PFERD HOUSING`).

#### 4.4. Regula Ștergerii Absolute a Cuvintelor Reziduale de la Coada Traducerii
Este strict interzisă duplicarea sau păstrarea cuvântului original în engleză la finalul textului tradus în română (`PFERD WASHER`, `PFERD RING`, `PFERD PIECE`, `PFERD PLUG`, `PFERD WHEEL`). Dacă ai tradus deja conceptul la început (`Șaibă distanțieră`, `Garnitură de etanșare`), cuvântul rezidual de la final se elimină complet.
* ❌ **ANTI-TIPAR:** `Piesa distantiera PFERD WASHER`
* ─ **CORECT:** `Șaibă distanțieră PFERD`

#### 4.5. Regula Ștergerii și Curățării Indicatoarelor de Metadate de Tăiere Mașină (`80 T` / `100 T`)
Prefixe de tipul `80 T 150-...` sau `100 T 350-...` reprezintă viteze periferice maxime ($80	ext{ m/s}$ sau $100	ext{ m/s}$) și tipul discului (`T` = tăiere/debitare). Ele trebuie curățate din textul brut și mutate ca atribute la final:
* ❌ **ANTI-TIPAR:** `80 T 150-1,0 H SG LAB HD STEELOX PFERD`
* ─ **CORECT:** `Disc abraziv de debitare pentru laborator metalografic PFERD SG STEELOX, 150 x 1.0 mm, viteză maximă 80 m/s`

#### 4.6. Regula Suffixelor Speciale
* `CPL.` / `CPL.M.GEW.` se extinde ca: `, complet echipat` / `, complet asamblat cu mufe filetate`.
* `BULK-P.` / `BULK` se extinde ca: `(ambalare industrială vrac)`.
* `HC-FEP` / `HICOAT` se extinde ca: `cu acoperire premium HICOAT`.

---

## 5. Matricea Completă de Exemple Few-Shot (25 de Tipare de Antrenament)

Aceste exemple servesc ca mostre fixe de învățare directă pentru re-rularea pipeline-ului:

1. **Input:** `CHAIN SAW SHARPENER KSSG 90-4,8`
   * **Output:** `Dispozitiv manual de ascuțit lanț drujbă PFERD KSSG 90-4.8`
2. **Input:** `CHAIN SHARP SET CS-SLS-4,0MM`
   * **Output:** `Dispozitiv manual de ascuțit lanț drujbă PFERD Chain Sharp CS-SLS, diametru 4.0 mm`
3. **Input:** `HAND FILE 1112 150 C1`
   * **Output:** `Pilă plată de mână PFERD 1112, lungime 150 mm, tăietură Cut 1`
4. **Input:** `KEY FILE HAND 1117 100 C2`
   * **Output:** `Pilă fină pentru lăcătușărie PFERD 1117, lungime 100 mm, tăietură Cut 2`
5. **Input:** `NEEDLE FILE 2401P 140 C2 HAND`
   * **Output:** `Pilă de precizie tip ac PFERD 2401P, lungime 140 mm, tăietură Cut 2`
6. **Input:** `CORINOX NEEDLE F. COR 2306P 180 C0 FLAT`
   * **Output:** `Pilă de precizie CORINOX tip ac PFERD COR 2306P Plat, lungime 180 mm, tăietură Cut 0`
7. **Input:** `WOOD RASP HLFR.1552 250C1`
   * **Output:** `Raspă semirotundă pentru lemn PFERD 1552, lungime 250 mm, tăietură Cut 1`
8. **Input:** `BEARING HOUSING`
   * **Output:** `Carcasă de rulment PFERD`
9. **Input:** `VALVE HOUSING`
   * **Output:** `Carcasă pentru supapă PFERD`
10. **Input:** `SPACER WASHER`
    * **Output:** `Șaibă distanțieră PFERD`
11. **Input:** `GEAR WHEEL Z=38`
    * **Output:** `Roată dințată PFERD Z=38`
12. **Input:** `BEVEL GEARING`
    * **Output:** `Angrenaj conic PFERD`
13. **Input:** `PLANETARY CAGE`
    * **Output:** `Colivie planetară (suport sateliți) PFERD`
14. **Input:** `LOCK RING`
    * **Output:** `Inel de blocare PFERD`
15. **Input:** `AIR SUP.HOSE PLS 16HD CPL.M.GEW.1/2"`
    * **Output:** `Furtun de alimentare cu aer pneumatic PFERD PLS 16HD, lungime 4 m, complet asamblat cu mufe filetate 1/2"`
16. **Input:** `TC-BURRS SPG 1020/6 STEEL HC-FEP`
    * **Output:** `Freză rotativă din carbură metalică (forma arbore cu cap ascuțit) PFERD SPG 1020/6 STEEL cu acoperire premium HICOAT, cap Ø10 mm x 20 mm, tija Ø6 mm`
17. **Input:** `ABRAS. SPIRAL BANDS GSB5125 A60  BULK-P.`
    * **Output:** `Inel abraziv cilindric (spirala) PFERD GSB5125 A60 (ambalare industrială vrac), diametru 51 mm, lungime 25 mm, granulație 60`
18. **Input:** `DRESSING STONE SE 702212 CU 46 M5V`
    * **Output:** `Piatră de corecție și îndreptare discuri abrazive PFERD SE, 70 x 22 x 12 mm`
19. **Input:** `STEP DRILL STB HSSE 04-39/10`
    * **Output:** `Burghiu în trepte HSSE PFERD STB, plajă găurire 4-39 mm, prindere 10 mm`
20. **Input:** `Red.-Ringe 51/32/25,4/19,05/15,875/12,7`
    * **Output:** `Set inele de reducție PFERD pentru discuri abrazive, diametru exterior 51 mm`
21. **Input:** `PLASTIC CASE KH 300`
    * **Output:** `Casetă din plastic pentru depozitare PFERD KH 300`
22. **Input:** `WOODEN HANDLE HKSF 100/1`
    * **Output:** `Mâner din lemn PFERD HKSF 100/1`
23. **Input:** `N.FILE ROLL CASE 266/14 P1`
    * **Output:** `Trusă rulabilă din plastic pentru pile ac PFERD 266/14 P1`
24. **Input:** `HOLD.NFH 212 (1)`
    * **Output:** `Mandrină de prindere pentru pile ac PFERD NFH 212`
25. **Input:** `PF 900 SET OF RIFFLERS`
    * **Output:** `Set pile speciale riflate PFERD PF 900`
