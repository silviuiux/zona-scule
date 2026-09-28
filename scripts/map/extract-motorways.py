# Romania's motorways (open / under construction) for the contact-page map,
# extracted by colour from a motorway status map (130km.ro, not kept in the
# repo) georeferenced with its city markers; writes motorways.json (lon, lat)
# for build-contact-map.js.
import json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, remove_small_objects, closing, opening, disk
exec(open('extract-helpers.py').read().split('# ── georeferencing')[0])
src = open('extract-helpers.py').read()
exec(src[src.index('# ── skeleton tracing'):src.index('# ── pic3: the whole first view')])  # trace, dp, plen, polys, to_d
IMG = '/tmp/claude-0/-home-user/4348f97d-4914-5b1a-95cf-3b8d4dba4f85/images/50.jpg'
# city markers (image px) ↔ real coordinates (lon, lat)
CITIES = [((270,560),(20.75,46.17)),((352,692),(21.23,45.75)),((388,584),(21.31,46.18)),((476,318),(21.81,47.12)),((496,728),(21.90,45.69)),((499,355),(21.92,47.06)),((611,300),(22.53,47.25)),((636,156),(22.73,47.80)),((648,685),(22.90,45.88)),((676,157),(22.88,47.79)),((716,874),(23.27,45.04)),((768,1013),(23.52,44.55)),((781,424),(23.59,46.77)),((785,671),(23.57,45.96)),((830,1065),(23.80,44.32)),((835,475),(23.78,46.57)),((879,696),(24.15,45.79)),((919,1032),(24.37,44.43)),((957,492),(24.56,46.54)),((1013,940),(24.87,44.86)),((1049,694),(24.97,45.84)),((1156,718),(25.59,45.65)),((1220,116),(26.07,47.95)),((1242,903),(26.02,44.94)),((1248,1040),(26.10,44.43)),((1268,194),(26.25,47.65)),((1286,376),(26.37,46.93)),((1378,310),(26.72,47.25)),((1378,842),(26.82,45.15)),((1383,460),(26.91,46.57)),((1427,704),(27.18,45.70)),((1505,326),(27.60,47.16)),((1556,324),(27.77,47.19)),((1586,798),(27.96,45.27)),((1604,754),(28.05,45.44)),((1614,1048),(28.03,44.34)),((1714,1092),(28.63,44.18))]
def feats(x, y): return np.array([1, x, y, x*x, x*y, y*y])
A = np.array([feats(x / 1000, y / 1000) for (x, y), _ in CITIES])
lon = np.array([c[1][0] for c in CITIES]); lat = np.array([c[1][1] for c in CITIES])
cl, *_ = np.linalg.lstsq(A, lon, rcond=None); ca, *_ = np.linalg.lstsq(A, lat, rcond=None)
res = [(np.hypot((A[i] @ cl - lon[i]) * 78.8, (A[i] @ ca - lat[i]) * 111.2)) for i in range(len(CITIES))]
print('fit residual km: mean %.1f max %.1f' % (np.mean(res), np.max(res)))
def px_to_ll(x, y): f = feats(x / 1000, y / 1000); return float(f @ cl), float(f @ ca)

a = np.asarray(Image.open(IMG).convert('RGB')).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
green = (g > 90) & (g < 160) & (r < 60) & (b < 60)
orange = (r > 200) & (g > 70) & (g < 150) & (b < 70)
# drop the legend and the credit (bottom-left) and the route-number plates
for m in (green, orange):
    m[1040:, :520] = False
def lines_of(mask, min_len=18):
    mask = remove_small_objects(closing(mask, disk(2)), 60)
    # route-number plates: compact filled blobs
    lab, n = ndi.label(mask)
    for i, sl in enumerate(ndi.find_objects(lab)):
        comp = lab[sl] == i + 1
        h, w = comp.shape; fill = comp.sum() / (h * w)
        if h < 40 and w < 60 and fill > 0.45: mask[sl][comp] = False
    sk = skeletonize(mask)
    return [dp(p, 1.2) for p in trace(sk) if plen(p) > min_len]
out = {}
for key, m in (('open', green), ('building', orange)):
    paths = lines_of(m)
    out[key] = [[px_to_ll(x, y) for x, y in p] for p in paths]
    print(key, len(paths))
json.dump(out, open('motorways.json', 'w'))
