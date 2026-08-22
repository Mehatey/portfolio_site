"""Cube Guy - animation clips + GLB/FBX export.
Run: python3 anim_export.py   (expects ../out/cubeguy_base.blend)
"""
import bpy, math, os, sys, json
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "cubeguy_base.blend"))
sc = bpy.context.scene
sc.render.fps = 24
ARM = bpy.data.objects["CG_Rig"]

# Bone local axes for the upright chain (+Z bones, roll 0):
#   rot.x = nod / pitch,  rot.y = yaw / turn,  rot.z = tilt / roll
# and pose-bone location .y runs along the bone (world +Z for the spine).


def new_action(name):
    a = bpy.data.actions.new(name)
    a.use_fake_user = True
    ad = ARM.animation_data or ARM.animation_data_create()
    ad.action = a
    for pb in ARM.pose.bones:
        pb.location = (0, 0, 0)
        pb.rotation_euler = (0, 0, 0)
        pb.scale = (1, 1, 1)
    return a


def key(bone, f, rot=None, loc=None, scl=None):
    pb = ARM.pose.bones[bone]
    if rot is not None:
        pb.rotation_euler = Euler([math.radians(v) for v in rot], 'XYZ')
        pb.keyframe_insert("rotation_euler", frame=f)
    if loc is not None:
        pb.location = Vector(loc)
        pb.keyframe_insert("location", frame=f)
    if scl is not None:
        pb.scale = Vector(scl)
        pb.keyframe_insert("scale", frame=f)


def track(bone, frames, rot=None, loc=None, scl=None):
    """frames: list of (f, value-tuple) for whichever channel is given."""
    for f, v in frames:
        key(bone, f, rot=v if rot else None, loc=v if loc else None, scl=v if scl else None)


def blink(f, close=3, open_=4):
    for b in ("Eye_L", "Eye_R"):
        key(b, f - close, scl=(1, 1, 1))
        key(b, f, scl=(1, 1, 0.07))
        key(b, f + open_, scl=(1, 1, 1))


def stash(action, end):
    ad = ARM.animation_data
    ad.action = action
    action.use_frame_range = True
    action.frame_start, action.frame_end = 1, end
    t = ad.nla_tracks.new()
    t.name = action.name
    t.strips.new(action.name, 1, action)
    t.mute = True
    ad.action = None


CLIPS = {}

# ------------------------------------------------------------------- Idle
a = new_action("Idle"); END = 97
track("Hips", [(1, (0, 0, 0)), (25, (0, -0.010, 0)), (49, (0, 0, 0)),
               (73, (0, -0.007, 0)), (97, (0, 0, 0))], loc=True)
track("Hips", [(1, (0, 0, 0)), (33, (0, 1.6, 0.9)), (65, (0, -1.2, -0.7)),
               (97, (0, 0, 0))], rot=True)
track("Chest", [(1, (0, 0, 0)), (25, (-1.5, 0, 0)), (49, (0.4, 0, 0)),
                (73, (-1.2, 0, 0)), (97, (0, 0, 0))], rot=True)
track("Chest", [(1, (1, 1, 1)), (25, (1.012, 1.016, 1.012)), (49, (1, 1, 1)),
                (73, (1.009, 1.012, 1.009)), (97, (1, 1, 1))], scl=True)
track("Neck", [(1, (0, 0, 0)), (30, (1.2, -1.4, 0)), (62, (-0.8, 1.0, 0)),
               (97, (0, 0, 0))], rot=True)
track("Head", [(1, (0, 0, 0)), (22, (-1.4, 3.4, -2.2)), (46, (0.8, -1.0, 1.4)),
               (70, (-0.6, -2.6, 1.0)), (97, (0, 0, 0))], rot=True)
for b, sgn in (("UpperArm_L", 1), ("UpperArm_R", -1)):
    track(b, [(1, (0, 0, 0)), (33, (1.6 * sgn, 0, 1.3)), (65, (-1.1 * sgn, 0, -0.9)),
              (97, (0, 0, 0))], rot=True)
blink(40); blink(79)
CLIPS["Idle"] = END; stash(a, END)

# ------------------------------------------------------------------- Look
a = new_action("Look"); END = 73
track("Head", [(1, (0, 0, 0)), (18, (-2.0, -27, -3.5)), (44, (-1.4, -25, -3.0)),
               (66, (0, 0, 0)), (73, (0, 0, 0))], rot=True)
track("Neck", [(1, (0, 0, 0)), (18, (0, -9, 0)), (44, (0, -8, 0)),
               (66, (0, 0, 0)), (73, (0, 0, 0))], rot=True)
