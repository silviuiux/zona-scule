// Camera keyframes for the contact-page map: scroll progress p → view width
// w (metres) and centre (x, y) in the map's shop-centred metres. The shop
// sits right of centre so the heading on the left stays clear.
export const CONTACT_MAP_CAMERA = [
  { p: 0, w: 3300, x: 80, y: -430 },
  { p: 0.28, w: 3300, x: 80, y: -430 },
  { p: 0.5, w: 46000, x: -5500, y: -900 },
  { p: 0.58, w: 46000, x: -5500, y: -900 },
  { p: 0.78, w: 3400000, x: -520000, y: -400000 },
  // …then settle back in on Romania for its motorways and cities
  { p: 0.83, w: 3400000, x: -520000, y: -400000 },
  { p: 0.95, w: 1350000, x: -30000, y: -190000 },
  { p: 1, w: 1350000, x: -30000, y: -190000 },
]
