# Street-level detail for the contact-page map (app/contact/ContactMap.tsx).
# Extracts streets (by class), the A1 junction outlines, the A1 centre-line,
# water and green areas by colour from Google Maps reference screenshots
# (not kept in the repo: I = folder with 39/40/41/47.jpg), georeferenced
# against each other with register-screenshots.py; writes city-detail.json,
# which build-contact-map.js folds into lib/contact-map-data.ts.
# Needs: pip install numpy pillow scikit-image scipy. Run from scripts/map/.
import json, numpy as np
from PIL import Image
from skimage.morphology import skeletonize, remove_small_objects, closing, disk, opening, dilation
from skimage.measure import find_contours
from scipy import ndimage as ndi
exec(open('extract-helpers.py').read().split('# ── pic3: the whole first view')[0].split('# ── georeferencing')[0])  # imports + load/near
I = '/tmp/claude-0/-home-user/4348f97d-4914-5b1a-95cf-3b8d4dba4f85/images/'
src = open('extract-helpers.py').read()
exec(src[src.index('# ── georeferencing'):src.index('# ── pic3: the whole first view')])  # fit, maps, trace, dp, plen, polys, to_d

# registered by cross-correlating road/water masks (register.py)
s23 = (0.467, 608.0, 112.0); s472 = (0.4305, 543.0, 12.0); S13 = (0.466, 582.0, 471.0)
def p2_to_p3(x, y): s, tx, ty = s23; return s * x + tx, s * y + ty
def p47_to_p2(x, y): s, tx, ty = s472; return s * x + tx, s * y + ty
def p1_to_p3(x, y): s, tx, ty = S13; return s * x + tx, s * y + ty
shop3 = p1_to_p3(960, 470)
M_PER_PX3 = 0.8466 / S13[0]
def p3_to_m(x, y): return ((x - shop3[0]) * M_PER_PX3, (y - shop3[1]) * M_PER_PX3)
def p47_to_m(x, y): return p3_to_m(*p2_to_p3(*p47_to_p2(x, y)))
def p1_to_p2(x, y): return x - 57, y + 769
def p1_to_m(x, y): return p3_to_m(*p1_to_p3(x, y))
def p2_to_m(x, y): return p3_to_m(*p2_to_p3(x, y))

def classify(a, excl):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    water = (abs(r - 144) < 32) & (abs(g - 216) < 26) & (b > 212)
    park = (g - r >= 22) & (g - b >= 8)
    roads = (b - r >= 7) & (r < 234) & (g < 238) & (r > 105) & ~water
    for x0, y0, x1, y1 in excl:
        for m in (water, park, roads): m[y0:y1, x0:x1] = False
    return water, park, roads

def bridge(paths, gap, cos_min=0.6):
    """Join path ends that continue each other across small gaps (labels)."""
    ends = []
    for i, p in enumerate(paths):
        if len(p) < 2: continue
        for side in (0, 1):
            q, r_ = (p[0], p[1]) if side == 0 else (p[-1], p[-2])
            d = np.array(q, float) - np.array(r_, float); n = np.hypot(*d)
            if n: ends.append((i, side, np.array(q, float), d / n))
    used = set(); extra = []
    for k, (i, s, q, d) in enumerate(ends):
        if (i, s) in used: continue
        best = None
        for m, (j, t, q2, d2) in enumerate(ends):
            if j == i or (j, t) in used: continue
            v = q2 - q; L = np.hypot(*v)
            if L == 0 or L > gap: continue
            v /= L
            if np.dot(v, d) > cos_min and np.dot(-v, d2) > cos_min and (best is None or L < best[0]):
                best = (L, j, t, q2)
        if best:
            used.add((i, s)); used.add((best[1], best[2]))
            extra.append([tuple(q), tuple(best[3])])
    return paths + extra

def not_icon(p, max_loop):
    closed = np.hypot(p[0][0] - p[-1][0], p[0][1] - p[-1][1]) < 3
    return not (closed and plen(p) < max_loop)

def road_lines(roads, major_r, gap_major, gap_minor, min_len_minor, tol):
    major = opening(roads, disk(major_r))
    major = remove_small_objects(major, 120)
    minor = roads & ~dilation(major, disk(2))
    mj = [dp(p, tol) for p in trace(skeletonize(closing(major, disk(2)))) if plen(p) > 20 and not_icon(p, 90)]
    mn = [dp(p, tol) for p in trace(skeletonize(remove_small_objects(closing(minor, disk(2)), 20))) if plen(p) > min_len_minor and not_icon(p, 70)]
    return major, bridge(mj, gap_major), bridge(mn, gap_minor)

