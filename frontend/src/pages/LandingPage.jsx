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
      .get("https://echoesofart-backend.onrender.com/api/posts")
      .then((res) => setArts(res.data))
      .catch((err) => console.error("Error fetching arts:", err));

    if (loggedUser?.id && loggedUser?.token) {
      // Fetch saved posts
      axios
        .get(`https://echoesofart-backend.onrender.com/api/saved/${loggedUser.id}`, {
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
        .get(`https://echoesofart-backend.onrender.com/api/liked/${loggedUser.id}`, {
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
          "https://echoesofart-backend.onrender.com/api/saved/remove",
          { postId },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSavedPosts(savedPosts.filter((id) => id !== postId));
      } else {
        await axios.post(
          "https://echoesofart-backend.onrender.com/api/saved/add",
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
          "https://echoesofart-backend.onrender.com/api/liked/remove",
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
          "https://echoesofart-backend.onrender.com/api/liked/add",
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
  className={`transition-all duration-300 flex flex-col items-center bg-[#f0f9ff] min-h-screen w-full ${
    sidebarOpen ? "ml-64" : "ml-20"
  } md:ml-20 sm:ml-0`}
>

  {/* Featured Works */}
  <div className="w-full flex flex-col items-center mt-[calc(var(--header-height)+50px)] mb-10">
    <h2 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-md">
      Featured Artworks
    </h2>
    <div className="w-24 h-1 mt-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg"></div>
  </div>

  {/* Filter Button */}
  <div className="mb-6">
    <button
      onClick={handleToggleFilter}
      className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition"
    >
      {buttonText}
    </button>
  </div>

  {/* Art Grid */}
  <div className="w-full max-w-[1300px] px-4 md:px-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24">
    {filteredArts.length > 0 ? (
      filteredArts.map((art) => (
        <div
          key={art._id}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
        >
          {/* Media */}
          {art.mediaType === "image" && (
            <img
              src={art.mediaUrl}
              alt={art.title}
              className="w-full h-56 object-cover"
            />
          )}
          {art.mediaType === "video" && (
            <video
              src={art.mediaUrl}
              controls
              className="w-full h-56 object-cover"
              poster={art.thumbnailUrl || ""}
            />
          )}
          {art.mediaType === "audio" && (
            <div className="p-4 bg-gray-100">
              <audio src={art.mediaUrl} controls className="w-full" />
            </div>
          )}

          {/* Card Content */}
          <div className="p-3">
            <h3 className="text-indigo-900 font-semibold text-lg">{art.title}</h3>
            {art.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{art.description}</p>
            )}

            {/* Tags */}
            {art.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
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
                Category: <span className="text-indigo-600">{art.category}</span>
              </p>
            )}
          </div>

          {/* Save & Like Buttons */}
          <div className="absolute top-2 right-2 flex space-x-2 items-center">
            <button
              className={`p-2 rounded-full transition-colors ${
                savedPosts.includes(art._id)
                  ? "bg-black/40 text-white hover:bg-black/60"
                  : "bg-gray-200 text-gray-400 hover:bg-gray-300"
              }`}
              onClick={() => handleToggleSavePost(art._id)}
            >
              {savedPosts.includes(art._id) ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button
              className={`p-2 rounded-full flex items-center space-x-1 transition-colors ${
                likedPosts.includes(art._id)
                  ? "bg-black/40 text-white hover:bg-black/60"
                  : "bg-gray-200 text-gray-400 hover:bg-gray-300"
              }`}
              onClick={() => handleToggleLikePost(art._id)}
            >
              {likedPosts.includes(art._id) ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
              <span className="text-white text-sm ml-1">{art.likeCount || 0}</span>
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="col-span-full text-center text-gray-500 font-medium text-lg">
        No artworks found 🎨
      </p>
    )}
  </div>
</main>

    </>
  );
};

export default LandingPage;
