import numpy as np
from PIL import Image
from scipy.signal import fftconvolve
from scipy import ndimage as ndi
I = '/tmp/claude-0/-home-user/4348f97d-4914-5b1a-95cf-3b8d4dba4f85/images/'
def feat(f):
    a = np.asarray(Image.open(I + f).convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    water = (abs(r - 144) < 32) & (abs(g - 216) < 26) & (b > 212)
    roads = (b - r >= 7) & (r < 234) & (g < 238) & (r > 105) & ~water
    return roads.astype(np.float32) + 1.5 * water.astype(np.float32)
def reg(src, dst, scales, guess=None, win=None):
    D = ndi.gaussian_filter(dst, 2.0); D = D - D.mean()
    best = None
    for s in scales:
        h, w = src.shape; S = np.asarray(Image.fromarray(src).resize((max(1, int(w * s)), max(1, int(h * s))), Image.BILINEAR))
        S = ndi.gaussian_filter(S, 2.0); S = S - S.mean()
        c = fftconvolve(D, S[::-1, ::-1], mode='full')
        # restrict to plausible offsets around the guess
        if guess is not None:
            gy, gx = guess(s)
            oy = int(gy + S.shape[0] - 1); ox = int(gx + S.shape[1] - 1)
            y0, y1 = max(0, oy - win), min(c.shape[0], oy + win); x0, x1 = max(0, ox - win), min(c.shape[1], ox + win)
            sub = c[y0:y1, x0:x1]; iy, ix = np.unravel_index(np.argmax(sub), sub.shape); iy += y0; ix += x0
        else:
            iy, ix = np.unravel_index(np.argmax(c), c.shape)
        val = c[iy, ix] / (np.sqrt((S ** 2).sum()) + 1e-9)
        ty, tx = iy - (S.shape[0] - 1), ix - (S.shape[1] - 1)
        if best is None or val > best[0]: best = (val, s, tx, ty)
    return best
F3, F2, F1, F47 = feat('41.jpg'), feat('40.jpg'), feat('39.jpg'), feat('47.jpg')
# pic2 -> pic3 around the landmark fit (s≈0.466, t≈(609,106))
b23 = reg(F2, F3, np.arange(0.450, 0.482, 0.002), guess=lambda s: (106, 609), win=60)
print('pic2->pic3', b23)
s = b23[1]
b23f = reg(F2, F3, np.arange(s - 0.002, s + 0.0021, 0.0005), guess=lambda s_: (b23[3], b23[2]), win=12)
print('pic2->pic3 fine', b23f)
# pic1 -> pic3 directly
b13 = reg(F1, F3, np.arange(b23f[1] - 0.004, b23f[1] + 0.0041, 0.001), guess=lambda s_: (106 + 769 * s_ , 609 - 57 * s_), win=40)
print('pic1->pic3', b13)
# pic47 -> pic2 (s≈0.4296, t≈(544,7))
b472 = reg(F47, F2, np.arange(0.415, 0.445, 0.002), guess=lambda s: (7, 544), win=60)
print('pic47->pic2', b472)
b472f = reg(F47, F2, np.arange(b472[1] - 0.002, b472[1] + 0.0021, 0.0005), guess=lambda s_: (b472[3], b472[2]), win=12)
print('pic47->pic2 fine', b472f)
import json; json.dump({'s23': [b23f[1], b23f[2], b23f[3]], 's13': [b13[1], b13[2], b13[3]], 's472': [b472f[1], b472f[2], b472f[3]]}, open('reg.json', 'w'))
