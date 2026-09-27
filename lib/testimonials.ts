export type Testimonial = {
  quote: string
  name: string
  role: string
  city: string
}

// TODO: PLACEHOLDER COPY — replace with real, attributable client
// testimonials (with the clients' consent) before this goes to production.
export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Comandăm de ani buni consumabile și scule electrice. Oferta vine în aceeași zi, iar livrarea pe șantier e mereu la timp.',
    name: 'Client 1',
    role: 'Șef de șantier',
    city: 'Pitești',
  },
  {
    quote: 'Ne-au ajutat să alegem echipamentele potrivite pentru atelier, nu cele mai scumpe. Se vede că știu meserie.',
    name: 'Client 2',
    role: 'Atelier de prelucrări metalice',
    city: 'Mioveni',
  },
  {
    quote: 'Pentru achizițiile prin S.E.A.P. documentația a fost completă de la început. Colaborare fără surprize.',
    name: 'Client 3',
    role: 'Achiziții publice',
    city: 'Argeș',
  },
  {
    quote: 'Service rapid și piese de schimb disponibile. Utilajele noastre au stat oprite mult mai puțin decât ne așteptam.',
    name: 'Client 4',
    role: 'Firmă de construcții',
    city: 'Câmpulung',
  },
  {
    quote: 'Consultanța tehnică face diferența: am primit exact ce ne trebuia pentru linia de producție, cu specificații clare.',
    name: 'Client 5',
    role: 'Inginer de producție',
    city: 'Curtea de Argeș',
  },
]
