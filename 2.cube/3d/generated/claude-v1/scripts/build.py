"""Cube Guy - procedural character build (mesh + UV + materials + rig + skin).

Run:  python3 build.py            (bpy as a module, headless)
Out:  ../out/cubeguy_base.blend, ../out/uv_islands.json
Every number lives in P below so proportions stay tunable in one place.
"""
import bpy, bmesh, math, json, os, sys
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cg_layout import ATLAS, BOXES, MAT_FOR_BOX, PAL
import cg_geo as G
from cg_geo import Vector as V

OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
TEX = os.path.normpath(os.path.join(HERE, "..", "tex"))
os.makedirs(OUT, exist_ok=True)

# character faces -Y in Blender  ->  faces +Z (forward) after glTF Y-up convert
P = dict(
    height=1.75,
    z_sole=0.0, z_ankle=0.105, z_knee=0.45, z_crotch=0.82,
    z_hip=0.94, z_waist=1.00, z_hem=0.852, z_chest=1.145,
    z_shoulder=1.222, z_collar=1.310, z_neck_top=1.338, z_head_bot=1.335,
    head_w=0.400, head_d=0.375, head_h=0.415,
    shoulder_w=0.305, chest_d=0.170, waist_w=0.285, waist_d=0.163,
    arm_out_deg=14.0, upper_arm=0.286, forearm=0.240, hand_len=0.112,
    arm_r=(0.050, 0.040, 0.034),
    leg_x=0.090, thigh=(0.092, 0.098), knee=(0.092, 0.097), ankle=(0.097, 0.104),
    shoe_l=0.296, shoe_w=0.178, shoe_h=0.094,
    eye_w=0.044, eye_h=0.118, eye_x=0.058, eye_z=0.050, eye_d=0.014,
    mouth_w=0.066, mouth_h=0.017, mouth_z=-0.098,
    density=1.56,
)
P["z_head_top"] = P["z_head_bot"] + P["head_h"]
P["z_head_mid"] = P["z_head_bot"] + P["head_h"] * 0.5
D = P["density"]
def nres(n):  # density-scaled resolution, kept even
    return max(4, int(round(n * D / 2)) * 2)


# ------------------------------------------------------------------ scene
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.length_unit = 'METERS'
    sc.unit_settings.scale_length = 1.0


def new_obj(name, verts, faces, smooth_angle=math.radians(38)):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], [list(f) for f in faces])
    me.validate(verbose=False)
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mark_sharp(bm, smooth_angle)
    bm.to_mesh(me); bm.free()
    for pl in me.polygons:
        pl.use_smooth = True
    return ob


def mark_sharp(bm, angle):
    for e in bm.edges:
        if len(e.link_faces) == 2:
            e.smooth = e.link_faces[0].normal.angle(e.link_faces[1].normal, 0.0) < angle
        else:
            e.smooth = False


# ------------------------------------------------------------------- head
def build_head():
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    cuts = nres(7)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    edge_of_cube = []
    for e in bm.edges:
        ok = True
        for v in e.verts:
            extremes = sum(1 for c in v.co if abs(abs(c) - 0.5) < 1e-5)
            if extremes < 2:
                ok = False
                break
        if ok:
            edge_of_cube.append(e)
    bmesh.ops.bevel(bm, geom=edge_of_cube, offset=0.088, segments=nres(5),
                    profile=0.5, affect='EDGES', offset_type='OFFSET',
                    clamp_overlap=True, loop_slide=True, material=-1)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    shear = Matrix.Identity(4); shear[0][2] = 0.014     # hand-built lean
    for v in bm.verts:
        c = Vector((v.co.x * P["head_w"], v.co.y * P["head_d"], v.co.z * P["head_h"]))
        c = shear @ c
        c = G.handmade(c, amount=0.0055, freq=2.6)
        v.co = c + Vector((0, 0, P["z_head_mid"]))

    mark_sharp(bm, math.radians(30))
    me = bpy.data.meshes.new("CG_Head")
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("CG_Head", me)
    bpy.context.collection.objects.link(ob)
    for pl in me.polygons:
        pl.use_smooth = True
    return ob


