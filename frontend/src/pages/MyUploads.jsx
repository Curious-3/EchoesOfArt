// MyUploads.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import "./../styles/MyUploads.css";

const MyUploads = ({ searchTerm }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchUserUploads();
  }, []);

  const fetchUserUploads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:8000/api/posts/user/my-uploads",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching uploads:", err);
    }
  };

  // Filter posts based on searchTerm
  const filteredPosts = posts.filter((post) => {
    const term = searchTerm.toLowerCase();
    const inTitle = post.title?.toLowerCase().includes(term);
    const inDescription = post.description?.toLowerCase().includes(term);
    const inTags = post.tags?.some((tag) => tag.toLowerCase().includes(term));
    return inTitle || inDescription || inTags;
  });

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditData({ title: post.title, description: post.description });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/posts/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      fetchUserUploads();
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserUploads();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <div className="uploads-page">
      <h2>My Uploaded Art</h2>
      {filteredPosts.length === 0 ? (
        <p>No uploads found!</p>
      ) : (
        filteredPosts.map((post) => (
          <div key={post._id} className="upload-card">
            {/* Render image/video */}
            {post.mediaType === "image" && post.mediaUrl && (
              <img src={post.mediaUrl} alt={post.title} className="upload-img" />
            )}
            {post.mediaType === "video" && post.mediaUrl && (
              <video
                src={post.mediaUrl}
                controls
                className="upload-img"
                poster={post.thumbnailUrl || ""}
              />
            )}

            {editingPostId === post._id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  placeholder="Title"
                />
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  placeholder="Description"
                ></textarea>
                <button onClick={() => handleUpdate(post._id)}>Save</button>
                <button onClick={() => setEditingPostId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="post-info">
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <button onClick={() => handleEdit(post)}>Edit</button>
                <button onClick={() => handleDelete(post._id)}>Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyUploads;
