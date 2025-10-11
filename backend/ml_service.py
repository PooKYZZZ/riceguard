# ml_service.py
from random import choice, uniform

# Map human-readable to your DiseaseKey if needed (router already does enum cast)
DISEASE_STRS = ["brown_spot", "blight", "blast", "healthy"]

def predict_image(image_path: str):
    """
    Return (label_str, confidence_float). Replace this with real model inference.
    """
    label = choice(DISEASE_STRS)
    confidence = round(uniform(0.85, 0.99), 4)
    return label, confidence
