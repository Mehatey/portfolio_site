# Resume Round 5

Open http://127.0.0.1:4317/output/image-review-2026-09-07/ and select a project. Each has 5 or 6 new media pieces and a local story preview. Comparisons provide original/proposed and desktop/390px phone views.

Authoritative plan: projects.json. Source page data: catalog.json and context.json. Reference copies: assets/, with provenance.json. Generated prompts, raw scenes and final composites: generated/. Projective coordinates and source selections: composite-provenance.json. Video edits: film-provenance.json. Inventory: manifest.json. Audit and decisions: audit.md and decisions.md.

## Rebuild sequence

1. Edit projects.json, applications.cjs or render.cjs. Do not rerun plan.cjs, prepare.cjs, copy-pass.cjs or carry-forward.cjs; those historical passes can overwrite later corrections.
2. Run node render.cjs. Capture affected artboards with Playwright at 1440×900 and 750×1100; applications also need .body element screenshots as -artifact files.
3. Run node export.cjs for responsive WebPs and contact sheets.
4. Motion sources: node motion.cjs. Render window.render(t) at 24fps after window.ready; preserve existing frame directories, then node encode-motion.cjs. GIFs are derived from logo MP4s.
5. Source edits: node films.cjs or node films.cjs project/id. It merges provenance for target edits.
6. Physical applications: node composite.cjs. Do not generate again without reviewing the existing prompt, scene and decision record.
7. Run node gallery.cjs and node compare.cjs. Review round-5/index.html before copying it to the parent index.html. Parent round-4.html preserves the previous gallery.
8. Run node document.cjs and node package.cjs after final exports. Download packages exclude frame intermediates.

Production integration remains pending visual selection. Keep project concepts labeled. Preserve original source files and review the repository instructions again before any production edits.
