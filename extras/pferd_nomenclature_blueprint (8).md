# Blueprint de Nomenclatură PFERD (August Rüggeberg) & Master Catalog Guide
## Document Tehnic Suprem pentru Automatizare AI și Curățare Baze de Date E-commerce (Versiunea 2.0 Consolidată)

Acest document reprezintă ghidul tehnic suprem de sistem conceput pentru a instrui, ghida și corecta Agenții AI (LLM) în procesul de traducere, curățare și optimizare în masă (*bulk batch processing*) a nomenclaturii produselor **PFERD**. Ghidul oferă acoperire completă de 100% pentru toate cele 16.220 de repere din catalog (consumabile abrazive, scule așchietoare, dispozitive forestiere și piese de schimb mecanice din Manualul 8/9), eliminând complet engleza reziduală și integrând toate variantele alternative de abrevieri identificate în listele de repere netraduse.

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

* **`HAND FILE` / `FLAT FILE` / `FLAT COUNTERS.`:** Pilă plată de mână (uz general) / Lamator HSS (zencuitor plat DIN 373).
* **`HALFROUND FILE` / `HLFR. FILE`:** Pilă semirotundă.
* **`SQUARE FILE` / `SQ. FILE` / `THSQ.`:** Pilă pătrată / Pilă pătrată subțire.
* **`THREE SQ. FILE` / `TRIANGULAR`:** Pilă triunghiulară.
* **`ROUND FILE` / `RD. FILE`:** Pilă rotundă.
* **`REG. PILLAR` / `REG.`:** Pilă rectangulară groasă pentru lăcătușărie (*Registerfeile / Pillar file*).
* **`KEY FILE` / `HAND 1117` / `KFH`:** **Pilă fină pentru lăcătușărie** (sau pilă pentru profile/chei).
  * 🛑 *NOTĂ CRITICĂ:* Traducerea ca „Cheie” este o eroare grosolană. Se referă la pilele mici folosite istoric la ajustarea butucilor de broască.
* **`NEEDLE FILE` / `CORINOX NEEDLE F.`:** **Pilă de precizie tip ac** (sau Pilă de precizie CORINOX tip ac). Termenul simplu „pilă ac” nu este acceptat comercial.
* **`RIFFLER` / `RIFFLER FILE` / `RIFFLER RASP` / `SET OF RIFFLERS`:** Pilă curbată pentru matrițerii / Set de pile speciale riflate.
* **`HAND RASP` / `WOOD RASP` / `WOOD FILE` / `WOODEN HANDLE`:** Raspă pentru lemn / Pilă pentru lemn / Mâner din lemn pentru pile.
* **`STAIRCASE-M.FILE RASP`:** Raspă specială pentru trepte de lemn (scări).
* **`HORSE SHOE FILE` / `HOOF PLANE`:** Pilă/Rindea pentru potcovit (îngrijirea copitelor).
* **`BRAKE CALIPER FILES` (`BSF`):** Pilă specială pentru curățat etrieri de frână.
* **`CAR BODY FILES` / `Auto corp pila`:** Pilă pentru caroserie auto (tinichigerie).
* **`LATHE FILE`:** Pilă pentru strung (geometrie specială pentru finisarea pieselor în rotație pe strung).
* **`TUNGSTEN POINT FILE` / `TUNGSTEN CARBIDE -FILE` / `HMF`:** Pilă pentru contacte electrice de tungsten / Pilă din carbură metalică.
* **`MILLED TO.BLADE` / `ED TO.BLADE` / `ED TO.FILE`:** Lamă de freză manuală (lame frezate speciale pentru caroserie sau plastice).
* **`SAW FILE` / `BAND SAW FILE` / `CANTSAW FILE` / `MILL SAW FILE`:** Pilă pentru ascuțit pânze de ferăstrău (elimină aberația de tăiere „fierăstrău pilă”).