def pill(w, h, d, centre, bulge=0.35):
    """A vertical pill slab that sits proud of the face plane."""
    n = nres(26)
    prof = G.profile(w, h, min(w, h) * 0.5, n)
    rings, layers = [], [(-0.5, 0.86), (-0.16, 1.0), (0.24, 0.99), (0.5, 0.82), (0.62, 0.45)]
    for t, s in layers:
        y = centre[1] - d * (t + 0.5)
        pts = [Vector((centre[0] + x * s, y, centre[2] + z * s)) for (x, z) in prof]
        rings.append(pts)
    return G.sweep(rings, cap_start=True, cap_end=True)


def build_face_parts():
    ex, ez = P["eye_x"], P["eye_z"]
    fy = -P["head_d"] * 0.5 + 0.004
    eL = pill(P["eye_w"], P["eye_h"], P["eye_d"],
              (-ex - 0.002, fy, P["z_head_mid"] + ez + 0.003))
    eR = pill(P["eye_w"] * 0.96, P["eye_h"] * 1.03, P["eye_d"],
              (ex - 0.003, fy, P["z_head_mid"] + ez - 0.004))
    mo = pill(P["mouth_w"], P["mouth_h"], 0.010,
              (0.004, fy, P["z_head_mid"] + P["mouth_z"]))
    return (new_obj("CG_Eye_L", *eL, math.radians(50)),
            new_obj("CG_Eye_R", *eR, math.radians(50)),
            new_obj("CG_Mouth", *mo, math.radians(50)))


# ------------------------------------------------------- neck / arms / hands
def arm_chain(side):
    s = -1.0 if side == 'L' else 1.0
    a = math.radians(P["arm_out_deg"] * (1.0 if side == 'L' else 1.06))
    sh = Vector((s * P["shoulder_w"] * 0.44, 0.0, P["z_shoulder"]))
    d = Vector((s * math.sin(a), 0.0, -math.cos(a)))
    el = sh + d * P["upper_arm"] + Vector((0.0, 0.024, 0.0))
    wr = sh + d * (P["upper_arm"] + P["forearm"]) + Vector((s * 0.016, -0.007, 0.0))
    dh = (wr - el).normalized()
    tip = wr + dh * P["hand_len"]
    return sh, el, wr, tip, d, dh


def build_skin():
    parts = []
    n = nres(20)
    rings = []
    for (w, dd, z) in [(0.140, 0.124, P["z_collar"] - 0.046),
                       (0.112, 0.102, P["z_collar"] - 0.010),
                       (0.090, 0.082, P["z_collar"] + 0.024),
                       (0.086, 0.078, P["z_neck_top"] + 0.006)]:
        prof = G.profile(w, dd, min(w, dd) * 0.42, n)
        rings.append([Vector((x, y, z)) for (x, y) in prof])
    parts.append(G.sweep(rings, True, True))

    for side in ('L', 'R'):
        sh, el, wr, tip, d, dh = arm_chain(side)
        s = -1.0 if side == 'L' else 1.0
        r0, r1, r2 = P["arm_r"]
        seg = nres(9)
        path = G.lerp_path(sh, el, seg)[:-1] + G.lerp_path(el, wr, seg)
        rad = (G.lerp_radii((r0, r0 * 0.95), (r1, r1 * 0.98), seg)[:-1]
               + G.lerp_radii((r1, r1 * 0.98), (r2, r2 * 1.0), seg))
        parts.append(G.limb(path, rad, nres(20), cap_start=True, cap_end=False))

        hpath = G.lerp_path(wr, tip, nres(7))
        hrad = [(r2 * 1.06, r2 * 0.88), (r2 * 1.52, r2 * 0.74), (r2 * 1.80, r2 * 0.66),
                (r2 * 1.86, r2 * 0.62), (r2 * 1.74, r2 * 0.58), (r2 * 1.36, r2 * 0.48),
                (r2 * 0.60, r2 * 0.30)]
        hrad = hrad[:len(hpath)] + [hrad[-1]] * max(0, len(hpath) - len(hrad))
        parts.append(G.limb(hpath, hrad, nres(20), cap_start=False, cap_end=True))
        tb0 = wr + dh * 0.022 + Vector((-s * r2 * 1.05, -0.008, 0))
        tb1 = tb0 + dh * 0.018 + Vector((-s * 0.030, -0.024, 0))
        parts.append(G.limb(G.lerp_path(tb0, tb1, 4),
                            [(r2 * 0.80, r2 * 0.68), (r2 * 0.82, r2 * 0.66),
                             (r2 * 0.68, r2 * 0.55), (r2 * 0.34, r2 * 0.30)],
                            nres(12), True, True))
    return new_obj("CG_Body", *G.merge(*parts), math.radians(46))


