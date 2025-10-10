import React, { useState } from "react";
import toast from "react-hot-toast";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import axios from "axios";

const WritingEditor = () => {
  const { quill, quillRef } = useQuill();
  const [title, setTitle] = useState("");
  const [writingId, setWritingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userToken = user?.token;

  //  Save Draft (manual only)
  const saveDraft = async (title, content) => {
    if (!userToken) {
      toast.error("You must be logged in to save a draft!");
      return;
    }

    if (!title && !content?.trim()) {
      toast.error("Please write something before saving!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/writing/save",
        { writingId, title, content, status: "draft" },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWritingId(res.data._id);
      toast.success("Draft saved!");
    } catch (err) {
      console.error("Error saving draft:", err);
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  //  Publish Writing
  const publishWriting = async () => {
    if (!userToken) {
      toast.error("You must be logged in to publish!");
      return;
    }

    const content = quill?.root?.innerHTML;
    if (!title || !content?.trim()) {
      toast.error("Please complete your writing first!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/writing/save",
        { writingId, title, content, status: "published" },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setWritingId(res.data._id);
      toast.success("Writing published successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish writing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <input
        type="text"
        placeholder="Enter title here..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "10px",
          padding: "10px",
          fontSize: "16px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <div
        ref={quillRef}
        style={{
          height: "400px",
          background: "#fff",
          borderRadius: "6px",
          border: "1px solid #ddd",
        }}
      />

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => {
            const content = quill?.root?.innerHTML;
            saveDraft(title, content);
          }}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ccc",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Save as Draft"}
        </button>

        <button
          onClick={publishWriting}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default WritingEditor;
