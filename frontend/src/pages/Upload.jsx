import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user)
    return (
      <p className="text-center mt-10 text-red-500">
        Please login to upload media.
      </p>
    );

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      const parsed = JSON.parse(storedUser);
      return parsed.token || localStorage.getItem("token");
    } catch {
      return localStorage.getItem("token");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !mediaFile) {
      setError("Title and media file are required.");
      return;
    }

    if ((mediaType === "video" || mediaType === "audio") && !thumbnail) {
      setError("Thumbnail is required for video and audio.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mediaType", mediaType);
    formData.append("tags", tags);
    formData.append("category", category);
    formData.append("file", mediaFile);
    if (thumbnail) formData.append("thumbnail", thumbnail);

    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError("You are not authorized. Please login again.");
        return;
      }

      await axios.post("http://localhost:8000/api/posts/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="pb-32">   {/* ← added to prevent footer overlap */}
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-md shadow-sm sm:mt-12 sm:p-8">
      <h2 className="text-center text-xl font-semibold mb-6">Upload Media</h2>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col text-sm font-medium">
          Title*:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col text-sm font-medium">
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col text-sm font-medium">
          Media File*:
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMediaFile(e.target.files[0])}
            required
            className="mt-1"
          />
        </label>

        <label className="flex flex-col text-sm font-medium">
          Media Type*:
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </label>

        {(mediaType === "video" || mediaType === "audio") && (
          <label className="flex flex-col text-sm font-medium">
            Thumbnail*:
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              required
              className="mt-1"
            />
          </label>
        )}

        <label className="flex flex-col text-sm font-medium">
          Tags (comma separated):
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <label className="flex flex-col text-sm font-medium">
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 py-2 rounded-md font-medium text-white ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  </div>
);

};

export default Upload;