def a3n(img): return load(img)

A1M = []
out = {'water': '', 'parks': '', 'minor': '', 'arterials': '', 'highways': '', 'a1': '', 'ramps': ''}
A1_REF = [(800,0),(893,58),(1000,165),(1060,235),(1127,315),(1243,458),(1320,580),(1400,720),(1470,840),(1540,940),(1565,973)]
def dist_ref(x, y):
    best = 1e9
    for (ax, ay), (bx, by) in zip(A1_REF, A1_REF[1:]):
        dx, dy = bx - ax, by - ay; t = max(0, min(1, ((x-ax)*dx + (y-ay)*dy) / (dx*dx + dy*dy)))
        best = min(best, np.hypot(x - ax - t*dx, y - ay - t*dy))
    return best
def is_a1(p, to3, tol):
    return np.mean([dist_ref(*to3(x, y)) for x, y in p]) < tol

# regions (pic3 coords) covered by the sharper sources
def box3(conv, w, h):
    pts = [conv(0, 0), conv(w, h)]; return (min(pts[0][0], pts[1][0]), min(pts[0][1], pts[1][1]), max(pts[0][0], pts[1][0]), max(pts[0][1], pts[1][1]))
B1 = box3(p1_to_p3, 2000, 960)
B2 = box3(p2_to_p3, 2000, 965)
BJ = (975, 150, 1175, 400)  # junction (pic3)
def inside(b, x, y, m=0): return b[0] + m < x < b[2] - m and b[1] + m < y < b[3] - m
print('B1', B1, 'B2', B2)

def add(key, paths, conv, closed=False):
    out[key] += to_d(paths, conv, closed)

def process(img, conv_to3, conv_to_m, excl, keep, scale, keep_area=None):
    keep_area = keep_area or keep
    a = load(img)
    water, park, roads = classify(a, excl)
    hwmask = near(a, (136, 160, 184), 34)
    major, mj, mn = road_lines(roads, 2 if scale > 1.5 else 3, 18 / scale * 1.8, 12 / scale * 1.8, 14 / scale * 1.6, 0.9)
    def keep_p(p): return np.mean([keep(*conv_to3(x, y)) for x, y in p]) > 0.5
    hw, art = [], []
    for p in mj:
        if not keep_p(p): continue
        ys = [min(a.shape[0]-1, max(0, int(round(y)))) for x, y in p]; xs = [min(a.shape[1]-1, max(0, int(round(x)))) for x, y in p]
        (hw if hwmask[ys, xs].mean() > 0.35 else art).append(p)
    a1 = [p for p in hw if is_a1(p, conv_to3, 14)]
    hw = [p for p in hw if not is_a1(p, conv_to3, 14)]
    A1M.extend([[conv_to_m(x, y) for x, y in p] for p in a1]); add('highways', hw, conv_to_m); add('arterials', art, conv_to_m)
    add('minor', [p for p in mn if keep_p(p)], conv_to_m)
    def keep_a(p): return np.mean([keep_area(*conv_to3(x, y)) for x, y in p]) > 0.5
    wp = [p for p in polys(water, 250, 1.1) if keep_a(p)]
    pp = [p for p in polys(park, 900, 1.6, sigma=1.6) if keep_a(p)]
    return wp, pp

UI3 = [(1860, 840, 2000, 973), (0, 0, 330, 12), (1580, 955, 2000, 973)]
UI12 = [(1850, 840, 2000, 965), (0, 880, 90, 965), (940, 925, 1060, 965), (1580, 950, 2000, 965), (0, 0, 320, 10)]
# periphery from pic3, centre from pic1 + pic2 (pic2 minus the junction), junction from pic47
w3, p3_ = process('41.jpg', lambda x, y: (x, y), p3_to_m, UI3,
    lambda x, y: not (inside(B1, x, y, 4) or inside(B2, x, y, 4)), 1.82)
w1, p1_ = process('39.jpg', p1_to_p3, p1_to_m, UI12, lambda x, y: True, 0.85)
w2, p2_ = process('40.jpg', p2_to_p3, p2_to_m, UI12,
    lambda x, y: not inside(B1, x, y) and not inside(BJ, x, y), 0.85,
    keep_area=lambda x, y: not inside(B1, x, y))
