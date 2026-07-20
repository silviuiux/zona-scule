import type { Metadata } from 'next'
import LegalLayout from '@/components/LegalLayout'

export const metadata: Metadata = {
  title: 'Politica de retur — Zona Scule',
  description: 'Condițiile de retur ale produselor comandate pe zonascule.ro, conform OG nr. 34/2014.',
}

const toc = [
  { id: 'dreptul-de-retur', label: 'Dreptul de retur' },
  { id: 'procedura', label: 'Procedura de retur' },
  { id: 'stare-produs', label: 'Starea produsului returnat' },
  { id: 'evaluare', label: 'Evaluarea gradului de uzură' },
  { id: 'ambalaj', label: 'Ambalaj' },
]

export default function PoliticaDeReturPage() {
  return (
    <LegalLayout
      eyebrow="Informații legale"
      title="Politica de"
      titleRed="retur"
      lastUpdated="21 iulie 2026"
      currentHref="/politica-de-retur"
      toc={toc}
    >
      <section id="dreptul-de-retur">
        <h2>Dreptul de retur</h2>
        <p>
          Compania noastră respectă prevederile OG nr. 34/2014 privind regimul juridic al
          contractelor la distanță. Astfel, orice <strong>persoană fizică</strong> are dreptul, în
          cazul produselor livrate prin curier, să notifice în scris comerciantul că renunță la
          cumpărare, fără penalități și fără invocarea unui motiv, în termen de{' '}
          <strong>14 zile lucrătoare</strong> de la primirea produsului.
        </p>
        <p>
          Returnarea produselor se face pe cheltuiala clientului, urmând ca acesta să primească, în
          termen de 14 zile lucrătoare (considerate de la data returnării produsului către Technology
          Promotion S.R.L.), contravaloarea comenzii.
        </p>
      </section>

      <section id="procedura">
        <h2>Procedura de retur</h2>
        <p>
          Este necesară depunerea unei cereri de retur ca prim pas — aceasta trebuie să fie semnată,
          datată și să conțină datele complete ale clientului, cât și ale comenzii, modalitatea de
          retur produs, modalitatea de retur bani și adresa de unde se va ridica produsul de
          returnat. Trimiteți cererea dumneavoastră la adresa de e-mail{' '}
          <a href="mailto:clienti@zonascule.ro">clienti@zonascule.ro</a> sau prin poștă, cu
          confirmare de primire.
        </p>
        <div className="legal-callout">
          <p>
            <strong>Atenție:</strong> folosiți doar adresa de e-mail de mai sus,{' '}
            <a href="mailto:clienti@zonascule.ro">clienti@zonascule.ro</a> — orice comunicare la altă
            adresă de e-mail NU este luată în considerare ca cerere de retur.
          </p>
        </div>
        <p>
          După trimiterea cererii de retur veți primi un e-mail sau un telefon cu un număr de
          înregistrare al cererii (dacă nu primiți confirmarea, verificați e-mailul sau adresa
          noastră). În cazul în care, în decurs de 14 zile de la trimiterea informațiilor despre
          retur (și implicit acceptarea returului), clientul nu furnizează un număr de AWB sau nu
          poate fi contactat prin metodele clasice (e-mail, telefon), vom considera că s-a renunțat
          la intenția de retur. Pentru a continua procesul de retur, clientul trebuie să deschidă o
          nouă cerere — cea veche va fi închisă.
        </p>
      </section>

      <section id="stare-produs">
        <h2>Starea produsului returnat</h2>
        <p>
          Produsul returnat trebuie să fie în aceeași stare în care a fost livrat (în ambalajul
          original, cu toate accesoriile, cu etichetele intacte și documentele care l-au însoțit). În
          coletul de retur trebuie să fie, neapărat, și factura fiscală emisă la cumpărarea
          produsului.
        </p>
        <p>
          În cazul în care produsele returnate suferă modificări, deteriorări, uzură, nu mai sunt
          complete sau au elemente ale setului de livrare deteriorate, conform legii în vigoare,
          profesionistul are dreptul de a diminua valoarea sumei rambursate, în urma unei evaluări
          obiective a produsului returnat — evaluare care nu trebuie să descurajeze cumpărătorul de a
          face retur.
        </p>
        <p>
          Elementele considerate consumabile (printre care cele mai întâlnite, dar nu absolute: perii
          de carbon, accesorii de test, filtre și saci aspirator, filtre sistem de filtrare, mandrine
          și elemente de fixare mandrine, tălpi de fixare materiale abrazive, capete și elemente de
          tăiat și fixat, capete de trimmere și motocoase, fire de tăiere, cuțite de tăiere), dacă
          suferă utilizare, trebuie schimbate în cazul unui retur, iar valoarea lor va fi scăzută din
          totalul sumei returnate. Pentru a evita deteriorarea elementelor consumabile în cazul în
          care doriți să testați produsul și credeți că îl veți returna, aveți grijă să afectați la
          minim sau deloc aceste elemente (testarea fără sarcină este cea mai uzuală).
        </p>
      </section>

      <section id="evaluare">
        <h2>Evaluarea gradului de uzură</h2>
        <p>
          În cazul returului este posibil ca valoarea de rambursat să fie redusă față de prețul de
          achiziție al produsului. Pentru a crește transparența și obiectivitatea procesului de
          retur, vă prezentăm câteva dintre procedurile standard pe care evaluatorii companiei
          noastre le folosesc pentru a determina gradul de uzură al produselor.
        </p>

        <h3>Consumabile</h3>
        <p>
          (inclusiv accesoriile sunt considerate consumabile, indiferent dacă sunt livrate separat,
          detașabile sau nedetașabile). Orice element care, în urma folosirii normale, se
          deteriorează, urmând ca la un interval de timp sau utilizare să fie înlocuit pentru a
          asigura funcționarea corespunzătoare a produsului — acestea nefiind proiectate să
          funcționeze pe întreaga perioadă de viață a produsului. În mod uzual, aici intră: filtre de
          orice natură, saci, perii de carbon, mandrine, tuburi aspirator, uleiuri, benzină, duze
          etc. Odată folosite în sarcină, consumabilele sunt considerate deteriorate 100% și urmează
          a fi distruse.
        </p>

        <h3>Produse (scule electrice sau cu motor termic)</h3>
        <table>
          <thead>
            <tr><th>Grad de uzură</th><th>Descriere</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>0%–10% — utilizare ușoară</td>
              <td>
                În sarcină sau fără sarcină. Mecanismele interne sunt intacte, fără urme de uzură și
                folosire. Exteriorul poate prezenta urme ușoare de zgâriere pe suprafețe fine și
                lucioase, ca urmare a manipulării. Produsele nu au urme de material de lucru. Aspect
                similar cu al unui produs expus.
              </td>
            </tr>
            <tr>
              <td>10%–15% — utilizare medie</td>
              <td>
                Produsul a fost utilizat în sarcină, mecanismele interne prezintă urme de folosire,
                fără urme de material (perii utilizate, urme pe rotor, urme de vaselină răspândite
                prin mecanisme sunt normale atât timp cât nu este prezent material de lucru/murdărie).
                Exteriorul prezintă urme de utilizare pe toate zonele, inclusiv pe zonele care nu sunt
                în mod uzual expuse lucrului cu materiale.
              </td>
            </tr>
            <tr>
              <td>15%–30% — utilizare intensă</td>
              <td>
                Mecanismele interne sunt afectate atât de lucru, cât și de material și impurități.
                Exteriorul prezintă urme de folosire intensă. Elementele de uzură internă și externă
                sunt evidente și nu pot fi remediate, ci doar înlocuite. Se consideră că produsul
                și-a îndeplinit o parte din durata de viață tehnologică.
              </td>
            </tr>
            <tr>
              <td>&gt; 30%</td>
              <td>
                Produsul a fost utilizat la lucrări grele, funcționând perioade mari de timp. O parte
                din elemente sunt suficient de degradate încât, deși pot funcționa în continuare, se
                recomandă schimbarea lor. Peste acest grad de utilizare se va face o expertiză service
                a unei terțe părți pentru a se stabili ce elemente necesită înlocuire pentru ca
                aparatului să îi fie asigurată durata de viață prevăzută la proiectare. Devizul va fi
                suportat de client; elementele ce necesită înlocuire vor fi suportate integral (alături
                de manoperă) de către client și vor fi adunate suplimentar la valoarea gradului de
                utilizare.
              </td>
            </tr>
          </tbody>
        </table>
        <div className="legal-callout">
          <p>
            <strong>Atenție:</strong> sculele cu motor termic, odată pornite, indiferent de utilizare,
            intră la un grad de utilizare de minimum 15% (peste care se adaugă gradele de utilizare de
            mai sus), întrucât la prima utilizare carburantul/uleiul inundă toate mecanismele, pornind
            procese ireversibile de degradare indiferent de utilizare (îmbătrânire și oxidare), precum
            și costuri suplimentare de întreținere. Odată motorul termic inundat, el trece într-o altă
            stare — de aceea sculele pe motor termic vin fără carburant și cu motorul intact.
          </p>
        </div>
      </section>

      <section id="ambalaj">
        <h2>Ambalaj</h2>
        <p>(indiferent de forma lui — cutie de carton sau valiză plastic/metal)</p>
        <ul>
          <li>
            <strong>3%–4% din valoarea produsului — degradare medie:</strong> ca urmare a
            transportului produsului ambalat necorespunzător, atât de curier, cât și de transportul
            efectuat de posesor între diferite locații.
          </li>
          <li>
            <strong>7% din valoarea produsului — degradare puternică:</strong> ambalajul a fost
            folosit, prezintă urme de utilizare la interior și exterior sau urme de murdărie
            (inclusiv urme de apă și mizerie), zgârieturi pe suprafață sau îi lipsesc elemente
            (inclusiv elementele de identificare).
          </li>
        </ul>
        <p>
          Aceste informații sunt orientative; ele pot fi completate cu observații în funcție de caz.
          Vă rugăm să luați în considerare cele de mai sus atunci când cumpărați un produs cu gândul
          de a-l testa și apoi doriți să îl returnați. Încercați să utilizați produsul doar în gol.
        </p>
      </section>
    </LegalLayout>
  )
}
