"""Sits at a desk, opens the laptop, gets to work. 6s @ 24fps, alpha pass."""
import bpy, math, os, sys, random
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.path.normpath(os.path.join(HERE, "..", "out", "seq_desk"))
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "..", "out", "cubeguy_base.blend"))
import props
from cel_lib import cel_material

sc = bpy.context.scene
sc.render.fps = 24
END = 144
LIGHT = Vector((-0.42, -0.80, 0.44)).normalized()
ARM = bpy.data.objects["CG_Rig"]
HERO = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith("_OL")]
for o in [o for o in bpy.data.objects if o.name.endswith("_OL")]:
    bpy.data.objects.remove(o, do_unlink=True)

SEAT_DROP = 0.462
ARM.location.z = -SEAT_DROP
propobjs, lid_parts = props.build_scene()

for pb in ARM.pose.bones:
    pb.rotation_mode = 'XYZ'
act = bpy.data.actions.new("DeskWork")
ARM.animation_data_create().action = act


def K(bone, f, rot=None, scl=None, loc=None):
    pb = ARM.pose.bones[bone]
    if rot is not None:
        pb.rotation_euler = Euler([math.radians(v) for v in rot], 'XYZ')
        pb.keyframe_insert("rotation_euler", frame=f)
    if scl is not None:
        pb.scale = Vector(scl); pb.keyframe_insert("scale", frame=f)
    if loc is not None:
        pb.location = Vector(loc); pb.keyframe_insert("location", frame=f)


def T(bone, keys, chan="rot"):
    for f, v in keys:
        K(bone, f, **{chan: v})


# ---- seated base: thighs forward, shins down, torso leaning in ---------
SIT = {
    "Hips": (-9, 0, 1), "Spine": (7, 0, -1), "Chest": (8, 2, -1),
    "Neck": (6, -2, 1), "Head": (7, -4, 2),
    "Clavicle_L": (0, 0, 6), "UpperArm_L": (-44, 0, -12), "Forearm_L": (0, 0, 58),
    "Hand_L": (-14, 0, 6),
    "Clavicle_R": (0, 0, -6), "UpperArm_R": (-44, 0, 12), "Forearm_R": (0, 0, -58),
    "Hand_R": (-14, 0, -6),
    "Thigh_L": (84, 0, 4), "Shin_L": (-80, 0, -2), "Foot_L": (-6, 0, 2),
    "Thigh_R": (82, 0, -5), "Shin_R": (-78, 0, 3), "Foot_R": (-5, 0, -3),
}
def _hand_pos(side):
    bpy.context.view_layer.update()
    return ARM.matrix_world @ ARM.pose.bones["Hand_" + side].tail


def _seed_torso():
    """Solve against the pose he will actually be in, not the rest pose."""
    for b in ("Hips", "Spine", "Chest", "Neck", "Head",
              "Clavicle_L", "Clavicle_R", "Thigh_L", "Shin_L", "Foot_L",
              "Thigh_R", "Shin_R", "Foot_R"):
        ARM.pose.bones[b].rotation_euler = Euler(
            [math.radians(v) for v in SIT[b]], 'XYZ')
    bpy.context.view_layer.update()


