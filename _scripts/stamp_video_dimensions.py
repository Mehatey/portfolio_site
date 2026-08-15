"""Stamp width/height onto every <video> in _pages, read from the file itself.

A <video> with no intrinsic size and no poster lays out at the HTML default —
300x150 — until its metadata arrives. Every case study on this site is built
out of them, so each page settles by jolting: a 150px letterbox that becomes
753px the moment the file responds, dragging everything below it down the
page. On /mandalas/ that is sixty-four separate jumps.

width/height on the element is the fix. The browser reserves the correct box
from the first layout pass and the media drops into a hole that is already
the right shape. The attributes are not a display size — the stylesheet still
controls that — they are the aspect ratio, which is the only thing needed to
reserve space.

Run after adding or re-encoding video:

    python3 _scripts/stamp_video_dimensions.py           # report only
    python3 _scripts/stamp_video_dimensions.py --write   # apply

Needs ffprobe. Videos it cannot find or probe are listed and left alone —
a wrong dimension is worse than none, because it would reserve a box the
media then has to fight.
"""

import glob
import json
import os
import re
import subprocess
import sys
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WRITE = "--write" in sys.argv

VIDEO_TAG = re.compile(r"<video(?![^>]*\bwidth=)([^>]*)>(.*?)</video>", re.S)
SRC_IN = re.compile(r'(?:data-src|src)="\{\{\s*site\.baseurl\s*\}\}/([^"]+)"')

probe_cache = {}


def probe(rel):
    if rel in probe_cache:
        return probe_cache[rel]
    # Paths in the markup are URL-encoded — "short%20film%20hd" is a real
    # directory with spaces in it. Decode before touching the filesystem.
    path = os.path.join(ROOT, urllib.parse.unquote(rel))
    if not os.path.exists(path):
        probe_cache[rel] = None
        return None
    try:
        out = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height",
                "-of",
                "json",
                path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        st = json.loads(out.stdout)["streams"][0]
        dim = (int(st["width"]), int(st["height"]))
    except Exception:
        dim = None
    probe_cache[rel] = dim
    return dim


total = stamped = missing = 0
misses = []

for page in sorted(glob.glob(os.path.join(ROOT, "_pages", "*.md"))):
    src = open(page, encoding="utf-8").read()
    changed = 0

    def fix(m):
        global stamped, missing, changed
        attrs, inner = m.group(1), m.group(2)
        rel = None
        hit = SRC_IN.search(inner) or SRC_IN.search(attrs)
        if hit:
            rel = hit.group(1)
        dim = probe(rel) if rel else None
        if not dim:
            missing += 1
            misses.append(rel or "(no source found)")
            return m.group(0)
        stamped += 1
        changed += 1
        return '<video width="%d" height="%d"%s>%s</video>' % (dim[0], dim[1], attrs, inner)

    new, n = VIDEO_TAG.subn(fix, src)
    total += n
    if changed and WRITE:
        open(page, "w", encoding="utf-8").write(new)
    if changed:
        print("%-40s %d stamped" % (os.path.basename(page), changed))

print("\n%d <video> seen, %d stamped, %d left alone" % (total, stamped, missing))
for m in sorted(set(misses)):
    print("   unprobed:", m)
if not WRITE:
    print("\n(dry run — pass --write to apply)")
