#!/usr/bin/env bash
# MIMIC needs a real HTTP origin (module workers + import maps won't run from file://).
# Any static server works; this uses python3, which ships with macOS.
# WebGPU treats http://localhost as a secure context, so no HTTPS needed.
cd "$(dirname "$0")"
PORT="${1:-5173}"
echo "MIMIC  ->  http://localhost:${PORT}"
echo "(Chrome or Edge desktop recommended; Safari 18+ also works.)"
exec python3 -m http.server "$PORT"