def solve_arm(side, target, tries=600):
    """Coarse random pass, then coordinate descent. Four DOF."""
    ua, fa = ARM.pose.bones["UpperArm_" + side], ARM.pose.bones["Forearm_" + side]
    tgt = Vector(target)

    sh_z = (ARM.matrix_world @ ua.head).z

    def apply(v):
        """Cost = reach error, plus penalties that keep the elbow low, the
        upper arm untwisted and the arm out of the torso. Position alone
        gives a valid but spidery solution."""
        ua.rotation_euler = Euler([math.radians(v[0]), math.radians(v[1]),
                                   math.radians(v[2])], 'XYZ')
        fa.rotation_euler = Euler([0.0, 0.0, math.radians(v[3])], 'XYZ')
        bpy.context.view_layer.update()
        hand = ARM.matrix_world @ ARM.pose.bones["Hand_" + side].tail
        elbow = ARM.matrix_world @ fa.head
        # reach dominates; the rest only break ties between valid solutions
        cost = 12.0 * (hand - tgt).length
        cost += 0.030 * abs(v[1])                         # no upper-arm twist
        cost += 0.9 * max(0.0, elbow.y - (-0.02))         # elbows stay back
        cost += 1.4 * max(0.0, elbow.z - (sh_z + 0.015))  # elbow stays low
        cost += 1.1 * max(0.0, 0.080 - abs(elbow.x))      # clears the ribs
        cost += 0.8 * max(0.0, abs(elbow.x) - 0.250)      # but does not flare
        return cost

    rng = random.Random(17 if side == "L" else 23)
    sgn = 1.0 if side == "L" else -1.0
    best, cur = 1e9, [-50.0, 0.0, -20.0 * sgn, 40.0 * sgn]
    for _ in range(tries):
        v = [rng.uniform(-95, 5), rng.uniform(-8, 8),
             rng.uniform(-55, 55), rng.uniform(-105, 105)]
        e = apply(v)
        if e < best:
            best, cur = e, v
    step = 12.0
    for _ in range(220):
        improved = False
        for i in range(4):
            for d in (step, -step):
                t = list(cur); t[i] += d
                e = apply(t)
                if e < best - 1e-5:
                    best, cur, improved = e, t, True
        if not improved:
            step *= 0.55
            if step < 0.04:
                break
    apply(cur)
    return cur, best


DY = -0.44
TARGETS = {"L": Vector((-0.108, DY + 0.104, 0.722)),
           "R": Vector((0.126, DY + 0.090, 0.722))}
_seed_torso()
for _s in ("L", "R"):
    _v, _err = solve_arm(_s, TARGETS[_s])
    SIT["UpperArm_" + _s] = (_v[0], _v[1], _v[2])
    SIT["Forearm_" + _s] = (0.0, 0.0, _v[3])
    ARM.pose.bones["UpperArm_" + _s].rotation_euler = Euler(
        [math.radians(x) for x in _v[:3]], 'XYZ')
    ARM.pose.bones["Forearm_" + _s].rotation_euler = Euler(
        [0.0, 0.0, math.radians(_v[3])], 'XYZ')
    bpy.context.view_layer.update()
    _h = ARM.matrix_world @ ARM.pose.bones["Hand_" + _s].tail
    print("arm", _s, "hand err %.1f mm" % ((_h - TARGETS[_s]).length * 1000),
          [round(x, 1) for x in _v], flush=True)

B = lambda b, dx=0, dy=0, dz=0: (SIT[b][0] + dx, SIT[b][1] + dy, SIT[b][2] + dz)
for b, r in SIT.items():
    K(b, 1, rot=r); K(b, END, rot=r)

# breathing under everything
T("Chest", [(1, (1, 1, 1)), (30, (1.012, 1.016, 1.012)), (60, (1, 1, 1)),
            (92, (1.010, 1.014, 1.010)), (122, (1, 1, 1)), (END, (1, 1, 1))], "scl")

# ---- 1: looking down at the shut laptop -------------------------------
T("Head", [(1, B("Head", dx=6, dy=-3)), (18, B("Head", dx=7, dy=1))])

# ---- 2: right hand reaches the lid, opens it --------------------------
T("UpperArm_R", [(1, B("UpperArm_R")), (24, B("UpperArm_R", dx=2)),      # settle
                 (34, B("UpperArm_R", dx=-16, dz=6)),                    # reach out
                 (46, B("UpperArm_R", dx=-24, dz=4)),                    # lifts
                 (56, B("UpperArm_R", dx=-8)), (66, B("UpperArm_R")),
                 (END, B("UpperArm_R"))])
T("Forearm_R", [(1, B("Forearm_R")), (24, B("Forearm_R", dz=-4)),
                (34, B("Forearm_R", dz=14)), (46, B("Forearm_R", dz=-6)),
                (58, B("Forearm_R", dz=4)), (66, B("Forearm_R")),
                (END, B("Forearm_R"))])
T("Hand_R", [(1, B("Hand_R")), (30, B("Hand_R", dx=-12)),
             (44, B("Hand_R", dx=8)), (58, B("Hand_R", dx=-4)),
             (66, B("Hand_R")), (END, B("Hand_R"))])
# head follows the lid up, then locks on the screen
T("Head", [(30, B("Head", dx=8, dy=-2)), (44, B("Head", dx=2)),
           (56, B("Head", dx=-3, dy=1)), (70, B("Head", dx=-1)),
           (END, B("Head", dx=1))])
