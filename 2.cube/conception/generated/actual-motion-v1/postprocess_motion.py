from pathlib import Path

import cv2
import numpy as np


ROOT = Path("/Users/siddharthmehta/Desktop/al-folio/2.cube/conception/generated/actual-motion-v1")
SOURCE = ROOT / "frames"
OUTPUT = ROOT / "styled-frames"
OUTPUT.mkdir(parents=True, exist_ok=True)


def main():
    files = sorted(SOURCE.glob("frame_*.png"))
    if not files:
        raise RuntimeError("No rendered frames found")
    sample = cv2.imread(str(files[0]))
    height, width = sample.shape[:2]
    rng = np.random.default_rng(81)
    coarse = rng.normal(0, 1, (45, 80)).astype(np.float32)
    coarse = cv2.resize(coarse, (width, height), interpolation=cv2.INTER_CUBIC)
    fibre = rng.normal(0, 1, (height, width)).astype(np.float32) * 0.7 + coarse * 0.3

    for index, path in enumerate(files):
        bgr = cv2.imread(str(path))
        soft = cv2.bilateralFilter(bgr, 7, 28, 28)
        hsv = cv2.cvtColor(soft, cv2.COLOR_BGR2HSV).astype(np.float32)
        hsv[..., 1] *= 0.72
        hsv[..., 2] = np.clip((hsv[..., 2] - 128) * 0.94 + 133, 0, 255)
        wash = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32) / 255.0

        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 28, 92).astype(np.float32) / 255.0
        pencil = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            19,
            7,
        ).astype(np.float32) / 255.0
        pencil *= np.clip((205 - gray) / 125.0, 0, 1)
        line = np.clip(edges * 0.92 + pencil * 0.34, 0, 1)

        # Two-frame boil. Geometry moves continuously; only graphite registration breathes.
        frame_rng = np.random.default_rng(700 + index // 2)
        dx, dy = frame_rng.integers(-1, 2, size=2)
        line = np.roll(line, (dy, dx), axis=(0, 1))
        echo = np.roll(line, (-dy or 1, dx or -1), axis=(0, 1))
        line = np.clip(line * 0.84 + echo * 0.16, 0, 1)

        wash *= 0.988 + fibre[..., None] * 0.010
        graphite = np.zeros_like(wash)
        graphite[:] = (0.035, 0.044, 0.050)
        alpha = line[..., None] * 0.86
        result = wash * (1 - alpha) + graphite * alpha

        # Sparse stable graphite dust, concentrated away from the face.
        dust_rng = np.random.default_rng(99)
        dust = dust_rng.random((height, width))
        dust_mask = (dust > 0.9993).astype(np.float32)
        dust_mask[: int(height * 0.18)] *= 0.35
        result *= 1.0 - dust_mask[..., None] * 0.24
        result = np.clip(result * 255, 0, 255).astype(np.uint8)
        cv2.imwrite(str(OUTPUT / path.name), result)


if __name__ == "__main__":
    main()
