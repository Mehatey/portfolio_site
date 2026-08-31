import bpy
import math
import os
from mathutils import Vector

ROOT = "/Users/siddharthmehta/Desktop/al-folio"
OUT = os.path.join(ROOT, "2.cube/3d/generated/cube-guy-film-v2")
MODEL = os.path.join(ROOT, "2.cube/3d/generated/claude-v1/cube_guy_v1.glb")

ART = [
    "/Users/siddharthmehta/Downloads/illustrations/illu/1.JPG",
    "/Users/siddharthmehta/Downloads/illustrations/illu/21.1.png",
    "/Users/siddharthmehta/Downloads/illustrations/illu/12.2.png",
    "/Users/siddharthmehta/Downloads/illustrations/illu/31.1.png",
]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def key(obj, prop, frame, value=None):
    if value is not None:
        setattr(obj, prop, value)
    obj.keyframe_insert(data_path=prop, frame=frame)


def set_interp(obj, mode="BEZIER"):
    if not obj.animation_data or not obj.animation_data.action:
        return
    for fc in getattr(obj.animation_data.action, "fcurves", []):
        for kp in fc.keyframe_points:
            kp.interpolation = mode


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def camera_pose(camera, frame, location, target, lens=52, interpolation="BEZIER"):
    camera.location = location
    camera.data.lens = lens
    look_at(camera, target)
    camera.keyframe_insert(data_path="location", frame=frame)
    camera.keyframe_insert(data_path="rotation_euler", frame=frame)
    camera.data.keyframe_insert(data_path="lens", frame=frame)
    set_interp(camera, interpolation)


