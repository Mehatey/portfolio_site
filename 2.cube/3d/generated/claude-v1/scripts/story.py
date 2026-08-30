"""'The Idea' - a 30s story in six new scenes, shot on 2s for stop-motion cadence.
dormant -> notices a mote -> chases it -> catches it -> it multiplies -> offers it out.
Usage: CG_SCENE=sleep python3 story.py
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Euler, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
SCENE = os.environ.get("CG_SCENE", "sleep")
OUT = os.path.normpath(os.path.join(HERE, "..", "out", "story", SCENE))
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "..", "out", "cubeguy_base.blend"))
from cel_lib import cel_material
import cg_geo as G

sc = bpy.context.scene
sc.render.fps = 24
LIGHT = Vector((-0.36, -0.84, 0.40)).normalized()
ARM = bpy.data.objects["CG_Rig"]
HERO = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith("_OL")]
for o in [o for o in bpy.data.objects if o.name.endswith("_OL")]:
    bpy.data.objects.remove(o, do_unlink=True)
for pb in ARM.pose.bones:
    pb.rotation_mode = 'XYZ'

LEN = {"sleep": 96, "notice": 120, "chase": 132, "ignite": 108,
       "bloom": 156, "offer": 108}[SCENE]
act = bpy.data.actions.new("ST_" + SCENE)
ARM.animation_data_create().action = act


def K(b, f, rot=None, scl=None, loc=None):
    pb = ARM.pose.bones[b]
    if rot is not None:
        pb.rotation_euler = Euler([math.radians(v) for v in rot], 'XYZ')
        pb.keyframe_insert("rotation_euler", frame=f)
    if scl is not None:
        pb.scale = Vector(scl); pb.keyframe_insert("scale", frame=f)
    if loc is not None:
        pb.location = Vector(loc); pb.keyframe_insert("location", frame=f)


def T(b, keys, chan="rot"):
    for f, v in keys:
        K(b, f, **{chan: v})


STAND = {
    "Hips": (2, 0, 5), "Spine": (1, 0, -3), "Chest": (-2, 3, -3),
    "Neck": (1, -4, 2), "Head": (-3, -8, 7),
    "Clavicle_L": (0, 0, 5), "UpperArm_L": (8, 0, -4), "Forearm_L": (0, 0, 15),
    "Hand_L": (0, 0, 8),
    "Clavicle_R": (0, 0, -3), "UpperArm_R": (-10, 0, 5), "Forearm_R": (0, 0, -26),
    "Hand_R": (0, 0, -13),
    "Thigh_L": (-6, 0, 2), "Shin_L": (4, 0, 0), "Foot_L": (2, 0, 0),
    "Thigh_R": (10, 0, -5), "Shin_R": (-17, 0, 0), "Foot_R": (10, 0, 3),
}
BASE = dict(STAND)
B = lambda b, dx=0, dy=0, dz=0: (BASE[b][0]+dx, BASE[b][1]+dy, BASE[b][2]+dz)


def lay(end):
    for b, r in BASE.items():
        K(b, 1, rot=r); K(b, end, rot=r)


def breathe(end, per=32, amt=1.014):
    ks, f, up = [], 1, True
    while f <= end:
        ks.append((f, (amt, amt+.004, amt) if up else (1, 1, 1)))
        up = not up; f += per
    ks.append((end, (1, 1, 1)))
    T("Chest", ks, "scl")


def blink(f, close=3, hold=0):
    for b in ("Eye_L", "Eye_R"):
        K(b, f-close, scl=(1, 1, 1)); K(b, f, scl=(1, 1, .08))
        K(b, f+hold, scl=(1, 1, .08)); K(b, f+hold+4, scl=(1, 1, 1))


def ease(a):
    for fc in a.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'


# the mote: one glowing seed that carries continuity across every scene
def make_mote(path_keys, scale_keys, colour=(0.98, 0.86, 0.42)):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=9, radius=0.030)
    me = bpy.data.meshes.new("Mote")
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("Mote", me)
    sc.collection.objects.link(ob)
    m = bpy.data.materials.new("MoteM"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*colour, 1.0)
    nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
    me.materials.append(m)
    for f, p in path_keys:
        ob.location = Vector(p); ob.keyframe_insert("location", frame=f)
    for f, s in scale_keys:
        ob.scale = (s, s, s); ob.keyframe_insert("scale", frame=f)
    ease(ob.animation_data.action)
    return ob


def head_glow(keys, colour=(0.99, 0.88, 0.50)):
    """A halo that sits BEHIND the cube. Flattened in depth so its front never
    crosses the face plane - the head occludes the middle, only the rim shows."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=26, v_segments=15, radius=0.205)
    me = bpy.data.meshes.new("Glow")
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new("Glow", me)
    sc.collection.objects.link(ob)
    m = bpy.data.materials.new("GlowM"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = (*colour, 1.0)
    nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
    me.materials.append(m)
    ob.location = (0.0, 0.02, 1.590)
    for f, s_ in keys:
        ob.scale = (s_, s_ * 0.34, s_ * 1.04)
        ob.keyframe_insert("scale", frame=f)
    ease(ob.animation_data.action)
    for fl in ("visible_shadow", "visible_diffuse", "visible_glossy",
               "visible_transmission", "visible_volume_scatter"):
        setattr(ob, fl, False)
    return ob


# ========================================================= 1. sleep =====
if SCENE == "sleep":
    BASE.update({"Chest": (12, 2, -4), "Spine": (9, 0, -3), "Neck": (13, -3, 3),
                 "Head": (17, -6, 6), "Clavicle_L": (0, 0, 11),
                 "Clavicle_R": (0, 0, -10), "UpperArm_L": (12, 0, -12),
                 "UpperArm_R": (-13, 0, 13), "Forearm_L": (0, 0, 26),
                 "Forearm_R": (0, 0, -34)})
    lay(LEN); breathe(LEN, 44, 1.020)
    T("Head", [(1, B("Head")), (46, B("Head", dx=2, dy=2)), (LEN, B("Head"))])
    for b in ("Eye_L", "Eye_R"):
        K(b, 1, scl=(1, 1, .06)); K(b, LEN, scl=(1, 1, .06))
    CAM = dict(az=18, el=3, d=5.4, tgt=(-0.62, 0, 0.96), lens=88, dolly=(0, 0, 0.10))
    make_mote([(1, (2.1, -0.5, 1.9)), (LEN, (1.15, -0.42, 1.72))],
              [(1, 0.0), (54, 0.0), (72, 1.0), (LEN, 1.0)])

# ======================================================== 2. notice =====
elif SCENE == "notice":
    lay(LEN); breathe(LEN, 34)
    T("Head", [(1, B("Head", dx=15, dy=-5)), (16, B("Head", dx=13, dy=-3)),
               (30, B("Head", dx=2, dy=9, dz=-5)),      # snaps up to it
               (38, B("Head", dx=-2, dy=13, dz=-7)),
               (52, B("Head", dx=-3, dy=11, dz=-6)),
               (78, B("Head", dx=-4, dy=4, dz=-2)),
               (LEN, B("Head", dx=-4, dy=-2, dz=1))])
    T("Neck", [(1, B("Neck", dx=11)), (34, B("Neck", dx=-2, dy=6)),
               (LEN, B("Neck", dx=-2))])
    T("Chest", [(1, B("Chest", dx=10)), (36, B("Chest", dx=-1, dy=4)),
                (LEN, B("Chest", dx=-2))])
    T("Spine", [(1, B("Spine", dx=8)), (36, B("Spine")), (LEN, B("Spine"))])
    for b, s_ in (("Clavicle_L", 10), ("Clavicle_R", -9)):
        T(b, [(1, B(b, dz=s_)), (40, B(b)), (LEN, B(b))])
    for b in ("Eye_L", "Eye_R"):
        K(b, 1, scl=(1, 1, .06)); K(b, 22, scl=(1, 1, .06))
        K(b, 30, scl=(1.18, 1, 1.24)); K(b, 46, scl=(1.06, 1, 1.10))
        K(b, 70, scl=(1, 1, 1)); K(b, LEN, scl=(1, 1, 1))
        K(b, 34, loc=(0.010, 0, 0)); K(b, 96, loc=(0.004, 0, 0))
    blink(88)
    CAM = dict(az=16, el=4, d=4.6, tgt=(-0.48, 0, 1.20), lens=92, dolly=(0, 0, 0.06))
    make_mote([(1, (1.15, -0.42, 1.72)), (46, (0.86, -0.44, 1.86)),
               (92, (0.62, -0.40, 1.66)), (LEN, (0.52, -0.42, 1.78))],
              [(1, 1.0), (LEN, 1.0)])

# ========================================================= 3. chase =====
elif SCENE == "chase":
    lay(LEN)
    T("Hips", [(1, B("Hips")), (30, B("Hips", dy=-8)), (72, B("Hips", dy=6)),
               (104, B("Hips", dy=-3)), (LEN, B("Hips"))])
    T("Chest", [(1, B("Chest")), (28, B("Chest", dx=-6, dy=8)),
                (66, B("Chest", dx=-10, dy=-6)), (100, B("Chest", dx=-4)),
                (LEN, B("Chest"))])
    T("Head", [(1, B("Head", dy=6)), (26, B("Head", dx=-8, dy=14, dz=-6)),
               (62, B("Head", dx=-12, dy=-10, dz=8)),
               (96, B("Head", dx=-6, dy=2)), (LEN, B("Head", dy=-2))])
    # two reaches: the first misses, the second closes on it
    T("Clavicle_R", [(1, B("Clavicle_R")), (24, B("Clavicle_R", dz=-16)),
                     (58, B("Clavicle_R", dz=-6)), (86, B("Clavicle_R", dz=-18)),
                     (112, B("Clavicle_R")), (LEN, B("Clavicle_R"))])
    T("UpperArm_R", [(1, B("UpperArm_R")), (14, B("UpperArm_R", dz=8)),
                     (28, B("UpperArm_R", dx=-16, dz=-62)),
                     (44, B("UpperArm_R", dx=-8, dz=-30)),
                     (62, B("UpperArm_R", dz=2)),
                     (88, B("UpperArm_R", dx=-20, dz=-72)),
                     (98, B("UpperArm_R", dx=-14, dz=-58)),
                     (116, B("UpperArm_R")), (LEN, B("UpperArm_R"))])
    T("Forearm_R", [(1, B("Forearm_R")), (30, B("Forearm_R", dz=-46)),
                    (48, B("Forearm_R", dz=-16)), (90, B("Forearm_R", dz=-54)),
                    (100, B("Forearm_R", dz=-40)), (118, B("Forearm_R")),
                    (LEN, B("Forearm_R"))])
    T("Hand_R", [(1, B("Hand_R")), (32, B("Hand_R", dz=-18)),
                 (40, B("Hand_R", dz=10)),                     # the grab that misses
                 (92, B("Hand_R", dz=-20)), (100, B("Hand_R", dz=14)),
                 (LEN, B("Hand_R"))])
    T("Thigh_R", [(1, B("Thigh_R")), (30, B("Thigh_R", dx=14)),
                  (70, B("Thigh_R", dx=-6)), (LEN, B("Thigh_R"))])
    T("Thigh_L", [(1, B("Thigh_L")), (30, B("Thigh_L", dx=-10)),
                  (70, B("Thigh_L", dx=8)), (LEN, B("Thigh_L"))])
    ARM.location = (0, 0, 0); ARM.keyframe_insert("location", frame=1)
    ARM.location = (0.16, 0, 0); ARM.keyframe_insert("location", frame=52)
    ARM.location = (-0.10, 0, 0); ARM.keyframe_insert("location", frame=104)
    ARM.location = (0, 0, 0); ARM.keyframe_insert("location", frame=LEN)
    blink(74)
    CAM = dict(az=12, el=3, d=5.8, tgt=(-0.30, 0, 1.02), lens=86, dolly=(0.10, 0, 0))
    make_mote([(1, (0.52, -0.42, 1.78)), (30, (0.30, -0.46, 1.92)),
               (44, (-0.06, -0.44, 1.74)),          # slips past the first grab
               (68, (-0.30, -0.48, 1.52)), (88, (-0.02, -0.46, 1.80)),
               (100, (0.16, -0.44, 1.86)), (LEN, (0.18, -0.44, 1.84))],
              [(1, 1.0), (LEN, 1.0)])

# ======================================================== 4. ignite =====
elif SCENE == "ignite":
    lay(LEN)
    T("Head", [(1, B("Head", dy=6, dz=-3)), (18, B("Head", dy=4)),
               (26, B("Head", dx=4)),
               (34, B("Head", dx=-9, dy=-2, dz=3)), (52, B("Head", dx=-5)),
               (78, B("Head", dx=-2, dy=3, dz=-2)), (LEN, B("Head", dy=1))])
    K("Head", 1, scl=(1, 1, 1)); K("Head", 28, scl=(0.94, 1.09, 0.94))
    K("Head", 38, scl=(1.13, 0.90, 1.12)); K("Head", 50, scl=(0.98, 1.03, 0.98))
    K("Head", 66, scl=(1.02, 0.99, 1.02)); K("Head", LEN, scl=(1, 1, 1))
    T("Clavicle_R", [(1, B("Clavicle_R", dz=-16)), (26, B("Clavicle_R", dz=-12)),
                     (48, B("Clavicle_R")), (LEN, B("Clavicle_R"))])
    T("UpperArm_R", [(1, B("UpperArm_R", dx=-18, dz=-66)),
                     (22, B("UpperArm_R", dx=-22, dz=-74)),   # brings it to the cube
                     (34, B("UpperArm_R", dx=-14, dz=-52)),
                     (58, B("UpperArm_R", dz=-8)), (LEN, B("UpperArm_R"))])
    T("Forearm_R", [(1, B("Forearm_R", dz=-50)), (22, B("Forearm_R", dz=-74)),
                    (40, B("Forearm_R", dz=-40)), (62, B("Forearm_R")),
                    (LEN, B("Forearm_R"))])
    T("Chest", [(1, B("Chest")), (28, B("Chest", dx=6)), (40, B("Chest", dx=-7)),
                (66, B("Chest", dx=-2)), (LEN, B("Chest"))])
    T("Hips", [(1, (0, 0, 0)), (30, (0, -0.020, 0)), (44, (0, 0.008, 0)),
               (70, (0, 0, 0)), (LEN, (0, 0, 0))], "loc")
    for b in ("Eye_L", "Eye_R"):
        K(b, 20, scl=(1, 1, 1)); K(b, 30, scl=(1, 1, .10))
        K(b, 40, scl=(1.26, 1, 1.32)); K(b, 66, scl=(1.08, 1, 1.10))
        K(b, LEN, scl=(1, 1, 1))
    CAM = dict(az=-16, el=5, d=4.2, tgt=(0.30, 0, 1.34), lens=95, dolly=(0, 0, 0.10))
    make_mote([(1, (0.18, -0.44, 1.84)), (20, (0.10, -0.34, 1.70)),
               (30, (0.0, -0.20, 1.60)), (LEN, (0.0, -0.20, 1.60))],
              [(1, 1.0), (28, 1.0), (34, 2.4), (40, 0.001), (LEN, 0.001)])
    head_glow([(1, 0.001), (30, 0.001), (38, 1.16), (52, 0.86),
               (78, 0.96), (LEN, 0.90)])

# ========================================================= 5. bloom =====
elif SCENE == "bloom":
    lay(LEN); breathe(LEN, 40)
    T("Head", [(1, B("Head", dy=2)), (30, B("Head", dx=-14, dy=-4, dz=4)),
               (74, B("Head", dx=-17, dy=6, dz=-5)),
               (118, B("Head", dx=-8, dy=-3, dz=3)), (LEN, B("Head"))])
    T("Neck", [(1, B("Neck")), (34, B("Neck", dx=-8)), (110, B("Neck", dx=-6)),
               (LEN, B("Neck"))])
    T("Chest", [(1, B("Chest")), (36, B("Chest", dx=-9)), (110, B("Chest", dx=-6)),
                (LEN, B("Chest"))])
    T("Hips", [(1, (0, 0, 0)), (40, (0, 0.018, 0)), (110, (0, 0.010, 0)),
               (LEN, (0, 0, 0))], "loc")
    for b, sg in (("UpperArm_L", 1), ("UpperArm_R", -1)):
        T(b, [(1, B(b)), (44, B(b, dx=-12, dz=26*sg)), (96, B(b, dx=-8, dz=20*sg)),
              (140, B(b)), (LEN, B(b))])
        fa = "Forearm_" + b[-1]
        T(fa, [(1, B(fa)), (48, B(fa, dz=18*sg)), (140, B(fa)), (LEN, B(fa))])
    for b in ("Eye_L", "Eye_R"):
        K(b, 1, scl=(1.10, 1, 1.14)); K(b, 60, scl=(1.16, 1, 1.20))
        K(b, 120, scl=(1.04, 1, 1.06)); K(b, LEN, scl=(1, 1, 1))
    CAM = dict(az=24, el=8, d=5.6, tgt=(-0.56, 0, 1.16), lens=84, dolly=(0, 0, 0.26))
    head_glow([(1, 0.95), (60, 1.05), (120, 0.80), (LEN, 0.55)])
    RIB = [(0.058, 0.42, 0.26, (0.36, 0.74, 0.68)), (-0.050, 0.54, 0.22, (0.88, 0.60, 0.26)),
           (0.022, 0.48, 0.30, (0.84, 0.42, 0.34)), (-0.074, 0.36, 0.20, (0.46, 0.54, 0.84)),
           (0.090, 0.60, 0.24, (0.92, 0.78, 0.36)), (-0.030, 0.44, 0.28, (0.52, 0.80, 0.62)),
           (0.066, 0.32, 0.18, (0.94, 0.66, 0.52))]
    origin = Vector((0.0, -0.02, 1.795))
    for i, (ox, hgt, amp, col) in enumerate(RIB):
        pts, n = [], 28
        for k in range(n):
            t = k / (n - 1)
            pts.append(origin + Vector((
                ox*(0.4+t*2.1) + math.sin(t*6.0+i)*amp*0.34*t,
                math.cos(t*4.4+i*1.7)*amp*0.28*t - 0.02, hgt*t)))
        rad = [(0.0080*(1-t/n)+0.0020, 0.0080*(1-t/n)+0.0020) for t in range(n)]
        v, fcs = G.limb(pts, rad, 8, True, True)
        me = bpy.data.meshes.new("Rib%d" % i)
        me.from_pydata([tuple(p) for p in v], [], [list(x) for x in fcs]); me.validate()
        ob = bpy.data.objects.new("Rib%d" % i, me); sc.collection.objects.link(ob)
        m = bpy.data.materials.new("RibM%d" % i); m.use_nodes = True
        nt = m.node_tree; nt.nodes.clear()
        o = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
        em.inputs['Color'].default_value = (*col, 1.0)
        nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
        me.materials.append(m)
        ob.location = origin; me.transform(Matrix.Translation(-origin))
        d0 = 14 + i * 8
        for f, s_ in ((1, 0.001), (d0, 0.001), (d0+30, 1.0), (128, 1.0),
                      (150, 0.35), (LEN, 0.20)):
            ob.scale = (s_, s_, s_); ob.keyframe_insert("scale", frame=f)
        for f, rz in ((1, 0), (LEN, math.radians(34 + i*6))):
            ob.rotation_euler = Euler((0, 0, rz), 'XYZ')
            ob.keyframe_insert("rotation_euler", frame=f)
        ease(ob.animation_data.action)

# ========================================================= 6. offer =====
else:
    lay(LEN); breathe(LEN, 34)
    T("Head", [(1, B("Head", dx=-8, dy=4)), (26, B("Head", dx=-3, dy=-2)),
               (46, B("Head", dy=-14, dz=8)),        # turns to camera
               (62, B("Head", dy=-18, dz=10)), (96, B("Head", dy=-16, dz=9)),
               (LEN, B("Head", dy=-15, dz=9))])
    T("Neck", [(1, B("Neck", dx=-5)), (48, B("Neck", dy=-7)), (LEN, B("Neck", dy=-6))])
    T("Clavicle_R", [(1, B("Clavicle_R", dz=-8)), (34, B("Clavicle_R", dz=-19)),
                     (96, B("Clavicle_R", dz=-18)), (LEN, B("Clavicle_R", dz=-18))])
    T("UpperArm_R", [(1, B("UpperArm_R", dx=-6, dz=-16)),
                     (30, B("UpperArm_R", dx=-40, dz=-24)),   # hand out to you
                     (44, B("UpperArm_R", dx=-46, dz=-26)),
                     (96, B("UpperArm_R", dx=-44, dz=-25)),
                     (LEN, B("UpperArm_R", dx=-44, dz=-25))])
    T("Forearm_R", [(1, B("Forearm_R", dz=-20)), (36, B("Forearm_R", dz=-40)),
                    (LEN, B("Forearm_R", dz=-38))])
    T("Hand_R", [(1, B("Hand_R")), (40, B("Hand_R", dx=-16)),
                 (70, B("Hand_R", dx=-12)), (LEN, B("Hand_R", dx=-13))])
    T("Chest", [(1, B("Chest", dx=-4)), (40, B("Chest", dy=-5)), (LEN, B("Chest", dy=-4))])
    blink(30); blink(90)
    CAM = dict(az=6, el=2, d=4.4, tgt=(-0.30, 0, 1.12), lens=92, dolly=(0, 0, -0.16))
    head_glow([(1, 0.55), (LEN, 0.42)])
    make_mote([(1, (0.30, -0.30, 1.30)), (40, (0.34, -0.44, 1.24)),
               (LEN, (0.33, -0.46, 1.26))],
              [(1, 0.001), (26, 0.001), (44, 1.15), (96, 1.0), (LEN, 1.05)])

ease(act)
for ob in HERO:
    for i, sl in enumerate(ob.data.materials):
        if sl:
            ob.data.materials[i] = cel_material(sl, LIGHT)

sc.world = bpy.data.worlds.new("W")
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = int(os.environ.get("CG_SAMPLES", 12))
sc.cycles.max_bounces = 0
sc.cycles.transparent_max_bounces = 12
sc.cycles.use_denoising = False
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.resolution_x = int(os.environ.get("CG_W", 1120))
sc.render.resolution_y = int(os.environ.get("CG_H", 630))
sc.view_settings.view_transform = 'Standard'

cam = bpy.data.cameras.new("Cam"); cam.lens = CAM["lens"]
cam.sensor_fit = 'VERTICAL'; cam.sensor_height = 36.0
co = bpy.data.objects.new("Cam", cam); sc.collection.objects.link(co)
sc.camera = co


def place(frame, extra=Vector((0, 0, 0))):
    a, e = math.radians(CAM["az"]), math.radians(CAM["el"])
    tgt = Vector(CAM["tgt"]) + extra
    co.location = tgt + Vector((math.sin(a)*math.cos(e)*CAM["d"],
                                -math.cos(a)*math.cos(e)*CAM["d"],
                                math.sin(e)*CAM["d"]))
    co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
    co.keyframe_insert("location", frame=frame)
    co.keyframe_insert("rotation_euler", frame=frame)


place(1)
if CAM.get("dolly"):
    place(LEN, Vector(CAM["dolly"]))
    ease(co.animation_data.action)

# shot on 2s: render every other frame, hold each for two
STEP = 2
start = int(os.environ.get("CG_START", 1)); stop = int(os.environ.get("CG_STOP", LEN))
n = 0
for fr in range(start, stop + 1, STEP):
    sc.frame_set(fr)
    sc.render.filepath = os.path.join(OUT, "f_%04d.png" % (n + 1))
    bpy.ops.render.render(write_still=True)
    n += 1
    if n % 20 == 0:
        print(SCENE, "step", n, flush=True)
print("SEQDONE", SCENE, n)
