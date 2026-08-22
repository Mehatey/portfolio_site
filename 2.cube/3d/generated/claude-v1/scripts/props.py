"""Desk, stool and a laptop whose lid really hinges. Flat cel materials."""
import bpy, bmesh, math
from mathutils import Vector, Matrix
import cg_geo as G


def flat(name, rgb, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*rgb, 1.0)
    em.inputs['Strength'].default_value = 1.0
    nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
    return m


def box(name, size, centre, r=0.008, mat=None, n=16):
    sx, sy, sz = size
    prof = G.profile(sx, sy, min(sx, sy, sz) * r / 0.008 * 0.08, n)
    rings = []
    for t, s in ((0.0, 0.90), (0.10, 1.0), (0.90, 1.0), (1.0, 0.90)):
        z = centre[2] - sz * 0.5 + sz * t
        rings.append([Vector((x + centre[0], y + centre[1], z)) for (x, y) in prof])
    v, f = G.sweep(rings, True, True)
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(p) for p in v], [], [list(x) for x in f])
    me.validate()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for e in bm.edges:
        e.smooth = False
    bm.to_mesh(me); bm.free()
    if mat:
        me.materials.append(mat)
    return ob


def build_scene():
    wood = flat("P_Wood", (0.62, 0.50, 0.37))
    wood_d = flat("P_WoodD", (0.44, 0.35, 0.26))
    metal = flat("P_Metal", (0.55, 0.58, 0.63))
    dark = flat("P_Dark", (0.16, 0.18, 0.22))
    screen = flat("P_Screen", (0.72, 0.80, 0.84))
    seat = flat("P_Seat", (0.40, 0.44, 0.50))

    objs = []
    DY = -0.44                                  # desk sits in front of him
    objs.append(box("Desk_Top", (1.26, 0.60, 0.036), (0.02, DY - 0.02, 0.664), mat=wood))
    for sx in (-1, 1):
        objs.append(box("Desk_Side", (0.034, 0.54, 0.622), (0.02 + sx * 0.58, DY - 0.02, 0.311), mat=wood_d))
    objs.append(box("Desk_Rail", (1.12, 0.034, 0.078), (0.02, DY - 0.26, 0.562), mat=wood_d))

    objs.append(box("Stool_Seat", (0.42, 0.38, 0.045), (0.0, 0.02, 0.442), mat=seat))
    for sx in (-1, 1):
        for sy in (-1, 1):
            objs.append(box("Stool_Leg", (0.030, 0.030, 0.420),
                            (sx * 0.17, 0.02 + sy * 0.15, 0.210), mat=metal))
    objs.append(box("Stool_Bar", (0.34, 0.026, 0.026), (0.0, 0.02, 0.150), mat=metal))

    base = box("Laptop_Base", (0.320, 0.225, 0.015), (0.03, DY + 0.055, 0.690), mat=metal)
    keys = box("Laptop_Keys", (0.266, 0.124, 0.004), (0.03, DY + 0.096, 0.6952), mat=dark)
    pad = box("Laptop_Pad", (0.096, 0.058, 0.003), (0.03, DY - 0.002, 0.6952), mat=dark)
    objs += [base, keys, pad]

    # lid pivots on its own origin at the hinge line
    hinge = Vector((0.03, DY + 0.166, 0.698))
    lid = box("Laptop_Lid", (0.320, 0.011, 0.214), (0.03, DY + 0.166, 0.698 + 0.107), mat=metal)
    sc = box("Laptop_Screen", (0.286, 0.006, 0.182), (0.03, DY + 0.160, 0.698 + 0.108), mat=screen)
    for o in (lid, sc):
        o.data.transform(Matrix.Translation(-hinge))
        o.location = hinge
    lid_parts = [lid, sc]

    mug = box("Mug", (0.074, 0.074, 0.092), (-0.34, DY + 0.04, 0.728), mat=wood_d)
    pad2 = box("Notebook", (0.190, 0.142, 0.011), (0.36, DY - 0.06, 0.688), mat=dark)
    objs += [mug, pad2]
    return objs, lid_parts
