"""Idle -> hover wave -> settle. 5s @ 24fps, flat pass with alpha.
Timing is hand-authored: anticipation, shoulder-leads-elbow overlap,
follow-through on the way down, and the head easing out of the turn late.
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "out", "seq"))
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "..", "out", "cubeguy_base.blend"))
sc = bpy.context.scene
sc.render.fps = 24
FPS = 24
END = 120                                   # 5.0 s
ARM = bpy.data.objects["CG_Rig"]
LIGHT = Vector((-0.34, -0.86, 0.38)).normalized()
HERO = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith("_OL")]
for o in [o for o in bpy.data.objects if o.name.endswith("_OL")]:
    bpy.data.objects.remove(o, do_unlink=True)

for pb in ARM.pose.bones:
    pb.rotation_mode = 'XYZ'
act = bpy.data.actions.new("IdleToWave")
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


# ---- base standing attitude, held through the whole shot ---------------
BASE = {
    "Hips": (2, 0, 7), "Spine": (1, 0, -4), "Chest": (-2, 4, -4),
    "Neck": (1, -5, 2), "Head": (-3, -11, 9),
    "Clavicle_L": (0, 0, 5), "UpperArm_L": (8, 0, -4), "Forearm_L": (0, 0, 15),
    "Hand_L": (0, 0, 8),
    "Clavicle_R": (0, 0, -3), "UpperArm_R": (-10, 0, 5), "Forearm_R": (0, 0, -26),
    "Hand_R": (0, 0, -13),
    "Thigh_L": (-6, 0, 2), "Shin_L": (4, 0, 0), "Foot_L": (2, 0, 0),
    "Thigh_R": (10, 0, -5), "Shin_R": (-17, 0, 0), "Foot_R": (10, 0, 3),
}
for b, r in BASE.items():
    for f in (1, END):
        K(b, f, rot=r)

B = lambda b, dx=0, dy=0, dz=0: (BASE[b][0] + dx, BASE[b][1] + dy, BASE[b][2] + dz)

# ---- breathing: chest scale + tiny hip rise, 2 slow cycles -------------
T("Chest", [(1, (1, 1, 1)), (26, (1.014, 1.020, 1.014)), (52, (1, 1, 1)),
            (78, (1.012, 1.017, 1.012)), (104, (1, 1, 1)), (END, (1, 1, 1))], "scl")
T("Hips", [(1, (0, 0, 0)), (26, (0, 0.008, 0)), (52, (0, 0, 0)),
           (78, (0, 0.006, 0)), (104, (0, 0, 0)), (END, (0, 0, 0))], "loc")
T("Chest", [(1, B("Chest")), (26, B("Chest", dx=-1.6)), (52, B("Chest")),
            (78, B("Chest", dx=-1.2)), (104, B("Chest"))])

# ---- head life before the wave, then the turn -------------------------
T("Head", [(1, B("Head")), (20, B("Head", dx=-1.4, dy=2.6, dz=-1.6)),
           (38, B("Head", dx=0.6, dy=-1.2)),
           (44, B("Head", dx=1.6, dy=-2.0, dz=1.0)),          # dip: anticipation
           (56, B("Head", dy=14, dz=-6)),                     # turns toward you
           (66, B("Head", dy=19, dz=-8)),                     # overshoot
           (74, B("Head", dy=16, dz=-6)),                     # settle
           (92, B("Head", dy=15, dz=-6)),
           (108, B("Head", dy=3, dz=1)),                      # eases back late
           (END, B("Head"))])
T("Neck", [(1, B("Neck")), (44, B("Neck", dx=1.0)), (58, B("Neck", dy=7)),
           (70, B("Neck", dy=9)), (92, B("Neck", dy=8)), (110, B("Neck", dy=2)),
           (END, B("Neck"))])

# ---- the wave: shoulder leads, elbow trails, hand trails further ------
T("Clavicle_R", [(1, B("Clavicle_R")), (42, B("Clavicle_R", dz=2)),
                 (52, B("Clavicle_R", dz=-13)), (60, B("Clavicle_R", dz=-16)),
                 (96, B("Clavicle_R", dz=-15)), (112, B("Clavicle_R")),
                 (END, B("Clavicle_R"))])
T("UpperArm_R", [(1, B("UpperArm_R")),
                 (44, B("UpperArm_R", dz=6)),                 # anticipation dip
                 (56, B("UpperArm_R", dx=-4, dz=-52)),
                 (64, B("UpperArm_R", dx=-6, dz=-64)),        # overshoot up
                 (72, B("UpperArm_R", dx=-5, dz=-58)),
                 (96, B("UpperArm_R", dx=-5, dz=-57)),
                 (106, B("UpperArm_R", dz=-14)),
                 (116, B("UpperArm_R", dz=4)),                # follow-through
                 (END, B("UpperArm_R"))])
T("Forearm_R", [(1, B("Forearm_R")), (46, B("Forearm_R", dz=8)),
                (60, B("Forearm_R", dz=-38)), (70, B("Forearm_R", dz=-52)),
                (78, B("Forearm_R", dz=-46)), (96, B("Forearm_R", dz=-47)),
                (110, B("Forearm_R", dz=-10)), (118, B("Forearm_R", dz=5)),
                (END, B("Forearm_R"))])
# the wave itself - three passes, decaying, offset from the arm settling
T("Hand_R", [(1, B("Hand_R")), (62, B("Hand_R", dz=4)),
             (70, B("Hand_R", dz=-26)), (78, B("Hand_R", dz=22)),
             (86, B("Hand_R", dz=-21)), (94, B("Hand_R", dz=15)),
             (102, B("Hand_R", dz=-8)), (112, B("Hand_R", dz=2)),
             (END, B("Hand_R"))])
# body answers the arm instead of ignoring it
T("Spine", [(1, B("Spine")), (44, B("Spine", dz=1)), (62, B("Spine", dz=-4)),
            (96, B("Spine", dz=-3)), (114, B("Spine")), (END, B("Spine"))])
T("Hips", [(1, B("Hips")), (44, B("Hips", dz=1.5)), (64, B("Hips", dz=-2.5)),
           (96, B("Hips", dz=-2)), (114, B("Hips")), (END, B("Hips"))])
T("Clavicle_L", [(1, B("Clavicle_L")), (60, B("Clavicle_L", dz=-3)),
                 (96, B("Clavicle_L", dz=-2)), (END, B("Clavicle_L"))])
T("UpperArm_L", [(1, B("UpperArm_L")), (60, B("UpperArm_L", dx=3, dz=3)),
                 (96, B("UpperArm_L", dx=2, dz=2)), (END, B("UpperArm_L"))])

# ---- blinks + a small eye widen as he registers you -------------------
for f in (30, 100):
    for b in ("Eye_L", "Eye_R"):
        K(b, f - 3, scl=(1, 1, 1)); K(b, f, scl=(1, 1, 0.08)); K(b, f + 4, scl=(1, 1, 1))
for b in ("Eye_L", "Eye_R"):
    K(b, 48, scl=(1, 1, 1)); K(b, 58, scl=(1.10, 1, 1.16))
    K(b, 84, scl=(1.05, 1, 1.08)); K(b, 96, scl=(1, 1, 1))

for fc in act.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'BEZIER'
        kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'


# ------------------------------------------------------------ cel look --
def cel(src):
    m = bpy.data.materials.new(src.name + "_A"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    img = None
    for n in src.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and 'basecolor' in n.image.name:
            img = n.image
    o = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(em.outputs['Emission'], o.inputs['Surface'])
    tex = nt.nodes.new('ShaderNodeTexImage'); tex.image = img; tex.interpolation = 'Smart'
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    dot = nt.nodes.new('ShaderNodeVectorMath'); dot.operation = 'DOT_PRODUCT'
    dot.inputs[1].default_value = tuple(LIGHT)
    nt.links.new(geo.outputs['Normal'], dot.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    ramp.color_ramp.elements[1].position = 0.30
    ramp.color_ramp.elements[1].color = (0.5, 0.5, 0.5, 1)
    ramp.color_ramp.elements.new(0.62).color = (1, 1, 1, 1)
    nt.links.new(dot.outputs['Value'], ramp.inputs['Fac'])
    dk = nt.nodes.new('ShaderNodeMix'); dk.data_type = 'RGBA'; dk.blend_type = 'MULTIPLY'
    dk.inputs['Factor'].default_value = 1.0
    nt.links.new(tex.outputs['Color'], dk.inputs[6])
    dk.inputs[7].default_value = (0.46, 0.50, 0.68, 1.0)
    md = nt.nodes.new('ShaderNodeMix'); md.data_type = 'RGBA'; md.blend_type = 'MULTIPLY'
    md.inputs['Factor'].default_value = 1.0
    nt.links.new(tex.outputs['Color'], md.inputs[6])
    md.inputs[7].default_value = (0.80, 0.82, 0.90, 1.0)
    b1 = nt.nodes.new('ShaderNodeMix'); b1.data_type = 'RGBA'
    nt.links.new(ramp.outputs['Color'], b1.inputs['Factor'])
    nt.links.new(dk.outputs[2], b1.inputs[6]); nt.links.new(md.outputs[2], b1.inputs[7])
    st = nt.nodes.new('ShaderNodeMath'); st.operation = 'GREATER_THAN'
    st.inputs[1].default_value = 0.62
    nt.links.new(dot.outputs['Value'], st.inputs[0])
    b2 = nt.nodes.new('ShaderNodeMix'); b2.data_type = 'RGBA'
    nt.links.new(st.outputs['Value'], b2.inputs['Factor'])
    nt.links.new(b1.outputs[2], b2.inputs[6]); nt.links.new(tex.outputs['Color'], b2.inputs[7])
    nt.links.new(b2.outputs[2], em.inputs['Color'])
    return m


for ob in HERO:
    for i, sl in enumerate(ob.data.materials):
        if sl:
            ob.data.materials[i] = cel(sl)

w = bpy.data.worlds.new("W"); sc.world = w
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = int(os.environ.get("CG_SAMPLES", 12))
sc.cycles.max_bounces = 0
sc.cycles.use_denoising = False
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.resolution_x = int(os.environ.get("CG_W", 720))
sc.render.resolution_y = int(os.environ.get("CG_H", 980))
sc.view_settings.view_transform = 'Standard'

cam = bpy.data.cameras.new("Cam"); cam.lens = 92
cam.sensor_fit = 'VERTICAL'; cam.sensor_height = 36.0
co = bpy.data.objects.new("Cam", cam); sc.collection.objects.link(co)
tgt = Vector((0, 0, 0.98)); a, e = math.radians(16), math.radians(3)
co.location = tgt + Vector((math.sin(a) * math.cos(e) * 6.0,
                            -math.cos(a) * math.cos(e) * 6.0, math.sin(e) * 6.0))
co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()
sc.camera = co

start = int(os.environ.get("CG_START", 1))
stop = int(os.environ.get("CG_STOP", END))
for f in range(start, stop + 1):
    sc.frame_set(f)
    sc.render.filepath = os.path.join(OUT, "f_%04d.png" % f)
    bpy.ops.render.render(write_still=True)
    if f % 10 == 0:
        print("frame", f, flush=True)
print("SEQDONE")
