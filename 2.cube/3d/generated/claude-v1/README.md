# Cube Guy — v1 (claude-v1)

A rebuilt, rigged, animated Cube Guy for the portfolio site. Everything here is
generated procedurally from scripts in `scripts/` — rerun them and you get this
asset back, byte for byte.

**Status:** first approved-pending milestone. Character asset + rig only.
The homepage has not been touched.

---

## 1. What shipped

| File                           | Size    | Notes                                                              |
| ------------------------------ | ------- | ------------------------------------------------------------------ |
| `cube_guy_v1.glb`              | 2.49 MB | Hero asset. Rigged, skinned, 6 animation clips, textures embedded. |
| `cube_guy_v1_outline.glb`      | 1.11 MB | Inverted-hull ink outline. Optional, see §6.                       |
| `cube_guy_v1.fbx`              | 4.63 MB | Interchange only. GLB is the delivery format.                      |
| `cubeguy_rigged.blend`         | —       | Editable master (mesh + rig + all clips).                          |
| `cubeguy_base.blend`           | —       | Mesh + rig before animation.                                       |
| `tex/cubeguy_basecolor_2k.png` | 2048²   | Base colour atlas.                                                 |
| `tex/cubeguy_normal_1k.png`    | 1024²   | Canvas weave normal.                                               |
| `tex/cubeguy_mask_1k.png`      | 1024²   | R = AO, G = roughness, B = FX/"mind" mask.                         |

Units are **metres**, Z-up in Blender, exported **Y-up** per glTF. Character is
**1.744 m** tall, feet on the ground plane, origin at world zero, all transforms
clean (no baked object scale or rotation).

---

## 2. Geometry

**26,220 triangles** total — inside the 25k–60k hero target.

| Object                        | Triangles | Vertices |
| ----------------------------- | --------- | -------- |
| `CG_Head`                     | 4,332     | 2,168    |
| `CG_Body` (neck, arms, hands) | 5,132     | 2,640    |
| `CG_Shirt`                    | 7,388     | 3,700    |
| `CG_Trousers`                 | 7,068     | 3,540    |
| `CG_Shoes`                    | 1,112     | 560      |
| `CG_Eye_L` / `CG_Eye_R`       | 396 each  | 200 each |
| `CG_Mouth`                    | 396       | 200      |

All quads, no n-gons, no loose geometry, no interior faces except the hidden
caps where the trouser legs tuck inside the hip volume. Edge loops run around
every joint (shoulder, elbow, hip, knee, ankle) so deformation stays smooth.

The head is a subdivided cube with only its twelve original edges bevelled, so
the front/side/top planes stay genuinely flat and readable while the corners go
soft. A low-frequency noise displacement (±5.5 mm) and a 1.4% shear keep it from
reading as a machined primitive. Eyes and mouth are **separate objects** with
their own bones — swap or hide them for expression variants without touching the
head mesh.

**Mobile LOD is not in this drop.** Decimating to the 8–20k band is a
five-minute job once the hero is signed off; doing it before then just means
doing it twice.

---

## 3. Materials & UVs

Six materials, one draw call each, all non-metallic and rough:

`CG_Head` · `CG_Skin` · `CG_Eyes` · `CG_Shirt` · `CG_Trousers` · `CG_Shoes`

They share the same three textures and differ only in roughness multiplier and
AO mix, so the site can retint or swap any region independently.

UV islands are packed **by body part** into named rectangles of one 2K atlas —
no chaotic generated atlas. Shirt and trousers use a front/back/side planar
projection, which is what makes the chest mark and the knee patch land in
predictable places. The layout lives in `scripts/cg_layout.py`; the exact island
rectangles are written to `out/uv_islands.json` on every build.

Surface is built from stated material ideas, not noise: a woven canvas with
irregular thread spacing and slub variation, screen-print halftone bite, dye
blotching, sparse photocopy toner speckle, and a wobbly three-pass dry-brush ink
contour just inside each island edge.

Palette is core-only — deep navy, teal, mustard, rust, cobalt, warm off-white,
charcoal. **No neon anywhere**; that is reserved for the emotional/interactive
states, which are shader work, not asset work.

---

## 4. Rig

23 bones, no constraints, no drivers — everything is plain FK so it survives
glTF export exactly as authored.

```
Root
└─ Hips ─ Spine ─ Chest ─ Neck ─ Head ─ Eye_L, Eye_R, Mouth
   ├─ Clavicle_L/R ─ UpperArm ─ Forearm ─ Hand
   └─ Thigh_L/R ─ Shin ─ Foot
```

- **Head squash/stretch** is bone scale on `Head`. The head is weighted 1.0 to
  it, so non-uniform scale squashes cleanly and carries to the eyes.
- **Eye control** is `Eye_L`/`Eye_R` — translate to look, scale Z to blink.
  Each eye mesh is weighted 1.0 to its own bone.
- Rest pose is a relaxed A-pose, arms 14° out, with a slight elbow break.
- Weights are computed procedurally (inverse fourth-power distance to bone
  segments, side-restricted so a left-leg vertex can never pick up a right-leg
  bone, then five Laplacian smoothing passes, max 4 influences, normalised).
  Verified: **zero unweighted vertices**, all eight meshes bound.

### FX attachment points

Empties parented to bones, exported as glTF nodes:

