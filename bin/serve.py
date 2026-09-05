#!/usr/bin/env python3
"""
Preview the built site, with working video.

    python3 bin/serve.py            # serves _site on http://127.0.0.1:4000
    python3 bin/serve.py 4321       # ...on another port
    python3 bin/serve.py 4000 _site # ...from another directory

WHY THIS EXISTS RATHER THAN `python3 -m http.server`.

Python's SimpleHTTPRequestHandler answers a Range request with 200 and the
whole file instead of 206 and the slice that was asked for. A browser reads
that as "this resource cannot be seeked", so every <video> on the site
reports seekable = [0, 0] and silently ignores any attempt to set
currentTime. Nothing errors. The video simply sits on frame zero.

That is not a hypothetical: it cost an hour of debugging a scrubbing bug in
the intro that did not exist anywhere except against that server. Any real
host, GitHub Pages included, serves ranges correctly.

This is a preview server for the BUILT output. It does not rebuild anything;
run `bundle exec jekyll build` first, or use `bundle exec jekyll serve` if
you want live rebuilds and are not testing video seeking.
"""
import os, re, sys, http.server, socketserver
ROOT = sys.argv[2] if len(sys.argv) > 2 else "_site"
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def send_head(self):
        rng = self.headers.get("Range")
        if not rng: return super().send_head()
        path = self.translate_path(self.path)
        if os.path.isdir(path): return super().send_head()
        try: f = open(path, "rb")
        except OSError:
            self.send_error(404); return None
        size = os.fstat(f.fileno()).st_size
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        start = int(m.group(1)) if m.group(1) else 0
        end = int(m.group(2)) if m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416); f.close(); return None
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        f.seek(start)
        self.wfile.write(f.read(end - start + 1))
        f.close()
        return None
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4000
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), H) as srv:
    print("serving %s on http://127.0.0.1:%d  (ctrl-c to stop)" % (os.path.abspath(ROOT), PORT))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
