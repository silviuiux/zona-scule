// Camera keyframes for the contact-page map: scroll progress p → view width
// w (metres) and centre (x, y) in the map's shop-centred metres. The shop
// sits right of centre so the heading on the left stays clear.
export const CONTACT_MAP_CAMERA = [
  // 01 · the street
  { p: 0, w: 700, x: -150, y: 0 },
  { p: 0.2, w: 700, x: -150, y: 0 },
  // 02 · Pitești
  { p: 0.38, w: 5200, x: -700, y: -300 },
  { p: 0.64, w: 5200, x: -700, y: -300 },
  // 03 · Romania
  { p: 0.88, w: 1350000, x: -30000, y: -190000 },
  { p: 1, w: 1350000, x: -30000, y: -190000 },
]
