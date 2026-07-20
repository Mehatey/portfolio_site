# Design system notes

## Design intent

The portfolio should feel like a controlled cinematic workspace: dark, spatial, glassy, curious, and technically alive. It should still behave like a professional hiring tool.

The strongest version of the site mixes:

- Recruiter clarity
- Product design credibility
- Cube character personality
- Carefully rationed WebGL, shader, blur, and glass effects
- Strong visual proof from real project media

The site should not become a generic SaaS grid, a pure art site, or a chaotic shader demo.

## Visual voice

Physical references:

- A dark studio desk with glowing artifacts
- Museum case labels and spatial installation captions
- A polished experimental operating system
- A glass object with personality

Tone:

- Calm
- Specific
- Strange but readable
- Premium without being sterile
- Playful in controlled pockets

## Typography

Current live type direction uses Figtree for primary text and DM Mono for technical labels.

Rules:

- Keep body line length around 65 to 75 characters.
- Use large display type sparingly.
- Avoid stacking multiple small uppercase labels in the same visual cluster.
- Use `text-wrap: balance` for main headings where supported.
- Use `text-wrap: pretty` for longer body text where supported.
- Avoid repeating tiny uppercase tracked labels above every section.
- Metadata should clarify, not decorate.

## Color

The site supports dark and light modes, but dark mode is the primary atmosphere.

Dark mode:

- Background should feel near black, not flat black.
- Text contrast must remain high.
- Blue light, green signal, and warm gold accents should be used carefully.
- Glows should be subtle and rare.

Light mode:

- Must not wash out icons or small text.
- Avoid gray on off white when contrast drops.
- Keep the work and contact icons clearly visible.

## Layout

General:

- Favor fewer type layers per viewport.
- Group related text tightly, then give the group air.
- Keep recruiter decisions visible early.
- Avoid making images huge when they delay comprehension.
- Avoid making images too small when they are the proof.

Works:

- Project rail and preview should support comparison.
- The first view should include title, category, outcome, role, proof, and a clear project link.
- Product design projects should be easy to find.

Project detail:

- Hero first, then concise overview, then metrics, then visual chapters.
- Keep the chapter map useful and labelled.
- Long archives should follow the quick case path.

Play:

- Default view is curated experiments.
- Camera roll is a separate mode.
- Filters should never conflict with mode controls.

Header:

- Four main icons only: Work, Play, Contact, About.
- Icons need clear hover states and accessible labels.
- Hover interactions are delight, not the only path.

Footer:

- Footer should feel like a quiet landing zone, not a second interface system.
- Keep contact routes obvious.

## Motion

Motion principles:

- Prefer specific transitions over `transition: all`.
- Use ease out curves with no bounce.
- Make hover states interruptible.
- Keep page content visible even if animation fails.
- Respect `prefers-reduced-motion`.
- Do not liquify or warp readable text.

Good places for motion:

- Nav icon hover personality
- Play mode switch
- Work preview transitions
- Home desk artifacts
- Profile card tilt
- Subtle page transitions

Avoid:

- Motion that traps scroll
- Constant flying elements that feel like bugs
- Heavy effects over navigation
- Decorative blur that reduces readability

## Accessibility and QA

Before shipping source changes:

1. Run Prettier on touched files.
2. Run `bundle exec jekyll build --quiet`.
3. Check desktop routes:
   - `/`
   - `/works/`
   - `/play/`
   - `/about/`
   - `/contact/`
   - key project pages
4. Confirm there is no horizontal overflow.
5. Confirm keyboard focus remains visible.
6. Confirm nav labels or tooltips are present.
7. Confirm Play mode switch works.
8. Confirm no scroll traps on project pages.
9. Confirm dark and light mode icon contrast.

## Future improvement backlog

These are safe future directions, not requirements for every pass:

- Add short case versions for long archive heavy projects.
- Refine project media selections for each case.
- Add real device QA on iPhone Safari and Android Chrome.
- Measure live Core Web Vitals after deploy.
- Improve resume and confidential work request funnel.
- Continue reducing repeated metadata and type labels where they crowd the first viewport.
