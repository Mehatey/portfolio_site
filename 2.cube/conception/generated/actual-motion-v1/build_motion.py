import bpy
import math
import os
from mathutils import Vector


OUT = "/Users/siddharthmehta/Desktop/al-folio/2.cube/conception/generated/actual-motion-v1"
FRAMES = os.path.join(OUT, "frames")
os.makedirs(FRAMES, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def watercolor(name, light, dark):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.96
    broad = nodes.new("ShaderNodeTexNoise")
    broad.inputs["Scale"].default_value = 4.8
    broad.inputs["Detail"].default_value = 4.0
    broad.inputs["Roughness"].default_value = 0.82
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*dark, 1)
    ramp.color_ramp.elements[1].color = (*light, 1)
    fibre = nodes.new("ShaderNodeTexNoise")
    fibre.inputs["Scale"].default_value = 135
    fibre.inputs["Detail"].default_value = 2.0
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.24
    bump.inputs["Distance"].default_value = 0.035
    links.new(broad.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(fibre.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def cube(name, size, material, bevel=0.035):
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("worn paper edge", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    obj.data.materials.append(material)
    return obj


def segment(name, radius, material, vertices=8):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=1, depth=2)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    bevel = obj.modifiers.new("soft joint edge", "BEVEL")
    bevel.width = 0.045
    bevel.segments = 2
    obj["radius"] = radius
    return obj


def key_obj(obj, frame):
    obj.keyframe_insert(data_path="location", frame=frame)
    obj.keyframe_insert(data_path="rotation_euler", frame=frame)
    obj.keyframe_insert(data_path="scale", frame=frame)


def place_segment(obj, start, end, frame, radius=None):
    start, end = Vector(start), Vector(end)
    delta = end - start
    obj.location = (start + end) * 0.5
    obj.rotation_euler = delta.to_track_quat("Z", "Y").to_euler()
    r = radius if radius is not None else obj.get("radius", 0.08)
    obj.scale = (r, r, max(delta.length * 0.5, 0.001))
    key_obj(obj, frame)


def set_interp(obj, mode="BEZIER"):
    if not obj.animation_data or not obj.animation_data.action:
        return
    for curve in getattr(obj.animation_data.action, "fcurves", []):
        for point in curve.keyframe_points:
            point.interpolation = mode


def look_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


clear_scene()
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 96
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = os.path.join(FRAMES, "frame_")
scene.world.color = (0.84, 0.82, 0.77)
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.88, 0.86, 0.81, 1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.72

paper = watercolor("warm fibre paper", (0.91, 0.88, 0.80), (0.67, 0.64, 0.58))
skin = watercolor("graphite skin", (0.63, 0.60, 0.55), (0.27, 0.27, 0.27))
shirt = watercolor("charcoal shirt", (0.11, 0.12, 0.12), (0.018, 0.021, 0.024))
indigo = watercolor("indigo cloth", (0.10, 0.18, 0.29), (0.025, 0.050, 0.095))
shoe_mat = watercolor("worn shoes", (0.20, 0.19, 0.17), (0.035, 0.035, 0.033))
ink = watercolor("ink", (0.035, 0.040, 0.042), (0.005, 0.006, 0.007))
rust = watercolor("rust wash", (0.47, 0.19, 0.10), (0.20, 0.055, 0.025))
teal = watercolor("muted teal", (0.10, 0.26, 0.28), (0.025, 0.09, 0.11))
red = watercolor("vermilion thread", (0.58, 0.045, 0.032), (0.24, 0.006, 0.004))

# Sparse paper world and impossible stair.
bpy.ops.mesh.primitive_plane_add(size=30, location=(1.0, 2.0, 2.0), rotation=(math.pi / 2, 0, 0))
backdrop = bpy.context.object
backdrop.data.materials.append(paper)
bpy.ops.mesh.primitive_plane_add(size=30, location=(1.0, 0, -0.08))
floor = bpy.context.object
floor.data.materials.append(paper)

steps = []
for i in range(6):
    step = cube(f"drawn stair {i}", (0.56, 0.82, 0.20), paper, 0.018)
    step.location = (-0.55 + i * 0.47, 0.04, i * 0.22)
    step.rotation_euler.z = 0.015 * (-1 if i % 2 else 1)
    steps.append(step)

# One architectural destination, severe and quiet.
for name, location, size, mat in [
    ("portal left", (2.42, 0.38, 1.52), (0.28, 0.75, 2.85), paper),
    ("portal right", (3.66, 0.38, 1.52), (0.28, 0.75, 2.85), paper),
    ("portal top", (3.04, 0.38, 2.82), (1.50, 0.75, 0.28), paper),
    ("portal dark", (3.04, 0.53, 1.43), (0.96, 0.16, 2.05), ink),
    ("rust plane", (2.53, 0.26, 1.63), (0.10, 0.035, 1.12), rust),
    ("teal plane", (2.70, 0.20, 0.53), (0.48, 0.035, 0.46), teal),
]:
    obj = cube(name, size, mat, 0.012)
    obj.location = location

# Articulated cut-paper body. Each limb segment receives authored transforms.
objects = {
    "torso": cube("torso", (0.32, 0.52, 0.57), shirt, 0.045),
    "head": cube("only cube head", (0.43, 0.43, 0.43), paper, 0.025),
    "neck": segment("neck", 0.07, skin),
    "upper_arm_l": segment("upper arm left", 0.072, skin),
    "lower_arm_l": segment("lower arm left", 0.062, skin),
    "upper_arm_r": segment("upper arm right", 0.072, skin),
    "lower_arm_r": segment("lower arm right", 0.062, skin),
    "upper_leg_l": segment("upper leg left", 0.12, indigo),
    "lower_leg_l": segment("lower leg left", 0.105, indigo),
    "upper_leg_r": segment("upper leg right", 0.12, indigo),
    "lower_leg_r": segment("lower leg right", 0.105, indigo),
    "hand_l": cube("hand left", (0.12, 0.055, 0.16), skin, 0.035),
    "hand_r": cube("hand right", (0.12, 0.055, 0.16), skin, 0.035),
    "foot_l": cube("foot left", (0.31, 0.22, 0.15), shoe_mat, 0.055),
    "foot_r": cube("foot right", (0.31, 0.22, 0.15), shoe_mat, 0.055),
}

for side, offset in (("l", -0.105), ("r", 0.105)):
    eye = cube(f"eye {side}", (0.055, 0.025, 0.13), ink, 0.018)
    objects[f"eye_{side}"] = eye
mouth = cube("mouth", (0.085, 0.022, 0.022), ink, 0.008)
objects["mouth"] = mouth

# Frame, pelvis, planted ankles, elbows, wrists. The repeated foot coordinates
# create actual holds while the hips pass over each planted step.
poses = [
    (1,  (-0.42, 0, 0.93), (-0.48, -0.13, 0.08), (-0.80, 0.13, 0.06), (-0.52, -0.13, 0.48), (-0.60, 0.13, 0.50), (-0.22, -0.27, 1.10), (-0.52, -0.28, 0.88), (-0.63, 0.27, 1.10), (-0.27, 0.27, 0.86)),
    (13, (-0.30, 0, 0.82), (-0.48, -0.13, 0.08), (-0.62, 0.13, 0.24), (-0.52, -0.13, 0.38), (-0.43, 0.13, 0.50), (-0.16, -0.27, 0.96), (-0.42, -0.28, 0.74), (-0.50, 0.27, 0.98), (-0.20, 0.27, 0.75)),
    (25, (0.00, 0, 1.02), (-0.48, -0.13, 0.08), (0.02, 0.13, 0.28), (-0.36, -0.13, 0.50), (-0.10, 0.13, 0.61), (0.16, -0.27, 1.20), (-0.14, -0.28, 0.92), (-0.14, 0.27, 1.23), (0.18, 0.27, 0.98)),
    (37, (0.33, 0, 1.20), (0.18, -0.13, 0.47), (0.02, 0.13, 0.28), (0.12, -0.13, 0.76), (0.13, 0.13, 0.71), (0.48, -0.27, 1.42), (0.22, -0.28, 1.15), (0.19, 0.27, 1.43), (0.48, 0.27, 1.22)),
    (49, (0.62, 0, 1.40), (0.49, -0.13, 0.51), (0.02, 0.13, 0.28), (0.40, -0.13, 0.92), (0.33, 0.13, 0.82), (0.74, -0.27, 1.63), (0.48, -0.28, 1.39), (0.49, 0.27, 1.65), (0.82, 0.27, 1.46)),
    (61, (0.91, 0, 1.57), (0.49, -0.13, 0.51), (0.94, 0.13, 0.72), (0.68, -0.13, 1.04), (0.76, 0.13, 1.12), (1.15, -0.27, 1.87), (1.48, -0.28, 2.05), (1.12, 0.27, 1.86), (1.43, 0.27, 2.01)),
    (73, (1.20, 0, 1.70), (0.96, -0.13, 0.72), (0.94, 0.13, 0.72), (0.99, -0.13, 1.21), (1.03, 0.13, 1.18), (1.50, -0.27, 2.00), (1.83, -0.25, 2.15), (1.48, 0.27, 1.97), (1.80, 0.24, 2.11)),
    (85, (1.42, 0, 1.77), (0.96, -0.13, 0.72), (1.42, 0.13, 0.94), (1.18, -0.13, 1.28), (1.23, 0.13, 1.35), (1.72, -0.27, 2.05), (1.98, -0.20, 2.20), (1.70, 0.27, 2.02), (1.98, 0.20, 2.17)),
    (96, (1.52, 0, 1.76), (1.43, -0.13, 0.94), (0.96, 0.13, 0.72), (1.38, -0.13, 1.32), (1.21, 0.13, 1.28), (1.70, -0.27, 2.00), (1.90, -0.19, 2.10), (1.68, 0.27, 1.98), (1.90, 0.19, 2.08)),
]

square = cube("earned paper side", (0.34, 0.035, 0.34), paper, 0.015)
square.rotation_euler = (0.08, 0.0, 0.18)

thread_a = segment("thread from wrist", 0.009, red, 6)
thread_b = segment("thread to square", 0.009, red, 6)

for frame, pelvis, ankle_l, ankle_r, knee_l, knee_r, elbow_l, wrist_l, elbow_r, wrist_r in poses:
    pelvis = Vector(pelvis)
    shoulder_l = pelvis + Vector((0.01, -0.24, 0.43))
    shoulder_r = pelvis + Vector((0.01, 0.24, 0.43))
    hip_l = pelvis + Vector((0, -0.13, -0.03))
    hip_r = pelvis + Vector((0, 0.13, -0.03))
    neck_base = pelvis + Vector((0, 0, 0.63))
    head_center = pelvis + Vector((-0.035 if frame in (13, 37, 61) else 0.02, 0, 0.94))

    objects["torso"].location = pelvis + Vector((0, 0, 0.34))
    objects["torso"].rotation_euler = (0, -0.10 if frame < 61 else -0.22, 0)
    key_obj(objects["torso"], frame)
    objects["head"].location = head_center
    objects["head"].rotation_euler = (0.02, -0.08 if frame < 61 else -0.18, -0.025)
    key_obj(objects["head"], frame)
    place_segment(objects["neck"], neck_base, head_center - Vector((0, 0, 0.22)), frame)

    place_segment(objects["upper_arm_l"], shoulder_l, elbow_l, frame)
    place_segment(objects["lower_arm_l"], elbow_l, wrist_l, frame)
    place_segment(objects["upper_arm_r"], shoulder_r, elbow_r, frame)
    place_segment(objects["lower_arm_r"], elbow_r, wrist_r, frame)
    place_segment(objects["upper_leg_l"], hip_l, knee_l, frame, 0.12)
    place_segment(objects["lower_leg_l"], knee_l, ankle_l, frame, 0.105)
    place_segment(objects["upper_leg_r"], hip_r, knee_r, frame, 0.12)
    place_segment(objects["lower_leg_r"], knee_r, ankle_r, frame, 0.105)

    for key_name, position in (("hand_l", wrist_l), ("hand_r", wrist_r)):
        objects[key_name].location = position
        objects[key_name].rotation_euler = (0.06, -0.25, 0.18)
        key_obj(objects[key_name], frame)
    for key_name, position in (("foot_l", ankle_l), ("foot_r", ankle_r)):
        objects[key_name].location = Vector(position) + Vector((0.10, 0, 0.01))
        objects[key_name].rotation_euler = (0, -0.05, 0)
        key_obj(objects[key_name], frame)

    # Face stays attached to the only cube head.
    for side, xoff in (("l", -0.105), ("r", 0.105)):
        objects[f"eye_{side}"].location = head_center + Vector((xoff, -0.222, 0.035))
        objects[f"eye_{side}"].rotation_euler = (0, 0, 0)
        key_obj(objects[f"eye_{side}"], frame)
    objects["mouth"].location = head_center + Vector((0, -0.224, -0.095))
    key_obj(objects["mouth"], frame)

    if frame < 61:
        square.scale = (0.001, 0.001, 0.001)
        square.location = (2.30, -0.05, 2.35)
    else:
        amount = (frame - 61) / 35
        square.scale = (1, 1, 1)
        square.location = Vector((2.30, -0.05, 2.35)).lerp(Vector((1.98, -0.05, 2.13)), amount)
    key_obj(square, frame)

    thread_mid = Vector(wrist_l).lerp(square.location, 0.5) + Vector((0.0, -0.04, -0.18))
    place_segment(thread_a, wrist_l, thread_mid, frame)
    place_segment(thread_b, thread_mid, square.location, frame)
    visible = 0.001 if frame < 61 else 1.0
    thread_a.scale.x *= visible
    thread_a.scale.y *= visible
    thread_b.scale.x *= visible
    thread_b.scale.y *= visible
    thread_a.keyframe_insert(data_path="scale", frame=frame)
    thread_b.keyframe_insert(data_path="scale", frame=frame)

for obj in objects.values():
    set_interp(obj, "BEZIER")
set_interp(square, "BEZIER")
set_interp(thread_a, "BEZIER")
set_interp(thread_b, "BEZIER")

# Camera tracks the performance, then moves closer for the catch.
bpy.ops.object.camera_add()
camera = bpy.context.object
scene.camera = camera
camera.data.lens = 58
for frame, location, target, lens in [
    (1, (0.55, -7.2, 2.40), (0.55, 0, 1.30), 52),
    (49, (0.95, -7.0, 2.62), (0.90, 0, 1.58), 52),
    (73, (1.25, -6.8, 2.82), (1.36, 0, 1.78), 55),
    (96, (1.55, -6.2, 2.92), (1.72, 0, 1.92), 58),
]:
    camera.location = location
    camera.data.lens = lens
    look_at(camera, target)
    camera.keyframe_insert(data_path="location", frame=frame)
    camera.keyframe_insert(data_path="rotation_euler", frame=frame)
    camera.data.keyframe_insert(data_path="lens", frame=frame)

# Tactile light, graphite silhouette, no glossy CG highlights.
for kind, location, energy, size, color in [
    ("AREA", (-3.0, -3.0, 5.0), 780, 4.5, (1.0, 0.82, 0.63)),
    ("AREA", (4.0, -2.0, 3.5), 510, 3.0, (0.42, 0.58, 0.78)),
    ("AREA", (1.0, 2.0, 5.0), 420, 5.0, (1.0, 0.55, 0.36)),
]:
    bpy.ops.object.light_add(type=kind, location=location)
    light = bpy.context.object
    light.data.energy = energy
    light.data.size = size
    light.data.color = color
    look_at(light, (1.0, 0, 1.3))

scene.render.use_freestyle = True
line_style = scene.view_layers[0].freestyle_settings.linesets[0].linestyle
line_style.color = (0.025, 0.032, 0.036)
line_style.thickness = 2.2
scene.view_settings.look = "AgX - Medium High Contrast"
scene.view_settings.exposure = -0.2

test_frame = os.environ.get("TEST_FRAME")
if test_frame:
    scene.frame_set(int(test_frame))
    scene.render.filepath = os.path.join(OUT, f"test-{int(test_frame):04d}.png")
    bpy.ops.render.render(write_still=True)
else:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "cube-guy-actual-motion-v1.blend"))
    bpy.ops.render.render(animation=True)
