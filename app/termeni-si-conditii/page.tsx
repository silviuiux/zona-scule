import type { Metadata } from 'next'
import Link from 'next/link'
import LegalLayout from '@/components/LegalLayout'
import { ANPC_SAL_URL, ODR_URL } from '@/lib/legal-nav'

export const metadata: Metadata = {
  title: 'Termeni și condiții — Zona Scule',
  description: 'Termenii și condițiile de utilizare a site-ului și de plasare a comenzilor pe zonascule.ro.',
}

const toc = [
  { id: 'general', label: 'Termeni generali' },
  { id: 'confidentialitate', label: 'Confidențialitate' },
  { id: 'preturi', label: 'Prețul produselor' },
  { id: 'plata', label: 'Modalități de plată' },
  { id: 'newsletter', label: 'Newsletter' },
  { id: 'functionare', label: 'Funcționarea site-ului' },
  { id: 'comentarii', label: 'Comentariile utilizatorilor' },
  { id: 'raspunderi', label: 'Răspunderi asumate' },
  { id: 'garantii', label: 'Garanții' },
  { id: 'litigii', label: 'Soluționarea litigiilor' },
  { id: 'dispozitii', label: 'Dispoziții finale' },
]

export default function TermeniSiConditiiPage() {
  return (
    <LegalLayout
      eyebrow="Informații legale"
      title="Termeni și"
      titleRed="condiții"
      lastUpdated="21 iulie 2026"
      currentHref="/termeni-si-conditii"
      toc={toc}
    >
      <section id="general">
        <h2>1. Termeni și condiții</h2>
        <p>
          Site-ul <strong>www.zonascule.ro</strong> este deținut de către Technology Promotion S.R.L.,
          având numărul de ordine în Registrul Comerțului J03/2679/1994, cod unic de înregistrare
          fiscală RO 6796092, și poate fi utilizat respectând condițiile menționate în prezentul
          document.
        </p>
      </section>

      <section id="confidentialitate">
        <h2>2. Politica de confidențialitate</h2>
        <p>
          Toate informațiile furnizate de către clienții site-ului www.zonascule.ro sunt folosite
          exclusiv pentru scopurile specificate (procesare comenzi), fără a fi înstrăinate către o
          terță parte.
        </p>
        <p>
          Pentru procesarea unei comenzi este nevoie de următoarele informații personale: nume,
          prenume, adresă de livrare/facturare, număr de telefon și adresă de e-mail.
        </p>
        <p>
          Dacă vă creați un cont pentru a beneficia de toate facilitățile oferite de site-ul nostru,
          nu trebuie să înstrăinați datele de autentificare. Pentru orice alte modificări cu privire
          la datele personale, ne puteți contacta la adresa de e-mail{' '}
          <a href="mailto:contact@zonascule.ro">contact@zonascule.ro</a>.
        </p>
        <p>
          În situațiile în care există temei juridic, datele personale ale utilizatorilor pot fi
          transmise autorităților abilitate. De asemenea, site-ul www.zonascule.ro nu poate fi tras
          la răspundere pentru pierderea sau copierea informațiilor personale de către persoane fără
          autorizație, care folosesc diverse modalități de interceptare (aparatură și software).
        </p>
        <p>
          Toate detaliile privind legislația GDPR le găsiți în{' '}
          <Link href="/politica-de-confidentialitate">Politica de confidențialitate</Link>, document
          ce face parte din prezentul contract.
        </p>
      </section>

      <section id="preturi">
        <h2>3. Prețul produselor</h2>
        <p>
          Prețurile afișate pe site-ul www.zonascule.ro sunt exprimate în Lei și includ T.V.A. 19%.
          Comenzile plasate fie telefonic, fie prin e-mail, au valoare contractuală conform
          legislației în vigoare.
        </p>
        <p>
          Clientul este de acord cu termenii și condițiile prezentate pe site în momentul în care
          plasează o comandă și înțelege valoarea contractuală a acesteia.
        </p>
        <p>
          Toate comenzile vor fi considerate comenzi ferme și vor fi expediate numai în momentul în
          care au fost confirmate telefonic de către un consultant www.zonascule.ro. De asemenea, tot
          telefonic se confirmă existența în stoc a produsului comandat. Stocul se actualizează
          automat concomitent cu depozitele furnizorilor și independent de societatea noastră, de
          aceea site-ul www.zonascule.ro nu poate fi tras la răspundere pentru lipsa produselor din
          stoc sau erori de afișare și descriere ale produselor.
        </p>
        <p>
          Dacă la un produs se afișează că momentan nu este în stoc (la comandă), puteți trimite
          solicitare „Verifică stoc”, iar un consultant va verifica disponibilitatea revenirii în
          stoc, în funcție de următorul import.
        </p>
        <p>
          zonascule.ro nu este răspunzătoare de întârzieri ale livrărilor provocate de terțe persoane
          (fabrici producătoare, în cazul produselor pe comandă) sau nelivrarea acestora, iar clientul
          își asumă în totalitate acest risc în momentul efectuării unei comenzi pentru produse care
          nu sunt în stoc.
        </p>
        <p>
          În situația ivirii unei erori în redactarea prețului sau a unei alte informații legate de
          un produs, clienții care au comandat respectivul produs vor fi notificați referitor la
          eroare, iar în cazul în care nu sunt de acord cu modificările aduse, comanda va fi anulată.
        </p>
      </section>

      <section id="plata">
        <h2>4. Modalități de plată</h2>
        <ul>
          <li>Plată numerar / ramburs la curier, când primiți coletul.</li>
          <li>Plată cu card bancar de debit VISA, Maestro sau Mastercard prin MobilPay – Librapay.</li>
          <li>Ordin de plată — se emite factură proformă pe care o puteți plăti la bancă sau online din internet banking. Când banii ajung în contul nostru, vă livrăm produsul.</li>
        </ul>
        <p>
          Dacă ați ales metoda de plată „online prin card bancar”, este necesar să completați un
          formular cu informațiile despre cardul dumneavoastră în pagina securizată a procesatorului
          de plăți.
        </p>
        <p>
          Plățile cu carduri de credit/debit emise sub sigla Visa și MasterCard (Visa/Visa Electron
          și MasterCard/Maestro) se efectuează prin intermediul sistemului „3-D Secure”, elaborat de
          organizațiile care asigură tranzacțiilor online același nivel de securitate ca cele
          realizate la bancomat sau în mediul fizic, la comerciant.
        </p>
        <p>
          „3-D Secure” asigură, în primul rând, că nicio informație legată de cardul dumneavoastră nu
          este transferată sau stocată, la niciun moment, pe serverele magazinului sau pe serverele
          procesatorului de plăți — aceste date fiind introduse direct în sistemele Visa și
          MasterCard.
        </p>
        <p>Pentru plățile prin card bancar nu este perceput niciun comision.</p>
      </section>

      <section id="newsletter">
        <h2>5. Abonarea și dezabonarea la newsletter</h2>
        <p>
          Clientul are posibilitatea de a se abona și dezabona la newsletterul site-ului nostru în
          mod voluntar.
        </p>
        <p>
          Conținutul mesajelor primite aparține zonascule.ro și este supus aceluiași regulament ca și
          site-ul.
        </p>
        <p>
          Mesajele respectă normele cu privire la comerțul electronic, iar clientul se poate dezabona
          oricând dorește, urmând pașii menționați la finalul mesajului primit.
        </p>
      </section>

      <section id="functionare">
        <h2>6. Funcționarea site-ului</h2>
        <p>
          Site-ul www.zonascule.ro este găzduit de serverele unei terțe părți, astfel că nu ne putem
          asuma responsabilitatea pentru eventualele erori de funcționare sau conținut.
        </p>
      </section>

      <section id="comentarii">
        <h2>7. Comentariile utilizatorilor</h2>
        <p>
          Utilizatorii care își exprimă părerea cu privire la produsele comercializate pe site-ul
          nostru își asumă toate drepturile pentru conținutul publicat. În cazul comentariilor cu
          limbaj obscen, calomnios sau conținut ilegal, ne rezervăm dreptul de a nu le publica.
        </p>
      </section>

      <section id="raspunderi">
        <h2>8. Răspunderi asumate</h2>
        <p>zonascule.ro nu este responsabilă pentru:</p>
        <ul>
          <li>întârzierea livrărilor în cazul în care acestea sunt cauzate de o terță parte (ex: firme de curierat);</li>
          <li>conținutul și funcționarea site-ului;</li>
          <li>eventuale erori ale descrierilor și imaginilor aflate pe site cu titlu informativ, ce pot conduce la o percepție deformată a produselor;</li>
          <li>pagubele apărute prin utilizarea de orice fel a produselor achiziționate de pe site-ul nostru;</li>
          <li>deteriorarea produselor în timpul transportului;</li>
          <li>mail-urile și conținutul pe care utilizatorii le trimit către terțe persoane prin intermediul site-ului nostru (ex. „Recomandă unui prieten” etc.).</li>
        </ul>
        <p>De asemenea, precizăm că:</p>
        <ul>
          <li>echipa noastră încearcă să furnizeze informații și imagini cât mai clare și precise pentru fiecare produs;</li>
          <li>produsele sunt ambalate corespunzător în momentul predării către firmele de curierat;</li>
          <li>prețurile de pe site pot suferi modificări oricând, fără o înștiințare prealabilă (comenzile confirmate de către operatorii noștri nu sunt afectate de aceste modificări);</li>
          <li>imposibilitatea confirmării telefonice de către client atrage anularea comenzii în maxim 2 zile.</li>
        </ul>
      </section>

      <section id="garantii">
        <h2>9. Garanții</h2>
        <p>
          Garanțiile oferite pentru produsele de pe site-ul nostru sunt cele oferite de către
          producător/importator. Acestea variază în funcție de produs și se referă la perioada în
          care producătorul/importatorul asigură reparații gratuite.
        </p>
        <p>Garanția produselor este valabilă numai dacă utilizatorul a respectat instrucțiunile de folosire.</p>
      </section>

      <section id="litigii">
        <h2>10. Soluționarea litigiilor</h2>
        <p>
          Dacă aveți o nemulțumire legată de o comandă, vă rugăm să ne contactați întâi direct, la{' '}
          <a href="mailto:contact@zonascule.ro">contact@zonascule.ro</a> — majoritatea situațiilor se
          rezolvă rapid pe această cale.
        </p>
        <p>
          În cazul în care nu ajungem la o înțelegere, aveți dreptul de a apela la soluționarea
          alternativă a litigiilor (SAL) prin platforma pusă la dispoziție de Autoritatea Națională
          pentru Protecția Consumatorilor:{' '}
          <a href={ANPC_SAL_URL} target="_blank" rel="noopener noreferrer">reclamatiisal.anpc.ro</a>.
        </p>
        <p>
          De asemenea, pentru litigiile rezultate din comerțul online, puteți folosi și platforma
          europeană de soluționare online a litigiilor (SOL/ODR):{' '}
          <a href={ODR_URL} target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>.
        </p>
      </section>

      <section id="dispozitii">
        <h2>11. Dispoziții finale</h2>
        <p>
          În cazul în care una dintre clauzele expuse anterior devine nulă, contractul rămâne
          valabil. Achiziționarea de produse de pe site-ul www.zonascule.ro este echivalentă cu
          acordul în ceea ce privește termenii și condițiile detaliate mai sus, și are valoare
          contractuală.
        </p>
      </section>
    </LegalLayout>
  )
}