### 2.2. Discuri de Debitare, Degroșare și Finisare (Manualele 4 și 6)
* **`EHT`:** Disc plat de debitare (Tip 41).
* **`EH`:** Disc cu centru depresat de debitare (Tip 42).
* **`E` / `GRINDING DISC`:** Disc abraziv gros pentru degroșare (Tip 27) / Disc polizor.
* **`POLIFAN®` (`PFF` / `PFC`):** Discuri abrazive cu lamele (PFF = Plat, PFC = Conic).
* **`CC-GRIND®` / `COMBICLICK` / `BACKING PAD`:** Discuri abrazive rigide silențioase / Sistem modular COMBICLICK / Pad (suport) de sprijin pentru discuri.
* **`VELCRO DISCS`:** Discuri abrazive cu prindere autoadezivă (Velcro / arici).
* **`FIBRE DISC`:** Disc abraziv pe suport de fibră vulcanizată.
* **`ABRAS. SPIRAL BANDS` / `LONG ABRASIVE BELT` / `LONG ABR.BELT` / `SHORT ABR. BELT`:** Inele abrazive cilindrice (Spirale) / Bandă abrazivă lungă de șlefuire / Bandă abrazivă scurtă.
* **`FAN GRINDER` / `FELT FAN`:** Corp abraziv lamelar cu tijă (șmirghel) / Perie lamelară din pâslă pentru lustruire.
* **`POLICAP` / `POLICAP ABR. CONES`:** Capace abrazive POLICAP (consumabile cilindrice/conice fără sfârșit).
* **`RUBBER DRUM HOLDERS` / `RUBBER DRUM` (`GK`):** Suport cilindric din cauciuc pentru inele abrazive (tambur expansibil din cauciuc montat pe tijă).
* **`F-RAD` / `FR`:** Disc lamelar frontal / Corp lamelar frontal (*Fächerad*).

### 2.3. Dispozitive de Ascuțit Lanțuri de Drujbă (Gama Forestieră)
* **`CHAIN SAW SHARPENER` / `CHAIN SHARP` / `KSSG 90` / `KSSG 91`:** Dispozitiv manual pentru ascuțit lanțuri de drujbă.
  * 🛑 *NOTĂ CRITICĂ:* Baza veche punea prefixul eronat „Lant”. Aceste repere sunt **dispozitive metalice de ghidaj**, NU lanțuri! Textul corect este: *Dispozitiv manual de ascuțit lanț drujbă PFERD KSSG...*
* **`CHAIN SHARPENING GAUGE` / `KSSL` / `DEPTH GAUGE` / `D.GAUGE`:** Șablon / Limitator de adâncime pentru ascuțire lanț drujbă.
* **`SC CS-G`:** Disc abraziv staționar pentru mașini electrice de ascuțit lanțuri de drujbă.

### 2.4. Scule Așchietoare Industriale, Teșitoare și Carote (Manualul 2)
* **`TC-BURRS` / `TC-BURR`:** Freză rotativă din carbură metalică (Tungsten Carbide).
* **`FINISH.CUTTER` / `CUTTER HSS` / `ALUMINIUM CUTTER` / `ENGRAV.CUTTER`:** Freză de finisare din oțel rapid HSS / Freză HSS pentru aluminiu / Freză HSS pentru gravare.
* **`STEP DRILL` / `STB`:** Burghiu în trepte PFERD (pentru table).
* **`SCD-...`:** Microburghiu monobloc din carbură metalică pentru CNC.
* **`COUNTERSINKER` / `COUNTERS.SET` / `COU.SET` / `COUNTERS.SET KES` / `COUNT. KES` / `KES HSS`:** Adâncitor (Teșitor) HSS / Set adâncitoare HSS (conform DIN 335).
* **`HOLE SAW`:** Carotă industrială PFERD.

### 2.5. Perii Industriale de Sârmă (Manualul 7)
* **`RBU` / `RBG` / `HBF` / `IBU` / `WIRE BRUSH`:** Perie industrială de sârmă (Circulară / Împletită heavy-duty / Tip pensulă / Perie cilindrică de interior / Set perii de sârmă).
* **`ST` / `INOX` / `MES`:** Sârmă din oțel carbon / Oțel inoxidabil / Alamă.

### 2.6. Corpuri Tehnice de Corecție, Finisaj Manual și Superabrazivi (Diamant / CBN)
* **`DRESSING STONE`:** Piatră de corecție, îndreptare și decolmatare discuri abrazive.
* **`SANDING STICK` / `PVSK` / `POLINOX` / `NON-WOVEN`:** Pilă abrazivă manuală elastică / Burete abraziv nețesut POLINOX / Material abraziv nețesut tridimensional.
* **`POLIFLEX BLOCKS` / `PFB` / `PF` (urmat de cod de corp precum `KE`, `KU`, `ZY` și liant `TX`, `GR`, `PUR`):** Bloc abraziv elastic / Corp polizor elastic POLIFLEX PFERD (piatră polizoare elastică).
* **`DIA.POINT` / `DIA NEEDLE` / `DZY/S` / `CBN-GRINDING`:** Corp polizor diamantat / Pilă de precizie diamantată tip ac / Disc abraziv CBN PFERD.
* **`DRY DIAMOND DRILL BIT` / `DIAMOND CORE DRILL` / `DCD` / `DIA-CUP-WHL` / `DCW 2R`:** Carotă diamantată pentru tăiere uscată pe polizor unghiular (flex) / Disc oală diamantat.

