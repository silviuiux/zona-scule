/* eslint-disable @typescript-eslint/no-require-imports -- plain Node build script */
// Builds lib/contact-map-data.ts for the contact-page map (app/contact/ContactMap.tsx).
// Needs, next to it: npm i world-atlas topojson-client, and these Natural Earth
// 10m GeoJSON files (github.com/nvkelso/natural-earth-vector/tree/master/geojson):
// admin_1_states_provinces, urban_areas, rivers_europe, rivers_lake_centerlines,
// roads, populated_places_simple. Run: node build-contact-map.js
const fs = require('fs')
const topo = require('topojson-client')
const LAT0 = 44.8576673, LON0 = 24.8794647
const R = 6371008.8, rad = Math.PI / 180
const phi0 = LAT0 * rad, lam0 = LON0 * rad
// Lambert azimuthal equal-area centred on the shop; x east, y south (SVG), metres
const P = ([lon, lat]) => {
  const phi = lat * rad, lam = lon * rad
  const k = Math.sqrt(2 / (1 + Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lam - lam0)))
  const x = R * k * Math.cos(phi) * Math.sin(lam - lam0)
  const y = R * k * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lam - lam0))
  return [x, -y]
}
const dp = (pts, tol) => {
  if (pts.length < 3) return pts
  const [fx, fy] = pts[0], [lx, ly] = pts[pts.length - 1]
  if (Math.hypot(fx - lx, fy - ly) < 1e-6 && pts.length > 4) {
    // closed ring: split at the midpoint so both halves have a real chord
    const m = pts.length >> 1
    return [...dp(pts.slice(0, m + 1), tol).slice(0, -1), ...dp(pts.slice(m), tol)]
  }
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1
  const st = [[0, pts.length - 1]]
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1
    for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i } }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]) }
  }
  return pts.filter((_, i) => keep[i])
}
const path = (lines, tol, closed, round = 1) => lines.map(l => {
  const p = dp(l.map(P), tol)
  if (p.length < 2) return ''
  return 'M' + p.map(([x, y]) => `${Math.round(x / round) * round} ${Math.round(y / round) * round}`).join('L') + (closed ? 'Z' : '')
}).join('')
const rings = g => g.type === 'Polygon' ? g.coordinates : g.type === 'MultiPolygon' ? g.coordinates.flat() : g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : []
const inside = (pt, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c } return c }
const G = f => JSON.parse(fs.readFileSync(f + '.geojson'))
const out = {}

