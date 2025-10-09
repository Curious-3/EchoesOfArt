import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaBookmark, FaRegBookmark, FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";

const LandingPage = ({ searchTerm }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arts, setArts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [user, setUser] = useState(null);

  // Filter toggle state
  const filterOptions = ["all", "image", "video"];
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);

    // Fetch all posts
    axios
      .get("http://localhost:8000/api/posts")
      .then((res) => setArts(res.data))
      .catch((err) => console.error("Error fetching arts:", err));

    if (loggedUser?.id && loggedUser?.token) {
      // Fetch saved posts
      axios
        .get(`http://localhost:8000/api/saved/${loggedUser.id}`, {
          headers: { Authorization: `Bearer ${loggedUser.token}` },
        })
        .then((res) => {
          const savedIds = [
            ...(res.data.images || []).map((p) => p._id),
            ...(res.data.videos || []).map((p) => p._id),
            ...(res.data.audios || []).map((p) => p._id),
          ];
          setSavedPosts(savedIds);
        })
        .catch((err) => console.error("Error fetching saved posts:", err));

      // Fetch liked posts
      axios
        .get(`http://localhost:8000/api/liked/${loggedUser.id}`, {
          headers: { Authorization: `Bearer ${loggedUser.token}` },
        })
        .then((res) => {
          const likedIds = res.data.map((p) => p.post._id || p.post);
          setLikedPosts(likedIds);
        })
        .catch((err) => console.error("Error fetching liked posts:", err));
    }
  }, []);

  // Toggle filter: all → image → video → all
  const handleToggleFilter = () => {
    const currentIndex = filterOptions.indexOf(filterType);
    const nextIndex = (currentIndex + 1) % filterOptions.length;
    setFilterType(filterOptions[nextIndex]);
  };

  // Update filtered arts based on search term + filter type
  const filteredArts = arts.filter((art) => {
    const matchesSearch = art.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterType === "all") return matchesSearch;
    return matchesSearch && art.mediaType?.toLowerCase() === filterType;
  });

  const handleToggleSavePost = async (postId) => {
    if (!user?.token) {
      alert("Please login first to save the post!");
      return;
    }
    try {
      if (savedPosts.includes(postId)) {
        await axios.post(
          "http://localhost:8000/api/saved/remove",
          { postId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSavedPosts(savedPosts.filter((id) => id !== postId));
      } else {
        await axios.post(
          "http://localhost:8000/api/saved/add",
          { postId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSavedPosts([...savedPosts, postId]);
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      alert("Failed to save/unsave post.");
    }
  };

  const handleToggleLikePost = async (postId) => {
    if (!user?.token) {
      alert("Please login first to like the post!");
      return;
    }
    try {
      if (likedPosts.includes(postId)) {
        await axios.post(
          "http://localhost:8000/api/liked/remove",
          { postId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setLikedPosts(likedPosts.filter((id) => id !== postId));
        setArts(
          arts.map((art) =>
            art._id === postId
              ? { ...art, likeCount: (art.likeCount || 1) - 1 }
              : art
          )
        );
      } else {
        await axios.post(
          "http://localhost:8000/api/liked/add",
          { postId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setLikedPosts([...likedPosts, postId]);
        setArts(
          arts.map((art) =>
            art._id === postId
              ? { ...art, likeCount: (art.likeCount || 0) + 1 }
              : art
          )
        );
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Failed to like/unlike post.");
    }
  };

  // Button text based on current filter
  const buttonText =
    filterType === "all"
      ? "Show Images Only"
      : filterType === "image"
      ? "Show Videos Only"
      : "Show All Posts";

  return (
    <>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`transition-all duration-500 min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f9fbff] to-[#eef2ff] flex flex-col items-center ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <div className="w-full text-center mt-24 mb-6">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
            Featured Artworks
          </h2>
          <div className="w-24 h-1 mt-4 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto rounded-full shadow-lg"></div>
        </div>

        {/* Toggle Filter Button */}
        <div className="mb-6 text-center">
          <button
            onClick={handleToggleFilter}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition"
          >
            {buttonText}
          </button>
        </div>

        {/* Art Grid */}
        <div className="w-full max-w-7xl px-6 md:px-10 grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24">
          {filteredArts.length > 0 ? (
            filteredArts.map((art) => (
              <div
                key={art._id}
                className="relative group bg-white/60 backdrop-blur-lg rounded-2xl overflow-hidden shadow-[0_6px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.15)] hover:-translate-y-2"
              >
                {/* Media */}
                {art.mediaType === "image" && art.mediaUrl && (
                  <img
                    src={art.mediaUrl}
                    alt={art.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                {art.mediaType === "video" && art.mediaUrl && (
                  <video
                    src={art.mediaUrl}
                    controls
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    poster={art.thumbnailUrl || ""}
                  />
                )}
                {art.mediaType === "audio" && art.mediaUrl && (
                  <div className="p-4 bg-gray-100">
                    <audio src={art.mediaUrl} controls className="w-full" />
                  </div>
                )}

                {/* Buttons overlay */}
                <div className="absolute top-2 right-2 flex space-x-2 items-center">
                  {/* Save button */}
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      user
                        ? "text-white bg-black/40 hover:bg-black/60"
                        : "text-gray-400 bg-gray-200 cursor-pointer hover:bg-gray-300"
                    }`}
                    onClick={() => handleToggleSavePost(art._id)}
                  >
                    {savedPosts.includes(art._id) ? (
                      <FaBookmark size={20} />
                    ) : (
                      <FaRegBookmark size={20} />
                    )}
                  </button>

                  {/* Like button with count */}
                  <button
                    className={`p-2 rounded-full flex items-center space-x-1 transition-colors ${
                      user
                        ? "text-white bg-black/40 hover:bg-black/60"
                        : "text-gray-400 bg-gray-200 cursor-pointer hover:bg-gray-300"
                    }`}
                    onClick={() => handleToggleLikePost(art._id)}
                  >
                    {likedPosts.includes(art._id) ? (
                      <FaHeart size={20} className="text-red-500" />
                    ) : (
                      <FaRegHeart size={20} />
                    )}
                    <span className="text-sm text-white ml-1">
                      {art.likeCount || 0}
                    </span>
                  </button>
                </div>

                {/* Card Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {art.title}
                  </h3>
                  {art.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {art.description}
                    </p>
                  )}

                  {/* Tags */}
                  {art.tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {art.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category */}
                  {art.category && (
                    <p className="mt-2 text-sm font-medium text-gray-700">
                      Category:{" "}
                      <span className="text-indigo-600">{art.category}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 text-lg font-medium">
              No artworks found 🎨
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default LandingPage;
