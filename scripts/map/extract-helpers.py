import json, numpy as np
from PIL import Image
from skimage.morphology import skeletonize, remove_small_objects, binary_closing, disk
from skimage.measure import find_contours
from scipy import ndimage as ndi

I = '/tmp/claude-0/-home-user/4348f97d-4914-5b1a-95cf-3b8d4dba4f85/images/'
def load(f): return np.asarray(Image.open(I + f).convert('RGB')).astype(np.int16)
def near(a, rgb, tol): return np.sqrt(((a - np.array(rgb)) ** 2).sum(-1)) < tol

# ── georeferencing ────────────────────────────────────────────────────────
def fit(pairs):  # p_dst = s * p_src + t (north-up, no rotation)
    A = []; b = []
    for (sx, sy), (dx, dy) in pairs:
        A += [[sx, 1, 0], [sy, 0, 1]]; b += [dx, dy]
    s, tx, ty = np.linalg.lstsq(np.array(A, float), np.array(b, float), rcond=None)[0]
    return s, tx, ty
# pic2 (40.jpg) -> pic3 (41.jpg): Ramada, VIVO, Piața Ceair, River Place, Lunca Argeșului
s23 = fit([((775,638),(970,404)), ((1160,538),(1150,357)), ((650,908),(911,529)), ((736,147),(952,176)), ((392,178),(792,188))])
# pic47 -> pic2: River Place, calisthenics, PETROM, OMV, Parcul Lunca Argeșului
s472 = fit([((448,324),(736,147)), ((12,457),(549,204)), ((1376,815),(1135,357)), ((1480,965),(1180,421)), ((765,1165),(872,508))])
print('s23', s23, 's472', s472)
M_PER_PX2 = 0.8466  # zoom 16 @2x
shop2 = (960 - 57, 470 + 769)            # shop in pic2 coords (via pic1)
def p2_to_p3(x, y): s, tx, ty = s23; return s * x + tx, s * y + ty
def p47_to_p2(x, y): s, tx, ty = s472; return s * x + tx, s * y + ty
shop3 = p2_to_p3(*shop2)
M_PER_PX3 = M_PER_PX2 / s23[0]
print('shop3', shop3, 'm/px3', M_PER_PX3)
def p3_to_m(x, y): return ((x - shop3[0]) * M_PER_PX3, (y - shop3[1]) * M_PER_PX3)
def p47_to_m(x, y): return p3_to_m(*p2_to_p3(*p47_to_p2(x, y)))

# ── skeleton tracing ─────────────────────────────────────────────────────
N8 = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
def trace(sk):
    sk = sk.copy(); H, W = sk.shape
    def nbrs(y, x):
        return [(y+dy, x+dx) for dy, dx in N8 if 0 <= y+dy < H and 0 <= x+dx < W and sk[y+dy, x+dx]]
    deg = np.zeros_like(sk, dtype=np.int8)
    ys, xs = np.nonzero(sk)
    for y, x in zip(ys, xs): deg[y, x] = len(nbrs(y, x))
    nodes = set(zip(*np.nonzero(sk & (deg != 2))))
    visited = set(); paths = []
    def walk(start, nxt):
        path = [start, nxt]; prev, cur = start, nxt
        while cur not in nodes:
            cand = [n for n in nbrs(*cur) if n != prev and (cur, n) not in visited]
            if not cand: break
            visited.add((cur, cand[0])); visited.add((cand[0], cur))
            prev, cur = cur, cand[0]; path.append(cur)
            if cur == start: break
        return path
    for n in nodes:
        for m in nbrs(*n):
            if (n, m) in visited: continue
            visited.add((n, m)); visited.add((m, n))
            paths.append(walk(n, m))
    # pure loops (no nodes)
    rest = sk.copy()
    for p in paths:
        for y, x in p: rest[y, x] = False
    lab, k = ndi.label(rest, structure=np.ones((3, 3)))
    for i in range(1, k + 1):
        pts = list(zip(*np.nonzero(lab == i)))
        if len(pts) > 10:
            start = pts[0]; path = [start]; prev = None; cur = start
            seen = {start}
            while True:
                cand = [n for n in nbrs(*cur) if n not in seen and lab[n] == i]
                if not cand: break
                cur = cand[0]; seen.add(cur); path.append(cur)
            paths.append(path)
    return [[(x, y) for y, x in p] for p in paths]

def dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = np.array(pts[0], float), np.array(pts[-1], float)
    d = b - a; L = np.hypot(*d)
    if L < 1e-9: dists = [np.hypot(*(np.array(p) - a)) for p in pts]
    else: dists = [abs(np.cross(d, np.array(p) - a)) / L for p in pts]
    i = int(np.argmax(dists))
    if dists[i] > tol: return dp(pts[:i + 1], tol)[:-1] + dp(pts[i:], tol)
    return [pts[0], pts[-1]]

def plen(p): return sum(np.hypot(p[i+1][0]-p[i][0], p[i+1][1]-p[i][1]) for i in range(len(p)-1))

def lines(mask, min_obj, min_len, tol, close=0):
    if close: mask = binary_closing(mask, disk(close))
    mask = remove_small_objects(mask, min_obj)
    sk = skeletonize(mask)
    out = []
    for p in trace(sk):
        if plen(p) < min_len: continue
        out.append(dp(p, tol))
    return out