// Europe (world-atlas 50m), clipped by bbox of ring centroid
const w50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'))
const w10 = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'))
const c50 = topo.feature(w50, w50.objects.countries).features
const c10 = topo.feature(w10, w10.objects.countries).features
const ro10 = c10.find(f => f.properties.name === 'Romania')
const big = ring => { const p = ring.map(P); let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return Math.abs(a / 2) > 2.5e9 } // > 2 500 km²
// every country ring touching the Europe box, clamped to it (the clamped
// edges fall outside the widest camera frame)
const BOX = [-24, 33, 52, 71]
const touches = r => r.some(([x, y]) => x > BOX[0] && x < BOX[2] && y > BOX[1] && y < BOX[3])
const clamp = r => r.map(([x, y]) => [Math.min(BOX[2], Math.max(BOX[0], x)), Math.min(BOX[3], Math.max(BOX[1], y))])
// strokes only: split each ring into runs of in-box points (no clamped edges)
const inBox = ([x, y]) => x > BOX[0] && x < BOX[2] && y > BOX[1] && y < BOX[3]
const runs = r => { const out = []; let cur = []; for (const pt of r) { if (inBox(pt)) cur.push(pt); else { if (cur.length > 1) out.push(cur); cur = [] } } if (cur.length > 1) out.push(cur); return out }
out.europe = c50.filter(f => f.properties.name !== 'Romania').map(f => path(rings(f.geometry).filter(r => touches(r) && big(clamp(r))).flatMap(runs), 7000, false, 1000)).join('')
out.romania = path(rings(ro10.geometry), 300, true, 10)
// Neighbours of Romania at 10m for a crisper mid zoom
// Argeș county, Pitești urban area
const adm = G('ne_10m_admin_1_states_provinces').features
const arges = adm.find(f => f.properties.iso_a2 === 'RO' && /^Arge/.test(f.properties.name))
out.county = path(rings(arges.geometry), 80, true)
const urb = G('ne_10m_urban_areas').features.find(f => rings(f.geometry).some(r => inside([LON0, LAT0], r)))
out.urban = urb ? path(rings(urb.geometry), 40, true) : ''
// Rivers: Argeș (europe supplement), + Danube for the country level
const rivE = G('ne_10m_rivers_europe').features
out.arges = path(rivE.filter(f => f.properties.name === 'Argeș').flatMap(f => rings(f.geometry)), 60, false)
const rivL = G('ne_10m_rivers_lake_centerlines').features
out.danube = path(rivL.filter(f => f.properties.name === 'Danube').flatMap(f => rings(f.geometry)), 1500, false, 100)
// Roads within ~70 km
const near = l => l.some(([x, y]) => Math.abs(x - LON0) < 0.9 && Math.abs(y - LAT0) < 0.6)
const roads = G('ne_10m_roads').features.filter(f => rings(f.geometry).some(near) && /Highway|Road/.test(f.properties.type))
out.roads = path(roads.flatMap(f => rings(f.geometry).filter(near)), 80, false)
// Places
const pp = G('ne_10m_populated_places_simple').features
const place = n => { const f = pp.find(f => f.properties.name === n && f.properties.adm0name === 'Romania'); return f ? P(f.geometry.coordinates).map(Math.round) : null }
out.places = Object.fromEntries(['Pitești', 'Bucharest', 'Craiova', 'Brașov', 'Cluj-Napoca', 'Constanța', 'Iași', 'Timișoara'].map(n => [n, place(n)]))
out.pitesti = place('Pitești')
// label anchor for Europe level
out.europeCenter = P([14, 50]).map(Math.round)
for (const k of Object.keys(out)) console.log(k, typeof out[k] === 'string' ? out[k].length : JSON.stringify(out[k]))

