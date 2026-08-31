from pathlib import Path
import math

import cv2
import numpy as np


ROOT = Path("/Users/siddharthmehta/Desktop/al-folio/2.cube/conception/generated")
SOURCE = ROOT / "cube-guy-architectural-keyframe-v1.png"
FRAMES = ROOT / "line-animation-frames"
WIDTH, HEIGHT = 1280, 720
FPS, SECONDS = 24, 9


def clamp01(value):
    return np.clip(value, 0.0, 1.0)


def smoothstep(edge0, edge1, value):
    if edge1 < edge0:
        return 1.0 - smoothstep(edge1, edge0, value)
    x = clamp01((value - edge0) / max(edge1 - edge0, 1e-6))
    return x * x * (3.0 - 2.0 * x)


def ease(value):
    value = max(0.0, min(1.0, value))
    return 1.0 - (1.0 - value) ** 3


def composite(base, layer, alpha):
    alpha = alpha[..., None] if alpha.ndim == 2 else alpha
    return base * (1.0 - alpha) + layer * alpha


def camera(frame, progress):
    zoom = 1.0 + 0.035 * smoothstep(0.05, 0.94, progress)
    pan_x = -7.0 * math.sin(progress * math.pi)
    pan_y = 3.0 * math.sin(progress * math.pi * 0.7)
    matrix = cv2.getRotationMatrix2D((WIDTH / 2, HEIGHT / 2), 0.0, zoom)
    matrix[0, 2] += pan_x
    matrix[1, 2] += pan_y
    return cv2.warpAffine(
        frame,
        matrix,
        (WIDTH, HEIGHT),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REFLECT_101,
    )


def main():
    FRAMES.mkdir(parents=True, exist_ok=True)
    source = cv2.imread(str(SOURCE), cv2.IMREAD_COLOR)
    source = cv2.resize(source, (WIDTH, HEIGHT), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    rgb = source[..., ::-1]
    gray = cv2.cvtColor(source, cv2.COLOR_BGR2GRAY)

    # Clean warm sheet with synthetic fibre. No ghost of the finished drawing.
    paper_rng = np.random.default_rng(19)
    coarse = paper_rng.normal(0, 1, (46, 82)).astype(np.float32)
    coarse = cv2.resize(coarse, (WIDTH, HEIGHT), interpolation=cv2.INTER_CUBIC)
    fine = paper_rng.normal(0, 1, (HEIGHT, WIDTH)).astype(np.float32)
    fibre = coarse * 0.008 + fine * 0.004
    paper = np.zeros_like(rgb)
    paper[:] = (0.945, 0.931, 0.895)
    paper += fibre[..., None]
    paper = clamp01(paper)

    # Graphite line field. Soft pencil body plus a sharper contour pass.
    soft_ink = clamp01((0.82 - gray) / 0.63)
    edges = cv2.Canny((gray * 255).astype(np.uint8), 34, 105).astype(np.float32) / 255.0
    edges = cv2.GaussianBlur(edges, (0, 0), 0.42)
    graphite = clamp01(np.maximum(soft_ink * 0.72, edges))
    graphite_color = np.zeros_like(rgb)
    graphite_color[:] = (0.055, 0.068, 0.075)

    hsv = cv2.cvtColor(source, cv2.COLOR_BGR2HSV)
    saturation = hsv[..., 1].astype(np.float32) / 255.0
    red = source[..., 2]
    green = source[..., 1]
    blue = source[..., 0]
    red_mask = clamp01((red - np.maximum(green, blue) - 0.025) * 7.0) * smoothstep(0.18, 0.52, red)
    red_mask = cv2.GaussianBlur(red_mask, (0, 0), 0.55)

    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH].astype(np.float32)
    # Two authored focal origins: the character's feet and architectural portal.
    char_order = np.sqrt(((xx - 230) / 940) ** 2 + ((yy - 650) / 760) ** 2)
    portal_order = np.sqrt(((xx - 930) / 700) ** 2 + ((yy - 300) / 650) ** 2)
    spatial_order = np.where(xx < 610, char_order * 0.78, 0.28 + portal_order * 0.68)

    rng = np.random.default_rng(73)
    noise_small = rng.random((HEIGHT // 18 + 2, WIDTH // 18 + 2), dtype=np.float32)
    noise = cv2.resize(noise_small, (WIDTH, HEIGHT), interpolation=cv2.INTER_CUBIC)
    reveal_order = spatial_order + (noise - 0.5) * 0.13

    # Sparse blue construction marks arrive before dark graphite.
    construction = clamp01(edges * (0.22 + saturation * 0.8))
    construction_color = np.zeros_like(rgb)
    construction_color[:] = (0.11, 0.30, 0.45)

    total = FPS * SECONDS
    for index in range(total):
        t = index / (total - 1)
        frame = paper.copy()

        construction_progress = ease((t - 0.015) / 0.29)
        construction_reveal = smoothstep(
            construction_progress + 0.055,
            construction_progress - 0.055,
            reveal_order,
        ) * construction_progress
        frame = composite(frame, construction_color, construction * construction_reveal * 0.31)

        line_progress = ease((t - 0.08) / 0.58)
        line_reveal = smoothstep(line_progress + 0.045, line_progress - 0.045, reveal_order) * line_progress

        # Pencil boil on twos: lines move, paper and watercolor remain calm.
        boil_rng = np.random.default_rng(900 + index // 2)
        dx, dy = boil_rng.integers(-1, 2, size=2)
        boiled = np.roll(graphite * line_reveal, (dy, dx), axis=(0, 1))
        echo = np.roll(boiled, (-dy or 1, dx or -1), axis=(0, 1))
        frame = composite(frame, graphite_color, clamp01(boiled * 0.84 + echo * 0.15))

        # Watercolor seeps beneath the finished pencil through an irregular wet edge.
        wash_progress = ease((t - 0.40) / 0.39)
        wet_edge = smoothstep(wash_progress + 0.11, wash_progress - 0.11, reveal_order + (noise - 0.5) * 0.2)
        tonal_mask = clamp01(soft_ink * 0.60 + saturation * 0.92)
        color_alpha = tonal_mask * wet_edge * 0.78
        color_alpha *= 1.0 - red_mask * 0.72
        frame = composite(frame, rgb, color_alpha)

        # Vermilion thread is last and reads as a deliberate drawn gesture.
        thread_progress = ease((t - 0.64) / 0.24)
        thread_order = clamp01((xx / WIDTH) * 0.86 + (1.0 - yy / HEIGHT) * 0.14)
        thread_reveal = smoothstep(thread_progress + 0.018, thread_progress - 0.018, thread_order)
        frame = composite(frame, rgb, red_mask * thread_reveal)

        # Reassert graphite above pigment, like ink placed after a dry wash.
        final_line = boiled * smoothstep(0.34, 0.64, t) * 0.35
        frame = composite(frame, graphite_color, final_line)

        frame = camera(frame, t)

        # Restrained analog exposure flutter, never digital glitch.
        exposure = 1.0 + math.sin(index * 0.43) * 0.004
        frame = clamp01(frame * exposure)
        output = (frame[..., ::-1] * 255).astype(np.uint8)
        cv2.imwrite(str(FRAMES / f"frame_{index + 1:04d}.png"), output)


if __name__ == "__main__":
    main()