### 2.7. Sisteme și Unități Grele de Antrenare (Mașini Speciale Manualul 8)
* **`MAMMOTH ELECTRONIC` / `MEW`:** Unitate grea de antrenare cu ax flexibil PFERD Mammoth Electronic MEW (sisteme trifazate cu reglare electronică a turației).
* **`PNEUM.CHISEL HAMMER` / `PNEUM.SLAG HAMMER` / `CHIPPING HAMMER` / `AIR-POW.`:** Ciocan pneumatic de dăltuit / Ciocan pneumatic de curățat și dăltuit / Mașină pneumatică (ex: polizor, mașină de pilit pneumatică).
* **`BW / SE / SCH` Transmissions (ex: `BW 10 SE 11 DIN15/G28` sau `SCH 10`):** Componente și ansambluri pentru axe flexibile. `BW` = *Biegsame Welle* (Ax flexibil complet PFERD); `SE` = *Seele* (Miez flexibil de schimb); `SCH` = *Schutzschlauch* (Furtun / manta de protecție exterioară).

---

## 3. Matricea de Accesorii Mașini, Hardware și Cele 2.000 de Piese de Schimb

Grupul de repere pur mecanice din Manualul 8/9 (piese de schimb originale pentru mașinile pneumatice, electrice și axuri flexibile PFERD) va fi mapat integral conform acestui set rigid de conversie, eliminând complet termenii englezești agățați la coadă:

### 3.1. Suporturi, Mandrine, Mânere și Organizatoare (Tool Accessories)
* **`COLLET SPZ`:** Pensetă de prindere PFERD SPZ.
* **`FLANGE SPF` / `FRONT FLANGE VFL`:** Flanșă de strângere PFERD SPF / Flanșă frontală.
* **`EXTENSION SPV` / `SPVH`:** Prelungitor de ax PFERD SPV.
* **`Finishing stones arbor` / `SPSH`:** Dorn de fixare PFERD SPSH pentru pietre de finisat.
* **`TOOL HOLDERS` / `TOOL HOLDER` / `TOOLHOLDER BO` / `TOOL HOLDERS BO` / `PVR`:** Dorn suport / Portsculă PFERD.
* **`NEEDLE F. HOLD.` / `NFH` / `HOLD.NFH`:** Mandrină de prindere / Suport pentru pile ac PFERD.
* **`Red.-Ringe` / `RDR`:** Set inele de reducție pentru discuri abrazive (*Reduzierringe*).
* **`QUICK MOUNTING TYPE SH`:** Sistem de montare rapidă PFERD SH.
* **`BACKING PAD`:** Pad de sprijin / Suport pentru discuri abrazive.
* **`PLASTIC HANDLE FH`:** Mâner din plastic pentru pile.
* **`PLASTIC CASE KH` / `ROLL CASE`:** Casetă din plastic pentru depozitare / Trusă (husă) rulabilă din plastic pentru pile ac.
* **`MOUNT.POINT SET` / `MOUNT.POINT SET KES` / `SET/`:** Set corpuri abrazive cu tijă / Set teșitoare PFERD.

