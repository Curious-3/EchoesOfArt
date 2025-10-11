import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import toast, { Toaster } from "react-hot-toast";

const MyUploads = ({ searchTerm }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

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

  useEffect(() => {
    fetchUserUploads();
  }, []);

  const fetchUserUploads = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("No token found. Please login.");
        return;
      }

      const res = await axios.get(
        "https://echoesofart-backend.onrender.com/api/posts/user/my-uploads",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching uploads:", err.response?.data || err.message);
      toast.error("Failed to fetch uploads.");
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditData({ title: post.title, description: post.description });
  };

  const handleUpdate = async (id) => {
    try {
      const token = getToken();
      await axios.put(`https://echoesofart-backend.onrender.com/api/posts/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingPostId(null);
      fetchUserUploads();
      toast.success("Post updated successfully!");
    } catch (err) {
      console.error("Error updating post:", err.response?.data || err.message);
      toast.error("Failed to update post.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`https://echoesofart-backend.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserUploads();
      toast.success("Post deleted successfully!");
    } catch (err) {
      console.error("Error deleting post:", err.response?.data || err.message);
      toast.error("Failed to delete post.");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const term = searchTerm?.toLowerCase() || "";
    const inTitle = post.title?.toLowerCase().includes(term);
    const inDescription = post.description?.toLowerCase().includes(term);
    const inTags = post.tags?.some((tag) => tag.toLowerCase().includes(term));
    return inTitle || inDescription || inTags;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">My Uploaded Art</h2>

      {filteredPosts.length === 0 ? (
        <p className="text-center text-gray-500">No uploads found!</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              {post.mediaType === "image" && post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              {post.mediaType === "video" && post.mediaUrl && (
                <video
                  src={post.mediaUrl}
                  controls
                  className="w-full h-48 object-cover"
                  poster={post.thumbnailUrl || ""}
                />
              )}

              {editingPostId === post._id ? (
                <div className="p-4 flex flex-col gap-2">
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    placeholder="Title"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
                    placeholder="Description"
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(post._id)}
                      className="flex-1 bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="flex-1 bg-gray-300 rounded-md py-2 hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-lg font-medium text-gray-800">{post.title}</h3>
                  <p className="text-sm text-gray-600">{post.description}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 bg-yellow-400 text-white rounded-md py-1 hover:bg-yellow-500 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="flex-1 bg-red-500 text-white rounded-md py-1 hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default MyUploads;
