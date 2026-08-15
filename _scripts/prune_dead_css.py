"""Remove CSS rules whose elements no longer exist, one named family at a time.

HANDOFF is explicit about why this is not a regex-over-selectors job: a
previous pass pattern-deleted rules mentioning a class, ate a prose comment
that contained a brace, turned the comment into a selector and swallowed the
rule after it. Brace counts stayed balanced, so the diff looked fine.

So this parses instead of matching. It walks the file tracking brace depth,
collects each complete top-level rule with its selector list, and removes a
rule only when EVERY selector in that list belongs to the family being
pruned. Comments are skipped as comments, never as CSS. Anything it is not
certain about, it leaves.

The families are passed in explicitly — there is no "find unused" mode,
because "unused" is a runtime property and this script cannot see the
browser. The evidence for each family below came from loading every page and
asking the DOM whether the selector matched anything.

    python3 _scripts/prune_dead_css.py            # report
    python3 _scripts/prune_dead_css.py --write    # apply
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRITE = "--write" in sys.argv

# file -> (family label, regex a selector must match to count as this family)
TARGETS = [
    (
        "_includes/home_coda.html",
        "coda__eyebrow / coda__note",
        r"\.coda__(eyebrow|note)\b",
        "The film-slate line and the 'Scroll to play' caption were removed at "
        "Sid's request; their styling stayed behind.",
    ),
    (
        "_layouts/sid_home.html",
        "num / num__ico",
        r"\.num(__[a-z]+)?\b",
        "'By the numbers' was replaced by The Range. The four pixel marks and "
        "their counters are gone from the markup.",
    ),
    (
        "_layouts/contact.html",
        "contact-copy (never in the markup)",
        r"\.contact-copy(?![A-Za-z0-9_-])",
        "HANDOFF documents two rules aimed at .contact-copy doing nothing — a "
        "z-index that was hiding the email behind a scrim on mobile, and the "
        "entry stagger. The wrappers are .c-corner. The only real element with "
        "that prefix is .contact-copybtn, which the negative lookahead spares.",
    ),
    (
        "_layouts/contact.html",
        "contact-hint / chint-*",
        r"\.(contact-hint|chint-[a-z]+)\b",
        "The 'move across the plate' tooltip was removed; no element carries "
        "these classes now.",
    ),
]


def rules(css):
    """Yield (start, end, selector_text) for each top-level rule."""
    i, n = 0, len(css)
    depth = 0
    sel_start = 0
    while i < n:
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        c = css[i]
        if c == "{":
            if depth == 0:
                sel = css[sel_start:i]
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                yield sel_start, i + 1, sel
                sel_start = i + 1
        i += 1


total = 0
for rel, label, pattern, why in TARGETS:
    path = os.path.join(ROOT, rel)
    src = open(path, encoding="utf-8").read()
    rx = re.compile(pattern)
    cuts = []
    for a, b, sel in rules(src):
        s = sel.strip()
        if not s or s.startswith("@") or "{" in s:
            continue
        parts = [p.strip() for p in s.split(",") if p.strip()]
        if not parts:
            continue
        # every selector in the list must belong to the family
        if all(rx.search(p) for p in parts):
            cuts.append((a, b, s))
    if not cuts:
        print("%-34s %-28s nothing to remove" % (rel, label))
        continue
    print("%-34s %-28s %d rules" % (rel, label, len(cuts)))
    for _, _, s in cuts[:4]:
        print("      %s" % s.replace("\n", " ")[:74])
    if len(cuts) > 4:
        print("      ... +%d more" % (len(cuts) - 4))
    total += len(cuts)
    if WRITE:
        for a, b, _ in reversed(cuts):
            src = src[:a] + src[b:]
        open(path, "w", encoding="utf-8").write(src)

print("\n%d rules%s" % (total, " removed" if WRITE else " would be removed (dry run)"))