def polys(mask, min_area, tol, sigma=1.2):
    mask = remove_small_objects(mask, min_area)
    mask = ndi.binary_fill_holes(mask) if False else mask
    sm = ndi.gaussian_filter(mask.astype(float), sigma)
    out = []
    for c in find_contours(sm, 0.5):
        pts = [(x, y) for y, x in c]
        if len(pts) < 8: continue
        area = 0.5 * abs(sum(pts[i][0]*pts[i-1][1] - pts[i-1][0]*pts[i][1] for i in range(len(pts))))
        if area < min_area: continue
        out.append(dp(pts, tol))
    return out

def to_d(paths, f, closed=False, nd=0):
    s = ''
    for p in paths:
        m = [f(*q) for q in p]
        s += 'M' + 'L'.join(f'{round(x, nd)} {round(y, nd)}'.replace('.0 ', ' ') for x, y in m) + ('Z' if closed else '')
    return s

# ── pic3: the whole first view ────────────────────────────────────────────
from skimage.morphology import binary_opening, binary_dilation
a3 = load('41.jpg')
H3, W3, _ = a3.shape
r, g, b = a3[..., 0], a3[..., 1], a3[..., 2]
water3 = (abs(r - 144) < 32) & (abs(g - 216) < 26) & (b > 212)
park3 = (g - r >= 22) & (g - b >= 8)
roads3 = (b - r >= 8) & (r < 232) & (g < 236) & (r > 105) & ~water3
major3 = binary_opening(roads3, disk(2))                 # only the thick roads survive
hw3 = major3 & near(a3, (136, 160, 184), 34)             # the darker blue-grey class
art3 = major3 & ~binary_dilation(hw3, disk(1))
minor3 = roads3 & ~binary_dilation(major3, disk(2))
# junction region (pic3 coords) — replaced with the close-up
jx0, jy0, jx1, jy1 = 960, 150, 1180, 420
def in_j(p): return all(jx0 < x < jx1 and jy0 < y < jy1 for x, y in p)

out = {}
out['water'] = to_d(polys(water3, 250, 1.1), p3_to_m, True)
out['parks'] = to_d(polys(park3, 900, 1.6, sigma=1.6), p3_to_m, True)
hw_paths = [p for p in lines(hw3, 80, 25, 1.0, close=2) if not in_j(p)]
art_paths = [p for p in lines(art3, 60, 20, 1.0, close=2) if not in_j(p)]
minor_paths = [p for p in lines(minor3, 25, 16, 0.9, close=2) if not in_j(p)]
print('pic3', len(hw_paths), len(art_paths), len(minor_paths))

# ── pic47: the A1 junction in detail ─────────────────────────────────────
a47 = load('47.jpg')
hw47 = near(a47, (136, 160, 184), 30)
art47 = near(a47, (192, 200, 216), 13) & ~hw47
water47 = near(a47, (144, 216, 232), 30)
# keep only what falls inside the junction window
def in_j47(p):
    return all(jx0 < q[0] < jx1 and jy0 < q[1] < jy1 for q in [p2_to_p3(*p47_to_p2(x, y)) for x, y in p])
j_hw = [p for p in lines(hw47, 200, 40, 1.4, close=2) if in_j47(p)]
j_art = [p for p in lines(art47, 150, 40, 1.4, close=2) if in_j47(p)]
print('junction', len(j_hw), len(j_art))

# A1: highway paths close to the A1 alignment (hand-picked pic3 points along it)
A1_REF = [(800,0),(893,58),(1000,165),(1060,235),(1127,315),(1243,458),(1320,580),(1400,720),(1470,840),(1540,940),(1565,973)]
def dist_to_ref(x, y):
    best = 1e9
    for (ax, ay), (bx, by) in zip(A1_REF, A1_REF[1:]):
        dx, dy = bx - ax, by - ay; t = max(0, min(1, ((x-ax)*dx + (y-ay)*dy) / (dx*dx + dy*dy)))
        best = min(best, np.hypot(x - ax - t*dx, y - ay - t*dy))
    return best
def is_a1(p, conv=lambda x, y: (x, y), tol=16):
    pts = [conv(x, y) for x, y in p]
    return np.mean([dist_to_ref(x, y) for x, y in pts]) < tol
a1 = [p for p in hw_paths if is_a1(p)]
other_hw = [p for p in hw_paths if not is_a1(p)]
conv47 = lambda x, y: p2_to_p3(*p47_to_p2(x, y))
j_a1 = [p for p in j_hw if is_a1(p, conv47, 10)]
j_ramps = [p for p in j_hw if not is_a1(p, conv47, 10)]

out['a1'] = to_d(a1, p3_to_m) + to_d(j_a1, p47_to_m)
out['highways'] = to_d(other_hw, p3_to_m)
out['ramps'] = to_d(j_ramps, p47_to_m) + to_d(j_art, p47_to_m)
out['arterials'] = to_d(art_paths, p3_to_m)
out['minor'] = to_d(minor_paths, p3_to_m)
out['shop3'] = shop3; out['mpp3'] = M_PER_PX3
out['s23'] = list(s23); out['s472'] = list(s472)
for k, v in out.items():
    if isinstance(v, str): print(k, len(v))
json.dump(out, open('city.json', 'w'))
# preview
import subprocess
