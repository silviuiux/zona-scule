import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'
import CookieSettingsButton from '@/components/CookieSettingsButton'

export const metadata: Metadata = {
  title: 'Politica de cookie-uri — Zona Scule',
  description: 'Ce sunt cookie-urile, ce tipuri folosește zonascule.ro și cum vă puteți gestiona preferințele.',
}

const toc = [
  { id: 'ce-sunt', label: 'Ce sunt cookie-urile' },
  { id: 'durata', label: 'Durata de stocare' },
  { id: 'tipuri', label: 'Tipuri de cookie-uri folosite' },
  { id: 'tabel', label: 'Cookie-urile folosite pe site' },
  { id: 'gestionare', label: 'Gestionarea preferințelor' },
  { id: 'protectia-datelor', label: 'Politica de protecție a datelor' },
]

export default function PoliticaDeCookieUriPage() {
  return (
    <LegalLayout
      eyebrow="Informații legale"
      title="Politica de"
      titleRed="cookie-uri"
      lastUpdated="21 iulie 2026"
      currentHref="/politica-de-cookie-uri"
      toc={toc}
    >
      <p>
        Precum majoritatea website-urilor, Zona Scule utilizează cookie-uri pentru a îmbunătăți
        experiența vizitatorilor site-ului.
      </p>

      <section id="ce-sunt">
        <h2>Ce sunt cookie-urile și în ce scop sunt utilizate</h2>
        <p>
          Cookie-urile sunt fișiere de date de mici dimensiuni, alcătuite dintr-o serie de litere și
          numere, care sunt instalate în memoria unui calculator sau a altui dispozitiv folosit
          pentru navigarea online (telefon, tabletă etc.) în momentul în care utilizatorul accesează
          un anumit site web.
        </p>
        <p>
          Cookie-urile sunt instalate prin solicitarea emisă de către serverul web unui browser.
          Astfel, site-ul web accesat de utilizator transmite informații către browserul acestuia,
          care la rândul său va crea un fișier text ce va reprezenta cookie-ul. Doar serverul web care
          a trimis cookie-ul poate să îl acceseze din nou în momentul în care utilizatorul revine pe
          site-ul respectivului server.
        </p>
        <p>
          Cookie-urile sunt complet pasive, deci nu pot fi executate asemenea unor coduri și nici nu
          pot fi utilizate pentru a transmite programe software sau viruși către utilizator. De
          asemenea, chiar dacă cookie-urile sunt stocate pe hard disk-ul utilizatorului, acestea nu
          pot accesa în niciun fel informațiile existente acolo.
        </p>
        <p>
          Cookie-urile în sine nu solicită informații cu caracter personal pentru a putea fi utilizate
          și, în cele mai multe cazuri, nu identifică personal utilizatorii de internet. Acestea sunt
          utilizate pentru a determina site-ul să funcționeze așa cum vă așteptați și pentru a vă oferi
          o experiență web personalizată.
        </p>
        <p>
          Astfel, Zona Scule utilizează pe site cookie-uri pentru gestionarea perioadelor de conectare
          și pentru adaptarea căutărilor din interiorul site-ului la nevoile fiecărui utilizator. De
          asemenea, cookie-urile pot fi utilizate pentru a întocmi rapoarte statistice anonime,
          sinoptice, care ne permit să înțelegem cum utilizează publicul site-ul și să îi îmbunătățim
          structura și conținutul. Nu putem stabili identitatea dumneavoastră în baza acestor
          informații.
        </p>
      </section>

      <section id="durata">
        <h2>Durata de stocare a cookie-urilor</h2>
        <p>
          Cookie-urile sunt stocate în dispozitiv pentru o perioadă determinată, care diferă în
          funcție de scopul pentru care sunt folosite. Astfel, unele cookie-uri sunt stocate pentru o
          singură utilizare (cookie-uri de sesiune), iar altele sunt stocate pentru un anumit interval
          de timp, în scopul de a fi reutilizate (cookie-uri persistente).
        </p>
        <p>
          Puteți modifica în orice moment setările browserului (din meniul Opțiuni/Setări/Preferințe)
          pentru a dezactiva utilizarea cookie-urilor, precum și pentru a elimina anumite cookie-uri
          sau toate cookie-urile salvate în dispozitiv. Trebuie să știți însă că anumite funcții ale
          site-ului sunt disponibile doar cu ajutorul cookie-urilor — dezactivarea lor poate face
          anumite secțiuni/pagini ale site-ului impracticabile sau dificil de utilizat.
        </p>
      </section>

      <section id="tipuri">
        <h2>Tipuri de cookie-uri folosite</h2>
        <p>
          Unele cookie-uri pe care le utilizăm sunt <strong>absolut necesare</strong>. Acestea au o
          semnificație definitorie pentru funcționarea corectă a site-ului și vă permit să navigați și
          să îi utilizați funcțiile. Cookie-urile necesare nu recunosc datele dumneavoastră personale
          de identificare — fără acestea, însă, nu putem oferi o funcționare eficientă a site-ului.
          Această categorie nu poate fi dezactivată din panoul de preferințe.
        </p>
        <p>
          Pe lângă cookie-urile necesare, folosim, doar cu acordul dumneavoastră,{' '}
          <strong>cookie-uri/instrumente de analiză</strong>. Acestea colectează informații cu privire
          la modul în care vizitatorii utilizează site-ul — de exemplu, ce secțiuni sunt vizitate mai
          des — sub formă de date agregate, care nu identifică niciun utilizator, și sunt folosite
          exclusiv pentru a îmbunătăți performanțele site-ului.
        </p>
      </section>

      <section id="tabel">
        <h2>Cookie-urile folosite pe site</h2>
        <table>
          <thead>
            <tr>
              <th>Nume</th>
              <th>Furnizor</th>
              <th>Scop</th>
              <th>Categorie</th>
              <th>Durată</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>zs-cookie-consent</code></td>
              <td>zonascule.ro</td>
              <td>Reține alegerea dumneavoastră privind cookie-urile, ca să nu vă cerem consimțământul la fiecare vizită.</td>
              <td>Necesar</td>
              <td>Persistent (local storage)</td>
            </tr>
            <tr>
              <td>Sesiune admin</td>
              <td>zonascule.ro</td>
              <td>Menține autentificarea în panoul de administrare, folosit exclusiv de echipa noastră.</td>
              <td>Necesar</td>
              <td>Sesiune</td>
            </tr>
            <tr>
              <td>Vercel Web Analytics</td>
              <td>Vercel Inc.</td>
              <td>Statistici anonime, agregate, de trafic (pagini vizitate, sursă vizite) — fără profilare individuală.</td>
              <td>Analiză (opțional)</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
        <p>
          Instrumentele de analiză se încarcă în browserul dumneavoastră doar dacă alegeți
          &bdquo;Accept tot&rdquo; sau activați explicit categoria &bdquo;Analiză&rdquo; din
          panoul de preferințe.
        </p>
      </section>

      <section id="gestionare">
        <h2>Gestionarea preferințelor</h2>
        <p>
          Vă puteți schimba oricând alegerea privind cookie-urile de analiză, direct de pe acest site:
        </p>
        <CookieSettingsButtonInline />
        <p>
          Preferința se aplică doar acestui browser/dispozitiv — dacă navigați de pe alt dispozitiv,
          vi se va cere din nou consimțământul.
        </p>
      </section>

      <section id="protectia-datelor">
        <h2>Politica de protecție a datelor</h2>
        <p>
          Prezenta Politică privitoare la cookie-uri se completează în mod corespunzător cu
          prevederile{' '}
          <a href="/politica-de-confidentialitate">Politicii de confidențialitate</a>, inclusiv cu
          modificările ulterioare ale acesteia.
        </p>
      </section>
    </LegalLayout>
  )
}

// Small server-side wrapper so the inline CTA sits inside prose flow while
// the actual click handler stays in the client island.
function CookieSettingsButtonInline() {
  return (
    <div className="legal-callout">
      <p style={{ marginBottom: 0 }}>
        <CookieSettingsButton variant="inline" />
      </p>
    </div>
  )
}
