"""Mark repeated gallery images as decorative instead of repeating their label.

Across the case studies, 197 images carry an alt attribute that is just the
project's name, over and over: /illustrations/ has forty-three images all
reading "Illustrations", /alpha-stockathon/ thirty-six reading "Alpha
Stockathon". A screen reader announces every one of them. That is not a
description, it is the same word forty-three times between the reader and the
rest of the page, and it is worse than nothing — a caller with no alt at all
would at least be skipped by some tools.

WCAG's answer for an image whose meaning is already carried by the
surrounding heading or caption is alt="" — explicitly decorative, skipped by
assistive tech. A process grid under a heading that says "Mandalas style
explorations" is exactly that case.

So: the FIRST image with a given alt on a page keeps it, because the gallery
should still announce itself once. Every later image with the identical alt
becomes alt="". Alt text that appears once or twice is never touched, because
that is a real description doing real work.

What this deliberately does NOT do is invent anything. Writing "Sid holding a
lantern in the Kochi backwaters" for an image nobody has described is how a
portfolio ends up asserting things about work it did not check. The images
that need real descriptions still need Sid.

    python3 _scripts/dedupe_alt_text.py            # report only
    python3 _scripts/dedupe_alt_text.py --write    # apply
"""

import collections
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRITE = "--write" in sys.argv
MIN_REPEATS = 3  # 1 or 2 uses of the same alt is not a pattern

IMG = re.compile(r"<img\b[^>]*>", re.S)
ALT = re.compile(r'\balt="([^"]*)"')

changed_total = 0

for page in sorted(glob.glob(os.path.join(ROOT, "_pages", "*.md"))):
    src = open(page, encoding="utf-8").read()
    tags = IMG.findall(src)
    counts = collections.Counter()
    for t in tags:
        m = ALT.search(t)
        if m and m.group(1).strip():
            counts[m.group(1)] += 1
    repeated = {a for a, n in counts.items() if n >= MIN_REPEATS}
    if not repeated:
        continue

    seen = set()
    changed = 0

    def one(m):
        global changed
        tag = m.group(0)
        am = ALT.search(tag)
        if not am:
            return tag
        alt = am.group(1)
        if alt not in repeated:
            return tag
        if alt not in seen:
            seen.add(alt)  # the first one keeps its label
            return tag
        changed += 1
        return tag[: am.start()] + 'alt=""' + tag[am.end() :]

    out = IMG.sub(one, src)
    if changed:
        changed_total += changed
        print("%-28s %3d images marked decorative" % (os.path.basename(page), changed))
        if WRITE:
            open(page, "w", encoding="utf-8").write(out)

print("\n%d total" % changed_total)
if not WRITE:
    print("(dry run — pass --write to apply)")
