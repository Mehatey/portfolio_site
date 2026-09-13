const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('#watercolour-bg');

/* Absorptions chosen for this scene, not for paper. The page inverts the sheet,
   so what each triple removes on paper is roughly what it shows on screen:
   two cyans and one ember. No olive, no purple cosmos. */
const SID_INKS = [
  [0.06, 0.66, 0.74],
  [0.09, 0.44, 0.42],
  [0.90, 0.36, 0.09],
];

const watercolour = window.Watercolour?.(canvas, {
  palette: SID_INKS,
  scale: innerWidth < 760 ? 0.26 : 0.34,
  dpr: 1,
  iterations: 5,
  ambient: reduced ? 0 : 0.15,
  drops: reduced ? 0 : 0.085,
  hover: reduced ? 0 : 0.34,
  vignette: 0,
  grain: 0.0,
  /* The sheet has to clear between beats. Slow drying is what turned a wash
     into a full-screen smoke cloud after a dozen clicks. */
  dry: 0.9905,
  settle: 0.9920,
  diffuse: 0.40,
  density: 1.30,
  /* The 3D scene drives the pigment now, in sky coordinates, so the engine's
     own screen space pointer handler is off. */
  pointer: false,
});

window.sidWatercolour = watercolour;
canvas.dataset.watercolour = watercolour ? 'ready' : 'unavailable';

if (watercolour) {
  const seed = [
    [0.14, 0.60, 0], [0.38, 0.34, 1], [0.58, 0.70, 2],
    [0.72, 0.42, 0], [0.90, 0.62, 1],
  ];
  for (const [x, y, ink] of seed) {
    watercolour.drop(x, y, SID_INKS[ink], 0.07 + Math.random() * 0.04, 0.18 + Math.random() * 0.1);
  }
  document.addEventListener('visibilitychange', () => {
    watercolour.set('ambient', document.hidden ? 0 : (reduced ? 0 : 0.13));
  });
}