### 3.2. Componente Mecanice Pure de Schimb (The Residual English Fixed)
* **`BEARING HOUSING` / `R.BEAR.HOUSING`:** Carcasă de rulment PFERD.
* **`VALVE HOUSING` / `MOTOR HOUSING` / `INSULATING HOUSING`:** Carcasă pentru supapă PFERD / Carcasă de motor pneumatic / Carcasă izolatoare PFERD.
* **`OUTER/INNER CONTROLLER HOUSING` / `ANGELED HEAD HOUSING`:** Carcasă exterioară/interioară de control PFERD / Carcasă pentru cap unghiular.
* **`VALVE BODY` / `GEAR WHEEL` / `SPUR GEAR` / `BEVEL GEAR SET` / `BEVEL GEARING`:** Corp pentru supapă / Roată dințată / Roată dințată cilindrică / Set angrenaj conic / Angrenaj conic PFERD.
* **`PLANETARY CAGE` / `LOCK RING` / `RETAINING RING` / `CIRCLIP`:** Colivie planetară (suport sateliți) / Inel de blocare / Inel de retenție (Circlip).
* **`SPACER WASHER` / `SPACER RING` / `SPACER SLEEVE` / `ADJUSTMENT RING`:** Șaibă distanțieră / Inel distanțier / Bucșă distanțieră / Inel de reglare PFERD.
* **`VALVE SCREW` / `FLANGE SCREW` / `HEXAGON SOCKET SCREW` / `FILLISTER HEAD SCREW` / `BOLT` / `PISTON` / `SWITCH KNOB`:** Șurub pentru supapă / Șurub de flanșă / Șurub cu cap hexagonal îndoit / Șurub cu cap cilindric bombat / Bolț / Piston / Buton de comutare.
* **`AIR SUP.HOSE` / `HOSE COUPLING` / `AIR INLET` / `AIR DUCT` / `METRE HOSE`:** Furtun de alimentare cu aer pneumatic / Cuplaj furtun / Admisie de aer / Deflector (canal) de aer pneumatic / Furtun la metru (metraj).
* **`ANGLE HEAD` / `SEAL PLATE` / `VANES` / `BRIDE`:** Cap unghiular PFERD / Placă de etanșare (Garnitură) / Palete pentru motor pneumatic / Flanșă de prindere (Bridă).
* **`NECK PART` / `DRIVE HUB` / `DRIVE JOURNAL`:** Ghidaj axial de gât PFERD / Butuc de antrenare / Ax de antrenare PFERD.
* **`ROLL PIN` / `SAFETY PIN`:** Știft cilindric elastic / Știft de siguranță PFERD.
* **`CONTACT ROLLER` / `DRIVE ROLL`:** Rolă de contact PFERD / Rolă de antrenare PFERD.
* **`SPEED WARN. PLATE` / `WARNING SIGN`:** Plăcuță indicatoare de avertizare turație maximă PFERD / Indicator de avertizare.
* **`CRANKED ARM` / `FREQUENCY DAMPER`:** Braț cotit / Amortizor de frecvență (Atenuator de vibrații).
* **`HEXAGON ANGLE WRENCH` / `SINGLE OPEN-END WRENCH` / `FACE SPANNER` / `SPANNER`:** Cheie imbus hexagonală / Cheie fixă cu un singur capăt / Cheie frontală cu știfturi pentru flanșe / Cheie de strângere.
* **`PRESS BIG` / `PRESS CABLE LUG` / `PRESS DISC`:** Cleme de presare mari / Papuc de cablu prin presare / Disc de presare PFERD.
* **`BALL` / `NEEDLE BUSH` / `NEEDLE ROLL` / `NEEDLE WREATH`:** Bilă metalică / Bucșă cu ace / Rolă ac / Colivie cu ace (piese de schimb).
* **`PROTECTIVE CAP` / `PROTECTION CAP` / `PROTECTION COVER` / `PROTECTION HOOD` / `PLUG PROTECTION`:** Capac de protecție / Carcasă de protecție / Manta de protecție PFERD.
* **`PUSH BUTTON` / `ROTARY HANDLE` / `ROTARY KNOB`:** Buton de pornire (cu revenire) / Mâner rotativ / Buton rotativ PFERD.
* **`CENTRIFUGAL DISC` / `CENTRIFUGAL GOVERNOR`:** Disc centrifugal / Regulator centrifugal PFERD.
* **`INTERMEDIATE PIECE` / `INTERMEDIATE PLATE` / `BRACKET`:** Piesă intermediară / Placă intermediară / Suport de fixare (Consolă) PFERD.
* **`THREAD ADAPTER` / `THREAD CONNECTING SLEEVE`:** Adaptor de filet / Manșon de legătură filetat PFERD.
* **`WSP-SET ALUMASTER` / `WSP-SET`:** Set plăcuțe amovibile din carbură PFERD (*Wendeschneidplatten Set*).
* **`METRE CORE TORSIONLESS` / `METRE HANDPIECE CABLE`:** Cablu/Miez flexibil de torsiune la metru (metraj).

---

## 4. Reguli Sterile de Curățare și Prompting pentru Agenți AI (Bulk Batch)

Aceste reguli constituie **Garda de Corp lingvistică** obligatorie pentru a opri defectele detectate în rulările anterioare:

### 🛑 Reguli de Eliminare a Anti-Tiparelor Relansate