# ------------------------------------------------------------------ shirt
def build_shirt():
    """Oversized boxy tee: flat wide drop-shoulder line, zero waist taper,
    hem hanging well past the hip so no waistband and no crop ever reads."""
    n = nres(44)
    W, Dp = 0.364, 0.232
    spec = [(P["z_hem"] - 0.004, W * 0.99, Dp * 0.99, 0.050),
            (P["z_hem"] + 0.045, W * 1.00, Dp * 1.00, 0.050),
            (0.965, W * 1.00, Dp * 1.00, 0.050),
            (1.040, W * 0.995, Dp * 0.99, 0.050),
            (P["z_chest"], W * 0.995, Dp * 0.99, 0.052),
            (1.186, W * 1.00, Dp * 0.985, 0.060),
            (P["z_shoulder"] + 0.002, W * 0.995, Dp * 0.97, 0.072),
            (P["z_shoulder"] + 0.024, W * 0.95, Dp * 0.93, 0.082),
            (P["z_shoulder"] + 0.046, W * 0.84, Dp * 0.88, 0.086),
            (1.290, W * 0.60, Dp * 0.76, 0.062),
            (P["z_collar"], W * 0.40, Dp * 0.52, 0.040)]
    rings = []
    for z, w, dd, r in spec:
        prof = G.profile(w, dd, r, n)
        rings.append([Vector((x, y, z)) for (x, y) in prof])
    dense = []
    for i in range(len(rings) - 1):
        dense.append(rings[i])
        for k in range(1, nres(3)):
            f = k / nres(3)
            dense.append([a.lerp(b, f) for a, b in zip(rings[i], rings[i + 1])])
    dense.append(rings[-1])
    body = G.sweep(dense, True, True)

    sleeves = []
    for side in ('L', 'R'):
        s = -1.0 if side == 'L' else 1.0
        # sleeve hangs from the dropped shoulder point, ending near the elbow
        start = Vector((s * 0.146, 0.002, P["z_shoulder"] + 0.014))
        end = Vector((s * 0.208, 0.018, 0.998))
        seg = nres(8)
        path = G.lerp_path(start, end, seg)
        rad = G.lerp_radii((0.094, 0.088), (0.071, 0.065), seg)
        sleeves.append(G.limb(path, rad, nres(24), True, True))
    return new_obj("CG_Shirt", *G.merge(body, *sleeves), math.radians(44))


# --------------------------------------------------------------- trousers
def build_trousers():
    """Wide-leg: no taper from hip to hem, legs meeting at the crotch and
    breaking over the shoe so the ankle never shows."""
    n = nres(38)
    hip = []
    for z, w, dd, r in [(0.906, 0.290, 0.216, 0.076),
                        (0.930, 0.306, 0.224, 0.080),
                        (P["z_hip"], 0.316, 0.226, 0.082),
                        (P["z_waist"], 0.306, 0.216, 0.080),
                        (P["z_waist"] + 0.022, 0.292, 0.204, 0.074)]:
        prof = G.profile(w, dd, r, n)
        hip.append([Vector((x, y, z)) for (x, y) in prof])
    parts = [G.sweep(hip, True, True)]

    for side in ('L', 'R'):
        s = -1.0 if side == 'L' else 1.0
        x0 = s * P["leg_x"]
        top = Vector((x0 * 0.94, 0.004, 0.968))
        kne = Vector((x0 * 1.04, -0.012, P["z_knee"]))
        hem = Vector((x0 * 1.12, 0.028, 0.074))
        seg = nres(9)
        path = G.lerp_path(top, kne, seg)[:-1] + G.lerp_path(kne, hem, seg)
        rad = (G.lerp_radii(P["thigh"], P["knee"], seg)[:-1]
               + G.lerp_radii(P["knee"], P["ankle"], seg))
        prof = G.profile(2.0, 2.0, 0.60, n)
        rings = []
        for i, p in enumerate(path):
            if i == 0:
                dv = path[1] - path[0]
            elif i == len(path) - 1:
                dv = path[-1] - path[-2]
            else:
                dv = path[i + 1] - path[i - 1]
            rings.append(G.ring(prof, rad[i][0], rad[i][1], p, G.frame_from_dir(dv)))
        parts.append(G.sweep(rings, True, True))
    return new_obj("CG_Trousers", *G.merge(*parts), math.radians(42))


