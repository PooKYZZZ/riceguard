import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ScanPage.css";

function ScanPage() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🧠 Local fallback recommendations (only used if backend doesn’t send one)
  const recommendations = {
    "Bacterial Leaf Blight":
      "Remove infected plants immediately and avoid excessive nitrogen fertilizer. Apply copper-based bactericides and ensure proper field drainage to prevent spread.",
    "Brown Spot":
      "Apply balanced fertilizer with potassium and nitrogen. Use fungicides like Mancozeb or Tricyclazole if infection persists. Ensure proper spacing and water management to reduce humidity.",
    "Leaf Smut":
      "Use resistant rice varieties and practice crop rotation. Avoid high nitrogen levels and maintain proper field sanitation. Apply appropriate fungicides if the infection is severe.",
    "Healthy":
      "Your rice crop appears healthy. Continue good farming practices, balanced fertilization, proper irrigation, and pest monitoring.",
  };

  // 🖼 Handle image upload and preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // 🚀 Handle image upload and prediction
  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();

      if (data.prediction) {
        const disease = data.prediction;
        const confidence = data.confidence;
        const recommendation =
          data.recommendation ||
          recommendations[disease] ||
          "No recommendation available.";

        // ✅ Display result
        const newResult = {
          disease,
          confidence,
          recommendation,
          timestamp: data.timestamp,
        };
        setResult(newResult);

        // ✅ Automatically save to history file (handled in backend)
        console.log("Prediction saved to history:", newResult);
      } else {
        alert("Error: " + (data.error || "Unknown error from server"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to connect to backend. Please check if Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  // 🔙 Navigation buttons
  const handleBack = () => navigate("/");
  const handleHistory = () => navigate("/history");

  return (
    <div className="scan-page">
      {/* 🔹 HEADER */}
      <div className="scan-header">
        <div className="logo-section">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Rice Guard Logo"
            className="scan-logo"
          />
        </div>
        <nav className="nav-links">
          <button onClick={handleBack}>Home</button>
          <button className="active">Scan</button>
          <button onClick={handleHistory}>History</button>
        </nav>
      </div>

      {/* 🔹 CONTENT */}
      <div className="scan-content">
        <div className="upload-card">
          {/* Image Upload Box */}
          <label htmlFor="file-upload" className="upload-box">
            {preview ? (
              <img
                src={preview}
                alt="Uploaded preview"
                className="uploaded-preview"
              />
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <p>Upload Image</p>
              </>
            )}
          </label>

          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />

          {/* Upload Button */}
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading || !image}
          >
            {loading ? "Analyzing..." : "UPLOAD IMAGE"}
          </button>

          {/* ✅ Result Display */}
          {result && (
            <div className="result-box">
              <h3>Result</h3>
              <p><strong>Disease:</strong> {result.disease}</p>
              <p><strong>Confidence:</strong> {result.confidence}%</p>
              <p><strong>Recommendation:</strong> {result.recommendation}</p>
              <p><strong>Analyzed On:</strong> {result.timestamp}</p>
            </div>
          )}
        </div>

        {/* Instruction Box */}
        <div className="instruction-box">
          <p>
            To begin analysis, upload your rice leaf image. Ensure the photo is
            clear and well-lit for accurate detection.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