def watercolor_material(name, base, dark=None, texture=None, emission=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*base, 1)
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.93
    bsdf.inputs["Metallic"].default_value = 0
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 4.2
    noise.inputs["Detail"].default_value = 3.5
    noise.inputs["Roughness"].default_value = 0.78
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    dark = dark or tuple(max(0, c * 0.65) for c in base)
    ramp.color_ramp.elements[0].color = (*dark, 1)
    ramp.color_ramp.elements[1].color = (*base, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    color_source = ramp.outputs["Color"]
    if texture and os.path.exists(texture):
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(texture, check_existing=True)
        mix = nt.nodes.new("ShaderNodeMixRGB")
        mix.blend_type = "MULTIPLY"
        mix.inputs[0].default_value = 0.72
        nt.links.new(color_source, mix.inputs[1])
        nt.links.new(tex.outputs["Color"], mix.inputs[2])
        color_source = mix.outputs["Color"]
    nt.links.new(color_source, bsdf.inputs["Base Color"])
    fiber = nt.nodes.new("ShaderNodeTexNoise")
    fiber.inputs["Scale"].default_value = 115
    fiber.inputs["Detail"].default_value = 2.2
    fiber.inputs["Roughness"].default_value = 0.82
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.22
    bump.inputs["Distance"].default_value = 0.035
    nt.links.new(fiber.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    if emission:
        nt.links.new(color_source, bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = emission
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def image_material(name, path):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Roughness"].default_value = 0.96
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(path, check_existing=True)
    nt.links.new(img.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def make_panel(name, path, location, size=(0.7, 0.5)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=location, rotation=(math.pi / 2, 0, 0))
    panel = bpy.context.object
    panel.name = name
    panel.scale = (size[0], size[1], 1)
    panel.data.materials.append(image_material(name + "_mat", path))
    solid = panel.modifiers.new("paper thickness", "SOLIDIFY")
    solid.thickness = 0.009
    bevel = panel.modifiers.new("soft paper edge", "BEVEL")
    bevel.width = 0.008
    bevel.segments = 2
    return panel


def add_paper_square():
    bpy.ops.mesh.primitive_plane_add(size=0.62, location=(-0.65, 0, 2.7), rotation=(math.pi / 2, 0, 0))
    sq = bpy.context.object
    sq.name = "FlatSquare"
    sq.data.materials.append(watercolor_material("flat paper", (0.79, 0.74, 0.65)))
    bevel = sq.modifiers.new("imperfect edge", "BEVEL")
    bevel.width = 0.018
    bevel.segments = 2
    solid = sq.modifiers.new("paper", "SOLIDIFY")
    solid.thickness = 0.018
    # eyes and mouth remain separate so the face can anticipate and blink.
    ink = watercolor_material("ink", (0.025, 0.028, 0.032))
    for x in (-0.12, 0.12):
        bpy.ops.mesh.primitive_cube_add(location=(x - 0.65, -0.018, 2.74), scale=(0.026, 0.014, 0.095))
        bpy.context.object.data.materials.append(ink)
        world_matrix = bpy.context.object.matrix_world.copy()
        bpy.context.object.parent = sq
        bpy.context.object.matrix_world = world_matrix
    bpy.ops.mesh.primitive_cube_add(location=(-0.65, -0.018, 2.56), scale=(0.06, 0.012, 0.012))
    bpy.context.object.data.materials.append(ink)
    world_matrix = bpy.context.object.matrix_world.copy()
    bpy.context.object.parent = sq
    bpy.context.object.matrix_world = world_matrix
    key(sq, "location", 1, Vector((-0.8, 0, 3.4)))
    key(sq, "rotation_euler", 1, Vector((math.pi / 2, 0, -0.22)))
    key(sq, "location", 42, Vector((-0.2, 0, 1.15)))
    key(sq, "rotation_euler", 42, Vector((math.pi / 2, 0, 0.14)))
    key(sq, "location", 58, Vector((0.0, 0, 1.46)))
    key(sq, "rotation_euler", 58, Vector((math.pi / 2, 0, -0.04)))
    key(sq, "scale", 66, Vector((1, 1, 1)))
    key(sq, "scale", 74, Vector((0.01, 0.01, 0.01)))
    set_interp(sq, "BEZIER")
    return sq


clear_scene()
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 720
scene.render.image_settings.file_format = "PNG"
os.makedirs(os.path.join(OUT, "frames"), exist_ok=True)
scene.render.filepath = os.path.join(OUT, "frames", "frame_")
scene.render.film_transparent = False
scene.world.color = (0.78, 0.75, 0.69)

# Soft paper world.
world = scene.world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.82, 0.79, 0.73, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.8

bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 1.8, 1.8), rotation=(math.pi / 2, 0, 0))
backdrop = bpy.context.object
backdrop.data.materials.append(watercolor_material("warm paper world", (0.86, 0.83, 0.77), (0.73, 0.77, 0.78)))

bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
floor = bpy.context.object
floor.data.materials.append(watercolor_material("paper floor", (0.66, 0.69, 0.68), (0.51, 0.56, 0.58)))

# Character and its authored clips.
bpy.ops.import_scene.gltf(filepath=MODEL)
for name in ["Camera", "Light", "Cube", "Icosphere"]:
    obj = bpy.data.objects.get(name)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)

rig = bpy.data.objects["CG_Rig"]
root = bpy.data.objects.new("CharacterRoot", None)
scene.collection.objects.link(root)
for obj in list(scene.objects):
    if obj == root or obj in {backdrop, floor}:
        continue
    if obj.name.startswith("CG_") or obj.name in {"HeadFX", "ThoughtOrigin", "LeftHandFX", "RightHandFX", "ChestFX"}:
        if obj.parent is None:
            obj.parent = root

root.scale = (0.001, 0.001, 0.001)
key(root, "scale", 68)
root.scale = (1, 1, 1)
key(root, "scale", 88)
root.location = Vector((0, 0, 0))

paper_skin = watercolor_material("paper skin", (0.76, 0.70, 0.62), (0.52, 0.47, 0.42))
shirt = watercolor_material("ink shirt", (0.022, 0.026, 0.034), (0.004, 0.006, 0.01))
pants = watercolor_material("indigo trousers", (0.055, 0.11, 0.24), (0.012, 0.025, 0.075))
shoes = watercolor_material("charcoal shoes", (0.035, 0.04, 0.055), (0.008, 0.01, 0.018))
head_mat = watercolor_material("cube paper", (0.74, 0.69, 0.60), (0.49, 0.45, 0.40))
for obj_name, mat in {
    "CG_Body": paper_skin,
    "CG_Shirt": shirt,
    "CG_Trousers": pants,
    "CG_Shoes": shoes,
    "CG_Head": head_mat,
}.items():
    obj = bpy.data.objects.get(obj_name)
    if obj and obj.type == "MESH":
        obj.data.materials.clear()
        obj.data.materials.append(mat)

# Head starts nearly two-dimensional, then gains depth in authored stages.
for obj_name in ["CG_Head", "CG_Eye_L", "CG_Eye_R", "CG_Mouth"]:
    obj = bpy.data.objects.get(obj_name)
    if not obj:
        continue
    for frame, depth in [(72, 0.08), (178, 0.28), (276, 0.52), (374, 0.74), (472, 0.9), (568, 1.0)]:
        obj.scale.y = depth
        obj.keyframe_insert(data_path="scale", frame=frame)
    set_interp(obj, "BEZIER")

# Character animation is stepped on twos, while the camera remains fluid.
for action in bpy.data.actions:
    for fc in getattr(action, "fcurves", []):
        try:
            step = fc.modifiers.new("STEPPED")
            step.frame_step = 2
        except Exception:
            pass

rig.animation_data_create()
rig.animation_data.action = None
track = rig.animation_data.nla_tracks.new()
track.name = "Thirty second performance"
segments = [
    ("Walk", 72, 168),
    ("Look", 168, 252),
    ("Wave", 252, 344),
    ("Look", 344, 432),
    ("ThoughtRelease", 432, 492),
    ("Wave", 492, 610),
    ("ClickReact", 610, 654),
    ("Idle", 654, 721),
]
for action_name, start, end in segments:
    action = bpy.data.actions.get(action_name)
    if not action:
        continue
    strip = track.strips.new(action_name, start, action)
    strip.action_frame_start = action.frame_range[0]
    strip.action_frame_end = action.frame_range[1]
    strip.frame_end = end
    strip.extrapolation = "NOTHING"
    strip.blend_type = "REPLACE"

# Memory panels enter as thin paper, never as extra cubes.
panel_specs = [
    ("childhood", ART[0], 146, (-1.65, -0.15, 1.75), (0.0, -0.2, 1.55)),
    ("making", ART[1], 238, (1.7, -0.1, 1.6), (0.15, -0.15, 1.5)),
    ("time", ART[2], 334, (-1.7, -0.05, 1.85), (-0.05, -0.15, 1.55)),
    ("language", ART[3], 430, (1.65, -0.1, 1.75), (0.0, -0.15, 1.55)),
]
for name, path, start, origin, destination in panel_specs:
    panel = make_panel(name, path, origin)
    panel.scale = (0.001, 0.001, 0.001)
    key(panel, "scale", start)
    panel.scale = (0.72, 0.52, 1)
    key(panel, "scale", start + 18)
    panel.location = Vector(origin)
    key(panel, "location", start + 18)
    panel.rotation_euler.z = -0.18 if origin[0] < 0 else 0.18
    key(panel, "rotation_euler", start + 18)
    panel.location = Vector(destination)
    panel.rotation_euler.z = 0
    key(panel, "location", start + 55)
    key(panel, "rotation_euler", start + 55)
    panel.scale = (0.16, 0.16, 0.16)
    key(panel, "scale", start + 56)
    panel.hide_render = False
    panel.keyframe_insert(data_path="hide_render", frame=start + 57)
    panel.hide_render = True
    panel.keyframe_insert(data_path="hide_render", frame=start + 58)
    set_interp(panel, "BEZIER")

# A single brush performs the self-authorship beat. It is physically attached
# to the right hand, not floated as an independent prop.
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.018, depth=0.46, location=(0.75, -0.16, 1.55))
brush = bpy.context.object
brush.data.materials.append(watercolor_material("brush wood", (0.34, 0.17, 0.09)))
bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.055, radius2=0.012, depth=0.18, location=(0.75, -0.16, 1.98))
tip = bpy.context.object
tip.data.materials.append(watercolor_material("wet indigo", (0.08, 0.18, 0.42), emission=0.08))
tip.parent = brush
tip.location = (0, 0, 0.31)
tip.rotation_euler = (0, 0, 0)
brush.rotation_euler = (0.08, 0.2, -0.5)
brush.parent = rig
brush.parent_type = "BONE"
brush.parent_bone = "Hand_R"
brush.location = (0.0, 0.16, 0.0)
brush.rotation_euler = (math.pi / 2, 0.08, -0.2)
brush.scale = (0.001, 0.001, 0.001)
key(brush, "scale", 492)
brush.scale = (1, 1, 1)
key(brush, "scale", 510)
key(brush, "rotation_euler", 510)
brush.rotation_euler = (math.pi / 2, -0.22, 0.08)
key(brush, "rotation_euler", 548)
brush.rotation_euler = (math.pi / 2, 0.18, -0.3)
key(brush, "rotation_euler", 578)
brush.scale = (0.001, 0.001, 0.001)
key(brush, "scale", 610)
set_interp(brush, "BEZIER")

