from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
HISTORY_FILE = 'history.json'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Function to check valid image file
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ Simulated model prediction (replace with your ML model later)
def predict_disease(image_path):
    # Here, you'd normally load your trained ML model
    # For now, we’ll simulate it
    import random
    diseases = [
        "Bacterial Leaf Blight",
        "Brown Spot",
        "Leaf Smut",
        "Healthy"
    ]
    disease = random.choice(diseases)
    confidence = round(random.uniform(85, 99), 2)

    # Recommendations
    recommendations = {
        "Bacterial Leaf Blight": "Remove infected plants immediately and avoid excessive nitrogen fertilizer. Apply copper-based bactericides and ensure proper field drainage.",
        "Brown Spot": "Apply balanced fertilizer with potassium and nitrogen. Use fungicides like Mancozeb or Tricyclazole if infection persists. Ensure proper spacing and water management to reduce humidity.",
        "Leaf Smut": "Use resistant rice varieties and practice crop rotation. Avoid high nitrogen levels and maintain proper field sanitation.",
        "Healthy": "Your rice crop appears healthy. Continue good farming practices and proper irrigation."
    }

    recommendation = recommendations.get(disease, "No recommendation available.")

    return disease, confidence, recommendation


# ✅ Route: Predict endpoint
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Get prediction result
    disease, confidence, recommendation = predict_disease(filepath)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ✅ Save result to history.json
    entry = {
        "timestamp": timestamp,
        "disease": disease,
        "confidence": confidence,
        "recommendation": recommendation
    }

    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, 'r') as f:
            try:
                history = json.load(f)
            except json.JSONDecodeError:
                history = []
    else:
        history = []

    history.append(entry)

    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=4)

    # ✅ Return response to frontend
    return jsonify({
        "prediction": disease,
        "confidence": confidence,
        "recommendation": recommendation,
        "timestamp": timestamp
    })


# ✅ Route: Get history
@app.route('/history', methods=['GET'])
def get_history():
    if not os.path.exists(HISTORY_FILE):
        return jsonify({"history": []})
    try:
        with open(HISTORY_FILE, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError:
        data = []
    return jsonify({"history": data})


# ✅ Route: Clear or delete a single record (optional)
@app.route('/delete_history', methods=['POST'])
def delete_history():
    index = request.json.get("index")
    if not os.path.exists(HISTORY_FILE):
        return jsonify({"message": "No history found."}), 404

    with open(HISTORY_FILE, 'r') as f:
        history = json.load(f)

    if 0 <= index < len(history):
        deleted = history.pop(index)
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history, f, indent=4)
        return jsonify({"message": "Deleted successfully.", "deleted": deleted})
    else:
        return jsonify({"message": "Invalid index."}), 400


if __name__ == '__main__':
    app.run(debug=True)
