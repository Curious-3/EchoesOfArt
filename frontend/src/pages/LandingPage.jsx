import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaBookmark, FaRegBookmark, FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import CommentSection from "../components/CommentSection";


const LandingPage = ({ searchTerm = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arts, setArts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [followLoading, setFollowLoading] = useState(new Set());

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
          const likedIds = res.data
            .filter((p) => p?.post && (p?.post._id || p?.post))
            .map((p) => p.post._id || p.post);
          setLikedPosts(likedIds);
        })
        .catch((err) => console.error("Error fetching liked posts:", err));
    }
  }, []);

  const handleToggleFilter = () => {
    const currentIndex = filterOptions.indexOf(filterType);
    const nextIndex = (currentIndex + 1) % filterOptions.length;
    setFilterType(filterOptions[nextIndex]);
  };

  const filteredArts = arts.filter((art) => {
    const matchesSearch = art.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filterType === "all") return matchesSearch;
    return matchesSearch && art.mediaType?.toLowerCase() === filterType;
  });

  const handleToggleSavePost = async (postId) => {
    if (!user?.token)
      return toast.error("Please login first to save the post!");
    try {
      const isSaved = savedPosts.includes(postId);
      setSavedPosts((prev) =>
        isSaved ? prev.filter((id) => id !== postId) : [...prev, postId]
      );

      const url = isSaved
        ? "http://localhost:8000/api/saved/remove"
        : "http://localhost:8000/api/saved/add";
      await axios.post(
        url,
        { postId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success(
        isSaved ? "Post removed from saved!" : "Post saved successfully!"
      );
    } catch (err) {
      console.error("Error toggling save:", err);
      toast.error("Failed to save/unsave post.");
    }
  };

  const handleToggleLikePost = async (postId) => {
    if (!user?.token)
      return toast.error("Please login first to like the post!");
    try {
      const isLiked = likedPosts.includes(postId);
      setLikedPosts((prev) =>
        isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
      );
      setArts((prevArts) =>
        prevArts.map((art) =>
          art._id === postId
            ? { ...art, likeCount: (art.likeCount || 0) + (isLiked ? -1 : 1) }
            : art
        )
      );

      const url = isLiked
        ? "http://localhost:8000/api/liked/remove"
        : "http://localhost:8000/api/liked/add";
      await axios.post(
        url,
        { postId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success(isLiked ? "You unliked the post 💔" : "Post liked ❤️");
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error("Failed to like/unlike post.");
    }
  };

  // ---------- FOLLOW LOGIC ----------
  const asString = (id) => {
    if (id === undefined || id === null) return "";
    return typeof id === "string" ? id : String(id);
  };

  const getLoggedId = () => asString(user?._id || user?.id);

  const isFollowing = (art) => {
    const followers = art?.createdBy?.followers || art?.owner?.followers || [];
    const loggedId = getLoggedId();
    return followers.map(asString).includes(loggedId);
  };

  const handleFollowUser = async (creatorIdRaw, artIndex) => {
    if (!user?.token) return toast.error("Please login to follow users!");

    const creatorId = asString(creatorIdRaw?._id || creatorIdRaw);
    if (!creatorId) return toast.error("Invalid creator id");

    const loggedId = getLoggedId();
    const art = arts[artIndex];
    if (!art) return toast.error("Invalid art index");

    const followers = (art.createdBy?.followers || []).map(asString);
    const currentlyFollowing = followers.includes(loggedId);

    if (followLoading.has(creatorId)) return;

    // optimistic UI
    setArts((prevArts) => {
      const updatedArts = [...prevArts];
      const target = updatedArts[artIndex];
      if (!target) return prevArts;

      const oldFollowers = (target.createdBy?.followers || []).map(asString);
      target.createdBy = { ...(target.createdBy || {}) };
      target.createdBy.followers = currentlyFollowing
        ? oldFollowers.filter((id) => id !== loggedId)
        : [...oldFollowers, loggedId];
      return updatedArts;
    });

    setFollowLoading((prev) => new Set(prev).add(creatorId));

    try {
      const endpoint = currentlyFollowing
        ? `http://localhost:8000/api/auth/unfollow/${creatorId}`
        : `http://localhost:8000/api/auth/follow/${creatorId}`;

      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      toast.success(
        currentlyFollowing
          ? "Unfollowed user successfully!"
          : "Followed user successfully!"
      );
    } catch (err) {
      console.error("Follow/Unfollow error:", err);
      toast.error(err.response?.data?.message || "Failed to follow/unfollow user");
    } finally {
      setFollowLoading((prev) => {
        const copy = new Set(prev);
        copy.delete(creatorId);
        return copy;
      });
    }
  };

  const buttonText =
    filterType === "all"
      ? "Show Images Only"
      : filterType === "image"
      ? "Show Videos Only"
      : "Show All Posts";

  return (
    <>
      <Toaster position="top-right" />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`transition-all duration-300 flex flex-col items-center bg-[#f0f9ff] min-h-screen w-full ${
          sidebarOpen ? "ml-64" : "ml-20"
        } md:ml-20 sm:ml-0`}
      >
        {/* Title */}
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

        {/* Posts Grid */}
        <div className="w-full max-w-[1300px] px-4 md:px-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24">
          {filteredArts.length > 0 ? (
            filteredArts.map((art, index) => {
              const creatorId = asString(art.createdBy?._id || art.createdBy);
              const loggedId = getLoggedId();
              const cannotFollowSelf = creatorId && creatorId === loggedId;
              const following = isFollowing(art);
              const isLoading = followLoading.has(creatorId);

              return (
                <div
                  key={art._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 relative"
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

                  {/* Follow Button */}
                  {art.createdBy && user && !cannotFollowSelf && (
                    <div className="absolute top-2 left-2 z-20">
                      <button
                        onClick={() =>
                          handleFollowUser(art.createdBy._id || art.createdBy, index)
                        }
                        disabled={isLoading}
                        className={`px-3 py-1 text-xs rounded-full transition ${
                          following
                            ? "bg-gray-300 text-gray-800 hover:bg-gray-400"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {isLoading
                          ? following
                            ? "Unfollowing..."
                            : "Following..."
                          : following
                          ? "Unfollow"
                          : "Follow"}
                      </button>
                    </div>
                  )}

                  {/* Save & Like Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col items-end space-y-2 z-10">
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
                      <span className="text-white text-sm ml-1">
                        {art.likeCount || 0}
                      </span>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-3">
                    <h3 className="text-indigo-900 font-semibold text-lg">
                      {art.title}
                    </h3>
                    {art.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {art.description}
                      </p>
                    )}
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
                    {art.category && (
                      <p className="mt-2 text-sm font-medium text-gray-700">
                        Category:{" "}
                        <span className="text-indigo-600">{art.category}</span>
                      </p>
                    )}
                  </div>

                  {/* ✅ Comment Section */}
                  <div className="p-3 border-t bg-gray-50">
                    <CommentSection postId={art._id} />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-600 text-center col-span-full">
              No posts found.
            </p>
          )}
        </div>
      </main>
    </>
  );
};
export default LandingPage;
