# Human by design

## Open

http://127.0.0.1:4193/web/tv-head.html?v=18

Source: `tv-head.html`, `human-interface.css`, `human-interface.js`.
The current preview mirrors these files under `.codex/previews/liquid-tesseract-v13/web`.
Earlier v17 entry files were preserved as `tv-head-v17.backup.html` and `tv-head-v17.backup.js`.

## Direction

A person behind an interface. One glass instrument, one human form, four short chapters.
The human is an explicitly labelled neutral scanned bust. It is not a reconstruction of Sid.
No portrait planes, primitive face, cap, cartoon uniform, fake award badges, or unstable skinning.

Impeccable informed the restrained hierarchy, Manrope typography, distinct interaction states,
short source-grounded copy, keyboard controls, and responsive visual checks.

## Interactions

- Hover the cube to dissolve its screen and reveal the scanned bust. Move away to restore it.
- “Meet the human” pins the reveal and works with touch or keyboard.
- Click the cube for a small expression and signal response. No head bob or positional impulse.
- Drag gently to inspect the cube. Rotation is bounded and eases back.
- Scroll normally through Human, Systems, Practice, and Contact. No scroll hijacking or pinned wheel trap.
- Hover/focus projects: Compete shows progress; Deloitte shows connected workflows; ENCODED opens a frame into space.
- Click projects for a short résumé-grounded explanation. Modal supports Escape and focus restoration.
- Understand / Make / Test changes both the explanation and the screen diagram.
- Three studio-light settings, ambient-motion pause, and optional browser text-to-speech.
- The Parsons card has small rotational wind movement around its attachment, never free-floating translation.

## Rendering and performance

Three.js 0.180.0, WebGL, physical transmission/IOR/roughness/clearcoat, a local PMREM studio
environment, ACES tone mapping through OutputPass, high-threshold bloom, fine grain,
240 GPU dust points, and a short low-amplitude signal artifact on interaction.
This is not WebGPU or a live AI service. The displayed code is an interaction metaphor.

One render loop capped at 60 updates per second. DPR starts at at most 1.5 and falls toward 1
under sustained slow frames. Texture drawing is capped at 20 updates per second.
Hidden tabs skip rendering. Reduced-motion preference pauses ambient animation. Context loss
shows recovery guidance; restoration reloads the scene. No camera/microphone access.

All runtime graphics dependencies, fonts, model, and normal map are local. No CDN is needed
after opening the local page. Optional system voice availability varies by browser/device.

## Visual QA performed

- In-app browser: 1440×900 desktop, native ~884×862 panel, and 390×844 mobile.
- Corrected desktop edge clipping, overlapping mobile controls, and work-section anchor spacing.
- Inspected landing, human reveal, work, process, and contact compositions.
- Tested hover, pinned reveal, project dialog, Make state, lighting controls, pause, and reduced-motion media emulation.
- No horizontal overflow at the tested mobile size. No console warnings or errors after local dependency switch.
- Browser scheduling sample: 180 animation frames, 8.3 ms median and 10.1 ms p95 in the test environment.
  This measures browser frame scheduling, not a cross-device GPU FPS guarantee.
- Responsive screenshots are saved in `qa-human-interface/`.

## Replace placeholder later

Replace `models/tv-head/placeholder-head.glb` with a licensed/owned scanned head.
The loader centres and scales its first mesh. A real scan with multiple meshes needs a group-based
normalization pass, preserved textures, and separate eye/hair materials. Remove the placeholder
label only after the actual likeness has been inspected and approved. Do not use a photo plane.

## Content provenance

Project details, role dates, education, impact figures, and contact email were taken from the
user-provided `Siddharth_Mehta_Resume_Product_Design.pdf`, copied to `assets/siddharth-mehta-resume.pdf`.
Webby recognition is attributed to the ENCODED exhibition, not represented as a personal award.
No employment or award claims have been independently verified beyond that supplied résumé.

## Asset credits

- Head geometry and normal map: Infinite, 3D Head Scan by Lee Perry-Smith / Infinite-Realities.
  CC BY 3.0, https://creativecommons.org/licenses/by/3.0/ .
  Distributed via Three.js examples: https://github.com/mrdoob/three.js/tree/r180/examples/models/gltf/LeePerrySmith .
  Source work: www.triplegangers.com. Original license preserved in `models/tv-head/LeePerrySmith_License.txt`.
  Changes here: geometry normalization, ceramic study material, lighting, and a sparse surface-point overlay.
- Three.js: MIT, license preserved in `vendor/three/LICENSE`.
- Manrope: SIL Open Font License 1.1, preserved in `fonts/Manrope-OFL.txt`.
  Typeface reference: https://fonts.google.com/specimen/Manrope .
- Glass cube, shader, screen graphics, ID layout, and interface were authored for this prototype.

## Remaining limits

This is a local interactive prototype, not a published portfolio or finished personal avatar.
The bust is static scanned geometry with subtle whole-head orientation, not a facial animation rig.
Project dialogs link to the existing portfolio, not newly authored case-study pages.
Voice is browser speech synthesis, not a clone of Sid’s voice. Other browsers and physical phones need testing.
