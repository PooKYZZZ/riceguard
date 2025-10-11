import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HistoryPage.css";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .catch((err) => console.error("Error fetching history:", err));
  }, []);

  return (
    <div className="history-page">
      <div className="history-header">
        <div className="logo-section">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="Rice Guard Logo"
            className="history-logo"
          />
        </div>

        <nav className="nav-links">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/scan")}>Scan</button>
          <button className="active">History</button>
        </nav>
      </div>

      <div className="history-content">
        <h2>Scan History</h2>

        {history.length === 0 ? (
          <p className="no-history">No history records found.</p>
        ) : (
          <div className="history-grid">
            {history
              .slice()
              .reverse()
              .map((item, index) => (
                <div key={index} className="history-card">
                  {item.image_path && (
                    <img
                      src={`http://127.0.0.1:5000/${item.image_path}`}
                      alt="Leaf"
                      className="history-image"
                    />
                  )}
                  <div className="history-info">
                    <h3>{item.disease}</h3>
                    <p>
                      <strong>Confidence:</strong> {item.confidence}%
                    </p>
                    <p>
                      <strong>Recommendation:</strong> {item.recommendation}
                    </p>
                    <p>
                      <strong>Date:</strong> {item.timestamp}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