// ── Street level: traced from a Google Maps reference (zoom 17, 2x screenshot,
// pin tip at image (996, 378)); 1 image px ≈ 0.4233 m at this latitude.
const K = 156543.03392 * Math.cos(LAT0 * rad) / 2 ** 17 / 2
const T = ([x, y]) => [Math.round((x - 996) * K * 10) / 10, Math.round((y - 378) * K * 10) / 10]
const streets = {
  dn65: { pts: [[0,20],[200,160],[430,322],[640,500],[824,668],[905,751]], w: 3, label: 'B-DUL I. C. BRĂTIANU', at: 0.3 },
  sfv: { pts: [[866,462],[935,378],[1050,236],[1240,0]], w: 2, label: 'STR. SFÂNTA VINERI', at: 0.62, main: true },
  pasaj: { pts: [[700,562],[866,462]], w: 1, label: '', at: 0.5 },
  milea: { pts: [[560,751],[640,640],[700,562]], w: 1.5, label: '', at: 0.5 },
  tepes: { pts: [[905,545],[1065,405],[1330,262]], w: 1.5, label: 'TEPEȘ VODĂ', at: 0.93 },
  mihai: { pts: [[1110,70],[1190,250],[1275,420],[1350,580],[1400,751]], w: 1.5, label: 'MIHAI VITEAZUL', at: 0.4 },
  rauri: { pts: [[900,760],[1180,610],[1420,480],[1600,380]], w: 1.5, label: 'RÂURILOR', at: 0.45 },
  lazar: { pts: [[640,285],[840,128],[1030,0]], w: 1.5, label: 'GH. LAZĂR', at: 0.55 },
  grivitei: { pts: [[300,470],[400,335],[470,240]], w: 1, label: '', at: 0.5 },
  florariei: { pts: [[240,0],[300,70],[360,120]], w: 1, label: '', at: 0.5 },
  sincai: { pts: [[1470,0],[1440,300],[1405,751]], w: 2.5, label: 'GH. ȘINCAI', at: 0.35 },
  negri: { pts: [[1545,0],[1520,300],[1490,751]], w: 1.5, label: 'C. NEGRI', at: 0.62 },
}
out.streets = Object.entries(streets).map(([id, s]) => {
  const p = s.pts.map(T)
  const d = 'M' + p.map(([x, y]) => `${x} ${y}`).join('L')
  // label anchor: point + angle at fraction `at` along the polyline
  const segs = p.slice(1).map((q, i) => [p[i], q, Math.hypot(q[0] - p[i][0], q[1] - p[i][1])])
  const total = segs.reduce((a, s) => a + s[2], 0)
  let rem = total * s.at, lx = 0, ly = 0, ang = 0
  for (const [a, b, l] of segs) { if (rem <= l) { const t = rem / l; lx = a[0] + (b[0] - a[0]) * t; ly = a[1] + (b[1] - a[1]) * t; ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; break } rem -= l }
  if (ang > 90) ang -= 180; if (ang < -90) ang += 180
  return { id, d, w: s.w, main: !!s.main, label: s.label, lx: Math.round(lx), ly: Math.round(ly), ang: Math.round(ang) }
})
out.water = 'M' + [[2000,0],[1950,150],[1880,260],[1820,340],[1790,450],[1800,560],[1860,660],[1940,730],[2000,751]].map(T).map(([x, y]) => `${x} ${y}`).join('L')
out.church = T([1000, 214])

