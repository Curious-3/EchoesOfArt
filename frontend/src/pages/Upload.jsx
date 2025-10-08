import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import "./../styles/Upload.css";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return <p>Please login to upload media.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !mediaFile) {
      setError("Title and media file are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mediaType", mediaType);
    formData.append("tags", tags);
    formData.append("category", category);
    formData.append("file", mediaFile);

    try {
      setLoading(true);

      //   Token ko localStorage se lo
      const token = localStorage.getItem("token");
      console.log("Token being sent:", token); // Debug ke liye

      const res = await axios.post("http://localhost:8000/api/posts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Post created:", res.data);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Media</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Title*:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label>
          Media File*:
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMediaFile(e.target.files[0])}
            required
          />
        </label>

        <label>
          Media Type*:
          <select value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </label>

        <label>
          Tags (comma separated):
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>

        <label>
          Category:
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default Upload;
