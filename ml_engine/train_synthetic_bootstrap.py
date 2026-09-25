"""Create a synthetic-only bootstrap model for integration/load testing.

This is deliberately NOT a production reach model: the metadata marks it as
synthetic, and callers must not present its output as observed performance.
Replace it after training/evaluating on real, consented APSM post outcomes.
"""
from __future__ import annotations

import json
import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

RNG = np.random.default_rng(20260925)
ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "ml_models"
MODEL_PATH = MODEL_DIR / "synthetic_bootstrap_reach_random_forest.pkl"
METADATA_PATH = MODEL_DIR / "synthetic_bootstrap_reach_metadata.json"


def make_dataset(rows: int = 50_000):
    platform = RNG.integers(0, 4, rows)  # instagram, youtube, facebook, linkedin
    hour = RNG.integers(0, 24, rows)
    hashtags = RNG.integers(0, 16, rows)
    caption_length = RNG.integers(20, 3001, rows)
    media_type = RNG.integers(0, 4, rows)  # image, video, reel/short, text
    followers = RNG.integers(100, 250_000, rows)
    # A transparent synthetic relationship used only to test end-to-end plumbing.
    timing = np.where((hour >= 9) & (hour <= 20), 1.18, 0.78)
    platform_factor = np.array([1.20, 1.08, 0.88, 1.00])[platform]
    media_factor = np.array([0.90, 1.08, 1.28, 0.70])[media_type]
    tag_factor = 0.6 + 0.045 * np.minimum(hashtags, 8) - 0.02 * np.maximum(hashtags - 10, 0)
    length_factor = 0.75 + 0.35 * np.exp(-((caption_length - 450) / 650) ** 2)
    noise = RNG.lognormal(mean=0, sigma=0.32, size=rows)
    reach = np.maximum(0, followers * timing * platform_factor * media_factor * tag_factor * length_factor * noise).round()
    engagement_rate = np.clip(0.012 + 0.006 * media_factor + 0.0015 * np.minimum(hashtags, 6) + RNG.normal(0, 0.006, rows), 0.002, 0.25)
    engagement = np.maximum(0, reach * engagement_rate).round()
    features = np.column_stack([platform, hour, hashtags, caption_length, media_type, followers])
    return features, np.column_stack([reach, engagement])


def main():
    features, targets = make_dataset()
    x_train, x_test, y_train, y_test = train_test_split(features, targets, test_size=0.2, random_state=42)
    # Histogram trees retain a compact artifact. A 100+ MB synthetic binary is
    # unsuitable for ordinary Git repositories and adds no product value.
    model = MultiOutputRegressor(HistGradientBoostingRegressor(max_iter=180, max_leaf_nodes=31, l2_regularization=1.0, random_state=42))
    model.fit(x_train, y_train)
    prediction = model.predict(x_test)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with MODEL_PATH.open("wb") as file:
        pickle.dump(model, file)
    metadata = {
        "artifact": MODEL_PATH.name,
        "training_data": "SYNTHETIC_ONLY",
        "rows": int(len(features)),
        "features": ["platform_index", "posting_hour", "hashtag_count", "caption_length", "media_type_index", "follower_count"],
        "targets": ["synthetic_reach", "synthetic_engagement"],
        "validation": {"mae": [float(x) for x in mean_absolute_error(y_test, prediction, multioutput="raw_values")], "r2": [float(x) for x in r2_score(y_test, prediction, multioutput="raw_values")]},
        "warning": "Synthetic metrics validate code behavior only. Do not report them as expected real-world reach or accuracy.",
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()
