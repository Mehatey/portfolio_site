# Cube of Creation: Reimagining Brief for Claude

## Your task

Rebuild this portfolio opening as an original interactive art direction. Keep the narrative and physical folding logic described below, but do not copy the current watercolor, voxel, typography, color palette, shaders, or decorative treatment. Develop one coherent visual language of your own.

The experience should feel like a single object revealing Siddharth Mehta in layers: introduction, personality, disciplines, perception, thinking, work, then identity mark. It is not a collection of unrelated effects.

## Core concept

A simple square introduces itself as Sid. Scrolling reveals that the square is one face of an unfolded cube. Each new face adds one part of Sid's identity. The flat arrangement then physically folds into a cube. One side opens like a door, the camera enters, and the interior becomes a spatial portfolio containing moving work. The camera exits. A lightning strike gives the final transformation a visible cause. The cube fragments, simplifies, and seamlessly resolves into Siddharth's small face logo at the top left of the portfolio.

The conceptual progression is:

`unknown surface → character → abilities → perception → mind → body of work → particles → identity mark`

The visual style may change completely. The object continuity must remain unmistakable.

## Experience sequence

### 1. Quiet opening

- Begin with an almost black field.
- Add only restrained atmospheric motion, such as fine dust, subtle grain, or another treatment appropriate to your art direction.
- Do not begin at maximum color, noise, or stimulation. Complexity should accumulate through the experience.
- Show no cube at first.
- Scroll writes the sentence letter by letter: `Hey, I'm Sid.`
- A caret may appear only while letters are being typed. Remove it after the full stop.

### 2. Square arrival and physical contact

- A square enters from above as a real object with mass, easing, momentum, and a small settling response.
- Keep the square slightly rounded.
- It must not overlap the introduction text.
- The text stays on its original baseline until the square physically touches it.
- At contact, the square pushes the text downward. Use screen-space collision or another genuine contact constraint. Do not move the text early on a separate automatic timeline.
- The sentence then backspaces and becomes: `Click the square`

### 3. Activation

- Clicking the square wakes Sid.
- Two eyes and a short neutral mouth appear.
- The face should feel observant, not permanently cheerful.
- Eyes blink, breathe slightly wider at irregular intervals, and contain small white catchlights.
- Keep glows and inner shading restrained. Preserve a simple graphic face.
- Pointer movement may influence gaze or the surrounding field.

### 4. Unfolded identity map

Scrolling adds square faces one by one. Open the three disciplines first, followed by the eye photograph, then the brain scan.

Final unfolded cross layout:

```text
                    PRODUCT DESIGN

CREATIVE TECHNOLOGY       FACE       EYE PHOTO       BRAIN SCAN

                      BRAND DESIGN
```

The faces must remain edge-connected. They should read as one continuous cube net, not six floating cards.

Use these discipline labels:

- `01` and `PRODUCT DESIGN`
- `02` and `BRAND DESIGN`
- `03` and `CREATIVE TECHNOLOGY`

You may invent a new typographic composition for them. Avoid generic centered titles. Use hierarchy, asymmetry, edge alignment, or systematic metadata appropriate to your chosen style. Do not add arbitrary illustrations or filler labels. Do not use fragments followed by slashes.

Image requirements:

- Eye source: `assets/sid-eye-natural.png`
- Brain source: `assets/sid-brain-clean.png`
- Show both at original color, contrast, detail, and aspect ratio.
- Do not apply the decorative face shaders, grain, desaturation, dark overlay, RGB splitting, glitching, or texture treatment to either photograph.
- Images must cover their entire face without black gutters, borders, stretching, or protruding beyond the panel.
- Put `SIDDHARTH MEHTA` at the top left of the brain scan in restrained MRI interface typography. Keep it clearly readable.

### 5. Fold into the cube

- Every panel rotates around its shared edge using a real hinge hierarchy.
- Preserve connected corners throughout the fold.
- Add subtle overshoot or settling only if it supports weight.
- Let the viewer understand the transformation. Do not fold all sides too quickly.
- The final result is the same character, now volumetric.
- Permit gentle drag or pointer movement to alter perspective without fighting scroll.

### 6. Enter the work

- One cube side opens like a door.
- The camera moves through that opening into the cube.
- Interior walls play these existing videos:

  - `assets/interior-space.mp4`
  - `assets/interior-mesh.mp4`
  - `assets/interior-vp.mp4`
  - `assets/interior-sid.mp4`
  - `assets/interior-o2.mp4`

- Videos must autoplay muted, loop, and preserve their aspect ratio.
- Use cover cropping when necessary. Never stretch or mirror them.
- Keep original video color. Do not oversaturate or recolor them to force a match.
- The interior styling should bridge naturally from the exterior style. It must not feel like a different website suddenly appeared.
- Let the viewer drag to look around properly. Scroll continues controlling narrative travel.
- Optional atmospheric moment: one short scene of light rain with spatial depth. Keep it calm and legible.

Show one contextual chapter at a time:

1. `01 / 05`  
   `Creative Technology`  
   `Ideas become responsive systems, prototypes, and working code.`

