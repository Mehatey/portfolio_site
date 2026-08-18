#!/usr/bin/env python3
"""
proxy for GUISE — a live generative mirror. Holds the fal.ai key and orchestrates
three fal models so the browser never sees the key:

  POST /see        { image_data_url }            -> { ok, caption }   (Florence-2 VLM)
  POST /transform  { prompt, image_data_url,
                     strength, steps }            -> { ok, url }       (FLUX img2img)
  POST /enhance    { image_url }                  -> { ok, url }       (Clarity upscaler)
  GET  /health

SEE looks at your camera frame, BECOME repaints you as your wish keeping your
pose, ENHANCE upscales a result you like to hi-res. Key lives in .env.

Run:  python3 reverie_proxy.py
"""
import base64
import json
import os
import pathlib
import sys
import tempfile
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# ── load FAL_KEY from .env ─────────────────────────────────────────────
ENV_FILE = Path(__file__).parent / ".env"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ[k.strip()] = v.strip()

if not os.environ.get("FAL_KEY"):
    print("FAL_KEY missing. put it in .env as FAL_KEY=...", file=sys.stderr)
    sys.exit(1)

import fal_client  # noqa: E402

PORT = 8011
# Fast image-edit path. The previous Canny ControlNet endpoint preserved pose
# well, but often sat in Fal's queue for minutes before returning.
GEN_MODEL = "fal-ai/flux-pro/kontext"
SEE_MODEL = "fal-ai/florence-2-large/detailed-caption"
UPSCALE_MODEL = "fal-ai/clarity-upscaler"
JOBS = {}
JOBS_LOCK = threading.Lock()
JOB_TTL_SECONDS = 10 * 60


def _upload_data_url(data_url):
    header, b64 = data_url.split(",", 1)
    ext = "jpg" if ("jpeg" in header or "jpg" in header) else "png"
    raw = base64.b64decode(b64)
    tmp = tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False)
    tmp.write(raw)
    tmp.close()
    url = fal_client.upload_file(tmp.name)
    pathlib.Path(tmp.name).unlink(missing_ok=True)
    return url


def _update_job(job_id, **changes):
    with JOBS_LOCK:
        if job_id in JOBS:
            JOBS[job_id].update(changes)


def _job_snapshot(job_id):
    now = time.time()
    with JOBS_LOCK:
        expired = [
            key
            for key, job in JOBS.items()
            if job.get("finished_at") and now - job["finished_at"] > JOB_TTL_SECONDS
        ]
        for key in expired:
            JOBS.pop(key, None)
        job = JOBS.get(job_id)
        if not job:
            return None
        snapshot = dict(job)
    snapshot["elapsed_seconds"] = round(
        (snapshot.get("finished_at") or now) - snapshot["created_at"], 1
    )
    snapshot.pop("created_at", None)
    snapshot.pop("finished_at", None)
    return snapshot


def _run_transform_job(job_id, prompt, data_url, control):
    try:
        _update_job(job_id, stage="uploading")
        src = _upload_data_url(data_url)

        def on_enqueue(request_id):
            _update_job(job_id, stage="queued", request_id=request_id)

        def on_queue_update(event):
            kind = type(event).__name__
            if kind == "Queued":
                # Fal positions are zero based. Show a human friendly count.
                _update_job(job_id, stage="queued", queue_position=max(0, event.position) + 1)
            elif kind == "InProgress":
                _update_job(job_id, stage="processing", queue_position=None)
            elif kind == "Completed":
                _update_job(job_id, stage="finalizing", queue_position=None)

        print(f"  become queued ctrl={control} · {prompt[:46]}", flush=True)
        result = fal_client.subscribe(
            GEN_MODEL,
            arguments={
                "prompt": prompt,
                "image_url": src,
                "guidance_scale": 3.5,
            },
            with_logs=True,
            on_enqueue=on_enqueue,
            on_queue_update=on_queue_update,
        )
        url = result["images"][0]["url"]
        finished_at = time.time()
        _update_job(job_id, stage="complete", url=url, finished_at=finished_at)
        snapshot = _job_snapshot(job_id)
        print(f"  become done {snapshot['elapsed_seconds']}s · {prompt[:46]}", flush=True)
    except Exception as error:
        finished_at = time.time()
        _update_job(
            job_id,
            stage="error",
            error=f"{type(error).__name__}: {error}",
            finished_at=finished_at,
        )
        print(f"  become error: {type(error).__name__}: {error}", flush=True)


