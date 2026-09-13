# Correction batch

Local illustrative previews only. No publication, API charges, or usage reset redemption. Built-in image generation produced scene plates; deterministic ImageMagick and Node compositing retained original artwork.

- Apna Adda: rejected the cube and exploration logo. Actual final menu is `11.illu/30.1.webp`, explicitly under “Menu” in `_pages/illustrations.md`. Used left menu panel, unchanged lettering and prices, on a laminated counter display beside grilled sandwich, chutney and chai. This is an illustrative application of existing work, not evidence of a real installation.
- Shot on iPhone: original complete landscape composition from `8.shotoniphone/3.webp`. Street print adds photographed folds, dust and weathered graffiti surroundings. Billboard has a separate revised taller physical plate and real scene shadows. Content fitted proportionally; substrate has modest extra margins. No portrait reflow or independently stretched artwork. The original capitalization and QR artwork remain unchanged. QR function not verified.
- Mool: generated a more compact phone. Cropped existing screenshot viewport, retained original UI, added safe area, fit to physical glass and masked around notch. Source `round-2/layers/mool-plans-source.png`, derived from `5.mool/8.webp`. Lower UI intentionally continues off viewport.
- Fairview: removed previous fake dark screenshot padding; fit native UI to estimated photographed panel ratio, white viewport continuation at bottom. Source `round-2/layers/fairview-screen.png`. Corrected four panel corners and subtle glass blend.
- Alpha: source `10.alpha/29.2.webp` is 1406:1000, not widescreen. Fit it inside approximately 16:9 physical display, with honest sidebars instead of stretching. Corrected panel corners and glass blend.
- Aananda: generated better binding, paper and contact-shadow plate. Discarded generated lettering. Restored exact original print from `9.aananda/14.webp`, using existing isolated page crops. Removed old physical page borders, normalized baked source lighting, continuously curved page mapping and multiply print integration. Fingers restored above print. Source text resolution limits tiny type.

## Files

Finals: `apna`, `shot`, `billboard`, `mool`, `fairview`, `alpha`, `aananda`, each PNG and WebP.
Prompts: adjacent `*-prompt.txt`, including billboard revision. Blank and intermediate scene PNGs retained. `previous/` stores rejected first-four composites; round 3 retains earlier complete batch.

Reproduce finals with `node compose-screens.cjs`, `node warp-book.cjs`, and `node compose-new.cjs`. Book script consumes source-lighting and skin masks already preserved in `layers/`. Do not rerun old `compose.cjs`, which records the rejected strip-warp attempt.

`gallery.cjs` creates the main comparison gallery. `placements.cjs` builds local case study copies. Apna application follows actual menu, Shot images follow original poster. Nothing written to production project pages.

## Visual review

Inspected full-resolution composites and book/phone close-ups. Rejected discontinuous book strip warp and removed speckles from unconverged inverse mapping. Checked screen corners, proportional content fit, menu stand occlusion, finger overlap, page edges and billboard shadows. Desktop and mobile gallery captures saved under `output/playwright/round-4/`. Source print text remains resolution-limited; these are illustrative presentation mockups, not new client deliverables.

## Later portfolio priorities

1. Apna: clearly label explorations versus selected identity, then show final menu and packaging together.
2. Shot on iPhone: show original landscape art beside an actual screen recording of the QR story; mockups alone cannot demonstrate the interaction.
3. Fairview and Alpha: pair context images with close UI views or interaction footage, since detail becomes unreadable inside a device at mobile sizes.
