import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HistoryPage.css";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(null); // 'selected' | 'all'
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
          <button onClick={() => setLogoutOpen(true)}>Log Out</button>
          <button onClick={() => navigate("/scan")}>Scan</button>
          <button className="active">History</button>
        </nav>
      </div>

      <div className="history-content">
        {(() => {
          const q = query.trim().toLowerCase();
          const visibleHistory = history
            .slice()
            .reverse()
            .filter((item) => {
              if (!q) return true;
              const hay = `${item.disease || ""} ${item.recommendation || ""} ${item.timestamp || ""}`.toLowerCase();
              return hay.includes(q);
            });

          const allVisibleSelected =
            visibleHistory.length > 0 &&
            visibleHistory.every((it) => selected.has(it.timestamp));

          const toggleSelect = (ts) => {
            setSelected((prev) => {
              const next = new Set(prev);
              if (next.has(ts)) next.delete(ts);
              else next.add(ts);
              return next;
            });
          };

          const toggleSelectAllVisible = () => {
            setSelected((prev) => {
              const next = new Set(prev);
              if (allVisibleSelected) {
                visibleHistory.forEach((it) => next.delete(it.timestamp));
              } else {
                visibleHistory.forEach((it) => next.add(it.timestamp));
              }
              return next;
            });
          };

          const openDelete = (mode) => {
            setDeleteMode(mode);
            setDeleteOpen(true);
          };

          const confirmDelete = async () => {
            try {
              if (deleteMode === "all") {
                // Optional backend call if available
                try {
                  await fetch("http://127.0.0.1:5000/history/clear", { method: "POST" });
                } catch (_) {}
                setHistory([]);
                setSelected(new Set());
              } else if (deleteMode === "selected") {
                const toDelete = Array.from(selected);
                if (toDelete.length === 0) return;
                // Optional backend call if available
                try {
                  await fetch("http://127.0.0.1:5000/history/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ timestamps: toDelete }),
                  });
                } catch (_) {}
                setHistory((prev) => prev.filter((it) => !selected.has(it.timestamp)));
                setSelected(new Set());
              }
            } finally {
              setDeleteOpen(false);
              setDeleteMode(null);
            }
          };

          return (
            <>
              <div className="history-toolbar">
                <h2>Scan History</h2>
                <div className="history-controls">
                  <input
                    className="history-search"
                    type="text"
                    placeholder="Search history..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <label className="select-all">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                    />
                    <span>Select all</span>
                  </label>
                  <button
                    className="danger"
                    disabled={selected.size === 0}
                    onClick={() => openDelete("selected")}
                  >
                    Delete Selected
                  </button>
                  <button
                    className="danger"
                    disabled={history.length === 0}
                    onClick={() => openDelete("all")}
                  >
                    Delete All
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="no-history">No history records found.</p>
              ) : (
                <div className="history-grid">
                  {visibleHistory.map((item, index) => (
                    <div key={index} className="history-card">
                      <div className="card-header">
                        <label>
                          <input
                            type="checkbox"
                            checked={selected.has(item.timestamp)}
                            onChange={() => toggleSelect(item.timestamp)}
                          />
                          <span>Select</span>
                        </label>
                      </div>
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

              {deleteOpen && (
                <div className="modal-backdrop">
                  <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>Confirm Delete</h2>
                    <p>
                      {deleteMode === "all"
                        ? "This will permanently delete all scans."
                        : `Delete ${selected.size} selected scan(s)?`}
                    </p>
                    <div className="modal-actions">
                      <button className="btn-outline" type="button" onClick={() => setDeleteOpen(false)}>
                        Cancel
                      </button>
                      <button className="btn-primary" type="button" onClick={confirmDelete}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

      </div>
      {logoutOpen && (
        <div className="modal-backdrop">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Log out</h2>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button
                className="btn-outline"
                type="button"
                onClick={() => setLogoutOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={() => {
                  setLogoutOpen(false);
                  navigate("/");
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