# Watercolor marks are authored strokes on his only head. Their reveal is the
# narrative action: identity is painted in, not decorated around him.
def add_face_stroke(name, points, material, start, end, thickness):
    curve_data = bpy.data.curves.new(name + "_curve", "CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = 2
    curve_data.bevel_depth = thickness
    curve_data.bevel_resolution = 3
    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for bp, point in zip(spline.bezier_points, points):
        bp.co = point
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    stroke = bpy.data.objects.new(name, curve_data)
    scene.collection.objects.link(stroke)
    stroke.data.materials.append(material)
    curve_data.bevel_factor_end = 0
    curve_data.keyframe_insert(data_path="bevel_factor_end", frame=start)
    curve_data.bevel_factor_end = 1
    curve_data.keyframe_insert(data_path="bevel_factor_end", frame=end)
    return stroke


# Pigment enters the cube itself. The face stays readable while its paper
# material blooms from neutral fibre into indigo and vermilion watercolor.
head_ramp = next((node for node in head_mat.node_tree.nodes if node.type == "VALTORGB"), None)
if head_ramp:
    head_ramp.color_ramp.elements[0].color = (0.49, 0.45, 0.40, 1)
    head_ramp.color_ramp.elements[1].color = (0.74, 0.69, 0.60, 1)
    head_ramp.color_ramp.elements[0].keyframe_insert(data_path="color", frame=510)
    head_ramp.color_ramp.elements[1].keyframe_insert(data_path="color", frame=510)
    head_ramp.color_ramp.elements[0].color = (0.025, 0.075, 0.25, 1)
    head_ramp.color_ramp.elements[1].color = (0.67, 0.10, 0.20, 1)
    head_ramp.color_ramp.elements[0].keyframe_insert(data_path="color", frame=594)
    head_ramp.color_ramp.elements[1].keyframe_insert(data_path="color", frame=594)

# Navy cap arrives late, after the character has earned it.
cap_mat = watercolor_material("navy cap", (0.08, 0.20, 0.36), (0.025, 0.06, 0.13))
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=12, location=(0, 0, 1.78), scale=(0.25, 0.22, 0.12))
cap = bpy.context.object
cap.data.materials.append(cap_mat)
bpy.ops.mesh.primitive_cube_add(location=(0, -0.18, 1.72), scale=(0.18, 0.16, 0.018))
brim = bpy.context.object
brim.data.materials.append(cap_mat)
brim_world = brim.matrix_world.copy()
brim.parent = cap
brim.matrix_world = brim_world
# Small sun patch. One personal prop, no decorative symbol cloud.
bpy.ops.mesh.primitive_circle_add(vertices=32, radius=0.052, fill_type="NGON", location=(0, -0.237, 1.795), rotation=(math.pi / 2, 0, 0))
sun_patch = bpy.context.object
sun_patch.data.materials.append(watercolor_material("sun patch", (0.92, 0.34, 0.07), (0.54, 0.12, 0.025), emission=0.03))
patch_world = sun_patch.matrix_world.copy()
sun_patch.parent = cap
sun_patch.matrix_world = patch_world
cap_world = cap.matrix_world.copy()
cap.parent = rig
cap.parent_type = "BONE"
cap.parent_bone = "Head"
cap.matrix_world = cap_world
cap.scale = (0.001, 0.001, 0.001)
key(cap, "scale", 382)
cap.scale = (1, 1, 1)
key(cap, "scale", 406)