# ------------------------------------------------------------------ shoes
def build_shoes():
    parts = []
    for side in ('L', 'R'):
        s = -1.0 if side == 'L' else 1.0
        toe_out = math.radians(6.0 if side == 'L' else 7.5)
        rot = Matrix.Rotation(s * toe_out, 4, 'Z')
        heel = Vector((0.0, 0.082, 0.0))
        toe = Vector((0.0, -P["shoe_l"] + 0.082, 0.0))
        n = nres(26)
        spec = [(0.00, 0.62, 0.30, 0.052), (0.10, 0.90, 0.62, 0.030),
                (0.30, 1.00, 0.94, 0.012), (0.55, 0.99, 1.00, 0.006),
                (0.76, 0.88, 0.92, 0.010), (0.90, 0.66, 0.70, 0.020),
                (1.00, 0.34, 0.38, 0.044)]
        rings = []
        for t, ws, hs, lift in spec:
            p = heel.lerp(toe, t)
            w = P["shoe_w"] * ws
            prof = G.profile(w, P["shoe_h"] * hs, min(w, P["shoe_h"] * hs) * 0.45, n)
            z = P["z_sole"] + P["shoe_h"] * 0.5 * hs + lift
            rings.append([rot @ Vector((x, p.y, z + y)) + Vector((s * P["leg_x"] * 1.10, 0, 0))
                          for (x, y) in prof])
        parts.append(G.sweep(rings, True, True))
    return new_obj("CG_Shoes", *G.merge(*parts), math.radians(40))


# --------------------------------------------------------------------- UV
def _fit(uvs, box, islands, key):
    x0, y0, x1, y1 = BOXES[box]
    bw, bh = (x1 - x0) / ATLAS, (y1 - y0) / ATLAS
    us = [u for u, v in uvs]; vs = [v for u, v in uvs]
    du, dv = max(max(us) - min(us), 1e-6), max(max(vs) - min(vs), 1e-6)
    sc = min(bw / du, bh / dv) * 0.94
    iw, ih = du * sc, dv * sc
    ox = x0 / ATLAS + (bw - iw) * 0.5
    oy = 1.0 - y1 / ATLAS + (bh - ih) * 0.5
    islands[key] = dict(box=box,
                        px=[ox * ATLAS, (1.0 - (oy + ih)) * ATLAS,
                            (ox + iw) * ATLAS, (1.0 - oy) * ATLAS])
    return [(ox + (u - min(us)) * sc, oy + (v - min(vs)) * sc) for u, v in uvs]


def uv_planar_split(ob, front, back, sidebox, islands):
    """Front/back/side planar projection - predictable enough to place decals on."""
    me = ob.data
    me.uv_layers.new(name="UVMap")
    bm = bmesh.new(); bm.from_mesh(me)
    lay = bm.loops.layers.uv.active
    groups = {front: [], back: [], sidebox: []}
    for f in bm.faces:
        nrm = f.normal
        if abs(nrm.y) >= abs(nrm.x) * 0.85 and nrm.y < 0:
            g, proj = front, lambda c: (c.x, c.z)
        elif abs(nrm.y) >= abs(nrm.x) * 0.85 and nrm.y > 0:
            g, proj = back, lambda c: (-c.x, c.z)
        else:
            g, proj = sidebox, lambda c: (c.y * (1 if nrm.x > 0 else -1), c.z)
        for lp in f.loops:
            groups[g].append((lp, proj(lp.vert.co)))
    for box, items in groups.items():
        if not items:
            continue
        fitted = _fit([uv for _, uv in items], box, islands, box)
        for (lp, _), uv in zip(items, fitted):
            lp[lay].uv = uv
    bm.to_mesh(me); bm.free()