// ── City level: traced from a wider map reference (≈1.9 m per image px;
// the shop sits at image (1011, 690), located via landmarks shared with the
// close-up). Main roads, rivers, parks and points of interest around it.
const K3 = 1.9
const T3 = ([x, y]) => [Math.round((x - 1011) * K3), Math.round((y - 690) * K3)]
const line = pts => 'M' + pts.map(T3).map(([x, y]) => `${x} ${y}`).join('L')
const anchorAt = (pts, at) => {
  const p = pts.map(T3)
  const segs = p.slice(1).map((q, i) => [p[i], q, Math.hypot(q[0] - p[i][0], q[1] - p[i][1])])
  let rem = segs.reduce((a, s) => a + s[2], 0) * at
  for (const [a, b, l] of segs) {
    if (rem <= l) { const t = rem / l; let ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180; return { lx: Math.round(a[0] + (b[0] - a[0]) * t), ly: Math.round(a[1] + (b[1] - a[1]) * t), ang: Math.round(ang) } }
    rem -= l
  }
  return { lx: 0, ly: 0, ang: 0 }
}
const cityRoads = {
  a1: { pts: [[800,0],[893,58],[1000,165],[1060,235],[1127,315],[1243,458],[1320,580],[1400,720],[1470,840],[1540,940],[1565,973]], w: 3.2, label: 'A1 · AUTOSTRADA BUCUREȘTI – PITEȘTI', at: 0.72 },
  dn7e: { pts: [[1150,305],[1240,300],[1338,308],[1450,345],[1565,372],[1760,400],[1982,428]], w: 2, label: 'DN7 · CALEA BUCUREȘTI', at: 0.6 },
  dn73: { pts: [[1105,0],[1125,100],[1140,215],[1150,300]], w: 2, label: 'DN73', at: 0.35 },
  depoz: { pts: [[440,0],[520,90],[600,180],[680,260],[748,320],[818,345],[916,362],[1000,380],[1045,395],[1100,330],[1127,315]], w: 2, label: 'STR. DEPOZITELOR', at: 0.3 },
  brat: { pts: [[1005,425],[950,465],[888,505],[830,560],[800,598]], w: 2, label: 'B-DUL I. C. BRĂTIANU', at: 0.5 },
  craiovei: { pts: [[800,598],[880,655],[907,683],[960,740],[1000,790],[1030,860],[1045,910],[1055,973]], w: 2, label: '', at: 0.5 },
  dn678: { pts: [[440,850],[560,800],[625,770],[665,700],[690,640],[700,570],[735,545],[800,598]], w: 1.6, label: '', at: 0.5 },
  repub: { pts: [[725,610],[790,700],[860,790],[930,870]], w: 1.4, label: '', at: 0.5 },
  sincai: { pts: [[1100,400],[1118,480],[1128,560],[1132,660],[1130,760],[1125,860]], w: 1.4, label: '', at: 0.5 },
  negri: { pts: [[1122,400],[1140,480],[1150,580],[1152,680],[1150,790]], w: 1.2, label: '', at: 0.5 },
}
const arges3 = [[850,0],[868,80],[898,160],[945,245],[1005,300],[1060,338],[1100,380],[1150,440],[1200,520],[1250,620],[1310,745],[1370,865],[1410,973]]
const doamnei3 = [[1420,0],[1350,70],[1300,140],[1250,220],[1210,280],[1175,330]]
const poly = pts => line(pts) + 'Z'
out.city = {
  roads: Object.entries(cityRoads).map(([id, r]) => ({ id, d: line(r.pts), w: r.w, label: r.label, ...anchorAt(r.pts, r.at) })),
  arges: line(arges3), argesLabel: anchorAt(arges3, 0.62),
  doamnei: line(doamnei3), doamneiLabel: anchorAt(doamnei3, 0.35),
  parks: [
    poly([[670,170],[720,150],[800,158],[860,175],[880,240],[850,280],[780,270],[700,240]]),
    poly([[1150,600],[1200,560],[1240,590],[1270,660],[1270,760],[1230,800],[1180,780],[1150,700]]),
    poly([[870,735],[915,725],[935,760],[905,785],[875,770]]),
  ].join(''),
  vivo: poly([[1105,330],[1130,320],[1172,392],[1148,402]]),
  junction: T3([1062, 232]),
  pois: [
    { name: 'BISERICA SF. VINERI', at: T3([1034, 660]), anchor: 'end', dx: -8, dy: -6 },
    { name: 'PARCUL ȘTRAND', at: T3([1210, 800]), anchor: 'middle', dx: 0, dy: 16 },
    { name: 'PARCUL CENTRAL', at: T3([900, 758]), anchor: 'end', dx: -8, dy: 4 },
    { name: 'HOTEL RAMADA', at: T3([970, 404]), anchor: 'end', dx: -8, dy: 4 },
    { name: 'NOD RUTIER A1', at: T3([1062, 232]), anchor: 'end', dx: -12, dy: 4 },
    { name: 'VIVO! PITEȘTI', at: T3([1150, 362]), anchor: 'start', dx: 10, dy: 4 },
    { name: 'PARCUL LUNCA ARGEȘULUI', at: T3([770, 212]), anchor: 'middle', dx: 0, dy: 4 },
  ],
}

fs.writeFileSync('geo.json', JSON.stringify(out))
const ts = `// Generated by scripts/map/build-contact-map.js — do not edit by hand.
// Lambert azimuthal equal-area projection centred on Strada Sfânta Vineri 28,
// Pitești (44.8576673 N, 24.8794647 E): x east / y south, in metres.
// Country / county / river / road data: Natural Earth (public domain) and
// world-atlas. Streets: traced by hand from a map reference (approximate).
export const CONTACT_MAP = ${JSON.stringify(out)} as const
`
fs.writeFileSync('contact-map-data.ts', ts) // copy to lib/
console.log('ts bytes', ts.length)
