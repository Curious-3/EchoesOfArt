import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { FaBookmark, FaRegBookmark, FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import CommentSection from "../components/CommentSection";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import LazyVideo from "../components/LazyVideo";
import { debounce } from "lodash";


const LandingPage = ({ searchTerm = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arts, setArts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [user, setUser] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const filterOptions = ["all", "image", "video"];
  const [filterType, setFilterType] = useState("all");

  // Fetch posts with pagination
  const fetchPosts = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/api/posts?page=${page}&limit=${limit}`
      );

      const newPosts = res.data.posts || [];

      // Prevent duplicate posts
      setArts((prev) => {
        const ids = new Set(prev.map((p) => p._id));
        const filtered = newPosts.filter((p) => !ids.has(p._id));
        return [...prev, ...filtered];
      });

      if (newPosts.length < limit) setHasMore(false);
    } catch (err) {
      console.error("Pagination error:", err);
    }
    setLoading(false);
  };

  // Fetch posts when page changes
  useEffect(() => {
    fetchPosts();
  }, [page]);

  // 👉 Debounced Infinite Scroll
  useEffect(() => {
    const debouncedScroll = debounce(() => {
      const bottomReached =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300;

      if (bottomReached && !loading && hasMore) {
        setPage((prev) => prev + 1);
      }
    }, 200);

    window.addEventListener("scroll", debouncedScroll);

    return () => {
      debouncedScroll.cancel();
      window.removeEventListener("scroll", debouncedScroll);
    };
  }, [loading, hasMore]);

  // Load saved / liked posts
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);

    if (loggedUser?.id && loggedUser?.token) {
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
        });

      axios
        .get(`http://localhost:8000/api/liked/${loggedUser.id}`, {
          headers: { Authorization: `Bearer ${loggedUser.token}` },
        })
        .then((res) => {
          const likedIds = res.data
            .filter((p) => p?.post)
            .map((p) => p.post._id || p.post);
          setLikedPosts(likedIds);
        });
    }
  }, []);

  // Filter logic
  const filteredArts = arts.filter((art) => {
    const matchesSearch = art.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    return matchesSearch && art.mediaType?.toLowerCase() === filterType;
  });

  // Save / like logic
  const handleToggleSavePost = async (postId) => {
    if (!user?.token) return toast.error("Please login first!");

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

      toast.success(isSaved ? "Removed from saved!" : "Post saved!");
    } catch (err) {
      toast.error("Failed to save post.");
    }
  };

  const handleToggleLikePost = async (postId) => {
    if (!user?.token) return toast.error("Login to like posts!");

    try {
      const isLiked = likedPosts.includes(postId);
      setLikedPosts((prev) =>
        isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
      );

      setArts((prev) =>
        prev.map((art) =>
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

      toast.success(isLiked ? "Unliked 💔" : "Liked ❤️");
    } catch (err) {
      toast.error("Failed to like post.");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`transition-all duration-300 flex flex-col items-center bg-[#f0f9ff] min-h-screen w-full ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <h2 className="text-3xl mt-24 font-bold">Featured Artworks</h2>

        {/* GRID */}
        <div className="w-full max-w-[1300px] px-4 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24 mt-6">
          {filteredArts.map((art) => (
            <div
              key={art._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-[1.02] transition flex flex-col"
            >
              {/* Media */}
              {art.mediaType === "image" && (
                <LazyLoadImage
                  src={art.mediaUrl}
                  alt={art.title}
                  effect="blur"
                  className="w-full h-56 object-cover"
                />
              )}

              {art.mediaType === "video" && (
                <LazyVideo
                  src={art.mediaUrl}
                  poster={art.thumbnailUrl}
                  className="w-full h-56 object-cover"
                />
              )}

              {/* Content */}
              <div className="p-3 flex-1">
                <h3 className="text-indigo-900 font-semibold">{art.title}</h3>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {art.description}
                </p>
              </div>

              {/* COMMENT SECTION */}
              <div className="mt-auto p-3 border-t bg-gray-50">
                <CommentSection postId={art._id} />
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && <p className="text-gray-600 mb-10">Loading more...</p>}

        {!hasMore && <p className="text-gray-600 mb-10">End of posts.</p>}
      </main>
    </>
  );
};

export default LandingPage;