def uv_smart(ob, box, islands, angle=66.0):
    me = ob.data
    me.uv_layers.new(name="UVMap")
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.selected_objects:
        o.select_set(False)
    ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(angle), island_margin=0.02,
                             correct_aspect=True, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    bm = bmesh.new(); bm.from_mesh(me)
    lay = bm.loops.layers.uv.active
    items = [(lp, tuple(lp[lay].uv)) for f in bm.faces for lp in f.loops]
    fitted = _fit([uv for _, uv in items], box, islands, box)
    for (lp, _), uv in zip(items, fitted):
        lp[lay].uv = uv
    bm.to_mesh(me); bm.free()


# --------------------------------------------------------------- materials
def load_img(fn):
    path = os.path.join(TEX, fn)
    img = bpy.data.images.load(path, check_existing=True)
    img.name = fn
    return img


def make_material(name, base, nrm, mask, rough_mul=1.0, nrm_str=0.6, ao_mix=0.30):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (620, 0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); bsdf.location = (300, 0)
    bsdf.inputs['Metallic'].default_value = 0.0
    bsdf.inputs['IOR'].default_value = 1.42
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.22
    # no sheen: keeps the glTF free of optional material extensions
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

    t_base = nt.nodes.new('ShaderNodeTexImage'); t_base.image = base
    t_base.location = (-620, 260); t_base.interpolation = 'Smart'
    t_mask = nt.nodes.new('ShaderNodeTexImage'); t_mask.image = mask
    t_mask.image.colorspace_settings.name = 'Non-Color'
    t_mask.location = (-620, -40)
    t_nrm = nt.nodes.new('ShaderNodeTexImage'); t_nrm.image = nrm
    t_nrm.image.colorspace_settings.name = 'Non-Color'
    t_nrm.location = (-620, -340)

    sep = nt.nodes.new('ShaderNodeSeparateColor'); sep.location = (-360, -40)
    nt.links.new(t_mask.outputs['Color'], sep.inputs['Color'])

    ao = nt.nodes.new('ShaderNodeMix'); ao.data_type = 'RGBA'
    ao.blend_type = 'MULTIPLY'; ao.location = (-100, 220)
    ao.inputs['Factor'].default_value = ao_mix
    nt.links.new(t_base.outputs['Color'], ao.inputs[6])
    nt.links.new(sep.outputs['Red'], ao.inputs[7])
    nt.links.new(ao.outputs[2], bsdf.inputs['Base Color'])

    rg = nt.nodes.new('ShaderNodeMath'); rg.operation = 'MULTIPLY'
    rg.location = (-100, -60); rg.inputs[1].default_value = rough_mul
    nt.links.new(sep.outputs['Green'], rg.inputs[0])
    nt.links.new(rg.outputs['Value'], bsdf.inputs['Roughness'])

    nm = nt.nodes.new('ShaderNodeNormalMap'); nm.location = (-160, -360)
    nm.inputs['Strength'].default_value = nrm_str
    nt.links.new(t_nrm.outputs['Color'], nm.inputs['Color'])
    nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return m


def build_materials():
    base, nrm, mask = (load_img("cubeguy_basecolor_2k.png"),
                       load_img("cubeguy_normal_1k.png"),
                       load_img("cubeguy_mask_1k.png"))
    for i in (base, nrm, mask):
        i.pack()
    spec = {"CG_Head": (1.02, 0.55, 0.30), "CG_Skin": (1.00, 0.50, 0.30),
            "CG_Eyes": (0.62, 0.25, 0.10), "CG_Shirt": (1.05, 0.85, 0.35),
            "CG_Trousers": (1.06, 0.90, 0.35), "CG_Shoes": (0.94, 0.60, 0.30)}
    return {k: make_material(k, base, nrm, mask, *v) for k, v in spec.items()}


