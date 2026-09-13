# Resume this image review

## Start here

Open `http://127.0.0.1:4317/output/image-review-2026-09-07/`.

If the local server has stopped, serve `/Users/siddharthmehta/Desktop/al-folio` on port 4317. Preview files depend on the existing `_site` assets and original project media. No Jekyll rebuild is needed to view this saved comparison.

## Current decisions

- Approved: round-2 Marriott reception and enrollment.
- Approved prior option: root `mool-b.webp`. New round-3 Mool is a candidate, not yet selected.
- Keep: `originals/naavo.webp` as the Naavo cover.
- Rejected: round-1 Naavo A/B. Do not generate similar variants again.
- Superseded: round-2 Fairview, Alpha and Aananda empty-table scenes. User found them too basic.
- Pending review: all nine round-3 proposals. One image per distinct application. No light/dark variants.

## Completed batch

Nine final PNG/WebP images: `mool`, `fairview`, `alpha`, `aananda`, `naavo-gift`, `naavo-use`, `naavo-incense`, `apna`, `shot`.

Three motion studies: `naavo-motion`, `cube-motion`, `mindu-motion`, each in MP4 and GIF.

Eight original-documentation storyboards in `evidence/`. Sixteen copied case-study previews in `placements/`. Main page generator is `gallery.cjs`; index lives one folder above.

Source copies and hashes: `references/` and `sources.json`. Prompts: the five JSON files listed in `sources.json`. Raw photographic scenes: `*-scene.png`. Mool's first attempt and revision both preserved. Compositing scripts use saved original artwork and masks. **Do not repeat image generation for this batch.**

Ready image exports: `exports/selected-webp.zip`, 480/900/1536px variants, about 2.2 MB total. Full-resolution PNGs remain beside the scripts. These are proposals, not automatically approved production assets.

## QA

Desktop 1440px and mobile 390px screenshots saved. Gallery: 45 images loaded, three videos decoded, no horizontal overflow. Case-study additions checked at both sizes. `qa.json` and `reproduction-check.json` record checks. Mool mobile hero uses a left-aligned crop in the local preview to keep the phone clear of the title.

## Next turn

Use the user's selections. Revise only a specifically rejected image or application. Keep exact original typography/UI/logo inserts. New contexts remain illustrative mockups, never presented as photos of actual client deployment or research participants. Preserve current approved scenes and originals.

Production source files have not been edited. Nothing published, committed or pushed. No usage resets redeemed. No separate API image/video generation authorized. Do not call a paid video service to replace the local motion studies without explicit authorization.
