import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import axios from "axios";

const WritingEditor = ({ userToken }) => {
  const { quill, quillRef } = useQuill();
  const [title, setTitle] = useState("");
  const [writingId, setWritingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const finalToken = userToken || storedUser?.token;

  console.log("FINAL TOKEN:", finalToken);

 useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("editingWriting") || "null");
    if (stored && quill) {
      setTitle(stored.title);
      setWritingId(stored._id);
      quill.root.innerHTML = stored.content;
      setTimeout(() => {
  localStorage.removeItem("editingWriting");
}, 100);

    }
  }, [quill]);

  const saveDraft = async () => {
    if (!finalToken) {
      toast.error("Login required!");
      return;
    }

    const content = quill?.root?.innerHTML;
    if (!title && !content?.trim()) {
      toast.error("Nothing to save!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/writing/save",
        { writingId, title, content, status: "draft" },
        { headers: { Authorization: `Bearer ${finalToken}` } }
      );

      setWritingId(res.data.writing._id);
      toast.success("Draft saved!");
    } catch (err) {
  console.error(err);

  if (err.response?.status === 401) {
    toast.error("Session expired. Please login again.");
    localStorage.removeItem("user");
    return;
  }

  toast.error("Failed to save");
}
finally {
      setLoading(false);
    }
  };

  const publishWriting = async () => {
    if (!finalToken) return toast.error("Login first!") ;

    const content = quill?.root?.innerHTML;
    if (!title || !content?.trim()) {
      return toast.error("Fill title & content!");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/writing/save",
        { writingId, title, content, status: "published" },
        { headers: { Authorization: `Bearer ${finalToken}` } }
      );

      setWritingId(res.data.writing._id);
      toast.success("Published!");
    }catch (err) {
  console.error(err);

  if (err.response?.status === 401) {
    toast.error("Session expired. Please login again.");
    localStorage.removeItem("user");
    return;
  }

  toast.error("Failed to publish");
}
finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md mx-auto">
      <input
        type="text"
        placeholder="Enter title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-3 border rounded-md text-lg"
      />

      <div ref={quillRef} className="h-96 bg-white border rounded-md" />

      <div className="mt-4 flex gap-3">
        <button
          onClick={saveDraft}
          disabled={loading}
          className="px-4 py-2 bg-gray-300 rounded-md"
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>

        <button
          onClick={publishWriting}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default WritingEditor;
