"""Two short sequences for the interactive page.
  look  - head sweeps full left to full right; cursor X scrubs it
  poke  - startle reaction, plays once on click
"""
import bpy, math, os, sys
from mathutils import Vector, Euler
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
WHICH = os.environ.get("CG_SEQ", "look")
OUT = os.path.normpath(os.path.join(HERE, "..", "out", "ix", WHICH))
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, "..", "out", "cubeguy_base.blend"))
from cel_lib import cel_material

sc = bpy.context.scene; sc.render.fps = 24
LIGHT = Vector((-0.36, -0.84, 0.40)).normalized()
ARM = bpy.data.objects["CG_Rig"]
HERO = [o for o in bpy.data.objects if o.type == 'MESH' and not o.name.endswith("_OL")]
for o in [o for o in bpy.data.objects if o.name.endswith("_OL")]:
    bpy.data.objects.remove(o, do_unlink=True)
for pb in ARM.pose.bones:
    pb.rotation_mode = 'XYZ'

BASE = {"Hips": (2, 0, 4), "Spine": (1, 0, -2), "Chest": (-2, 0, -2),
        "Neck": (1, 0, 1), "Head": (-2, 0, 2),
        "Clavicle_L": (0, 0, 5), "UpperArm_L": (8, 0, -4), "Forearm_L": (0, 0, 15),
        "Hand_L": (0, 0, 8), "Clavicle_R": (0, 0, -4), "UpperArm_R": (-8, 0, 5),
        "Forearm_R": (0, 0, -22), "Hand_R": (0, 0, -11),
        "Thigh_L": (-5, 0, 2), "Shin_L": (3, 0, 0), "Foot_L": (2, 0, 0),
        "Thigh_R": (8, 0, -4), "Shin_R": (-14, 0, 0), "Foot_R": (8, 0, 3)}
B = lambda b, dx=0, dy=0, dz=0: (BASE[b][0]+dx, BASE[b][1]+dy, BASE[b][2]+dz)


def setpose(d):
    for b, r in BASE.items():
        ARM.pose.bones[b].rotation_euler = Euler([math.radians(v) for v in r], 'XYZ')
    for b, r in d.items():
        ARM.pose.bones[b].rotation_euler = Euler([math.radians(v) for v in r], 'XYZ')


def eyes(sx=0.0, sz=1.0):
    for b in ("Eye_L", "Eye_R"):
        pb = ARM.pose.bones[b]
        pb.location = Vector((sx, 0, 0))
        pb.scale = Vector((1, 1, sz))


for ob in HERO:
    for i, sl in enumerate(ob.data.materials):
        if sl:
            ob.data.materials[i] = cel_material(sl, LIGHT)
sc.world = bpy.data.worlds.new("W")
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = 12; sc.cycles.max_bounces = 0
sc.cycles.transparent_max_bounces = 12
sc.cycles.use_denoising = False
sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.resolution_x = 760; sc.render.resolution_y = 900
sc.view_settings.view_transform = 'Standard'

cam = bpy.data.cameras.new("Cam"); cam.lens = 92
cam.sensor_fit = 'VERTICAL'; cam.sensor_height = 36.0
co = bpy.data.objects.new("Cam", cam); sc.collection.objects.link(co)
sc.camera = co
tgt = Vector((0, 0, 0.98))
co.location = tgt + Vector((0.0, -5.6, 0.10))
co.rotation_euler = (tgt - co.location).to_track_quat('-Z', 'Y').to_euler()


def shoot(i):
    bpy.context.view_layer.update()
    sc.render.filepath = os.path.join(OUT, "f_%03d.png" % i)
    bpy.ops.render.render(write_still=True)


if WHICH == "look":
    N = 25
    for i in range(N):
        t = i / (N - 1)
        u = t * 2 - 1                       # -1 (his right) .. +1
        setpose({
            "Head":  (-2 + 3*abs(u), -30*u, 2 + 9*u),
            "Neck":  (1 + 1.5*abs(u), -11*u, 1 + 3*u),
            "Chest": (-2, -6*u, -2 + 2*u),
            "Spine": (1, -2.5*u, -2),
            "Hips":  (2, -1.5*u, 4),
            "Clavicle_L": (0, 0, 5 - 2*u), "Clavicle_R": (0, 0, -4 - 2*u),
        })
        eyes(sx=0.013*u, sz=1.0)
        shoot(i)
        print("look", i, flush=True)
else:
    # startle: snap back, squash, eyes wide, recover with a settle
    KEYS = [
        (0.00, dict(head=(-2, 0, 2), sq=(1, 1, 1), eye=1.0, hips=0.0)),
        (0.08, dict(head=(2, 0, 0), sq=(1.02, 0.98, 1.02), eye=1.0, hips=-0.004)),
        (0.18, dict(head=(-16, 4, -6), sq=(1.16, 0.86, 1.14), eye=1.34, hips=0.016)),
        (0.30, dict(head=(-12, 3, -4), sq=(0.93, 1.10, 0.94), eye=1.26, hips=0.006)),
        (0.44, dict(head=(-5, -2, 4), sq=(1.05, 0.97, 1.04), eye=1.12, hips=-0.002)),
        (0.60, dict(head=(-1, -4, 5), sq=(0.99, 1.02, 0.99), eye=1.04, hips=0.001)),
        (0.78, dict(head=(-3, -2, 3), sq=(1.01, 0.99, 1.01), eye=1.0, hips=0.0)),
        (1.00, dict(head=(-2, 0, 2), sq=(1, 1, 1), eye=1.0, hips=0.0)),
    ]

    def lerp(a, b, t):
        return a + (b - a) * t

    def sample(t):
        for k in range(len(KEYS) - 1):
            t0, d0 = KEYS[k]; t1, d1 = KEYS[k + 1]
            if t0 <= t <= t1:
                f = 0 if t1 == t0 else (t - t0) / (t1 - t0)
                f = f * f * (3 - 2 * f)          # smoothstep between keys
                return {
                    "head": tuple(lerp(d0["head"][i], d1["head"][i], f) for i in range(3)),
                    "sq": tuple(lerp(d0["sq"][i], d1["sq"][i], f) for i in range(3)),
                    "eye": lerp(d0["eye"], d1["eye"], f),
                    "hips": lerp(d0["hips"], d1["hips"], f)}
        return KEYS[-1][1]

    N = 34
    for i in range(N):
        d = sample(i / (N - 1))
        setpose({"Head": d["head"],
                 "Neck": (1 + d["head"][0] * 0.35, d["head"][1] * 0.4, 1),
                 "Chest": (-2 + d["head"][0] * 0.22, 0, -2),
                 "UpperArm_L": (8 + d["head"][0] * 0.5, 0, -4 - d["head"][0] * 0.3),
                 "UpperArm_R": (-8 + d["head"][0] * 0.5, 0, 5 + d["head"][0] * 0.3)})
        ARM.pose.bones["Head"].scale = Vector(d["sq"])
        ARM.pose.bones["Hips"].location = Vector((0, d["hips"], 0))
        eyes(sx=0.0, sz=d["eye"])
        shoot(i)
        print("poke", i, flush=True)
print("IXDONE", WHICH, N)
