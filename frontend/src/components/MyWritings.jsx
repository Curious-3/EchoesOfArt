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
        const res = await axios.get("http://localhost:8000/api/writing/my-writings", {
          headers: { Authorization: `Bearer ${userToken}` },
        });
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
    // Save the writing data temporarily so WritingEditor can load it
    localStorage.setItem("editingWriting", JSON.stringify(writing));
    navigate("/writing"); // Go to editor page
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>My Writings</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("draft")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "draft" ? "#2196f3" : "#ddd",
            color: activeTab === "draft" ? "#fff" : "#000",
          }}
        >
          Drafts
        </button>

        <button
          onClick={() => setActiveTab("published")}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            backgroundColor: activeTab === "published" ? "#4caf50" : "#ddd",
            color: activeTab === "published" ? "#fff" : "#000",
          }}
        >
          Published
        </button>
      </div>

      {loading ? (
        <p>Loading writings...</p>
      ) : filteredWritings.length === 0 ? (
        <p style={{ textAlign: "center" }}>No {activeTab} writings found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredWritings.map((w) => (
            <li
              key={w._id}
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
              onClick={() => handleEdit(w)}
            >
              <h3 style={{ marginBottom: "5px" }}>{w.title}</h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: w.content.slice(0, 150) + "...",
                }}
              />
              <small>Status: {w.status}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyWritings;
