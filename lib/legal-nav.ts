// Shared list of static "legal / informational" pages — used by the footer,
// by LegalLayout's cross-page sidebar, and by any page that needs to link
// between them. Single source of truth so we don't hand-copy hrefs/labels.

export type LegalPageLink = {
  href: string
  label: string
}

export const LEGAL_PAGES: LegalPageLink[] = [
  { href: '/termeni-si-conditii', label: 'Termeni și condiții' },
  { href: '/politica-de-retur', label: 'Politica de retur' },
  { href: '/politica-de-confidentialitate', label: 'Politica de confidențialitate' },
  { href: '/politica-de-cookie-uri', label: 'Politica de cookie-uri' },
]

// Soluționarea Alternativă a Litigiilor — link ANPC este obligatoriu conform
// OG 38/2015 / Regulamentul UE 524/2013 pe orice site de comerț electronic.
export const ANPC_SAL_URL = 'https://reclamatiisal.anpc.ro'
export const ODR_URL = 'https://ec.europa.eu/consumers/odr'
