# Recruiter ready pass, 25 Nov 2026

Goal: a design recruiter or hiring manager can land anywhere on the site, understand
who Sid is and what he did, and never hit a flaw that makes the craft look doubtful.
Constraint: do not break the design system or reopen decisions Sid already made.

## Review lanes (read only, findings with evidence)

- [x] A. Home first impression: hero in full and lite mode, both themes, 1440 / 820 / 390, nav, proof strip, What I bring, footer.
- [x] B. Case studies: all 18 pages. Honest claims, front matter facts, labels, decisions copy, media, mobile reading, next project chain.
- [x] C. Works, Play, About, Contact: hierarchy, copy, alignment, hover and click states, both themes.
- [x] D. Technical polish: titles, meta descriptions, OG and Twitter cards, canonical, schema, favicon, 404, resume PDF, links, a11y names, focus states, keyboard, reduced motion, console, perf.

## Implementation (me, serial, one commit per fix, push, verify)

- [x] Triage findings: fix only verified issues that respect Sid's rules.
- [x] Fix batch 1: correctness and honesty issues.
- [x] Fix batch 2: visual and UX polish.
- [x] Fix batch 3: technical polish.
- [x] Prettier check, CI green, live re-verification of every fix.
- [x] Update HANDOFF.md.

## Fixed and verified live (25 to 26 Nov)

Encoded activations wording. About seal on phones, skill lists, FAQ alignment. Contact COPY pills and skip link.
Works wide cover source. Case study link previews (curated description, Concept and Self initiated named, no
mid sentence cut), three new 1200x630 share cards, manifest, sitemap dev files. Reduced motion on case studies.
Home: lite hero buttons and caption (above 760px only), 4+ years together, lane one-liner, heading gap on phones,
tablet portrait buttons. Cube Guy on the reading line, tab cube.

## Held for Sid, these are his calls or claims only he can verify

Claims (from the case study review, none edited):

- Collectio: the belt footage is called both "real conveyor footage" (caption, "8 of 23 real dispatches") and
  "generated reference footage" (decision text). Say which numbers came from which. Also no engagement status for
  "Goa Waste Management" and the 2019 to 2026 span is unexplained.
- Mind Your Feelings: "the data we collected is now being used by local mental health organizations" has no support
  on the page. "In milliseconds" has no figure. Tools omit Python though the reflection mentions the Python backend.
- Marriott: "17% lift in employee usage and customer satisfaction" is one number for two metrics, and "9,000+
  properties in scope" reads as rollout.
- M Health Fairview: $13.6M, 32%, 22%, "top-rated care app", 4.4 rating and "100+ hospitals and 60 clinics" need a
  source, and whether they are client reported.
- Durations disagree: Cube of Creations "six-year" vs 2018 to 2025, Illustrations "seven-year" vs works.yml "Eight years".
- Aananda says cards are "to be placed" while decisions read as if they were. Obin says "four hours became four
  minutes" in a concept project. Mandalas has two proof tiles, not three. Several proof tiles repeat year or "Solo".
- Encoded: "unsanctioned" next to "an exhibition at the Met" needs one line saying who authorised it.
- next_project chain: Ledger and Obin point at each other, Collectio, Alpha and Shot on iPhone have no inbound link.

Design calls:

- Light theme footer: the photo fades to a cream wash, then a navy band; footer links stay pale gray on the wash.
- Home "What I bring" headline is 80px, bigger than the hero statement. Lane card photos read dark and muddy.
- Home portrait is still coarse tiles after 12 seconds. The proof ticker is 12px uppercase and always moving.
- Works lanes leave about 170 to 210px of blank under the small card beside a wide or 4:5 card.
- Play uses a different left edge (130px) than Works and About (58px), and its tab switcher moves on Camera roll.
- Uppercase tracked labels remain on Works lane heads, Play card tags and /ai-prototypes/.
- Contact at 820px leaves about 500px empty under the links. The Cmd+K palette has a double box around its field.
