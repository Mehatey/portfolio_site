# Portfolio completion checklist

Consolidated from Sid's feedback, the Lovable audit briefs, and the Codex handoff documents dated through November 14, 2026.

## Recruiter path

- [x] Strongest case studies surface ownership, decisions, tradeoffs, outcomes, and next project navigation.
- [x] Project facts and section navigation use a persistent desktop rail and a compact mobile flow.
- [x] Decisions render from project data as plain editorial copy, without numbered scaffolding or system labels.
- [x] Works index exposes the complete project set and role filters.
- [x] Obin and Ledger use calm identity covers on the index instead of illegible interface crops.
- [x] Resume and LinkedIn remain visible without hover discovery or pill containers.
- [x] Homepage introduction states role, experience, specialties, scale, availability, and prior companies.
- [x] Compete remains an experience entry only. There is not enough verified material for a case study.

## Visual system

- [x] Site uses one primary sans family and one supporting display family at most.
- [x] Mono styled label treatment removed from recruiter facing project metadata.
- [x] Navigation spacing, hit areas, contrast, and hover positions are stable.
- [x] Light and dark themes share the same hierarchy and token system.
- [x] Homepage capability section uses a restrained spatial object instead of a presentation list.
- [x] Footer media enters a distinct deep blue creative environment with a scroll triggered transition.
- [x] Homepage water, lighting, award movement, and object avoidance read as one scene.
- [x] Homepage conversation surface uses three direct questions and opens with a candid limitation.

## Mobile and accessibility

- [x] Navigation fits at 390px without horizontal overflow.
- [x] Homepage switches to a calm, static mobile composition instead of forcing desktop WebGL.
- [x] Project rails collapse into normal document flow on narrow screens.
- [x] Motion has reduced motion fallbacks.
- [x] Decorative canvases and images are hidden from assistive technology where appropriate.
- [x] Shared controls meet minimum interaction target sizes.
- [x] Automated portfolio accessibility scan reports zero current findings.

## Performance and reliability

- [x] Hero rendering caps pixel density and pauses when hidden.
- [x] Heavy media below the fold is lazy or interaction gated.
- [x] Latent Atlas loads behind an explicit start gate.
- [x] Core images use responsive variants and reserved dimensions where available.
- [x] Static build, formatting, links, and deployment workflows are part of the verification path.
- [x] Mobile lab trace meets Core Web Vitals targets. About measured 1.01 second LCP and 0.08 CLS on Fast 4G.

## Deliberate decisions

- [x] Keep separate Home, About, Contact, Work, and Play destinations. The proposed single long page conflicts with the approved information architecture.
- [x] Keep current project URLs. Renaming Bloom to Bodhi without a migration would create avoidable link risk.
- [x] Keep the existing native scroll transition between project stories. No scroll hijacking library is used.
- [x] Do not invent Marriott inventory or employee metrics, Compete outcomes, research counts, or testimonials.
- [x] Do not add a Compete case study until verified screens and copy exist.

## Final verification for every release

- [x] Build passes from the current source tree.
- [x] Formatting and diff checks pass.
- [x] Desktop and mobile visual QA passes in light and dark modes.
- [x] No horizontal overflow at 390px, 768px, or 1440px.
- [x] Key navigation and project links resolve.
- [ ] Only intended source changes are committed.
- [ ] CI completes before production is called ready.