# Camera: eight shots, with fast authored transitions rather than one showroom orbit.
bpy.ops.object.camera_add()
camera = bpy.context.object
scene.camera = camera
camera.data.dof.use_dof = True
camera.data.dof.focus_object = rig
camera.data.dof.aperture_fstop = 5.6
camera_pose(camera, 1, (-0.9, -7.2, 2.2), (-0.6, 0, 2.3), 68)
camera_pose(camera, 64, (0.2, -5.5, 1.75), (0, 0, 1.5), 58)
camera_pose(camera, 78, (-2.1, -6.4, 1.55), (0, 0, 1.0), 54, "LINEAR")
camera_pose(camera, 160, (2.2, -6.1, 1.65), (0, 0, 1.35), 55)
camera_pose(camera, 252, (-2.6, -4.6, 1.7), (0, 0, 1.5), 62)
camera_pose(camera, 344, (0.8, -3.4, 1.76), (0, 0, 1.58), 74)
camera_pose(camera, 432, (-1.1, -3.2, 1.7), (0, 0, 1.55), 78)
camera_pose(camera, 528, (1.9, -4.3, 1.55), (0, 0, 1.45), 60)
camera_pose(camera, 624, (-2.0, -5.0, 1.45), (0, 0, 1.35), 54)
camera_pose(camera, 720, (1.15, -3.8, 1.72), (0, 0, 1.55), 72)

