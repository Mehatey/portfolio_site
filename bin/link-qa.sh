#!/usr/bin/env bash
# Resolve every outbound URL in the repo.
#
# Why: behance.net/mehatey sat on the CONTACT page returning 404 -- the single
# most likely outbound click a recruiter makes there -- while every other
# Behance link on the site used the correct handle. Nothing in a build, a
# screenshot or a 628-assertion crawl can see that, because the link is
# perfectly well-formed; it just does not exist.
#
# Two codes are bot defences rather than dead links and are treated as
# passes. LinkedIn answers 999 to anything that is not a browser. Artnet sits
# behind a Cloudflare challenge that answers 403 with "Just a moment..." --
# verified by loading it in a real Chrome, which gets the same 403, while a
# human with cookies passes through. Flagging either would train whoever runs
# this to ignore its output, which is worse than not running it.
set -u
urls=$(grep -rhoE 'href="https?://[^"]+"' _layouts/*.html _includes/*.html _data/*.yml _pages/*.md play/*.html 2>/dev/null \
  | sed 's/href="//;s/"$//' | sort -u \
  | grep -viE 'schema\.org|w3\.org|jsdelivr|googleapis|gstatic|unpkg|storage\.googleapis|cdnjs')
fail=0
n=0
for u in $urls; do
  n=$((n+1))
  code=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 25 -A "Mozilla/5.0" "$u")
  case "$code" in
    2*|3*|999|403) ;;
    *) printf "  DEAD %-4s %s\n" "$code" "$u"; fail=$((fail+1)) ;;
  esac
done
echo "checked $n outbound links"
[ "$fail" -eq 0 ] && echo "all resolve" || echo "dead: $fail"
exit $fail