track("Chest", [(1, (0, 0, 0)), (22, (0, -7, 0)), (46, (0, -6, 0)),
                (68, (0, 0, 0)), (73, (0, 0, 0))], rot=True)
track("Hips", [(1, (0, 0, 0)), (24, (0, -2.5, 0)), (68, (0, 0, 0))], rot=True)
for b in ("Eye_L", "Eye_R"):
    track(b, [(1, (0, 0, 0)), (12, (0.012, 0, 0)), (46, (0.012, 0, 0)),
              (62, (0, 0, 0))], loc=True)
blink(14); blink(58)
CLIPS["Look"] = END; stash(a, END)

# ------------------------------------------------------------------- Wave
a = new_action("Wave"); END = 85
track("Clavicle_R", [(1, (0, 0, 0)), (16, (0, 0, -12)), (62, (0, 0, -12)),
                     (82, (0, 0, 0)), (85, (0, 0, 0))], rot=True)
track("UpperArm_R", [(1, (0, 0, 0)), (18, (-8, 0, -74)), (64, (-8, 0, -74)),
                     (84, (0, 0, 0)), (85, (0, 0, 0))], rot=True)
track("Forearm_R", [(1, (0, 0, 0)), (20, (0, 0, -38)), (64, (0, 0, -34)),
                    (84, (0, 0, 0)), (85, (0, 0, 0))], rot=True)
track("Hand_R", [(1, (0, 0, 0)), (26, (0, 0, -15)), (34, (0, 0, 13)),
                 (42, (0, 0, -13)), (50, (0, 0, 12)), (58, (0, 0, -6)),
                 (70, (0, 0, 0)), (85, (0, 0, 0))], rot=True)
track("Head", [(1, (0, 0, 0)), (22, (-2, -7, 5)), (58, (-1, -6, 4)),
               (80, (0, 0, 0)), (85, (0, 0, 0))], rot=True)
track("Chest", [(1, (0, 0, 0)), (22, (0, -3, -2)), (60, (0, -3, -2)),
                (82, (0, 0, 0)), (85, (0, 0, 0))], rot=True)
blink(30)
CLIPS["Wave"] = END; stash(a, END)

# ------------------------------------------------------------------- Walk
a = new_action("Walk"); END = 49
FR = [1, 13, 25, 37, 49]
# one cycle sampled at quarters; the R side reads the same table half a cycle on
LEG = [(24, -4, -12), (0, -26, 6), (-20, -6, 14), (-4, -14, -2), (24, -4, -12)]
ARMSW = [-18, 0, 18, 0, -18]
for side, off in (("L", 0), ("R", 2)):
    for i, f in enumerate(FR):
        th, sh, ft = LEG[(i + off) % 4]
        key(f"Thigh_{side}", f, rot=(th, 0, 0))
        key(f"Shin_{side}", f, rot=(sh, 0, 0))
        key(f"Foot_{side}", f, rot=(ft, 0, 0))
    swing = "R" if side == "L" else "L"
    for i, f in enumerate(FR):
        ua = ARMSW[(i + off) % 4]
        key(f"UpperArm_{swing}", f, rot=(ua, 0, 0))
        key(f"Forearm_{swing}", f, rot=(max(0, -ua) * 0.5, 0, 0))
track("Hips", [(1, (0, -0.004, 0)), (13, (0, 0.012, 0)), (25, (0, -0.004, 0)),
               (37, (0, 0.012, 0)), (49, (0, -0.004, 0))], loc=True)
track("Hips", [(1, (0, -5, 0)), (25, (0, 5, 0)), (49, (0, -5, 0))], rot=True)
track("Chest", [(1, (2, 4, 0)), (25, (2, -4, 0)), (49, (2, 4, 0))], rot=True)
track("Head", [(1, (-1, -2.5, 1.5)), (13, (1, 0, 0)), (25, (-1, 2.5, -1.5)),
               (37, (1, 0, 0)), (49, (-1, -2.5, 1.5))], rot=True)
CLIPS["Walk"] = END; stash(a, END)

# ------------------------------------------------------------- ClickReact
a = new_action("ClickReact"); END = 31
track("Head", [(1, (1, 1, 1)), (4, (1.15, 0.83, 1.13)), (11, (0.93, 1.09, 0.94)),
               (19, (1.03, 0.98, 1.02)), (31, (1, 1, 1))], scl=True)
track("Head", [(1, (0, 0, 0)), (5, (-6, 4, 9)), (15, (3, -2, -4)),
               (31, (0, 0, 0))], rot=True)
