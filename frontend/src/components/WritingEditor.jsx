import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import axios from "axios";

/* 🔥 GRADIENT OPTIONS */
const GRADIENTS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #ff758c, #ff7eb3)",
  "linear-gradient(135deg, #43cea2, #185a9d)",
  "linear-gradient(135deg, #f7971e, #ffd200)",
  "linear-gradient(135deg, #232526, #414345)",
];

const CATEGORIES = [
  "Poetry",
  "Story",
  "Thoughts",
  "Love",
  "Life",
  "Motivation",
  "Sad / Healing",
  "Spiritual",
];

const WritingEditor = ({ userToken }) => {
  const { quill, quillRef } = useQuill();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [writingId, setWritingId] = useState(null);
  const [loading, setLoading] = useState(false);

    // AI TAGS
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loadingTags, setLoadingTags] = useState(false);

  // 🎨 background gradient
  const [bgStyle, setBgStyle] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const finalToken = userToken || storedUser?.token;

  /* ================= LOAD EDIT MODE ================= */
  useEffect(() => {
    if (!quill) return;

    const stored = JSON.parse(localStorage.getItem("editingWriting") || "null");
    if (!stored) return;

    setTitle(stored.title || "");
    setCategory(stored.category || "");
    setWritingId(stored._id || null);
    setTags(stored.tags || []);

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(stored.content || "", "text/html");

      const bgWrapper = doc.querySelector(".writing-bg");
      if (bgWrapper) {
        setBgStyle(bgWrapper.style.background || "");
        quill.root.innerHTML = bgWrapper.innerHTML;
      } else {
        quill.root.innerHTML = stored.content || "";
      }
    } catch {
      quill.root.innerHTML = stored.content || "";
    }

    localStorage.removeItem("editingWriting");
  }, [quill]);

  /* ================= HELPER ================= */
  const buildContentWithBg = () => {
    const innerHTML = quill?.root?.innerHTML || "";
    return `
      <div class="writing-bg" style="background:${bgStyle}; padding:16px;">
        ${innerHTML}
      </div>
    `;
  };

  const extractBgFromContent = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.querySelector(".writing-bg")?.style.background || "";
    } catch {
      return "";
    }
  };


    /* ================= 🤖 GENERATE TAGS (GEMINI) ================= */
  const generateTags = async () => {
    if (!title && !quill?.root?.innerText?.trim()) {
      return toast.error("Write something before generating tags");
    }

    try {
      setLoadingTags(true);

      const res = await axios.post(
        "http://localhost:8000/api/writing/generate-tags",
        {
          title,
          content: quill.root.innerText,
        },
        {
          headers: { Authorization: `Bearer ${finalToken}` },
        }
      );

      if (res.data?.tags) {
        setTags(res.data.tags);
        toast.success("AI tags generated");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate tags");
    } finally {
      setLoadingTags(false);
    }
  };


  /* ================= SAVE DRAFT ================= */
  const saveDraft = async () => {
    if (!finalToken) return toast.error("Login required!");
    if (!category) return toast.error("Please select a category");

    const content = buildContentWithBg();
    if (!title && !content.trim()) {
      return toast.error("Nothing to save!");
    }

    try {
      setLoading(true);

      const safeBgStyle = bgStyle || extractBgFromContent(content);

      const res = await axios.post(
        "http://localhost:8000/api/writing/save",
        {
          writingId,
          title,
          content,
          category,
          tags,
          bgStyle: safeBgStyle,
          status: "draft",
        },
        {
          headers: { Authorization: `Bearer ${finalToken}` },
        }
      );

      setWritingId(res.data.writing._id);
      toast.success("Draft saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PUBLISH ================= */
  const publishWriting = async () => {
    if (!finalToken) return toast.error("Login first!");
    if (!category) return toast.error("Please select a category");

    const content = buildContentWithBg();
    if (!title || !content.trim()) {
      return toast.error("Fill title & content!");
    }

    try {
      setLoading(true);

      const safeBgStyle = bgStyle || extractBgFromContent(content);

      const res = await axios.post(
        "http://localhost:8000/api/writing/save",
        {
          writingId,
          title,
          content,
          category,
          tags,
          bgStyle: safeBgStyle,
          status: "published",
        },
        {
          headers: { Authorization: `Bearer ${finalToken}` },
        }
      );

      setWritingId(res.data.writing._id);
      toast.success("Published!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 rounded-lg shadow-md bg-transparent">
      {/* TITLE */}
      <input
        type="text"
        placeholder="Enter title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-3 border rounded-md text-lg"
      />

      {/* CATEGORY */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full mb-4 p-3 border rounded-md"
      >
        <option value="">Select Category *</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>


      {/* 🏷️ TAGS */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-medium">Tags</h3>
          <button
            type="button"
            onClick={generateTags}
            disabled={loadingTags}
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md"
          >
            {loadingTags ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        {/* TAG CHIPS */}
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() =>
                  setTags(tags.filter((_, i) => i !== index))
                }
                className="text-xs text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* ADD CUSTOM TAG */}
        <input
          type="text"
          placeholder="Add custom tag & press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              e.preventDefault();
              setTags([...new Set([...tags, tagInput.toLowerCase()])]);
              setTagInput("");
            }
          }}
          className="w-full p-2 border rounded-md text-sm"
        />
      </div>


      {/* 🎨 GRADIENT PICKER */}
      <div className="flex gap-3 mb-4">
        {GRADIENTS.map((g, i) => (
          <button
            key={i}
            onClick={() => setBgStyle(g)}
            className={`w-14 h-14 rounded-lg border-2 transition ${
              bgStyle === g ? "border-blue-500 scale-105" : "border-gray-300"
            }`}
            style={{ background: g }}
          />
        ))}
      </div>

      {/* ✍️ EDITOR */}
      <div
        className="rounded-xl p-4 min-h-[350px] border"
        style={{ background: bgStyle || "#ffffff" }}
      >
        <div ref={quillRef} style={{ minHeight: "300px" }} />
      </div>

      {/* ACTIONS */}
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
