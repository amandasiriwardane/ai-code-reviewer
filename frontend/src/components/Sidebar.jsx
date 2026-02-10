import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../api/config";
import "../styles/sidebar.css";
import api from "../api/config";

export default function Sidebar({ onSelect, currentId, triggerRefresh, isSidebarOpen }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
  setLoading(true);
  try {
    // No headers needed here anymore! The interceptor handles it.
    const res = await api.get("/api/review/history");
    setHistory(res.data);
  } catch (err) {
    console.error("History fetch failed:", err);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, triggerRefresh]);

  return (
    <aside className={`sidebar-card ${isSidebarOpen ? "expanded" : "collapsed"}`}>
      {/* 1. Only render the list if the sidebar is expanded */}
      {isSidebarOpen && (
        <>
          <div className="sidebar-header">
            <h3>Recent Reviews</h3>
            {loading && <span className="loading-spinner">...</span>}
          </div>

          <div className="history-container">
            {history.length === 0 && !loading ? (
              <p className="empty-msg">No reviews yet.</p>
            ) : (
              history.map((item) => (
                <div 
                  key={item._id} 
                  className={`history-item ${currentId === item._id ? 'active' : ''}`}
                  onClick={() => onSelect(item)}
                >
                  <div className="history-info">
                    <span className="lang-label">{item.language}</span>
                    <span className="time-label">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="code-hint">
                    {item.code.replace(/\n/g, ' ').substring(0, 35)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </aside>
  );
}