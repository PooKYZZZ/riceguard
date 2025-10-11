# backend/ml_service.py
from __future__ import annotations
import os
from pathlib import Path
from functools import lru_cache

# Optional: allow overriding via .env
MODEL_PATH = os.getenv("MODEL_PATH")

# TensorFlow is optional at type-check time, import guarded
try:
    from tensorflow.keras.models import load_model
    import numpy as np
    from PIL import Image
    TF_OK = True
except Exception:
    TF_OK = False


def _default_model_path() -> Path:
    """
    Resolve to the repo-root /ml/model.h5 by walking from this file.
    backend/ml_service.py  ->  repo root (..)..  -> ml/model.h5
    """
    here = Path(__file__).resolve()
    repo_root = here.parents[1]  # ../../
    return (repo_root / "ml" / "model.h5").resolve()


@lru_cache(maxsize=1)
def get_model():
    """Load and cache the Keras model. Raises clear error if missing."""
    if not TF_OK:
        raise RuntimeError("TensorFlow/Pillow not available in this environment")

    path = Path(MODEL_PATH).resolve() if MODEL_PATH else _default_model_path()
    if not path.exists():
        raise FileNotFoundError(f"Model file not found at: {path}")

    print(f"⟲ Loading RiceGuard ML model from: {path}")
    return load_model(str(path))


def _preprocess(image_path: str) -> "np.ndarray":
    """
    Adjust this to match your model’s expected input shape.
    Example: resize to 224x224, scale 0..1, add batch dim.
    """
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    arr = np.asarray(img, dtype="float32") / 255.0
    arr = np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)
    return arr


# ---- Public API used by routers.py ----
def predict_image(image_path: str) -> tuple[str, float]:
    """
    Returns: (label_str, confidence_float)
    """
    model = get_model()
    x = _preprocess(image_path)
    preds = model.predict(x)  # shape (1, C)
    idx = int(np.argmax(preds, axis=1)[0])
    conf = float(np.max(preds, axis=1)[0])

    # Map index -> label expected by your DiseaseKey enum
    index_to_label = {0: "brown_spot", 1: "blast", 2: "blight", 3: "healthy"}
    label = index_to_label.get(idx, "healthy")
    return label, conf
