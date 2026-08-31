import bpy
import math
import os
from mathutils import Vector


ROOT = "/Users/siddharthmehta/Desktop/al-folio/2.cube/3d/generated/cube-head-handmade-v3"
BLEND = os.path.join(ROOT, "cube-head-handmade-v3.blend")
VIDEO = os.path.join(ROOT, "cube-head-handmade-v3-10s.mp4")
ATLAS = os.path.join(ROOT, "assets", "watercolor-atlas.png")
FRAMES = os.path.join(ROOT, "frames")
os.makedirs(ROOT, exist_ok=True)
os.makedirs(FRAMES, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.materials, bpy.data.curves, bpy.data.meshes, bpy.data.cameras, bpy.data.lights):
        pass


def set_input(node, names, value):
    for name in names:
        if name in node.inputs:
            node.inputs[name].default_value = value
            return


def look_at(obj, target=(0, 0, 0)):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def make_principled(name, color, roughness=0.45, metallic=0.0, transmission=0.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    set_input(bsdf, ["Base Color"], color)
    set_input(bsdf, ["Roughness"], roughness)
    set_input(bsdf, ["Metallic"], metallic)
    set_input(bsdf, ["Transmission Weight", "Transmission"], transmission)
    if emission:
        set_input(bsdf, ["Emission Color", "Emission"], emission)
        set_input(bsdf, ["Emission Strength"], emission_strength)
    return mat


def watercolor_material(name, pigment, accent, start, end, direction="X", transmission=0.08):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 4.2
    noise.inputs["Detail"].default_value = 7.0
    noise.inputs["Roughness"].default_value = 0.72
    noise.inputs["Distortion"].default_value = 0.28
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 28.0
    fine.inputs["Detail"].default_value = 3.0
    fine.inputs["Roughness"].default_value = 0.82

    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    mix_coord = nt.nodes.new("ShaderNodeMath")
    mix_coord.operation = "MULTIPLY_ADD"
    mix_coord.inputs[1].default_value = 0.76
    mix_coord.inputs[2].default_value = 0.02
    add_noise = nt.nodes.new("ShaderNodeMath")
    add_noise.operation = "ADD"
    noise_scale = nt.nodes.new("ShaderNodeMath")
    noise_scale.operation = "MULTIPLY"
    noise_scale.inputs[1].default_value = 0.22
    progress = nt.nodes.new("ShaderNodeValue")
    progress.name = "PaintProgress"
    progress.outputs[0].default_value = -0.28
    progress.outputs[0].keyframe_insert("default_value", frame=start)
    progress.outputs[0].default_value = 1.32
    progress.outputs[0].keyframe_insert("default_value", frame=end)
    reveal = nt.nodes.new("ShaderNodeMath")
    reveal.operation = "LESS_THAN"

    grain = nt.nodes.new("ShaderNodeValToRGB")
    grain.color_ramp.elements[0].position = 0.18
    grain.color_ramp.elements[0].color = (0.12, 0.16, 0.20, 1)
    grain.color_ramp.elements[1].position = 0.82
    grain.color_ramp.elements[1].color = (0.96, 1.0, 1.0, 1)
    grain.color_ramp.elements.new(0.48).color = accent

    pigment_mix = nt.nodes.new("ShaderNodeMixRGB")
    pigment_mix.blend_type = "MULTIPLY"
    pigment_mix.inputs[0].default_value = 0.74
    pigment_mix.inputs[1].default_value = pigment
    base_mix = nt.nodes.new("ShaderNodeMixRGB")
    base_mix.blend_type = "MIX"
    base_mix.inputs[1].default_value = (0.72, 0.75, 0.72, 1)

    mask_grain = nt.nodes.new("ShaderNodeMath")
    mask_grain.operation = "MULTIPLY"
    mask_grain.inputs[1].default_value = 1.0

    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.22
    bump.inputs["Distance"].default_value = 0.08

    nt.links.new(tex.outputs["Generated"], mapping.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], noise.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], fine.inputs["Vector"])
    nt.links.new(mapping.outputs["Vector"], sep.inputs["Vector"])
    axis = {"X": 0, "Y": 1, "Z": 2}[direction]
    nt.links.new(sep.outputs[axis], mix_coord.inputs[0])
    nt.links.new(noise.outputs["Fac"], noise_scale.inputs[0])
    nt.links.new(mix_coord.outputs[0], add_noise.inputs[0])
    nt.links.new(noise_scale.outputs[0], add_noise.inputs[1])
    nt.links.new(add_noise.outputs[0], reveal.inputs[0])
    nt.links.new(progress.outputs[0], reveal.inputs[1])
    nt.links.new(noise.outputs["Fac"], grain.inputs[0])
    nt.links.new(grain.outputs["Color"], pigment_mix.inputs[2])
    nt.links.new(reveal.outputs[0], mask_grain.inputs[0])
    nt.links.new(mask_grain.outputs[0], base_mix.inputs[0])
    nt.links.new(pigment_mix.outputs[0], base_mix.inputs[2])
    nt.links.new(base_mix.outputs[0], bsdf.inputs["Base Color"])
    nt.links.new(fine.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    nt.links.new(bsdf.outputs[0], out.inputs[0])

    set_input(bsdf, ["Roughness"], 0.38)
    set_input(bsdf, ["Metallic"], 0.03)
    set_input(bsdf, ["Transmission Weight", "Transmission"], transmission)
    set_input(bsdf, ["Coat Weight", "Clearcoat"], 0.26)
    set_input(bsdf, ["Coat Roughness", "Clearcoat Roughness"], 0.19)
    set_input(bsdf, ["Emission Color", "Emission"], tuple(min(1.0, c * 0.24) for c in pigment[:3]) + (1,))
    set_input(bsdf, ["Emission Strength"], 0.12)

    return mat


def atlas_paint_material(name, region, start, end, direction="X"):
    """Real watercolor atlas, paper base, ragged animated pigment reveal."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex = nt.nodes.new("ShaderNodeTexCoord")
    image = bpy.data.images.load(ATLAS, check_existing=True)

    def atlas_image(index):
        col = index % 3
        row = index // 3
        scale = nt.nodes.new("ShaderNodeVectorMath")
        scale.operation = "MULTIPLY"
        scale.inputs[1].default_value = (1.0 / 3.0, 1.0 / 2.0, 1.0)
        offset = nt.nodes.new("ShaderNodeVectorMath")
        offset.operation = "ADD"
        offset.inputs[1].default_value = (col / 3.0, 0.5 if row == 0 else 0.0, 0.0)
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = image
        node.interpolation = "Linear"
        node.extension = "CLIP"
        nt.links.new(tex.outputs["UV"], scale.inputs[0])
        nt.links.new(scale.outputs[0], offset.inputs[0])
        nt.links.new(offset.outputs[0], node.inputs["Vector"])
        return node

    paper_tex = atlas_image(0)
    pigment_tex = atlas_image(region)
    generated = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(generated.outputs["Generated"], sep.inputs["Vector"])

    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3.1
    noise.inputs["Detail"].default_value = 8.0
    noise.inputs["Roughness"].default_value = 0.82
    nt.links.new(generated.outputs["Generated"], noise.inputs["Vector"])
    noise_scale = nt.nodes.new("ShaderNodeMath")
    noise_scale.operation = "MULTIPLY"
    noise_scale.inputs[1].default_value = 0.27
    nt.links.new(noise.outputs["Fac"], noise_scale.inputs[0])
    edge = nt.nodes.new("ShaderNodeMath")
    edge.operation = "ADD"
    axis = {"X": 0, "Y": 1, "Z": 2}[direction]
    nt.links.new(sep.outputs[axis], edge.inputs[0])
    nt.links.new(noise_scale.outputs[0], edge.inputs[1])
    progress = nt.nodes.new("ShaderNodeValue")
    progress.name = "PaintProgress"
    progress.outputs[0].default_value = -0.24
    progress.outputs[0].keyframe_insert("default_value", frame=start)
    progress.outputs[0].default_value = 1.30
    progress.outputs[0].keyframe_insert("default_value", frame=end)
    reveal = nt.nodes.new("ShaderNodeMath")
    reveal.operation = "LESS_THAN"
    nt.links.new(edge.outputs[0], reveal.inputs[0])
    nt.links.new(progress.outputs[0], reveal.inputs[1])

    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.blend_type = "MIX"
    nt.links.new(reveal.outputs[0], mix.inputs[0])
    nt.links.new(paper_tex.outputs["Color"], mix.inputs[1])
    nt.links.new(pigment_tex.outputs["Color"], mix.inputs[2])
    nt.links.new(mix.outputs[0], bsdf.inputs["Base Color"])

    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 42.0
    fine.inputs["Detail"].default_value = 4.0
    fine.inputs["Roughness"].default_value = 0.88
    nt.links.new(generated.outputs["Generated"], fine.inputs["Vector"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.16
    bump.inputs["Distance"].default_value = 0.045
    nt.links.new(fine.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    set_input(bsdf, ["Roughness"], 0.68)
    set_input(bsdf, ["Metallic"], 0.0)
    set_input(bsdf, ["Coat Weight", "Clearcoat"], 0.035)
    return mat


def add_beveled_cube(name, scale, location, material, bevel=0.08, parent=None):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bev = obj.modifiers.new("Soft hand-built edge", "BEVEL")
    bev.width = bevel
    bev.segments = 6
    obj.data.materials.append(material)
    if parent:
        obj.parent = parent
    return obj


def add_face_panel(name, scale, location, rotation, material, parent):
    panel = add_beveled_cube(name, scale, location, material, bevel=0.018, parent=parent)
    panel.rotation_euler = rotation
    return panel


def add_capsule(name, location, scale, material, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    obj.parent = parent
    return obj


def add_sketch_edge(name, start, end, material, parent, seed, pass_index):
    """Slightly inaccurate multi-pass graphite construction line."""
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 1
    curve.bevel_depth = 0.007 if pass_index == 0 else 0.0035
    curve.bevel_resolution = 1
    spline = curve.splines.new("POLY")
    count = 13
    spline.points.add(count - 1)
    a = Vector(start)
    b = Vector(end)
    direction = (b - a).normalized()
    helper = Vector((0, 0, 1)) if abs(direction.z) < 0.8 else Vector((1, 0, 0))
    p1 = direction.cross(helper).normalized()
    p2 = direction.cross(p1).normalized()
    for i in range(count):
        u = i / (count - 1)
        overshoot = (u - 0.5) * 1.018 + 0.5
        point = a.lerp(b, overshoot)
        wobble = 0.013 + pass_index * 0.006
        point += p1 * math.sin(seed * 1.91 + i * 1.63) * wobble
        point += p2 * math.sin(seed * 2.47 + i * 2.11) * wobble * 0.7
        spline.points[i].co = (*point, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    obj.parent = parent
    return obj


clear_scene()
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1080
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.quality = 90
scene.render.film_transparent = False
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 240
scene.render.filepath = os.path.join(FRAMES, "frame_")

scene.world.color = (0.52, 0.47, 0.39)
scene.view_settings.look = "AgX - Medium Low Contrast"

controller = bpy.data.objects.new("CubeHead_Controller", None)
bpy.context.collection.objects.link(controller)

paper = atlas_paint_material("Warm ivory handmade paper", 0, 1, 2, "X")
black = make_principled("Soft graphite face", (0.008, 0.007, 0.006, 1), roughness=0.86, metallic=0.0)

core = add_beveled_cube("Handmade paper cube", (2.22, 2.22, 2.30), (0, 0, 0), paper, bevel=0.045, parent=controller)

mats = [
    atlas_paint_material("Cobalt bloom", 1, 28, 76, "Z"),
    atlas_paint_material("Smoky indigo bloom", 4, 74, 126, "X"),
    atlas_paint_material("Dusty teal bloom", 2, 112, 168, "Z"),
    atlas_paint_material("Muted ultramarine bloom", 3, 154, 207, "X"),
    atlas_paint_material("Pale blue grey bloom", 5, 186, 232, "X"),
]

d = 2.235
t = 0.026
add_face_panel("Ivory face panel", (2.13, t, 2.21), (0, -d, 0), (0, 0, 0), paper, controller)
add_face_panel("Right cobalt wash", (t, 2.13, 2.21), (d, 0, 0), (0, 0, 0), mats[0], controller)
add_face_panel("Back indigo wash", (2.13, t, 2.21), (0, d, 0), (0, 0, 0), mats[1], controller)
add_face_panel("Left turquoise wash", (t, 2.13, 2.21), (-d, 0, 0), (0, 0, 0), mats[2], controller)
add_face_panel("Top ultramarine wash", (2.13, 2.13, t), (0, 0, 2.315), (0, 0, 0), mats[3], controller)
add_face_panel("Bottom cyan wash", (2.13, 2.13, t), (0, 0, -2.315), (0, 0, 0), mats[4], controller)

# Uneven graphite edge passes, intentionally imperfect like the reference drawing.
edge_mat = make_principled("Graphite construction lines", (0.018, 0.016, 0.014, 1), roughness=0.94)
edge_x = 2.255
edge_y = 2.255
edge_z = 2.335
edges = []
for x in (-edge_x, edge_x):
    for y in (-edge_y, edge_y):
        edges.append(((x, y, -edge_z), (x, y, edge_z)))
for x in (-edge_x, edge_x):
    for z in (-edge_z, edge_z):
        edges.append(((x, -edge_y, z), (x, edge_y, z)))
for y in (-edge_y, edge_y):
    for z in (-edge_z, edge_z):
        edges.append(((-edge_x, y, z), (edge_x, y, z)))
for edge_index, (start, end) in enumerate(edges):
    for pass_index in range(2):
        add_sketch_edge(
            f"Graphite edge {edge_index:02d} pass {pass_index}",
            start,
            end,
            edge_mat,
            controller,
            edge_index * 3 + pass_index,
            pass_index,
        )

left_eye = add_capsule("Left eye", (-0.62, -2.29, 0.34), (0.13, 0.055, 0.46), black, controller)
right_eye = add_capsule("Right eye", (0.62, -2.29, 0.34), (0.13, 0.055, 0.46), black, controller)
mouth = add_capsule("Mouth", (0, -2.29, -0.62), (0.23, 0.055, 0.055), black, controller)

for eye in (left_eye, right_eye):
    for frame, z_scale in ((1, 1.0), (18, 1.0), (20, 0.07), (23, 1.0), (132, 1.0), (134, 0.07), (137, 1.0), (226, 1.0), (228, 0.07), (231, 1.0), (240, 1.0)):
        eye.scale = (1.0, 1.0, z_scale)
        eye.keyframe_insert("scale", frame=frame)

for frame, x_scale in ((1, 1.0), (34, 0.72), (84, 0.82), (138, 1.0), (184, 0.72), (220, 0.84), (240, 1.0)):
    mouth.scale = (x_scale, 1.0, 1.0)
    mouth.keyframe_insert("scale", frame=frame)

rotations = {
    1: (-4, -5, 0),
    20: (-5, -4, 0),
    34: (-3, -3, 7),
    62: (3, -7, -82),
    72: (2, -8, -96),
    84: (4, -6, -90),
    104: (-2, -3, -90),
    126: (-4, 5, 8),
    138: (-5, 4, 0),
    154: (-4, 2, -8),
    174: (3, 7, 82),
    184: (2, 8, 96),
    196: (4, 6, 90),
    208: (-12, 0, 55),
    220: (-6, -2, -8),
    232: (-4, -4, 3),
    240: (-4, -5, 0),
}
for frame, degrees in rotations.items():
    controller.rotation_euler = tuple(math.radians(v) for v in degrees)
    controller.keyframe_insert("rotation_euler", frame=frame)
scale_keys = {
    1: (0.80, 0.80, 0.80),
    20: (0.81, 0.81, 0.79),
    34: (0.78, 0.80, 0.83),
    62: (0.76, 0.84, 0.82),
    72: (0.83, 0.77, 0.82),
    84: (0.80, 0.80, 0.80),
    126: (0.82, 0.78, 0.80),
    138: (0.80, 0.80, 0.80),
    174: (0.76, 0.84, 0.82),
    184: (0.83, 0.77, 0.82),
    196: (0.80, 0.80, 0.80),
    208: (0.78, 0.80, 0.84),
    220: (0.83, 0.79, 0.78),
    232: (0.79, 0.81, 0.81),
    240: (0.80, 0.80, 0.80),
}
for frame, value in scale_keys.items():
    controller.scale = value
    controller.keyframe_insert("scale", frame=frame)

for frame, z in ((1, 0.0), (20, 0.05), (34, -0.04), (72, 0.08), (104, 0.02), (138, 0.0), (184, 0.08), (208, 0.13), (220, -0.04), (240, 0.0)):
    controller.location = (0, 0, z)
    controller.keyframe_insert("location", frame=frame)

# Camera
bpy.ops.object.camera_add(location=(0, -12.7, 0.40))
camera = bpy.context.object
camera.data.lens = 62
look_at(camera, (0, 0, -0.05))
scene.camera = camera

# Studio lights
def area(name, location, energy, color, size):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.color = color
    light.data.shape = "DISK"
    light.data.size = size
    look_at(light, (0, 0, 0))
    return light

area("Window key", (-4.8, -6.0, 6.5), 1050, (1.0, 0.88, 0.72), 5.5)
area("Paper fill", (5.5, -2.0, 3.0), 560, (0.72, 0.82, 1.0), 4.5)
area("Soft top", (0, 0, 7.5), 420, (1.0, 0.95, 0.86), 5.5)

# Quiet paper backdrop and floor. Negative space stays dominant.
back_mat = paper
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 3.4, 0), rotation=(math.radians(90), 0, 0))
back = bpy.context.object
back.data.materials.append(back_mat)
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -1.94))
floor = bpy.context.object
floor.data.materials.append(back_mat)

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
preview_frame = os.environ.get("PREVIEW_FRAME")
if preview_frame:
    frame = int(preview_frame)
    scene.frame_set(frame)
    scene.render.filepath = os.path.join(ROOT, f"preview-{frame:04d}.jpg")
    bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = os.path.join(FRAMES, "frame_")
    bpy.ops.render.render(animation=True)
