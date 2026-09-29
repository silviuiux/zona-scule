// Cover photo for each Zona Soluții story: a manufacturer application photo
// of a product the story is actually about (chosen by hand from the catalog's
// gallery images; storage copies where they exist). Product stories use
// their own product's photos instead.
export const SOLUTION_COVERS: Record<string, string> = {
  // D-tect 18V: scanning a wall before drilling
  'scule-pentru-electricieni': 'https://pt-media.bosch-pt.com/media/ro-RO/0601081671-D-tect18V-200-17C-ro-RO-o595730v186-D-Tect18V-200-17C-Application-Constrution-Side-Mark-MR1-052.jpg',
  // Milwaukee PACKOUT plumbing set
  'scule-pentru-instalatori': 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932499467--App_1.jpg?v=832A4E1F033864CFF0B89152A7634649&width=1050&height=700&entropycrop=1&width=1050&heightratio=0.6666666666666666&mode=crop',
  // Bosch GBH 18V-40 C rotary hammer
  'scule-pentru-constructii': 'https://pt-media.bosch-pt.com/media/ro-RO/1600A0373T-2x-EXBA18V-80--EXAL18V-160-ro-RO-o582925v186-o582925v12GBH-18V-40-C-EXBA18V-8Ah-EXPERT-Application-Image-Bohrhammer.jpg',
  // Bosch GTS 70-216 table saw
  'scule-pentru-tamplarie': 'https://pt-media.bosch-pt.com/media/ro-RO/0601B30600-GTS-70-216-ro-RO-o579948v186-GTS-70-216-Application-Image-Closeup-01.jpg',
  // Bosch GWX 17-125 PSB cutting metal
  'scule-pentru-prelucrarea-metalelor': 'https://pt-media.bosch-pt.com/media/ro-RO/06017D3700-GWX-17-125-PSB-ro-RO-o395986v186-GWX-17-125-PSB-application-cutting007.jpg',
  // Kärcher BR 30/1 C scrubber-drier
  'echipamente-curatenie-profesionala': 'https://dfbhgnbqwoinujnzfxsl.supabase.co/storage/v1/object/public/product-images/kaercher-1-783-054-0/g1.jpg',
  // Milwaukee 1/4" ratchet
  'scule-industria-auto-linii-asamblare': 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932464947--App_1.jpg?v=658C64F22C8561C1813A90528CB6D38E&width=1050&height=700&entropycrop=1&width=1050&heightratio=0.6666666666666666&mode=crop',
  // Milwaukee 1/4" ratchet and socket set
  'cuplu-controlat-linia-de-asamblare': 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932464944--App_1.jpg?v=B4AF5FA8F42631C4253113AAEF99EDEE&width=1050&height=700&entropycrop=1&width=1050&heightratio=0.6666666666666666&mode=crop',
  // Bosch GGS straight grinder deburring a pipe
  'aer-comprimat-scule-pneumatice-linie-auto': 'https://pt-media.bosch-pt.com/media/ro-RO/06019B5401-GGS-18V-20-ro-RO-o382852v186-GGS-18V-20-4ah-procore-application-rohrausfr-39.jpg',
  // Bosch GPX 9-125 S polisher
  'finisaj-si-retus-de-suprafata-industria-auto': 'https://pt-media.bosch-pt.com/media/ro-RO/06013B1000-GPX9-125S-ro-RO-o629797v186-PRO-GPX9-125S-Applicationimage-closeup01.jpg',
  // Bosch GTC 12V-450-13 thermal camera in production
  'mentenanta-in-uzina-auto': 'https://pt-media.bosch-pt.com/media/ro-RO/0601083900-GTC-12V-450-13-ro-RO-o518324v186-GTC-12V-450-13-Application-Produktion-EU-0029.jpg',
  // Kärcher NT 75/2 Tact² Me industrial vacuum
  'curatenie-si-protectie-in-hala-auto': 'https://dfbhgnbqwoinujnzfxsl.supabase.co/storage/v1/object/public/product-images/kaercher-1-667-288-0/g2.jpg',
  // Bosch GWX 17-125 PSB chamfering
  'scule-furnizori-industria-auto': 'https://pt-media.bosch-pt.com/media/ro-RO/06017D3700-GWX-17-125-PSB-ro-RO-o395976v186-GWX-17-125-PSB-application-chamfer002.jpg',
  // Milwaukee 3/8" spark plug socket
  'scule-pentru-service-auto': 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932480675--App_1.jpg?v=925DBC244DCE99603367311D50B25397&width=1050&height=700&entropycrop=1&width=1050&heightratio=0.6666666666666666&mode=crop',
  // Bosch GWS 18V-11 S on site
  'scule-pentru-firme-de-constructii': 'https://pt-media.bosch-pt.com/media/ro-RO/06019N4002-GWS-18V-11-S-ro-RO-o476679v186-476679GWS-18V-11-S-applicationimage-02.jpg',
  // Kärcher NT 22/1 Ap L wet-dry vacuum
  'dotari-institutii-seap': 'https://dfbhgnbqwoinujnzfxsl.supabase.co/storage/v1/object/public/product-images/kaercher-1-378-623-0/g1.jpg',
  // Bosch GWS 12-125 angle grinder
  'cum-alegi-discul-de-polizor': 'https://pt-media.bosch-pt.com/media/ro-RO/06013A6101-GWS-12-125---standard-auxiliary-handle-ro-RO-o430727v186-GWS-12-125-Application-197-3-T7.jpg',
  // Milwaukee SDS-max bit in concrete
  'ce-burghiu-pentru-ce-material-sds-plus-sds-max': 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932352765--App_1.jpg?v=FE09B04A5ADBFBF674D89C870B7CBF3C&width=1050&height=700&entropycrop=1&width=1050&heightratio=0.6666666666666666&mode=crop',
  // Bosch GCM 305-216 D blade cutting parquet
  'cati-dinti-panza-circulara': 'https://pt-media.bosch-pt.com/media/ro-RO/0601B49000-GCM-305-216-D-ro-RO-o411728v186-GCM-305-216-D-application-cutting-parquet-close-up015-T5.jpg',
  // Bosch GAS 35 H AFC, H-class extraction
  'aspirator-industrial-clase-filtrare-l-m-h': 'https://pt-media.bosch-pt.com/media/ro-RO/06019C3600-GAS-35-H-AFC-ro-RO-o342543v186-GAS-35-H-AFC-GNF-35-CA-application-T3.jpg',
  // Kärcher HDS 8/18-4 C hot-water pressure washer
  'aparat-spalat-cu-presiune-bar-debit-apa-calda': 'https://dfbhgnbqwoinujnzfxsl.supabase.co/storage/v1/object/public/product-images/kaercher-1-174-900-0/g1.jpg',
  // Bosch GCL 12V-50-22 CG green line laser
  'nivela-laser-linie-verde-sau-rosie': 'https://pt-media.bosch-pt.com/media/ro-RO/0601066S02-GCL-12V-50-22-CG-ro-RO-o475490v186-GCL-12V-50-22-CG-Application-Horizontal-Line-T1.jpg',
  // Bosch AMPShare battery and charger
  'platforme-acumulatori-12v-18v-ampshare-m18': 'https://pt-media.bosch-pt.com/media/ro-RO/1600A0373X-2x-EXBA18V-80--EXAL18V2-320-ro-RO-o580575v186-EXAL18V2-320-AMPShare-Application-10316-Bluelook.jpg',
  // Milwaukee tile and glass drill bit
  'renovare-baie-lista-de-scule': 'https://dfbhgnbqwoinujnzfxsl.supabase.co/storage/v1/object/public/product-images/milwaukee-4932471958/g1.jpg',
  // Bosch GTB 18V-45 drywall screwdriver on steel studs
  'montaj-gips-carton-pas-cu-pas': 'https://pt-media.bosch-pt.com/media/ro-RO/06019K7000-GTB-185-LI-ro-RO-o373128v186-GTB-18V-45-application-steel-studs.jpg',
  // Bosch GDR 18V-200 on a terrace
  'terasa-din-lemn-scule': 'https://pt-media.bosch-pt.com/media/ro-RO/06019J2107-GDR-18V-200-ro-RO-o323257v186-GDR-18V-200-4ah-procore-application-terrasse-061.jpg',
  // Milwaukee compact ratchet set in PACKOUT
  'dotarea-unui-atelier-nou': 'https://static.milwaukeetool.eu/remote.axd/milwaukee-media-images.s3.amazonaws.com/hi/4932499470--App_1.jpg?v=18EF1C1D9A1274B8D338D36E11B871B7&width=1050&height=700&entropycrop=1&width=1050&heightratio=0.6666666666666666&mode=crop',
}
