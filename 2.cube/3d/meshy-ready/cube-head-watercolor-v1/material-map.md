# Cube Head Material Map

## Base colors

| Surface | Base color | Roughness | Transmission | Clearcoat |
| --- | --- | ---: | ---: | ---: |
| Face, luminous ivory paper | `#E8DCC4` | 0.24 | 0.04 | 0.55 |
| Cobalt water side | `#174DB8` | 0.12 | 0.18 | 0.95 |
| Turquoise top | `#6C9FAA` | 0.16 | 0.12 | 0.82 |
| Pale blue grey rear | `#BACBCD` | 0.22 | 0.08 | 0.68 |
| Graphite face and edge lines | `#17202D` | 0.42 | 0.00 | 0.05 |

## PBR settings

- Metallic: `0.0` everywhere. Water is reflective because of specular response and clearcoat, not metalness.
- IOR: `1.333` for blue water surfaces. Use `1.42` for the varnished paper face.
- Specular level: `0.50` to `0.58`.
- Clearcoat roughness: `0.07` to `0.12`.
- Roughness map: pigment pools `0.10` to `0.16`; dry fibers `0.30` to `0.42`.
- Normal map: derive from paper grain. Strength `0.12` to `0.18`.
- Displacement: extremely subtle, `0.002` to `0.006` relative to cube width.
- Transmission: blue surfaces only. Keep below `0.22` so geometry stays readable.
- Emission: optional blue edge glow at `0.03` to `0.06`. Do not emit across full faces.

## Meshy texture prompt

Handmade watercolor cube head with a warm luminous ivory paper face, saturated cobalt water side, dusty turquoise top, pale blue grey rear, and extremely thin graphite construction lines. The colored faces look like translucent wet watercolor sealed beneath a smooth clear resin skin. Crisp cube silhouette, fibrous paper microtexture visible beneath reflections, physically based dielectric highlights, subtle internal depth, restrained blue edge glow. Nonmetallic, not chrome, not plastic, no cartoon gloss, no thick facial marks. Two long hairline vertical graphite eyes and one tiny horizontal hairline mouth.
