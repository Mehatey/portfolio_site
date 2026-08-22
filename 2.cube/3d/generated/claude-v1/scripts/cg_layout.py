"""Shared constants: palette, UV atlas layout, proportions.
Used by both make_textures.py (PIL) and build.py (bpy) so the atlas
rectangles and the mesh UV packing can never drift apart.
"""

ATLAS = 2048
NORMAL_RES = 1024
MASK_RES = 1024

# --- core palette (hex) -------------------------------------------------
PAL = {
    "navy":      (0x16, 0x23, 0x3A),
    "teal":      (0x1B, 0x74, 0x76),
    "cobalt":    (0x2B, 0x4E, 0xA2),
    "mustard":   (0xE0, 0x9E, 0x18),
    "rust":      (0xB4, 0x55, 0x2C),
    "coral":     (0xE2, 0x70, 0x5A),
    "offwhite":  (0xF1, 0xE9, 0xDA),
    "charcoal":  (0x23, 0x26, 0x2B),
    "paper":     (0xEF, 0xE2, 0xCC),
    "ink":       (0x14, 0x16, 0x1A),
}

# --- atlas boxes, in pixels (x0, y0, x1, y1) with y from TOP (PIL space) -
# build.py converts to Blender UV space (y from bottom) itself.
BOXES = {
    "head":        (  16,   16,  720,  720),
    "shirt_front": ( 736,   16, 1216,  512),
    "shirt_back":  (1232,   16, 1712,  512),
    "shirt_side":  (1728,   16, 2032,  512),
    "trou_front":  ( 736,  528, 1216, 1120),
    "trou_back":   (1232,  528, 1712, 1120),
    "trou_side":   (1728,  528, 2032, 1120),
    "arm":         (  16,  736,  400, 1120),
    "hand":        ( 416,  736,  720, 1040),
    "shoe":        (  16, 1136,  520, 1440),
    "neck":        ( 536, 1136,  760, 1360),
    "eye":         ( 776, 1136, 1000, 1360),
    "mouth":       (1016, 1136, 1240, 1280),
}

# base colour per island
BOX_COLOR = {
    "head":        PAL["offwhite"],
    "shirt_front": PAL["mustard"],
    "shirt_back":  PAL["mustard"],
    "shirt_side":  PAL["mustard"],
    "trou_front":  PAL["teal"],
    "trou_back":   PAL["teal"],
    "trou_side":   PAL["teal"],
    "arm":         PAL["paper"],
    "hand":        PAL["paper"],
    "shoe":        PAL["navy"],
    "neck":        PAL["paper"],
    "eye":         PAL["charcoal"],
    "mouth":       PAL["charcoal"],
}

# which islands get the "mind / thought" FX mask in the blue channel
FX_MASK_BOXES = {"head", "eye", "mouth"}

MAT_FOR_BOX = {
    "head": "CG_Head", "eye": "CG_Eyes", "mouth": "CG_Eyes", "neck": "CG_Skin",
    "arm": "CG_Skin", "hand": "CG_Skin",
    "shirt_front": "CG_Shirt", "shirt_back": "CG_Shirt", "shirt_side": "CG_Shirt",
    "trou_front": "CG_Trousers", "trou_back": "CG_Trousers", "trou_side": "CG_Trousers",
    "shoe": "CG_Shoes",
}