class Handler(BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS, GET")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._json({"ok": True, "gen": GEN_MODEL, "see": SEE_MODEL, "enhance": UPSCALE_MODEL})
        elif parsed.path == "/transform/status":
            job_id = parse_qs(parsed.query).get("id", [""])[0]
            job = _job_snapshot(job_id)
            self._json(job or {"ok": False, "error": "unknown transform job"})
        else:
            self.send_response(404)
            self._cors()
            self.end_headers()

    def do_POST(self):
        routes = {
            "/see": self._see,
            "/transform": self._transform,
            "/transform/start": self._transform_start,
            "/enhance": self._enhance,
        }
        fn = routes.get(self.path)
        if not fn:
            self.send_response(404)
            self._cors()
            self.end_headers()
            return
        try:
            n = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(n).decode("utf-8")) if n else {}
            fn(body)
        except Exception as e:
            print(f"  {self.path} error: {type(e).__name__}: {e}", flush=True)
            self._json({"ok": False, "error": f"{type(e).__name__}: {e}"})

    # ── SEE — Florence-2 captions the frame ──
    def _see(self, body):
        data_url = body.get("image_data_url", "")
        if not data_url.startswith("data:image"):
            return self._json({"ok": False, "error": "need image_data_url"})
        t0 = time.time()
        url = _upload_data_url(data_url)
        r = fal_client.run(SEE_MODEL, arguments={"image_url": url})
        caption = (r.get("results") or "").strip()
        print(f"  see {round(time.time()-t0,2)}s · {caption[:60]}", flush=True)
        self._json({"ok": True, "caption": caption})

    # ── BECOME — edit the camera frame into the requested guise ──
    def _transform_start(self, body):
        prompt = body.get("prompt", "").strip()
        data_url = body.get("image_data_url", "")
        control = float(body.get("control", 0.82))
        if not prompt or not data_url.startswith("data:image"):
            return self._json({"ok": False, "error": "need prompt + image_data_url"})
        job_id = uuid.uuid4().hex
        with JOBS_LOCK:
            JOBS[job_id] = {
                "ok": True,
                "job_id": job_id,
                "stage": "preparing",
                "queue_position": None,
                "created_at": time.time(),
            }
        threading.Thread(
            target=_run_transform_job,
            args=(job_id, prompt, data_url, control),
            daemon=True,
        ).start()
        self._json({"ok": True, "job_id": job_id, "stage": "preparing"})

    def _transform(self, body):
        prompt = body.get("prompt", "").strip()
        data_url = body.get("image_data_url", "")
        control = float(body.get("control", 0.82))
        if not prompt or not data_url.startswith("data:image"):
            return self._json({"ok": False, "error": "need prompt + image_data_url"})
        t0 = time.time()
        src = _upload_data_url(data_url)
        print(f"  become start ctrl={control} · {prompt[:46]}", flush=True)
        r = fal_client.run(GEN_MODEL, arguments={
            "prompt": prompt,
            "image_url": src,
            "guidance_scale": 3.5,
        })
        url = r["images"][0]["url"]
        print(f"  become ctrl={control} {round(time.time()-t0,2)}s · {prompt[:46]}", flush=True)
        self._json({"ok": True, "url": url})

    # ── ENHANCE — Clarity upscaler for a hi-res final ──
    def _enhance(self, body):
        image_url = body.get("image_url", "")
        if not image_url.startswith("http"):
            return self._json({"ok": False, "error": "need image_url"})
        t0 = time.time()
        r = fal_client.run(UPSCALE_MODEL, arguments={"image_url": image_url, "upscale_factor": 2})
        url = r["image"]["url"]
        print(f"  enhance {round(time.time()-t0,2)}s", flush=True)
        self._json({"ok": True, "url": url})

    def _json(self, payload):
        b = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def log_message(self, *_a, **_k):
        return


if __name__ == "__main__":
    print(f"[guise] proxy on http://localhost:{PORT}")
    print(f"[guise] see={SEE_MODEL}")
    print(f"[guise] become={GEN_MODEL}")
    print(f"[guise] enhance={UPSCALE_MODEL}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