# junction close-up: highway class only, split A1 / ramps
a47 = load('47.jpg')
hw47 = near(a47, (136, 160, 184), 32)
art47 = near(a47, (192, 200, 216), 14) & ~dilation(hw47, disk(1))
conv47 = lambda x, y: p2_to_p3(*p47_to_p2(x, y))
jhw = [dp(p, 1.2) for p in trace(skeletonize(remove_small_objects(closing(hw47, disk(5)), 300))) if plen(p) > 40 and not_icon(p, 120)]
jhw = [p for p in bridge(jhw, 30) if np.mean([inside(BJ, *conv47(x, y)) for x, y in p]) > 0.5]
A1M.extend([[p47_to_m(x, y) for x, y in p] for p in jhw if is_a1(p, conv47, 9)])
out['a1'] = to_d(bridge(A1M, 90, 0.3), lambda x, y: (x, y))
out['ramps'] += to_d([p for p in jhw if not is_a1(p, conv47, 9)], p47_to_m)
# water / parks: pic3 outside the sharp boxes, pic1/pic2 inside
# water and green areas from the wide view only (one source, no seams)
a3w = load('41.jpg'); water3, park3, _ = classify(a3w, UI3)
out['water'] = to_d(polys(water3, 250, 1.1), p3_to_m, True)
out['parks'] = to_d(polys(park3, 900, 1.6, sigma=1.6), p3_to_m, True)
out['shop3'] = shop3; out['mpp3'] = M_PER_PX3
for k, v in out.items():
    if isinstance(v, str): print(k, len(v))
json.dump(out, open('city.json', 'w'))

# ── junction as outlined road shapes (true widths) ────────────────────────
hwj = remove_small_objects(closing(hw47, disk(2)), 400)
jpolys = []
for c in find_contours(ndi.gaussian_filter(hwj.astype(float), 1.0), 0.5):
    pts = [(x, y) for y, x in c]
    if len(pts) < 10: continue
    cx = np.mean([p[0] for p in pts]); cy = np.mean([p[1] for p in pts])
    if not inside(BJ, *conv47(cx, cy)): continue
    jpolys.append(dp(pts, 1.2))
out['junction'] = to_d(jpolys, p47_to_m, True)
out['ramps'] = ''

# ── A1 centre-line: average every A1 point along the alignment ───────────
ref_m = [p3_to_m(x, y) for x, y in A1_REF]
segs = []; acc = 0
for (ax, ay), (bx, by) in zip(ref_m, ref_m[1:]):
    L = np.hypot(bx - ax, by - ay); segs.append((ax, ay, bx, by, L, acc)); acc += L
def proj(x, y):
    best = None
    for ax, ay, bx, by, L, s0 in segs:
        dx, dy = (bx - ax) / L, (by - ay) / L
        t = max(0, min(L, (x - ax) * dx + (y - ay) * dy))
        px, py = ax + dx * t, ay + dy * t
        d = (x - px) * -dy + (y - py) * dx
        if best is None or abs(d) < abs(best[1]): best = (s0 + t, d, dx, dy, px, py)
    return best
def hw_pixels(img, to3, stride=2):
    a = load(img); m = near(a, (136, 160, 184), 30)
    ys, xs = np.nonzero(m[::stride, ::stride]); return [to3(x * stride, y * stride) for x, y in zip(xs, ys)]
cloud = hw_pixels('41.jpg', lambda x, y: (x, y)) + hw_pixels('40.jpg', p2_to_p3) + hw_pixels('47.jpg', lambda x, y: p2_to_p3(*p47_to_p2(x, y)), 3)
bins = {}
for x3, y3 in cloud:
    x, y = p3_to_m(x3, y3)
    s_, d, *_ = proj(x, y)
    if abs(d) > 60: continue
    bins.setdefault(int(s_ // 20), []).append(d)
line = []
for b_ in sorted(bins):
    if len(bins[b_]) < 6: continue
    s_ = (b_ + 0.5) * 20; d = float(np.median(bins[b_]))
    if abs(d) > 28: continue   # bins pulled off by a neighbouring road
    for ax, ay, bx, by, L, s0 in segs:
        if s0 <= s_ <= s0 + L:
            dx, dy = (bx - ax) / L, (by - ay) / L; t = s_ - s0
            line.append((ax + dx * t - dy * d, ay + dy * t + dx * d)); break
# light smoothing
sm = [line[0]] + [tuple(np.mean(line[max(0, i-3):i+4], axis=0)) for i in range(1, len(line) - 1)] + [line[-1]]
out['a1'] = 'M' + 'L'.join(f'{round(x)} {round(y)}' for x, y in dp(sm, 2.0))
out['a1_ends'] = [sm[0], sm[-1]]
print('junction', len(out['junction']), 'a1 pts', len(sm))
json.dump(out, open('city.json', 'w'))
