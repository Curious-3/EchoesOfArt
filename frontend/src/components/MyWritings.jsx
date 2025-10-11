import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyWritings = () => {
  const [writings, setWritings] = useState([]);
  const [activeTab, setActiveTab] = useState("draft");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userToken = user?.token;

  useEffect(() => {
    if (!userToken) {
      toast.error("Please log in to see your writings.");
      return;
    }

    const fetchWritings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8000/api/writing/my-writings",
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        setWritings(res.data.writings);
      } catch (err) {
        console.error("Error fetching writings:", err);
        toast.error("Failed to load writings");
      } finally {
        setLoading(false);
      }
    };

    fetchWritings();
  }, [userToken]);

  const filteredWritings = writings.filter((w) => w.status === activeTab);

  const handleEdit = (writing) => {
    localStorage.setItem("editingWriting", JSON.stringify(writing));
    navigate("/writing"); // Go to editor page
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>My Writings</h2>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {["draft", "published"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              backgroundColor:
                activeTab === tab ? (tab === "draft" ? "#2196f3" : "#4caf50") : "#ddd",
              color: activeTab === tab ? "#fff" : "#000",
              transition: "all 0.3s",
            }}
          >
            {tab === "draft" ? "Drafts" : "Published"}
          </button>
        ))}
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Loading writings...</p>
      ) : filteredWritings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No {activeTab} writings found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredWritings.map((w) => (
            <li
              key={w._id}
              onClick={() => handleEdit(w)}
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
              }}
            >
              <h3 style={{ marginBottom: "5px" }}>{w.title}</h3>

              {/* Single-line preview for drafts */}
              <p
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: "5px",
                  color: "#555",
                  fontSize: "14px",
                }}
              >
                {w.content.replace(/<[^>]+>/g, "")}
              </p>

              <small>Status: {w.status}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyWritings;