T("Neck", [(1, B("Neck")), (44, B("Neck", dx=2)), (58, B("Neck", dx=-4)),
           (END, B("Neck", dx=-3))])

# lid: shut, then swings open with a touch of overshoot
SHUT, OPEN = -94.0, -6.0
lid_keys = [(1, SHUT), (30, SHUT), (36, SHUT + 3), (46, SHUT + 52),
            (54, OPEN + 6), (60, OPEN - 4), (66, OPEN), (END, OPEN)]
for ob in lid_parts:
    for f, ang in lid_keys:
        ob.rotation_euler = Euler((math.radians(ang), 0, 0), 'XYZ')
        ob.keyframe_insert("rotation_euler", frame=f)
    if ob.animation_data and ob.animation_data.action:
        for fc in ob.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'BEZIER'
                kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'

# ---- 3: typing -------------------------------------------------------
TYPE_START, TYPE_END = 72, END
tap = 0
f = TYPE_START
side = 0
while f < TYPE_END - 4:
    bone = "Hand_L" if side else "Hand_R"
    amp = 7 + (tap % 3) * 3
    hold = 5 + (tap % 4)
    K(bone, f, rot=B(bone))
    K(bone, f + 2, rot=B(bone, dx=-amp))
    K(bone, f + 4, rot=B(bone))
    if tap % 3 == 0:                      # forearm answers the bigger taps
        fa = "Forearm_L" if side else "Forearm_R"
        K(fa, f, rot=B(fa))
        K(fa, f + 2, rot=B(fa, dz=(3 if side else -3)))
        K(fa, f + 5, rot=B(fa))
    f += hold
    side ^= 1
    tap += 1

# a beat where he stops and thinks, then goes back in
T("Head", [(96, B("Head", dx=1)), (104, B("Head", dx=-4, dy=-9, dz=6)),
           (116, B("Head", dx=-3, dy=-8, dz=5)), (126, B("Head", dx=1, dy=-1)),
           (END, B("Head", dx=1))])
T("Chest", [(1, B("Chest")), (104, B("Chest", dx=-3, dz=2)),
            (124, B("Chest")), (END, B("Chest"))])
for b in ("Eye_L", "Eye_R"):
    for fr in (26, 88, 132):
        K(b, fr - 3, scl=(1, 1, 1)); K(b, fr, scl=(1, 1, 0.08)); K(b, fr + 4, scl=(1, 1, 1))
    K(b, 58, scl=(1, 1, 1)); K(b, 66, scl=(1.08, 1, 1.12)); K(b, 80, scl=(1, 1, 1))

for fc in act.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'BEZIER'
        kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'

for ob in HERO:
    for i, sl in enumerate(ob.data.materials):
        if sl:
            ob.data.materials[i] = cel_material(sl, LIGHT)

sc.world = bpy.data.worlds.new("W")
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = int(os.environ.get("CG_SAMPLES", 12))
sc.cycles.max_bounces = 0
sc.cycles.use_denoising = False
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.resolution_x = int(os.environ.get("CG_W", 1040))
sc.render.resolution_y = int(os.environ.get("CG_H", 820))
sc.view_settings.view_transform = 'Standard'

cam = bpy.data.cameras.new("Cam"); cam.lens = 55
cam.sensor_fit = 'HORIZONTAL'; cam.sensor_width = 36.0
co = bpy.data.objects.new("Cam", cam); sc.collection.objects.link(co)
tgt = Vector((0.02, -0.24, 0.74))
a, e = math.radians(33), math.radians(19)
d = 2.42
co.location = tgt + Vector((math.sin(a) * math.cos(e) * d,
                            -math.cos(a) * math.cos(e) * d, math.sin(e) * d))
co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = co

start = int(os.environ.get("CG_START", 1)); stop = int(os.environ.get("CG_STOP", END))
for fr in range(start, stop + 1):
    sc.frame_set(fr)
    sc.render.filepath = os.path.join(OUT, "f_%04d.png" % fr)
    bpy.ops.render.render(write_still=True)
    if fr % 15 == 0:
        print("frame", fr, flush=True)
print("SEQDONE")
