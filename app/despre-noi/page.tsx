import { permanentRedirect } from 'next/navigation'

// "Despre noi" now lives on the contact page, below the form and map.
export default function DespreNoiPage() {
  permanentRedirect('/contact#despre-noi')
}
