#!/usr/bin/env python3
"""Serve the built portfolio and proxy iNaturalist audio for local FERAL use."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


SITE_ROOT = Path(__file__).resolve().parents[3] / "_site"
UPSTREAM = "https://static.inaturalist.org"


class FeralHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Range, Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/inat-audio/"):
            self._proxy_audio(send_body=True)
            return
        super().do_GET()

    def do_HEAD(self):
        if self.path.startswith("/inat-audio/"):
            self._proxy_audio(send_body=False)
            return
        super().do_HEAD()

    def _proxy_audio(self, *, send_body: bool):
        upstream_url = f"{UPSTREAM}/{self.path.removeprefix('/inat-audio/')}"
        headers = {"Accept": "*/*", "User-Agent": "FERAL-local/1.0"}
        if range_header := self.headers.get("Range"):
            headers["Range"] = range_header

        try:
            request = Request(upstream_url, headers=headers, method="GET" if send_body else "HEAD")
            with urlopen(request, timeout=20) as response:
                self.send_response(response.status)
                for name in ("Content-Type", "Content-Length", "Content-Range", "Accept-Ranges", "Cache-Control"):
                    if value := response.headers.get(name):
                        self.send_header(name, value)
                self.end_headers()
                if send_body:
                    while chunk := response.read(64 * 1024):
                        self.wfile.write(chunk)
        except HTTPError as error:
            self.send_error(error.code, error.reason)
        except (URLError, TimeoutError) as error:
            self.send_error(502, f"Audio upstream unavailable: {error}")


def main():
    global SITE_ROOT
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--site-root", type=Path, default=SITE_ROOT)
    args = parser.parse_args()
    SITE_ROOT = args.site_root.expanduser().resolve()

    server = ThreadingHTTPServer((args.host, args.port), FeralHandler)
    print(f"FERAL local server: http://{args.host}:{args.port}/ai-prototypes/feral/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
