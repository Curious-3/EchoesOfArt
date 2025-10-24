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

  // Save draft function
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

  // Publish writing function
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
    <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md mx-auto">
      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter title here..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-3 border rounded-md border-gray-300 text-lg"
      />

      {/* Quill Editor */}
      <div
        ref={quillRef}
        className="h-96 bg-white border rounded-md border-gray-300"
      />

      {/* Action Buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => saveDraft(title, quill?.root?.innerHTML)}
          disabled={loading}
          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
        >
          {loading ? "Saving..." : "Save as Draft"}
        </button>

        <button
          onClick={publishWriting}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default WritingEditor;