# Lighting favors tactile paper and readable silhouettes.
bpy.ops.object.light_add(type="AREA", location=(-3.2, -3.0, 5.0))
key_light = bpy.context.object
key_light.data.energy = 900
key_light.data.shape = "DISK"
key_light.data.size = 4.0
look_at(key_light, (0, 0, 1.2))
bpy.ops.object.light_add(type="AREA", location=(3.5, -1.0, 3.2))
rim = bpy.context.object
rim.data.energy = 650
rim.data.color = (0.35, 0.52, 0.85)
rim.data.size = 3.0
look_at(rim, (0, 0, 1.4))
bpy.ops.object.light_add(type="AREA", location=(0, 2.0, 4.5))
fill = bpy.context.object
fill.data.energy = 500
fill.data.color = (1.0, 0.62, 0.38)
fill.data.size = 5.0
look_at(fill, (0, 0, 1.0))

scene.render.use_freestyle = True
view_layer = scene.view_layers[0]
freestyle = view_layer.freestyle_settings
line_style = freestyle.linesets[0].linestyle
line_style.color = (0.035, 0.045, 0.06)
line_style.thickness = 3.0

add_paper_square()

# Gentle exposure and contrast. No bloom, chromatic aberration, or AI-style fog.
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = 0.1

test_frame = os.environ.get("TEST_FRAME")
if test_frame:
    scene.frame_set(int(test_frame))
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = os.path.join(OUT, f"test-{int(test_frame):04d}.png")
    bpy.ops.render.render(write_still=True)
else:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "cube-guy-animatic-v1.blend"))
    bpy.ops.render.render(animation=True)