2. `02 / 05`  
   `Spatial Computing`  
   `I design interactions that move beyond the rectangle and into space.`

3. `03 / 05`  
   `Product Design`  
   `Research, systems thinking, and careful execution turn ambiguity into useful products.`

4. `04 / 05`  
   `Brand Design`  
   `Identity gives complex products a clear voice, rhythm, and point of view.`

5. `05 / 05`  
   `Experiments in Motion`  
   `Motion helps people understand change, causality, and what to do next.`

Use `WHY HIRE SID` as the small persistent interior framing label. The chapter copy should remain readable against every video.

### 7. Exit and causal transition

- Move the camera back outside the cube.
- Hold the complete cube briefly so the next event has anticipation.
- A lightning strike travels from above and hits the cube.
- Draw the strike progressively with scroll. Use a fast primary flash and a weaker after-flash.
- The impact triggers fragmentation. The cube must not abruptly swap into particles before contact.

### 8. Fragmentation and simplification

- Break the cube into many small cube fragments, with varied sizes.
- Preserve momentum. Outer fragments drift away even if scrolling pauses.
- Use believable acceleration, drag, rotation, and settling rather than uniform radial motion.
- Keep the transformation reversible or stable when the user scrolls backward.
- Fragments should gradually lose decorative color and converge toward clean neutral white geometry.
- Briefly form a smaller cube inside the larger structure, suggesting an eye or inner self.
- Smoothly simplify the remaining geometry into the final identity mark. Give this section enough scroll distance and interpolation frames to read clearly.

### 9. Exact identity handoff

- Final shape must reproduce the existing al-folio logo, not an approximate cube icon.
- Source reference: `../../../../_includes/site_logo.html`
- It is a thin white rounded-square outline containing two short vertical eyes and one short horizontal mouth.
- Remove all 3D perspective and green line color by the final frame.
- Scale the mark down and dock it at the top left.
- The last particles should appear to become the mark itself. Avoid a visible crossfade to an unrelated SVG.

Reveal final portfolio copy:

```text
Siddharth Mehta

Product designer.
Research to shipped code.

SELECTED WORK ↓
```

## Interaction rules

- Scroll owns narrative progress.
- Click activates Sid and may create a restrained reaction. Remove paper boats and unrelated click effects.
- Drag controls viewpoint during the cube and interior chapters.
- Pointer hover may affect the environment, but should feel fluid and intentional rather than pixelated distortion.
- Do not let hover grading alter the eye photo, brain scan, or videos.
- Support mouse, trackpad, touch, keyboard activation, and `prefers-reduced-motion`.
- On reduced motion, show the same information with short fades and stable states. Skip rain, lightning flicker, rapid camera travel, and particle chaos.

## Style freedom

Invent a distinct style. It can be typographic, architectural, cinematic, minimal, tactile, luminous, monochrome, technical, organic, or another coherent direction. You may replace every existing shader and material.

Keep these invariants:

- One continuous object throughout the narrative.
- Real connected folding and unfolding.
- Slow accumulation from quiet to overstimulation, then reduction to a simple mark.
- Three disciplines first, eye second, brain scan last.
- Untouched photography and video reproduction.
- Readable contextual copy.
- Lightning visibly causes breakup.
- Fragmentation resolves into the exact existing logo at top left.

## Technical guidance

- Prefer one normalized master progress value controlled by GSAP ScrollTrigger.
- Divide progress into named chapters and overlaps rather than scattered magic numbers.
- Damp rendered progress toward target progress to remove trackpad jitter.
- Parent every panel to a hinge group placed at its shared edge.
- Separate media materials from decorative panel materials.
- Place video and image planes slightly in front of their supporting surface to avoid z-fighting, but keep them inside the physical panel silhouette.
- Fit textures using UV transforms or cover calculations. Never distort source media.
- Use one render loop. Do not create competing animation loops.
- Pause expensive media and effects when hidden.
- Cap device pixel ratio and particle count for performance.
- Prevent ScrollTrigger refreshes from changing the visible narrative state.

Suggested chapter state names:

```text
quiet
typing
arrival
contact
activation
unfolding
folding
interior
exit
lightning
fragmentation
logo_handoff
portfolio
```

## Acceptance checks

- Text moves only when square physically reaches it.
- No caret remains after `Hey, I'm Sid.`
- No panel overlaps, detached hinges, or gaps during fold.
- Discipline order is clear before personal images appear.
- Eye and brain images remain bright, clean, synchronized, and undistorted.
- `SIDDHARTH MEHTA` is readable at brain scan top left.
- Every interior video visibly plays and preserves aspect ratio.
- Dragging provides useful viewing freedom without breaking scroll control.
- Lightning lands before first fragment separates.
- Fragment motion continues gently during scroll pauses.
- Intermediate inner cube is legible.
- Final outline is white, flat, rounded, small, and identical to the existing logo.
- Final mark lands at top left without a jump.
- No console errors. Smooth on desktop and mobile. Reduced-motion path remains usable.

## Deliverable

Create one strong implementation, not multiple style options. First present the chosen visual direction in a short paragraph, then build it. Preserve current assets. Do not overwrite source photographs, source videos, or the original site logo.
