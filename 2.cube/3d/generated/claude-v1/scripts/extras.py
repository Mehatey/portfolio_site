"""Wireframe, rig, posed frames and turntable. Usage: python3 extras.py <what>"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
RND = os.path.join(OUT, "renders")
what = sys.argv[1] if len(sys.argv) > 1 else "all"
bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "cubeguy_rigged.blend"))
sys.path.insert(0, HERE)
import render as R   # reuse world / lights / camera helpers

sc = bpy.context.scene
R.sc = sc
R.outdir = RND
os.makedirs(RND, exist_ok=True)
R.build_stage()

HERO = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith("_OL")]
OL = [o for o in bpy.data.objects if o.name.endswith("_OL")]
ARM = bpy.data.objects["CG_Rig"]


def flat_mat(name, rgba, emit=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    if emit:
        b = nt.nodes.new('ShaderNodeEmission')
        b.inputs['Color'].default_value = rgba
        nt.links.new(b.outputs['Emission'], o.inputs['Surface'])
    else:
        b = nt.nodes.new('ShaderNodeBsdfDiffuse')
        b.inputs['Color'].default_value = rgba
        nt.links.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m


def hide(objs, state=True):
    for o in objs:
        o.hide_render = state


def shoot(name, tag, **kw):
    R.tag = tag
    R.outdir = RND
    R.shoot(name, **kw)


# ------------------------------------------------------------- wireframe
if what in ("all", "wire"):
    hide(OL, True)
    pale = flat_mat("WF_Fill", (0.90, 0.89, 0.86, 1))
    ink = flat_mat("WF_Line", (0.05, 0.06, 0.08, 1), emit=True)
    for o in HERO:
        o.data.materials.clear(); o.data.materials.append(pale)
        w = o.copy(); w.data = o.data.copy()
        w.name = o.name + "_WF"
        sc.collection.objects.link(w)
        w.data.materials.clear(); w.data.materials.append(ink)
        md = w.modifiers.new("Wire", 'WIREFRAME')
        md.thickness = 0.0016
        md.use_replace = True
        md.use_boundary = True
    R.setup('CYCLES', 28, 760, 1000)
    shoot("07_wireframe", "v8", az_deg=22, elev=4)
    bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "cubeguy_rigged.blend"))
    R.sc = sc = bpy.context.scene
    R.build_stage()
    HERO = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith("_OL")]
    OL = [o for o in bpy.data.objects if o.name.endswith("_OL")]
    ARM = bpy.data.objects["CG_Rig"]

# ------------------------------------------------------------------- rig
if what in ("all", "rig"):
    hide(OL, True)
    ghost = bpy.data.materials.new("Ghost"); ghost.use_nodes = True
    nt = ghost.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial')
    mix = nt.nodes.new('ShaderNodeMixShader')
    tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    df = nt.nodes.new('ShaderNodeBsdfDiffuse')
    df.inputs['Color'].default_value = (0.82, 0.84, 0.88, 1)
    mix.inputs['Fac'].default_value = 0.80
    nt.links.new(df.outputs['BSDF'], mix.inputs[1])
    nt.links.new(tr.outputs['BSDF'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], o.inputs['Surface'])
    ghost.blend_method = 'BLEND'
    for ob in HERO:
        ob.data.materials.clear(); ob.data.materials.append(ghost)
        ob.visible_shadow = False

    bone_mat = flat_mat("BoneMat", (0.98, 0.42, 0.16, 1), emit=True)
    joint_mat = flat_mat("JointMat", (0.20, 0.72, 0.95, 1), emit=True)
    bm = bmesh.new()
    jm = bmesh.new()
    for b in ARM.data.bones:
        h, t = b.head_local, b.tail_local
        d = t - h
        L = d.length
        if L < 1e-5:
            continue
        basis = R.__dict__.get("noop")
        up = Vector((0, 0, 1))
        if abs(d.normalized().dot(up)) > 0.995:
            up = Vector((0, 1, 0))
        sx = up.cross(d).normalized()
        sy = d.normalized().cross(sx).normalized()
        r = max(0.006, min(0.016, L * 0.10))
        ring = [h + d * 0.18 + (sx * math.cos(a) + sy * math.sin(a)) * r
                for a in [i * math.pi / 2 for i in range(4)]]
        vs = [bm.verts.new(h)] + [bm.verts.new(p) for p in ring] + [bm.verts.new(t)]
        for i in range(4):
            j = (i + 1) % 4
            bm.faces.new((vs[0], vs[1 + j], vs[1 + i]))
            bm.faces.new((vs[5], vs[1 + i], vs[1 + j]))
        res = bmesh.ops.create_uvsphere(jm, u_segments=10, v_segments=6, radius=0.014)
        bmesh.ops.translate(jm, verts=res["verts"], vec=h)
    for name, mesh_bm, mat in (("RigBones", bm, bone_mat), ("RigJoints", jm, joint_mat)):
        me = bpy.data.meshes.new(name)
        mesh_bm.to_mesh(me); mesh_bm.free()
        ob = bpy.data.objects.new(name, me)
        sc.collection.objects.link(ob)
        me.materials.append(mat)
        ob.visible_shadow = False
    R.setup('CYCLES', 26, 760, 1000)
    shoot("08_rig", "v8", az_deg=26, elev=4)
    bpy.ops.wm.open_mainfile(filepath=os.path.join(OUT, "cubeguy_rigged.blend"))
    R.sc = sc = bpy.context.scene
    R.build_stage()
    ARM = bpy.data.objects["CG_Rig"]

# ----------------------------------------------------------------- poses
def use_clip(name, frame):
    ad = ARM.animation_data
    for t in ad.nla_tracks:
        t.mute = True
    act = next(a for a in bpy.data.actions if a.name == name)
    ad.action = act
    sc.frame_set(frame)


if what in ("all", "pose"):
    R.setup('CYCLES', 44, 760, 1000)
    for nm, clip, f, az in (("09_pose_wave", "Wave", 40, 20),
                            ("10_pose_thought", "ThoughtRelease", 44, 30),
                            ("11_pose_walk", "Walk", 13, 38),
                            ("12_pose_click", "ClickReact", 5, 12)):
        use_clip(clip, f)
        shoot(nm, "v8", az_deg=az, elev=3)

# ------------------------------------------------------------- turntable
if what in ("all", "turn"):
    use_clip("Idle", 1)
    R.setup('CYCLES', 16, 480, 640)
    N = 36
    tdir = os.path.join(RND, "turntable")
    os.makedirs(tdir, exist_ok=True)
    for i in range(N):
        sc.frame_set(1 + int(i * 96 / N))
        R.outdir = tdir
        R.tag = "t"
        R.shoot("%03d" % i, az_deg=i * 360.0 / N, elev=3)
