# Portfolio image review, 7 September 2026

Preview: http://127.0.0.1:4317/output/image-review-2026-09-07/

## Scope and evidence

Inspected live homepage and Works, plus Mool, Marriott, Naavo and Encoded page views. Read local case-study content for those projects and Aananda. Surveyed all 16 current work covers in `original-cover-survey.jpg`. Read repository conventions and handoff history as context; current user request governs scope. Historical deployment instructions were not authorization to publish this batch.

The site presents product design, AI/spatial experiments and cultural/brand work. The first batch concentrates on existing artifacts whose presentation can improve without inventing new work.

## Source inventory

| Project       | Preserved source                           | Resolution        | Use                                           |
| ------------- | ------------------------------------------ | ----------------- | --------------------------------------------- |
| Mool          | `5.mool/cover.jpg`                         | 1800 × 1248       | Original phone, hand, artwork and UI          |
| Mool grid     | `assets/img/work-previews/mool/cover.webp` | 1800 × 1248       | Generation reference; same composition        |
| Marriott      | `assets/img/marriott/cover.webp`           | 1500 × 844        | Original dashboard; crop x244 y69, 1012 × 706 |
| Naavo cover   | `7.naavo/cover.webp`                       | 2048 × 1463       | Before comparison; larger than 1800 px JPEG   |
| Naavo bottles | `7.naavo/13.5 solo.webp`                   | 1800 × 814, alpha | Original front and angled bottle renders      |

Used the largest relevant sources located in project folders. A targeted search in `_to_delete` found no matching larger cover or bottle source. No claim that larger masters cannot exist elsewhere on the computer.

Sources copied into `originals/`; source files remain untouched. Final masters are the six `{project}-{a,b}.png` files, with WebP exports for previews. All six are 1536 × 1024. Generation outputs and exact prompts are retained separately; `compose.sh` reproduces the final composites using ImageMagick.

## Decisions

### Mool

Problem: the phone starts about a quarter of the way down a large flat blue field, losing impact in a small card. A uses indigo window light; B uses a sculptural indigo paper fold. Both enlarge the existing phone/hand without inventing UI or folk-art details. Prefer A; B is a quieter alternative.

The first direct edit redrew UI details. Rejected its foreground, used the single allowed generation revision to obtain an empty background, then composited the original foreground. Seven generation calls total: six initial treatments and one Mool A revision. No other generation revisions.

QA found that an initial 15% color tolerance damaged the hand. Corrected the deterministic mask to an edge-connected 6% fill after removing the source border; removed the enclosed blue gap between thumb and phone separately. Visually rechecked the hand, device outline and screen. Original pixels retained within the mask; ordinary resizing and WebP compression apply to exports.

### Marriott

Problem: the black dashboard edges merge into the charcoal surround. A uses a lighter graphite studio field and removes the original outer margin. Increased the final dashboard size after thumbnail QA showed the first composition made it slightly smaller at 4:3. B places the original screenshot against stone and walnut.

Prefer A for a work card. B is an explicitly conceptual presentation mockup, not evidence of a physical product, actual hotel deployment, or real property. The dashboard content is original and unretouched. Its existing bottom-edge crop is retained; missing interface content was not generated.

### Naavo

Problem: the box cover cuts off the packaging; hard shadows compete with its label. Instead of reconstructing a missing box, use existing transparent bottle renders. A shows two front views against teal. B shows three existing views against planes using the brand palette. Keep the box image within the case study. Prefer A for clarity; B for the broader packaging presentation.

Label artwork and bottle geometry are original, including limitations of the supplied render resolution. Generated content is confined to the background. Contact shadows are added in the composition. No newly invented packaging variants, claims or ingredients.

## Other covers

- Keep documentary/actual work: Encoded, Mind Your Feelings, Broken and Beautiful, Bodhi, Shot on iPhone and personal illustrations. Their evidence and authorship matter more than cosmetic generation.
- Keep Alpha Stockathon's actual pixel-art language; it is already distinctive.
- Presentation candidates for later: Fairview's screen framing, Aananda's partially obstructed poster, AI Experiments' busy thumbnail, AI Self and Cube of Creations' dark abstract covers. Review real source frames before generating replacements.
- Bloom and Bodhi already have numerous untracked experiments. Left those files untouched and avoided duplicating that work.

## Visual QA

- Compared all six final compositions against originals at 4:3 card crops and full 3:2 composition.
- Gallery measured 349.33 × 261.99 px desktop cards at a 1200 px viewport, matching the approximately 349.4 × 262.1 px live Works measurement.
- Mobile gallery cards measure 337 × 252.75 px at 390 px, matching the observed live mobile card size.
- Verified light and dark gallery backgrounds, all nine comparison images decoded, and no horizontal overflow at 1200 or 390 px.
- Verified image detail dialog opens, Escape closes it, and crop selection changes the presentation.
- Fixed an HTML height-attribute interaction found during QA, which initially stretched thumbnails to 1024 CSS pixels tall.
- Screenshots saved under `../playwright/review-*`. These prove the comparison gallery and static image crops; they do not prove that every animated state of the production site is correct.
- Original screen and label content is preserved through deterministic compositing. The generated Mool foreground is a rejected draft, not a final asset.

## Later site priorities, grounded in this inspection

1. Prevent decorative animation from obscuring project cards. `works-before.png` captures a large reflective cube/cloud over Mool, with rain across the work grid. Better source images cannot solve an overlay covering them.
2. Separate case-study titles from artifact imagery where needed. Live Mool and Marriott screenshots show the title region and a dark gradient over the product UI. Preserve a readable product view instead of darkening the information being showcased.
3. Reconcile duplicate cover references before adopting a winner. Mool uses a work-preview asset in Works and a separate `5.mool/cover.jpg` hero. Update selected placements and responsive derivatives deliberately after taste calibration.

## Stop state

First batch complete for review. No production templates, data, original images or existing experiments changed. No commit, push, deployment, schedule, usage reset or separate paid API call. Built-in image generation only. Await visual-direction feedback before expanding the queue.