def outline_material():
    m = bpy.data.materials.new("CG_Outline")
    m.use_nodes = True
    m.use_backface_culling = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (400, 0)
    mix = nt.nodes.new('ShaderNodeMixShader'); mix.location = (200, 0)
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); tr.location = (0, 120)
    em = nt.nodes.new('ShaderNodeEmission'); em.location = (0, -120)
    em.inputs['Color'].default_value = (0.035, 0.04, 0.05, 1.0)
    em.inputs['Strength'].default_value = 1.0
    geo = nt.nodes.new('ShaderNodeNewGeometry'); geo.location = (-200, 0)
    nt.links.new(geo.outputs['Backfacing'], mix.inputs['Fac'])
    nt.links.new(tr.outputs['BSDF'], mix.inputs[1])
    nt.links.new(em.outputs['Emission'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    m.blend_method = 'BLEND'
    return m


def build_outline(objs, thick=0.0098):
    """Inverted-hull ink line. Ships as its own object set so the hero GLB
    stays viewer-correct; the site renders it with side = BackSide."""
    col = bpy.data.collections.new("CG_Outline")
    bpy.context.scene.collection.children.link(col)
    mat = outline_material()
    made = []
    for ob in objs:
        o2 = ob.copy()
        o2.data = ob.data.copy()
        o2.name = ob.name + "_OL"
        col.objects.link(o2)
        me = o2.data
        me.materials.clear()
        me.materials.append(mat)
        bm = bmesh.new(); bm.from_mesh(me)
        bm.verts.ensure_lookup_table()
        for v in bm.verts:
            v.co += v.normal * thick
        bm.to_mesh(me); bm.free()
        # camera rays only - the hull must never shadow or bounce light
        o2.visible_shadow = False
        o2.visible_diffuse = False
        o2.visible_glossy = False
        o2.visible_transmission = False
        o2.visible_volume_scatter = False
        made.append(o2)
    return made


# --------------------------------------------------------------------- rig
BONES = [
    # name, head, tail, parent, connected
    ("Root",        (0, 0, 0),                     (0, -0.25, 0),                None,        False),
    ("Hips",        (0, 0, P["z_hip"] - 0.005),    (0, 0, P["z_waist"] + 0.03),  "Root",      False),
    ("Spine",       (0, 0, P["z_waist"] + 0.03),   (0, 0, P["z_chest"] - 0.01),  "Hips",      True),
    ("Chest",       (0, 0, P["z_chest"] - 0.01),   (0, 0, P["z_shoulder"] + 0.01), "Spine",   True),
    ("Neck",        (0, 0, P["z_shoulder"] + 0.01), (0, 0, P["z_head_bot"]),     "Chest",     True),
    ("Head",        (0, 0, P["z_head_bot"]),       (0, 0, P["z_head_top"]),      "Neck",      True),
    ("Eye_L",       (-0.058, -0.185, 1.590),       (-0.058, -0.265, 1.590),      "Head",      False),
    ("Eye_R",       (0.053, -0.185, 1.583),        (0.053, -0.265, 1.583),       "Head",      False),
    ("Mouth",       (0.004, -0.185, 1.436),        (0.004, -0.255, 1.436),       "Head",      False),
]
for _s, _sg in (('L', -1.0), ('R', 1.0)):
    _sh, _el, _wr, _tip, _d = None, None, None, None, None


def _limb_bones():
    out = []
    for side in ('L', 'R'):
        sh, el, wr, tip, d, dh = arm_chain(side)
        s = -1.0 if side == 'L' else 1.0
        out += [
            (f"Clavicle_{side}", (0, 0, P["z_shoulder"] - 0.012), tuple(sh), "Chest", False),
            (f"UpperArm_{side}", tuple(sh), tuple(el), f"Clavicle_{side}", True),
            (f"Forearm_{side}",  tuple(el), tuple(wr), f"UpperArm_{side}", True),
            (f"Hand_{side}",     tuple(wr), tuple(tip), f"Forearm_{side}", True),
            (f"Thigh_{side}",    (s * P["leg_x"] * 0.92, 0.004, P["z_hip"] - 0.005),
                                 (s * P["leg_x"] * 1.03, 0.006, P["z_knee"]), "Hips", False),
            (f"Shin_{side}",     (s * P["leg_x"] * 1.03, 0.006, P["z_knee"]),
                                 (s * P["leg_x"] * 1.08, 0.010, P["z_ankle"]), f"Thigh_{side}", True),
            (f"Foot_{side}",     (s * P["leg_x"] * 1.08, 0.010, P["z_ankle"]),
                                 (s * P["leg_x"] * 1.10, -0.185, P["z_sole"] + 0.030),
                                 f"Shin_{side}", True),
        ]
    return out


def build_armature():
    arm_data = bpy.data.armatures.new("CG_Armature")
    arm = bpy.data.objects.new("CG_Rig", arm_data)
    bpy.context.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    for name, h, t, parent, conn in BONES + _limb_bones():
        b = arm_data.edit_bones.new(name)
        b.head, b.tail, b.roll = Vector(h), Vector(t), 0.0
        if parent:
            b.parent = arm_data.edit_bones[parent]
            b.use_connect = conn
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in arm.pose.bones:
        pb.rotation_mode = 'XYZ'
    return arm


# ---------------------------------------------------------------- skinning
CANDIDATES = {
    "CG_Head":     ["Head"],
    "CG_Eye_L":    ["Eye_L"], "CG_Eye_R": ["Eye_R"], "CG_Mouth": ["Mouth"],
    "CG_Body":     ["Chest", "Neck", "Head",
                    "Clavicle_L", "UpperArm_L", "Forearm_L", "Hand_L",
                    "Clavicle_R", "UpperArm_R", "Forearm_R", "Hand_R"],
    "CG_Shirt":    ["Hips", "Spine", "Chest", "Neck",
                    "Clavicle_L", "UpperArm_L", "Clavicle_R", "UpperArm_R"],
    "CG_Trousers": ["Hips", "Spine", "Thigh_L", "Shin_L", "Thigh_R", "Shin_R"],
    "CG_Shoes":    ["Foot_L", "Shin_L", "Foot_R", "Shin_R"],
}
POWER, MAX_INF, SMOOTH_IT, SMOOTH_F = 4.0, 4, 5, 0.45


def candidates_for(obname, p):
    """Per-vertex bone shortlist. Side-restricted so a left-leg vertex can
    never pick up a right-leg bone across the crotch, and so the torso panel
    of the tee is never dragged by the upper arm."""
    side = 'L' if p.x < 0 else 'R'
    if obname == "CG_Trousers":
        return ["Hips", "Spine", f"Thigh_{side}", f"Shin_{side}"]
    if obname == "CG_Shirt":
        if abs(p.x) > 0.150 and p.z > 1.00:          # sleeve + shoulder cap
            return ["Chest", f"Clavicle_{side}", f"UpperArm_{side}"]
        return ["Hips", "Spine", "Chest", "Neck", f"Clavicle_{side}"]
    if obname == "CG_Body":
        if abs(p.x) < 0.075 and p.z > 1.20:          # neck
            return ["Chest", "Neck", "Head"]
        return ["Chest", f"Clavicle_{side}", f"UpperArm_{side}",
                f"Forearm_{side}", f"Hand_{side}"]
    if obname == "CG_Shoes":
        return [f"Foot_{side}", f"Shin_{side}"]
    return CANDIDATES[obname]


def seg_dist(p, h, t):
    d = t - h
    L2 = d.dot(d)
    if L2 < 1e-12:
        return (p - h).length
    u = max(0.0, min(1.0, (p - h).dot(d) / L2))
    return (p - (h + d * u)).length


def skin(ob, arm):
    names = CANDIDATES[ob.name]
    B = {n: (arm.data.bones[n].head_local.copy(), arm.data.bones[n].tail_local.copy())
         for n in names}
    me = ob.data
    nv = len(me.vertices)
    W = [dict() for _ in range(nv)]
    for i, v in enumerate(me.vertices):
        p = v.co
        raw = []
        for n in candidates_for(ob.name, p):
            h, t = B[n]
            d = max(seg_dist(p, h, t), 1e-4)
            raw.append((n, 1.0 / (d ** POWER)))
        s = sum(w for _, w in raw)
        for n, w in raw:
            W[i][n] = w / s

    if len(names) > 1 and SMOOTH_IT:
        adj = [[] for _ in range(nv)]
        for e in me.edges:
            a, b = e.vertices
            adj[a].append(b); adj[b].append(a)
        for _ in range(SMOOTH_IT):
            new = []
            for i in range(nv):
                acc = dict(W[i])
                for k in acc:
                    acc[k] *= (1.0 - SMOOTH_F)
                if adj[i]:
                    f = SMOOTH_F / len(adj[i])
                    for j in adj[i]:
                        for k, w in W[j].items():
                            acc[k] = acc.get(k, 0.0) + w * f
                new.append(acc)
            W = new

    groups = {n: ob.vertex_groups.new(name=n) for n in names}
    for i in range(nv):
        top = sorted(W[i].items(), key=lambda kv: -kv[1])[:MAX_INF]
        s = sum(w for _, w in top) or 1.0
        for n, w in top:
            groups[n].add([i], w / s, 'REPLACE')
    md = ob.modifiers.new("Armature", 'ARMATURE')
    md.object = arm
    ob.parent = arm


# ----------------------------------------------------------------- empties
def add_empties(arm):
    spec = [("ThoughtOrigin", "Head",   (0.0, -0.02, P["z_head_top"] + 0.055)),
            ("HeadFX",        "Head",   (0.0, -0.02, P["z_head_mid"])),
            ("ChestFX",       "Chest",  (0.0, -0.105, P["z_chest"] + 0.01)),
            ("LeftHandFX",    "Hand_L", None),
            ("RightHandFX",   "Hand_R", None)]
    made = []
    for name, bone, pos in spec:
        if pos is None:
            pos = tuple(arm.data.bones[bone].tail_local)
        e = bpy.data.objects.new(name, None)
        e.empty_display_type = 'PLAIN_AXES'
        e.empty_display_size = 0.055
        bpy.context.collection.objects.link(e)
        e.parent = arm
        e.parent_type = 'BONE'
        e.parent_bone = bone
        bpy.context.view_layer.update()
        e.matrix_world = Matrix.Translation(Vector(pos))
        made.append(e)
    return made


# -------------------------------------------------------------------- main
def main():
    reset()
    islands = {}
    head = build_head()
    eyeL, eyeR, mouth = build_face_parts()
    body = build_skin()
    shirt = build_shirt()
    trousers = build_trousers()
    shoes = build_shoes()

    uv_smart(head, "head", islands, angle=52)
    uv_smart(eyeL, "eye", islands, 80); uv_smart(eyeR, "eye", islands, 80)
    uv_smart(mouth, "mouth", islands, 80)
    uv_smart(body, "arm", islands, 70)
    uv_planar_split(shirt, "shirt_front", "shirt_back", "shirt_side", islands)
    uv_planar_split(trousers, "trou_front", "trou_back", "trou_side", islands)
    uv_smart(shoes, "shoe", islands, 62)

    mats = build_materials()
    for ob, m in ((head, "CG_Head"), (eyeL, "CG_Eyes"), (eyeR, "CG_Eyes"),
                  (mouth, "CG_Eyes"), (body, "CG_Skin"), (shirt, "CG_Shirt"),
                  (trousers, "CG_Trousers"), (shoes, "CG_Shoes")):
        ob.data.materials.append(mats[m])

    arm = build_armature()
    for ob in (head, eyeL, eyeR, mouth, body, shirt, trousers, shoes):
        skin(ob, arm)
    add_empties(arm)
    build_outline([head, body, shirt, trousers, shoes])

    tris = 0
    report = {}
    for ob in bpy.data.objects:
        if ob.type != 'MESH' or ob.name.endswith("_OL"):
            continue
        me = ob.data
        t = sum(len(p.vertices) - 2 for p in me.polygons)
        report[ob.name] = dict(tris=t, verts=len(me.vertices))
        tris += t
    report["_total_tris"] = tris
    dims = [max(v.co[i] for ob in bpy.data.objects if ob.type == 'MESH' and not ob.name.endswith('_OL') for v in ob.data.vertices)
            for i in range(3)]
    report["_height_m"] = round(dims[2], 4)

    with open(os.path.join(OUT, "uv_islands.json"), "w") as f:
        json.dump(islands, f, indent=1)
    with open(os.path.join(OUT, "build_report.json"), "w") as f:
        json.dump(report, f, indent=1)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "cubeguy_base.blend"))
    print(json.dumps(report, indent=1))


main()
