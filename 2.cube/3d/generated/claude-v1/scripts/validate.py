"""Reopen the EXPORTED GLB (not the .blend) and prove it out."""
import bpy, os, sys, json, math
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
GLB = os.path.join(OUT, "cube_guy_v1.glb")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene

rep = {"file": os.path.basename(GLB), "size_mb": round(os.path.getsize(GLB) / 1e6, 2)}
# Blender's glTF importer adds a stray 'Icosphere' placeholder that is
# not present in the file itself - verified by parsing the GLB JSON.
meshes = [o for o in bpy.data.objects
          if o.type == 'MESH' and not o.name.startswith('Icosphere')]
arms = [o for o in bpy.data.objects if o.type == 'ARMATURE']
empties = [o for o in bpy.data.objects if o.type == 'EMPTY']

rep["meshes"] = len(meshes)
rep["armatures"] = len(arms)
rep["bones"] = len(arms[0].data.bones) if arms else 0
rep["empties"] = {o.name: [round(v, 4) for v in o.matrix_world.translation]
                  for o in sorted(empties, key=lambda e: e.name)}
rep["materials"] = sorted({m.name for o in meshes for m in o.data.materials if m})
rep["images"] = sorted({i.name: None for i in bpy.data.images if i.name != 'Render Result'})
rep["animations"] = sorted(a.name.split("_CG_Rig")[0] for a in bpy.data.actions)

tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
rep["triangles"] = tris

lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
for o in meshes:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        lo = Vector((min(lo[i], w[i]) for i in range(3)))
        hi = Vector((max(hi[i], w[i]) for i in range(3)))
size = hi - lo
rep["bbox_min"] = [round(v, 4) for v in lo]
rep["bbox_max"] = [round(v, 4) for v in hi]
rep["size_xyz_m"] = [round(v, 4) for v in size]
rep["tallest_axis"] = "XYZ"[max(range(3), key=lambda i: size[i])]
rep["standing_height_m"] = round(max(size), 4)

# skinning: every mesh must be bound and every vertex must carry weight
unskinned, unweighted = [], {}
for o in meshes:
    mods = [m for m in o.modifiers if m.type == 'ARMATURE' and m.object]
    if not mods:
        unskinned.append(o.name)
        continue
    bad = 0
    for v in o.data.vertices:
        if not v.groups or sum(g.weight for g in v.groups) < 1e-4:
            bad += 1
    if bad:
        unweighted[o.name] = bad
rep["meshes_without_armature"] = unskinned
rep["vertices_with_no_weight"] = unweighted

# animations: does each one actually move bones?
moved = {}
for a in bpy.data.actions:
    bones = {fc.data_path.split('"')[1] for fc in a.fcurves if '"' in fc.data_path}
    moved[a.name] = {"bones_driven": len(bones),
                     "frames": [round(a.frame_range[0]), round(a.frame_range[1])],
                     "channels": len(a.fcurves)}
rep["animation_detail"] = moved

# loop check on the clips that must cycle
loops = {}
for name in ("Idle", "Walk"):
    a = next((x for x in bpy.data.actions if x.name.split("_CG_Rig")[0] == name), None)
    if not a:
        continue
    worst = 0.0
    for fc in a.fcurves:
        f0, f1 = a.frame_range
        worst = max(worst, abs(fc.evaluate(f0) - fc.evaluate(f1)))
    loops[name] = round(worst, 5)
rep["loop_seam_max_delta"] = loops

print(json.dumps(rep, indent=1))
with open(os.path.join(OUT, "validation_report.json"), "w") as f:
    json.dump(rep, f, indent=1)