| Empty                        | Parent     | Purpose                                      |
| ---------------------------- | ---------- | -------------------------------------------- |
| `ThoughtOrigin`              | `Head`     | 5 cm above the head — thread/ribbon emission |
| `HeadFX`                     | `Head`     | Head centre — glow, distortion origin        |
| `ChestFX`                    | `Chest`    | Front of chest                               |
| `LeftHandFX` / `RightHandFX` | `Hand_L/R` | Trails, sparks                               |

---

## 5. Animation clips

24 fps. Exported as six separate named glTF animations.

| Clip             | Frames | Loops       | Notes                                                      |
| ---------------- | ------ | ----------- | ---------------------------------------------------------- |
| `Idle`           | 1–97   | ✅ seamless | Breathing, weight shift, head drift, two blinks            |
| `Look`           | 1–73   | one-shot    | Head turns, chest follows, eyes lead into the turn         |
| `Wave`           | 1–85   | one-shot    | Understated — clavicle + shoulder, not a mascot arm        |
| `Walk`           | 1–49   | ✅ seamless | Stylised, walks in place; drive root translation in-engine |
| `ClickReact`     | 1–31   | one-shot    | Head squash, tilt, eye pop, recover                        |
| `ThoughtRelease` | 1–97   | one-shot    | Head tips back, chest opens, eyes squeeze then widen       |

Loop seams measured on the exported file: `Idle` and `Walk` both **0.0**
maximum channel delta between first and last frame.

Blur, vibration, spiral and melt from `3.2.mp4` are deliberately **not** baked
into geometry or clips. They belong in the vertex shader driven off the mask
texture's blue channel and the FX empties.

---

## 6. The ink outline

The illustrated black contour is what makes this read as Cube Guy rather than a
soft 3D toy, so it ships — but as a **separate file**, not fused into the hero.

`cube_guy_v1_outline.glb` is the same rig driving a hull pushed 9.8 mm along the
vertex normals. Render it with `material.side = THREE.BackSide` and an unlit
near-black colour, sharing the hero's animation time. Eyes and mouth are
excluded — they are already dark, and outlining them produced a white halo.

Kept separate because glTF has no front-face-cull flag: fused in, the hero GLB
would look like a black blob in any generic viewer. If you'd rather do
post-process edge detection in the site's render pass, skip this file entirely —
the hero is authored to work either way.

---

## 7. Export settings

```
format         GLB
Y-up           on
apply modifiers off      (sharp edges are a mesh attribute, not a modifier)
animation mode ACTIONS   (one glTF animation per clip, clean names)
skins          on
images         JPEG q86, embedded
extensions     none
Draco/meshopt  off
```

Sharp edges are baked as the `sharp_edge` attribute rather than an EdgeSplit
modifier, so skinned export never has to apply modifiers — which is the usual
way skinning gets silently broken.

---

## 8. Validation

Run `python3 scripts/validate.py`. It reopens the **exported GLB**, not the
.blend, and checks structure, orientation, scale, skinning and loops. Current
result:

- 8 meshes, 1 armature, 23 bones, 5 FX empties — all present
- 6 materials, 3 embedded images, **no missing materials**
- 6 animations, all named correctly, 23 bones driven each
- Tallest axis Z (Blender frame after import) → Y-up in file ✅
- Height 1.744 m, feet at z = 0.006 ✅
- **Zero** meshes without an armature modifier
- **Zero** vertices with no weight
- `Idle` and `Walk` loop seams both 0.0

GLB JSON was also parsed directly to confirm no stray nodes and no unexpected
extensions. (Blender's glTF _importer_ adds a phantom `Icosphere` on load — it
is not in the file; verified against the raw JSON.)

**No official Khronos `gltf-validator` was available in this environment.** The
checks above are mine, not that tool's. Worth one run before the asset goes
live.

---

## 9. What needs your eyes

Honest list — these are judgement calls I can't make from stills:

1. **Head-to-shoulder ratio.** Currently 1.31× shoulder width, per the brief and
   the conception sketch. The finished illustrations run smaller. One number in
   `P["head_w"]` changes it.
2. **Hands.** Simplified paddles with a thumb nub. They read fine at portfolio
   scale, slightly stubby in close-up. Deliberate, but your call.
3. **Wave timing.** Toned down twice already. Feel is a foreground-playback
   judgement, not a still-frame one.
4. **Mustard/teal saturation** on a real screen versus this renderer's AgX view
   transform — likely reads a touch warmer in three.js.
5. **The chest mark** is an original tangle-of-thought motif, not your actual
   signature. If you want the real `Sm`, hand me the glyph and I'll place it.

---

## 10. Rebuilding

```bash
cd scripts
python3 make_textures.py     # atlas, normal, mask
python3 build.py             # mesh + UV + materials + rig + skin  -> cubeguy_base.blend
python3 anim_export.py       # clips + GLB/FBX                     -> cubeguy_rigged.blend
python3 validate.py          # reopen the GLB and check it
python3 render.py ../out/cubeguy_base.blend ../out/renders v1
python3 extras.py all        # wireframe, rig, poses, turntable
```

Every proportion is a single entry in the `P` dict at the top of `build.py`.
`P["density"]` scales the whole mesh resolution — tri count moves roughly with
its square.
