import type { Metadata } from 'next'
import Link from 'next/link'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Politica de confidențialitate — Zona Scule',
  description: 'Cum prelucrează Zona Scule (Technology Promotion S.R.L.) datele cu caracter personal, conform GDPR.',
}

const toc = [
  { id: 'categorii', label: '1. Categorii de date' },
  { id: 'scopuri', label: '2. Scopuri și temeiuri' },
  { id: 'durata', label: '3. Durata prelucrării' },
  { id: 'dezvaluire', label: '4. Dezvăluirea datelor' },
  { id: 'transfer', label: '5. Transferul datelor' },
  { id: 'drepturi', label: '6. Drepturile dumneavoastră' },
  { id: 'minori', label: '7. Confidențialitatea minorilor' },
  { id: 'modificari', label: '8. Modificări ale politicii' },
]

export default function PoliticaDeConfidentialitatePage() {
  return (
    <LegalLayout
      eyebrow="Informații legale"
      title="Politica de"
      titleRed="confidențialitate"
      lastUpdated="21 iulie 2026"
      currentHref="/politica-de-confidentialitate"
      toc={toc}
    >
      <p>
        Confidențialitatea datelor dumneavoastră cu caracter personal reprezintă una dintre
        preocupările principale ale Technology Promotion S.R.L. (Zona Scule), cu sediul în județul
        Argeș, România, în calitate de operator de date.
      </p>
      <p>
        Acest document are rolul de a vă informa cu privire la prelucrarea datelor dumneavoastră cu
        caracter personal, în contextul utilizării paginii de internet www.zonascule.ro, la care ne
        vom referi în continuare cu denumirea &bdquo;site-ul&rdquo;.
      </p>

      <section id="categorii">
        <h2>1. Categoriile de date cu caracter personal prelucrate</h2>
        <p>A. Dacă sunteți client al site-ului, prelucrăm datele dumneavoastră cu caracter personal, cum ar fi:</p>
        <ul>
          <li>nume și prenume;</li>
          <li>număr de telefon;</li>
          <li>adresă de e-mail;</li>
          <li>adresă de facturare;</li>
          <li>adresă de livrare;</li>
          <li>date referitoare la modul în care utilizați site-ul (de exemplu, comportamentul/preferințele/obișnuințele dumneavoastră în cadrul acestuia);</li>
          <li>precum și orice alte categorii de date pe care le furnizați direct în contextul creării contului de utilizator, al plasării unei comenzi sau în orice alt mod care rezultă din utilizarea site-ului.</li>
        </ul>
        <p>
          Dacă pentru a vă crea cont de utilizator pe site utilizați contul dumneavoastră de Facebook
          sau Google, prelucrăm următoarele date publice de profil afișate de aplicațiile respective:
          nume utilizator, adresă de e-mail.
        </p>
        <p>
          În cazul în care alegeți să vă creați cont de utilizator doar înainte de a finaliza comanda
          unui produs disponibil pe site, se va solicita adresa dumneavoastră de e-mail, în baza
          căreia va fi creat automat un cont. Dacă nu finalizați comanda, adresa de e-mail și
          celelalte date furnizate nu vor fi stocate, iar contul creat va fi șters automat.
        </p>
        <p>B. Dacă sunteți vizitator al site-ului, prelucrăm datele dumneavoastră cu caracter personal pe care le furnizați:</p>
        <ul>
          <li>direct, în contextul secțiunii de contact/întrebări/reclamații, în măsura în care ne contactați în acest fel;</li>
          <li>
            indirect, prin date precum: adresa IP, browserul folosit, durata navigării, istoricul
            căutărilor, sistemul de operare folosit, limba și paginile vizualizate, URL-uri complete,
            secvența de click-uri, informații sau produse vizualizate/căutate, durata vizitelor pe
            anumite pagini, informații privind interacțiunea cu paginile (derulare, click-uri, treceri
            de mouse), date despre comportamentul utilizatorilor.
          </li>
        </ul>
      </section>

      <section id="scopuri">
        <h2>2. Scopurile și temeiurile prelucrării</h2>
        <p>A. Dacă sunteți client al site-ului, prelucrăm datele dumneavoastră astfel:</p>
        <ul>
          <li>
            pentru desfășurarea relației contractuale dintre dumneavoastră și noi, respectiv pentru
            preluarea, validarea, expedierea și facturarea comenzii plasate pe site, informarea
            dumneavoastră asupra stării comenzii, organizarea returului de produse comandate etc.
            <br />
            <em>Temei:</em> executarea contractului definit în{' '}
            <Link href="/termeni-si-conditii">Termenii și condițiile</Link> site-ului. Furnizarea
            datelor este necesară pentru executarea acestui contract; refuzul poate face imposibilă
            derularea raporturilor contractuale.
          </li>
          <li>
            pentru îndeplinirea obligațiilor legale ce ne revin în contextul serviciilor prestate prin
            intermediul site-ului, inclusiv obligații fiscale și de arhivare.
            <br />
            <em>Temei:</em> obligație legală. Furnizarea datelor este necesară — refuzul poate face
            imposibilă respectarea obligațiilor legale și, deci, oferirea serviciilor.
          </li>
          <li>
            pentru activități de marketing, respectiv transmiterea prin mijloace de comunicare la
            distanță (e-mail, SMS) a unor comunicări comerciale privind produsele și serviciile
            noastre.
            <br />
            <em>Temei:</em> consimțământul dumneavoastră, dacă alegeți să îl furnizați, prin bifarea
            casetei corespunzătoare la crearea contului sau ulterior, din secțiunea &bdquo;Informațiile
            contului meu&rdquo;. Vă puteți dezabona oricând, din opțiunea aflată la finalul fiecărui
            e-mail/SMS sau din contul dumneavoastră. Furnizarea este voluntară — refuzul nu are urmări
            negative pentru dumneavoastră.
          </li>
          <li>
            pentru efectuarea de analize și raportări privind modul de funcționare a site-ului și
            realizarea de profiluri de preferințe, în principal pentru îmbunătățirea experienței
            oferite.
            <br />
            <em>Temei:</em> interesul nostru legitim de a îmbunătăți permanent experiența clienților.
            Furnizarea este voluntară — refuzul nu are urmări negative pentru dumneavoastră.
          </li>
        </ul>
        <p>B. Dacă sunteți vizitator al site-ului, prelucrăm datele dumneavoastră astfel:</p>
        <ul>
          <li>
            pentru activități de marketing, similar celor descrise mai sus, pe baza consimțământului
            exprimat prin bifarea casetei din formularul de abonare la newsletter.
          </li>
          <li>
            pentru rezolvarea plângerilor și reclamațiilor și pentru monitorizarea traficului, în
            vederea îmbunătățirii experienței oferite pe site.
            <br />
            <em>Temei:</em> interesul nostru legitim de a asigura funcționarea corectă a site-ului și
            de a soluționa comentariile, întrebările sau reclamațiile. Furnizarea este voluntară —
            refuzul nu are urmări negative pentru dumneavoastră.
          </li>
        </ul>
      </section>

      <section id="durata">
        <h2>3. Durata pentru care vă prelucrăm datele</h2>
        <p>
          Vă prelucrăm datele cu caracter personal atât cât este necesar pentru realizarea scopurilor
          de prelucrare menționate mai sus.
        </p>
        <p>
          Dacă sunteți client, prelucrăm datele dumneavoastră pe întreaga durată a raporturilor
          contractuale și ulterior, conform obligațiilor legale (de exemplu, documentele justificative
          financiar-contabile se păstrează, conform legii, 10 ani de la data încheierii exercițiului
          financiar în cursul căruia au fost întocmite).
        </p>
        <p>
          Dacă vă exercitați opțiunea de ștergere a contului de utilizator, vom interpreta această
          acțiune ca opțiune de dezabonare de la comunicările comerciale — nu vă vom mai trimite
          e-mailuri și/sau SMS-uri de acest gen. Ștergerea contului nu are ca efect automat ștergerea
          datelor dumneavoastră cu caracter personal; pentru aceasta vă puteți exercita drepturile
          detaliate la punctul 6.
        </p>
        <p>
          Dacă solicitați ștergerea contului, dar pe acesta există cel puțin o comandă activă, cererea
          de ștergere va putea fi înregistrată numai după livrarea produselor și finalizarea ultimei
          comenzi active.
        </p>
        <p>
          Dacă vă retrageți consimțământul pentru prelucrarea datelor în scop de marketing, va înceta
          prelucrarea datelor dumneavoastră în acest scop, fără a afecta prelucrările desfășurate pe
          baza consimțământului exprimat înainte de retragere.
        </p>
      </section>

      <section id="dezvaluire">
        <h2>4. Dezvăluirea datelor cu caracter personal</h2>
        <p>Nu închiriem/vindem datele dumneavoastră cu caracter personal către terțe părți.</p>
        <p>
          Pe lângă operator, în anumite situații, datele pot fi accesibile pentru terțe părți precum
          furnizori de servicii, operatori de transport, furnizori de hosting, companii IT — numite,
          dacă este necesar, persoane împuternicite de operator. Acestea sunt obligate prin contract
          să mențină confidențialitatea datelor și să le folosească exclusiv în scopul pentru care le
          au fost furnizate.
        </p>
        <p>De asemenea, am putea dezvălui datele dumneavoastră către autorități publice centrale/locale, exemplificativ:</p>
        <ul>
          <li>pentru administrarea site-ului;</li>
          <li>pentru atribuirea de premii sau alte facilități obținute în urma participării la campanii promotionale;</li>
          <li>pentru mentenanța, personalizarea și îmbunătățirea site-ului și a serviciilor derulate prin intermediul lui;</li>
          <li>pentru efectuarea analizei datelor, testare și cercetare, monitorizarea tendințelor de utilizare și dezvoltarea caracteristicilor de siguranță;</li>
          <li>pentru transmiterea de comunicări comerciale de marketing, în condițiile și limitele prevăzute de lege;</li>
          <li>atunci când dezvăluirea este prevăzută de lege.</li>
        </ul>
      </section>

      <section id="transfer">
        <h2>5. Transferul datelor cu caracter personal</h2>
        <p>
          Datele cu caracter personal furnizate pot fi transferate în afara României, dar doar către
          state din Uniunea Europeană.
        </p>
      </section>

      <section id="drepturi">
        <h2>6. Drepturile de care beneficiați</h2>
        <p>În condițiile prevăzute de legislația în materia prelucrării datelor cu caracter personal, beneficiați de următoarele drepturi:</p>
        <ul>
          <li><strong>dreptul la informare</strong> — de a primi detalii privind activitățile de prelucrare, conform celor descrise în acest document;</li>
          <li><strong>dreptul de acces la date</strong> — de a obține confirmarea privind prelucrarea datelor, precum și detalii despre modalitatea de prelucrare, scop, destinatari etc.;</li>
          <li><strong>dreptul la rectificare</strong> — de a obține corectarea, fără întârzieri nejustificate, a datelor inexacte, precum și completarea datelor incomplete;</li>
          <li><strong>dreptul la ștergerea datelor</strong> (&bdquo;dreptul de a fi uitat&rdquo;) — se aplică anumite condiții; este posibil ca datele să fie anonimizate și prelucrarea să continue în scopuri statistice;</li>
          <li><strong>dreptul la restricționarea prelucrării</strong>, în anumite condiții;</li>
          <li><strong>dreptul la portabilitatea datelor</strong> — de a primi datele într-un format structurat, uzual și ușor de citit, și de a le transmite altui operator, dacă sunt îndeplinite condițiile legale;</li>
          <li>
            <strong>dreptul la opoziție</strong> — inclusiv, în orice moment și gratuit, ca datele să
            nu mai fie prelucrate în scop de marketing direct;
          </li>
          <li><strong>dreptul de a nu fi supus unei decizii individuale automate</strong>, inclusiv crearea de profiluri, care produce efecte juridice semnificative;</li>
          <li>dreptul de a vă adresa Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal sau instanțelor competente.</li>
        </ul>
        <p>
          Pentru orice întrebări suplimentare sau pentru a vă exercita drepturile de mai sus, vă rugăm
          să vă adresați la adresa de e-mail{' '}
          <a href="mailto:contact@zonascule.ro">contact@zonascule.ro</a>.
        </p>
      </section>

      <section id="minori">
        <h2>7. Confidențialitatea minorilor</h2>
        <p>
          Nu contactăm cu bună știință și nu colectăm informații de la persoane cu vârsta sub 18 ani.
          Website-ul nu are ca scop solicitarea de informații de orice fel de la persoane cu vârsta
          sub 18 ani.
        </p>
        <p>
          Dacă printr-o eroare intrăm în posesia unor astfel de informații și suntem înștiințați
          despre acest lucru, vom obține consimțământul parental adecvat pentru a le utiliza sau, dacă
          nu este posibil, le vom șterge de pe serverele noastre. Dacă doriți să ne comunicați acest
          lucru, vă rugăm să ne contactați la{' '}
          <a href="mailto:contact@zonascule.ro">contact@zonascule.ro</a>.
        </p>
      </section>

      <section id="modificari">
        <h2>8. Modificări în politica de confidențialitate</h2>
        <p>
          Ne rezervăm dreptul de a modifica această politică de confidențialitate. În cazul unor
          modificări majore, veți fi înștiințat pe e-mail (dacă este posibil) sau prin afișarea unui
          mesaj specific pe site.
        </p>
        <p>
          Acest site folosește fișiere de tip cookie. Pentru mai multe informații cu privire la modul
          în care se folosesc aceste fișiere, consultați{' '}
          <Link href="/politica-de-cookie-uri">Politica de cookie-uri</Link>.
        </p>
      </section>
    </LegalLayout>
  )
}
