"""Pure-python geometry helpers for the Cube Guy build (no bpy needed)."""
import math, bisect
from mathutils import Vector, Matrix, noise


# ---------------------------------------------------------------- profiles
def rrect_dense(w, d, r, per=64):
    """Dense CCW point list for a rounded rectangle in the XY plane."""
    hw, hd = w * 0.5 - r, d * 0.5 - r
    hw, hd = max(hw, 0.0), max(hd, 0.0)
    pts = []
    corners = [(hw, hd, 0.0), (-hw, hd, 90.0), (-hw, -hd, 180.0), (hw, -hd, 270.0)]
    for i, (cx, cy, a0) in enumerate(corners):
        for k in range(per):
            a = math.radians(a0 + 90.0 * k / per)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
        nx, ny, _ = corners[(i + 1) % 4]
        ax = math.radians(a0 + 90.0)
        sx, sy = cx + r * math.cos(ax), cy + r * math.sin(ax)
        ex, ey = nx + r * math.cos(ax), ny + r * math.sin(ax)
        for k in range(1, per):
            f = k / per
            pts.append((sx + (ex - sx) * f, sy + (ey - sy) * f))
    return pts


def resample_closed(pts, n):
    m = len(pts)
    acc = [0.0]
    for i in range(m):
        p, q = pts[i], pts[(i + 1) % m]
        acc.append(acc[-1] + math.hypot(q[0] - p[0], q[1] - p[1]))
    total = acc[-1]
    out = []
    for i in range(n):
        t = total * i / n
        j = min(bisect.bisect_right(acc, t) - 1, m - 1)
        seg = acc[j + 1] - acc[j]
        f = 0.0 if seg <= 1e-12 else (t - acc[j]) / seg
        p, q = pts[j], pts[(j + 1) % m]
        out.append((p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f))
    return out


def profile(w, d, r, n):
    return resample_closed(rrect_dense(w, d, r), n)


# ------------------------------------------------------------------ sweeps
def frame_from_dir(direction):
    """Orthonormal basis with -Z' along `direction` (so profiles face along it)."""
    f = Vector(direction).normalized()
    up = Vector((0, 0, 1))
    if abs(f.dot(up)) > 0.995:
        up = Vector((0, 1, 0))
    side = up.cross(f).normalized()
    up2 = f.cross(side).normalized()
    return Matrix((side, up2, f)).transposed()


def ring(prof, sx, sy, origin, basis=None):
    out = []
    for (x, y) in prof:
        v = Vector((x * sx, y * sy, 0.0))
        if basis is not None:
            v = basis @ v
        out.append(v + Vector(origin))
    return out


def sweep(rings, cap_start=True, cap_end=True):
    verts, faces = [], []
    n = len(rings[0])
    for r in rings:
        verts.extend(r)
    for i in range(len(rings) - 1):
        a, b = i * n, (i + 1) * n
        for j in range(n):
            k = (j + 1) % n
            faces.append((a + j, a + k, b + k, b + j))
    if cap_start:
        faces.append(tuple(range(n - 1, -1, -1)))
    if cap_end:
        o = (len(rings) - 1) * n
        faces.append(tuple(range(o, o + n)))
    return verts, faces


def limb(path, radii_xy, prof_n, cap_start=True, cap_end=True):
    """path: list of Vector waypoints. radii_xy: list of (sx, sy) per waypoint."""
    prof = profile(2.0, 2.0, 1.0, prof_n)          # unit circle
    rings = []
    for i, p in enumerate(path):
        if i == 0:
            d = path[1] - path[0]
        elif i == len(path) - 1:
            d = path[-1] - path[-2]
        else:
            d = (path[i + 1] - path[i - 1])
        basis = frame_from_dir(d)
        sx, sy = radii_xy[i]
        rings.append(ring(prof, sx, sy, p, basis))
    return sweep(rings, cap_start, cap_end)


def lerp_path(a, b, n):
    a, b = Vector(a), Vector(b)
    return [a.lerp(b, i / (n - 1)) for i in range(n)]


def lerp_radii(a, b, n):
    return [(a[0] + (b[0] - a[0]) * i / (n - 1),
             a[1] + (b[1] - a[1]) * i / (n - 1)) for i in range(n)]


def handmade(v, amount=0.004, freq=3.4, seed=Vector((11.3, 5.7, 2.9))):
    """Low-frequency wobble so nothing reads as a machined primitive."""
    nv = noise.noise_vector(Vector(v) * freq + seed)
    return Vector(v) + Vector(nv) * amount


def merge(*parts):
    """Combine (verts, faces) tuples into one, re-basing indices."""
    V, F = [], []
    for verts, faces in parts:
        o = len(V)
        V.extend(verts)
        F.extend([tuple(i + o for i in f) for f in faces])
    return V, F
