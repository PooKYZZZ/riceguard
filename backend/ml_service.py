from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image

MODEL_PATH = "ml/model.h5"
_model = None

def get_model():
    global _model
    if _model is None:
        print("🔹 Loading RiceGuard ML model...")
        _model = load_model(MODEL_PATH)
    return _model

def predict_image(image_path: str):
    """Load an image and return the predicted label + confidence."""
    model = get_model()
    img = Image.open(image_path).resize((224, 224))  # adjust to training size
    arr = np.array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)
    preds = model.predict(arr)[0]
    
    labels = ["brown_spot", "blast", "blight", "healthy"]
    idx = np.argmax(preds)
    confidence = float(preds[idx])
    return labels[idx], confidence