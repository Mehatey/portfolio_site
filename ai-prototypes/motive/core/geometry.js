export function intentIndexFromDelta(dx, dy) {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle >= -135 && angle < -45) return 0;
  if (angle >= -45 && angle < 45) return 1;
  if (angle >= 45 && angle < 135) return 2;
  return 3;
}

export function clampLens(pointer, viewport, size = { width: 390, height: 245 }) {
  return {
    x: Math.min(viewport.width - size.width - 14, Math.max(14, pointer.x + 28)),
    y: Math.min(viewport.height - size.height - 18, Math.max(74, pointer.y - 50)),
  };
}