#### 4.1. Regula Ignorării Complete a Baseline-ului Vechi (Sterilizare Sursă)
Agentul AI trebuie să ignore complet traducerile defectuoase introduse în bazele de date intermediare (`Lant...`, `Cheie...`, `Patrat pila...`, `Rulment PFERD HOUSING`). Sursa exclusivă și suverană de adevăr tehnic este coloana originală în limba engleză **`ITEM_LABEL`** sau **`PDT_SUMMARY`**!

#### 4.2. Regula Ștergerii Complete a Prefixului de Sortare ERP
Cuvintele în engleză de tip categorie de la începutul etichetelor (`TC-BURRS`, `MTD.POINT`, `CUT-OFF WHEEL`, `FAN GRINDER`, `NEEDLE FILE`, `BENCH WHEEL`) **NU** trebuie lăsate în titlul comercial în limba română! Rolul lor este preluat de traducerea extinsă românească.

#### 4.3. Regula Inversării Topicii pentru Piese Hardware Compuse (Substantiv + Determinator)
Toate piesele mecanice, carcasele și subansamblurile se traduc obligatoriu inversând structura engleză (`VALVE BODY` ➔ `Corp pentru supapă PFERD`, nu `Supapa PFERD BODY`; `BEARING HOUSING` ➔ `Carcasă de rulment PFERD`, nu `Rulment PFERD HOUSING`).

#### 4.4. Regula Ștergerii Absolute a Cuvintelor Reziduale de la Coada Traducerii
Este strict interzisă duplicarea sau păstrarea cuvântului original în engleză la finalul textului tradus în română (`PFERD WASHER`, `PFERD RING`, `PFERD PIECE`, `PFERD PLUG`, `PFERD WHEEL`). Dacă ai tradus deja conceptul la început (`Șaibă distanțieră`, `Garnitură de etanșare`), cuvântul rezidual de la final se elimină complet.

#### 4.5. Regula Ștergerii și Curățării Indicatoarelor de Metadate de Tăiere Mașină (`80 T` / `100 T`)
Prefixe de tipul `80 T 150-...` sau `100 T 350-...` reprezintă viteze periferice maxime (80 m/s sau 100 m/s) și tipul discului (`T` = tăiere/debitare). Ele trebuie curățate din textul brut și mutate ca atribute la final under formatul comercial local.

#### 4.6. Regula Sufixelor Speciale
* `CPL.` / `CPL.M.GEW.` se extinde ca: `, complet echipat` / `, complet asamblat cu mufe filetate`.
* `BULK-P.` / `BULK` se extinde ca: `(ambalare industrială vrac)`.
* `HC-FEP` / `HICOAT` se extinde ca: `cu acoperire premium HICOAT`.

---

## 5. Matricea Completă de Exemple Few-Shot (30 de Tipare de Antrenament)

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
22. **Input:** `MAMMOTH ELECTRONIC MEW 18/150`
    * **Output:** `Unitate de antrenare cu ax flexibil PFERD Mammoth Electronic MEW 18/150`
23. **Input:** `PNEUM.CHISEL HAMMER PH 18 F EG03`
    * **Output:** `Ciocan pneumatic de dăltuit PFERD PH 18 F EG03`
24. **Input:** `BW 10 SE 11 DIN15/G28`
    * **Output:** `Ax flexibil complet PFERD BW 10 SE 11, conexiune DIN15/G28`
25. **Input:** `DIAMOND CORE DRILL DCD 68xM14 FL PSF`
    * **Output:** `Carotă diamantată pentru tăiere uscată PFERD DCD 68xM14 FL PSF, diametru 68 mm`
26. **Input:** `LONG ABR.BELT BA 50/1000 X A 60`
    * **Output:** `Bandă abrazivă lungă de șlefuire PFERD BA 50/1000 X, granulație A60`
27. **Input:** `RUBBER DRUM HOLDERS GK 0410/6`
    * **Output:** `Suport cilindric din cauciuc pentru inele abrazive PFERD GK 0410/6, prindere tijă 6 mm`
28. **Input:** `ROLL PIN 2 X 5`
    * **Output:** `Știft cilindric elastic PFERD 2 x 5 mm`
29. **Input:** `COUNT. KES HSS DIN 335 C90° 10,4`
    * **Output:** `Adâncitor HSS PFERD KES, conform DIN 335 C90°, diametru 10.4 mm`
30. **Input:** `TOOLHOLDER BO 8/10 HSD-R 50`
    * **Output:** `Dorn suport PFERD BO 8/10 HSD-R 50`
