"""Sample the cube-guy GLB down to a point cloud small enough to ship.

The source is 27MB: 335k skinned vertices with normals, UVs, joints and
weights, plus a 1.8MB texture. The hero needs none of that. A depth-shaded
point cloud needs positions and nothing else, so this walks the node
hierarchy for the real world transform, takes every Nth vertex, normalises
the result into a unit box and quantises to int16.
"""

import json
import struct
import sys
import zlib

SRC = "/Users/siddharthmehta/Downloads/cube_guy_blender.glb"
TARGET = int(sys.argv[1]) if len(sys.argv) > 1 else 55000

d = open(SRC, "rb").read()
length = struct.unpack("<I", d[8:12])[0]
off, j, bin_off = 12, None, None
while off < length:
    clen, ctype = struct.unpack("<II", d[off : off + 8])
    if ctype == 0x4E4F534A:
        j = json.loads(d[off + 8 : off + 8 + clen])
    else:
        bin_off = off + 8
    off += 8 + clen


def mat_mul(a, b):
    out = [0.0] * 16
    for c in range(4):
        for r in range(4):
            out[c * 4 + r] = sum(a[k * 4 + r] * b[c * 4 + k] for k in range(4))
    return out


def node_matrix(n):
    if "matrix" in n:
        return list(n["matrix"])
    t = n.get("translation", [0, 0, 0])
    r = n.get("rotation", [0, 0, 0, 1])
    s = n.get("scale", [1, 1, 1])
    x, y, z, w = r
    m = [
        (1 - 2 * (y * y + z * z)) * s[0], (2 * (x * y + z * w)) * s[0], (2 * (x * z - y * w)) * s[0], 0,
        (2 * (x * y - z * w)) * s[1], (1 - 2 * (x * x + z * z)) * s[1], (2 * (y * z + x * w)) * s[1], 0,
        (2 * (x * z + y * w)) * s[2], (2 * (y * z - x * w)) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0,
        t[0], t[1], t[2], 1,
    ]
    return m


# world matrix of every node, by walking down from the scene roots
world = {}
IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]


def walk(idx, parent):
    n = j["nodes"][idx]
    m = mat_mul(parent, node_matrix(n))
    world[idx] = m
    for c in n.get("children", []):
        walk(c, m)


for root in j["scenes"][j.get("scene", 0)]["nodes"]:
    walk(root, IDENT)

mesh_node = next(i for i, n in enumerate(j["nodes"]) if "mesh" in n)
M = world[mesh_node]

prim = j["meshes"][j["nodes"][mesh_node]["mesh"]]["primitives"][0]


def reader(attr):
    acc = j["accessors"][prim["attributes"][attr]]
    bv = j["bufferViews"][acc["bufferView"]]
    return (
        bin_off + bv.get("byteOffset", 0) + acc.get("byteOffset", 0),
        bv.get("byteStride") or 12,
        acc["count"],
    )


start, stride, count = reader("POSITION")
n_start, n_stride, _ = reader("NORMAL")
# TEXCOORD_0 so each point can carry the model's own base colour. The GLB
# ships a 4096 JPEG; a 1024 copy of it lives at assets/models/cube-guy-albedo.jpg.
t_start, t_stride, _ = reader("TEXCOORD_0")

step = max(1, count // TARGET)
pts = []
nrm = []
uvs = []
for i in range(0, count, step):
    o = start + i * stride
    x, y, z = struct.unpack_from("<fff", d, o)
    wx = M[0] * x + M[4] * y + M[8] * z + M[12]
    wy = M[1] * x + M[5] * y + M[9] * z + M[13]
    wz = M[2] * x + M[6] * y + M[10] * z + M[14]
    pts.append((wx, wy, wz))

    # Normals take the rotation but not the translation. The mesh transform
    # here has no shear and uniform scale, so the upper 3x3 is its own inverse
    # transpose up to a factor the normalise below removes anyway.
    o = n_start + i * n_stride
    nx, ny, nz = struct.unpack_from("<fff", d, o)
    rx = M[0] * nx + M[4] * ny + M[8] * nz
    ry = M[1] * nx + M[5] * ny + M[9] * nz
    rz = M[2] * nx + M[6] * ny + M[10] * nz
    ln = (rx * rx + ry * ry + rz * rz) ** 0.5 or 1.0
    nrm.append((rx / ln, ry / ln, rz / ln))

    o = t_start + i * t_stride
    u, vt = struct.unpack_from("<ff", d, o)
    uvs.append((u, vt))

xs = [p[0] for p in pts]
ys = [p[1] for p in pts]
zs = [p[2] for p in pts]
cx, cy, cz = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, (min(zs) + max(zs)) / 2
span = max(max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs))
k = 2.0 / span  # normalise the longest axis to -1..1

norm = [((p[0] - cx) * k, (p[1] - cy) * k, (p[2] - cz) * k) for p in pts]
print("points:", len(norm))
print("extent x", round(min(p[0] for p in norm), 3), round(max(p[0] for p in norm), 3))
print("extent y", round(min(p[1] for p in norm), 3), round(max(p[1] for p in norm), 3))
print("extent z", round(min(p[2] for p in norm), 3), round(max(p[2] for p in norm), 3))


def png(path, W, H, pix):
    """Minimal greyscale PNG so the silhouette can actually be looked at."""
    raw = b"".join(b"\x00" + bytes(pix[r * W : (r + 1) * W]) for r in range(H))

    def chunk(tag, data):
        c = tag + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xFFFFFFFF)

    hdr = struct.pack(">IIBBBBB", W, H, 8, 0, 0, 0, 0)
    open(path, "wb").write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", hdr) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


def view(path, ax, ay, flip_y=True):
    W = H = 360
    buf = [0] * (W * H)
    for p in norm:
        u = (p[ax] + 1) / 2
        v = (p[ay] + 1) / 2
        if flip_y:
            v = 1 - v
        px = int(u * (W - 1))
        py = int(v * (H - 1))
        i = py * W + px
        buf[i] = min(255, buf[i] + 40)
    png(path, W, H, buf)


OUT = "/private/tmp/claude-501/-Users-siddharthmehta/4bd32600-df52-4e6a-b827-32e18d5d3c85/scratchpad/"
view(OUT + "cg-front.png", 0, 1)
view(OUT + "cg-side.png", 2, 1)
view(OUT + "cg-top.png", 0, 2)

# Positions int16 (6 bytes), normals int8 (3), uvs uint16 (4): 13 a point,
# against 32 for the same data as float32. The normals let the hover reveal
# light the surface as a solid; the uvs let it wear the model's own skin.
out = bytearray()
for p in norm:
    out += struct.pack("<hhh", *[max(-32767, min(32767, int(round(c * 32767)))) for c in p])
for n in nrm:
    out += struct.pack("<bbb", *[max(-127, min(127, int(round(c * 127)))) for c in n])
# uvs as unsigned int16 over 0..1, which is a 15-micron grid on a 1024 texture
for t in uvs:
    out += struct.pack("<HH", *[max(0, min(65535, int(round(c * 65535)))) for c in t])
dst = "/Users/siddharthmehta/Desktop/al-folio/assets/models/cube-guy-points.bin"
import os

os.makedirs(os.path.dirname(dst), exist_ok=True)
open(dst, "wb").write(bytes(out))
print("wrote", dst, len(out), "bytes")
