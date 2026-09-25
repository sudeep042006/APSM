"""Local HTTP inference service for APSM reach-model artifacts.

Run separately from Express:
    python backend/ml_engine/inference_service.py

The service never exposes a model binary. It accepts a validated feature vector
from the authenticated Express gateway and returns a clearly-labelled estimate.
"""
from __future__ import annotations

import json
import os
import pickle
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
DEFAULT_MODEL = HERE.parent.parent / "ml_engine" / "ml_models" / "synthetic_bootstrap_reach_random_forest.pkl"
MODEL_PATH = Path(os.environ.get("APSM_MODEL_PATH", DEFAULT_MODEL)).resolve()
MODEL = None
MODEL_ERROR = None
PLATFORM_INDEX = {"instagram": 0, "youtube": 1, "facebook": 2, "linkedin": 3}
MEDIA_INDEX = {"image": 0, "video": 1, "reel": 2, "short": 2, "text": 3, "post": 3}


def load_model():
    global MODEL, MODEL_ERROR
    try:
        with MODEL_PATH.open("rb") as handle:
            MODEL = pickle.load(handle)
        MODEL_ERROR = None
    except Exception as error:  # Keep health endpoint available for diagnostics.
        MODEL = None
        MODEL_ERROR = str(error)


def number(value, name, minimum=0, maximum=1_000_000_000):
    if not isinstance(value, (int, float)) or isinstance(value, bool) or not minimum <= value <= maximum:
        raise ValueError(f"{name} must be a number between {minimum} and {maximum}.")
    return float(value)


def predict(payload):
    if MODEL is None:
        raise RuntimeError("Model unavailable")
    platform = str(payload.get("platform", "")).lower()
    if platform not in PLATFORM_INDEX:
        raise ValueError("platform is invalid.")
    media_type = str(payload.get("media_type", "post")).lower()
    caption_length = number(payload.get("caption_length"), "caption_length", 0, 10_000)
    hashtag_count = number(payload.get("hashtag_count"), "hashtag_count", 0, 100)
    posting_hour = number(payload.get("posting_hour"), "posting_hour", 0, 23)
    follower_count = number(payload.get("follower_count"), "follower_count", 0, 1_000_000_000)
    features = np.array([[PLATFORM_INDEX[platform], posting_hour, hashtag_count, caption_length, MEDIA_INDEX.get(media_type, 3), follower_count]])
    values = MODEL.predict(features)[0]
    return {
        "estimated_reach": max(0, round(float(values[0]))),
        "estimated_engagement": max(0, round(float(values[1]))),
        "model_mode": "SYNTHETIC_BOOTSTRAP",
        "warning": "This estimate comes from synthetic training data and is not a real-world reach forecast.",
    }


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def respond(self, status, body):
        raw = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        if self.path != "/health":
            return self.respond(HTTPStatus.NOT_FOUND, {"error": "Not found"})
        self.respond(HTTPStatus.OK, {"status": "ok" if MODEL else "degraded", "model_loaded": bool(MODEL), "model_path": str(MODEL_PATH), "error": MODEL_ERROR})

    def do_POST(self):
        if self.path != "/predict":
            return self.respond(HTTPStatus.NOT_FOUND, {"error": "Not found"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 16_384:
                raise ValueError("Invalid payload size.")
            payload = json.loads(self.rfile.read(length))
            self.respond(HTTPStatus.OK, predict(payload))
        except ValueError as error:
            self.respond(HTTPStatus.BAD_REQUEST, {"error": str(error)})
        except RuntimeError as error:
            self.respond(HTTPStatus.SERVICE_UNAVAILABLE, {"error": str(error), "detail": MODEL_ERROR})
        except Exception:
            self.respond(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Inference failed."})


if __name__ == "__main__":
    load_model()
    port = int(os.environ.get("ML_INFERENCE_PORT", "8010"))
    print(f"APSM ML inference service listening on http://127.0.0.1:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
