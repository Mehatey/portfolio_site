"""Review renders for Cube Guy. Usage: python3 render.py <blend> <outdir> [tag] [quick]"""
import bpy, math, os, sys, json
from mathutils import Vector, Euler

if __name__ == "__main__":
    blend, outdir = sys.argv[1], sys.argv[2]
    tag = sys.argv[3] if len(sys.argv) > 3 else "v1"
    quick = len(sys.argv) > 4 and sys.argv[4] == "quick"
    os.makedirs(outdir, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=blend)
else:
    outdir, tag = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               "..", "out", "renders"), "x"
sc = bpy.context.scene

BG = (0.735, 0.706, 0.655, 1.0)     # warm paper sweep


def world():
    w = bpy.data.worlds.new("CG_World")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.inputs['Color'].default_value = (0.62, 0.63, 0.66, 1)
    bg.inputs['Strength'].default_value = 1.05
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])


def backdrop():
    m = bpy.data.materials.new("Backdrop"); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs['Base Color'].default_value = BG
    b.inputs['Roughness'].default_value = 1.0
    bpy.ops.mesh.primitive_plane_add(size=16, location=(0, 0, -0.001))
    f = bpy.context.object; f.name = "CG_Floor"; f.data.materials.append(m)


def lights():
    specs = [("Key",  (-2.2, -3.0, 3.1), 260, (1.0, 0.97, 0.93), 3.0),
             ("Fill", (2.9, -2.4, 1.6),  170, (0.86, 0.91, 1.00), 3.4),
             ("Rim",  (1.4, 3.2, 2.6),   210, (0.90, 0.95, 1.00), 1.6),
             ("Kick", (-2.6, 2.4, 0.9),  110, (1.00, 0.84, 0.62), 1.8)]
    for n, loc, power, col, size in specs:
        d = bpy.data.lights.new(n, 'AREA')
        d.energy, d.color, d.size, d.shape = power, col, size, 'SQUARE'
        o = bpy.data.objects.new(n, d)
        o.location = loc
        bpy.context.collection.objects.link(o)
        dirv = Vector((0, 0, 1.15)) - Vector(loc)
        o.rotation_euler = dirv.to_track_quat('-Z', 'Y').to_euler()


def camera(az_deg, elev=0.0, dist=5.0, target=(0, 0, 0.90), lens=85, ortho=False):
    cam = bpy.data.cameras.new("Cam")
    cam.lens = lens
    if ortho:
        cam.type = 'ORTHO'; cam.ortho_scale = 2.05
    o = bpy.data.objects.new("Cam", cam)
    bpy.context.collection.objects.link(o)
    a, e = math.radians(az_deg), math.radians(elev)
    o.location = Vector(target) + Vector((math.sin(a) * math.cos(e) * dist,
                                          -math.cos(a) * math.cos(e) * dist,
                                          math.sin(e) * dist))
    o.rotation_euler = (Vector(target) - o.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = o
    return o


def setup(engine, samples, w, h):
    sc.render.engine = engine
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'PNG'
    if engine == 'CYCLES':
        sc.cycles.device = 'CPU'
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
        sc.cycles.max_bounces = 6
        sc.cycles.caustics_reflective = False
        sc.cycles.caustics_refractive = False
        sc.view_settings.view_transform = 'AgX'
        sc.view_settings.look = 'AgX - Base Contrast'


def shoot(name, **kw):
    for o in [o for o in bpy.data.objects if o.type == 'CAMERA']:
        bpy.data.objects.remove(o, do_unlink=True)
    camera(**kw)
    sc.render.filepath = os.path.join(outdir, f"{tag}_{name}.png")
    bpy.ops.render.render(write_still=True)
    print("rendered", name, flush=True)


def build_stage():
    world(); backdrop(); lights()


if __name__ != "__main__":
    pass
elif True:
    build_stage()
    if quick:
        setup('CYCLES', 24, 470, 700)
        shoot("quick_front", az_deg=0)
    else:
        setup('CYCLES', int(os.environ.get("CG_SAMPLES", 64)), 760, 1000)
        for nm, az, el in [("01_front", 0, 0), ("02_threequarter_front", 34, 4),
                           ("03_side", 90, 0), ("04_threequarter_back", 146, 4),
                           ("05_back", 180, 0), ("06_head_detail", 18, 12)]:
            if nm == "06_head_detail":
                shoot(nm, az_deg=az, elev=el, dist=1.55, target=(0, 0, 1.545), lens=95)
            else:
                shoot(nm, az_deg=az, elev=el)