track("Chest", [(1, (0, 0, 0)), (4, (4, 0, 0)), (14, (-2, 0, 0)),
                (31, (0, 0, 0))], rot=True)
track("Hips", [(1, (0, 0, 0)), (4, (0, -0.022, 0)), (14, (0, 0.006, 0)),
               (31, (0, 0, 0))], loc=True)
for b in ("Eye_L", "Eye_R"):
    track(b, [(1, (1, 1, 1)), (4, (1.2, 1, 1.26)), (16, (0.92, 1, 0.9)),
              (31, (1, 1, 1))], scl=True)
CLIPS["ClickReact"] = END; stash(a, END)

# --------------------------------------------------------- ThoughtRelease
a = new_action("ThoughtRelease"); END = 97
track("Head", [(1, (0, 0, 0)), (20, (7, 0, 0)), (36, (-16, 2, -3)),
               (64, (-13, -1, 2)), (90, (0, 0, 0)), (97, (0, 0, 0))], rot=True)
track("Head", [(1, (1, 1, 1)), (30, (0.96, 1.05, 0.96)), (40, (1.07, 1.09, 1.07)),
               (62, (1.02, 1.02, 1.02)), (90, (1, 1, 1)), (97, (1, 1, 1))], scl=True)
track("Neck", [(1, (0, 0, 0)), (36, (-6, 0, 0)), (64, (-5, 0, 0)),
               (90, (0, 0, 0)), (97, (0, 0, 0))], rot=True)
track("Chest", [(1, (0, 0, 0)), (34, (-7, 0, 0)), (66, (-5, 0, 0)),
                (92, (0, 0, 0)), (97, (0, 0, 0))], rot=True)
track("Hips", [(1, (0, 0, 0)), (34, (0, 0.014, 0)), (66, (0, 0.008, 0)),
               (92, (0, 0, 0)), (97, (0, 0, 0))], loc=True)
for b, sgn in (("UpperArm_L", 1), ("UpperArm_R", -1)):
    track(b, [(1, (0, 0, 0)), (34, (0, 0, 15 * sgn)), (66, (0, 0, 11 * sgn)),
              (92, (0, 0, 0)), (97, (0, 0, 0))], rot=True)
for b in ("Eye_L", "Eye_R"):
    track(b, [(1, (1, 1, 1)), (22, (1, 1, 0.18)), (32, (1, 1, 0.18)),
              (44, (1.14, 1, 1.2)), (70, (1, 1, 1)), (97, (1, 1, 1))], scl=True)
CLIPS["ThoughtRelease"] = END; stash(a, END)

for act in bpy.data.actions:
    for fc in act.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'

sc.frame_start, sc.frame_end = 1, 97
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "cubeguy_rigged.blend"))

# ------------------------------------------------------------------ export
HERO = [o for o in bpy.data.objects if not o.name.endswith("_OL")]
OL = [o for o in bpy.data.objects if o.name.endswith("_OL")]
ol_col = bpy.data.collections.get("CG_Outline")

GLTF = dict(export_format='GLB', export_yup=True, export_apply=False,
            export_animation_mode='ACTIONS', export_skins=True,
            export_def_bones=False, export_optimize_animation_size=True,
            export_image_format='JPEG', export_jpeg_quality=86,
            export_texture_dir='', export_cameras=False, export_lights=False,
            export_extras=True, export_bake_animation=False)

def select_only(objs):
    for o in bpy.data.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = ARM


# hero: everything except the inverted-hull outline copies
select_only(HERO)
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "cube_guy_v1.glb"),
                          use_selection=True, **GLTF)
bpy.ops.export_scene.fbx(filepath=os.path.join(OUT, "cube_guy_v1.fbx"),
                         use_selection=True, apply_unit_scale=True,
                         add_leaf_bones=False, bake_anim=True,
                         bake_anim_use_all_actions=True, path_mode='COPY',
                         embed_textures=True)

# outline hull as its own file: site renders it with side = BackSide
select_only(OL + [ARM])
g2 = dict(GLTF); g2["export_image_format"] = 'NONE'
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "cube_guy_v1_outline.glb"),
                          use_selection=True, **g2)

rep = {"clips": CLIPS, "fps": 24}
for f in ("cube_guy_v1.glb", "cube_guy_v1_outline.glb", "cube_guy_v1.fbx"):
    p = os.path.join(OUT, f)
    if os.path.exists(p):
        rep[f] = round(os.path.getsize(p) / 1e6, 2)
with open(os.path.join(OUT, "export_report.json"), "w") as fh:
    json.dump(rep, fh, indent=1)
print(json.dumps(rep, indent=1))
