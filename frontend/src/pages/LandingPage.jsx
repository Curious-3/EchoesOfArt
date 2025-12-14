import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  FaBookmark,
  FaRegBookmark,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
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

  // pagination
  const [page, setPage] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // filters
  const [filters, setFilters] = useState({
    sort: "recent",
    mediaType: "",
    category: "",
    tag: "",
  });

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
  if (!hasMore || loading) return;

  setLoading(true);
  try {
    const res = await axios.get(
      "http://localhost:8000/api/posts/explore",
      {
        params: {
          page,
          limit,
          search: searchTerm,
          ...filters,
        },
      }
    );

    // ✅ FIX: define newPosts properly
    const newPosts = res.data || [];

    setArts((prev) => {
      const ids = new Set(prev.map((p) => p._id));
      const unique = newPosts.filter((p) => !ids.has(p._id));
      return page === 0 ? unique : [...prev, ...unique];
    });

    if (newPosts.length < limit) {
      setHasMore(false);
    }
  } catch (err) {
    console.error("Pagination error:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchPosts();
  }, [page]);

  // reset on filter / search
 useEffect(() => {
  setArts([]);
  setPage(0);
  setHasMore(true);

  // 🔥 IMPORTANT: force fresh fetch
  setTimeout(() => {
    fetchPosts();
  }, 0);

}, [filters, searchTerm]);


  /* ================= INFINITE SCROLL ================= */
  useEffect(() => {
    const onScroll = debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    }, 200);

    window.addEventListener("scroll", onScroll);
    return () => {
      onScroll.cancel();
      window.removeEventListener("scroll", onScroll);
    };
  }, [loading, hasMore]);

  /* ================= LOAD USER / SAVED / LIKED ================= */
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedUser);

    if (!loggedUser?.token) return;

    axios
      .get(`http://localhost:8000/api/saved/${loggedUser.id}`, {
        headers: { Authorization: `Bearer ${loggedUser.token}` },
      })
      .then((res) => {
        const ids = [
          ...(res.data.images || []).map((p) => p._id),
          ...(res.data.videos || []).map((p) => p._id),
          ...(res.data.audios || []).map((p) => p._id),
        ];
        setSavedPosts(ids);
      });

    axios
      .get("http://localhost:8000/api/posts/liked", {
        headers: { Authorization: `Bearer ${loggedUser.token}` },
      })
      .then((res) => {
        const ids = res.data
          .map((p) => p.post?._id)
          .filter(Boolean);
        setLikedPosts(ids);
      });
  }, []);

  /* ================= SAVE ================= */
  const handleToggleSavePost = async (postId) => {
    if (!user?.token) return toast.error("Please login first!");

    const isSaved = savedPosts.includes(postId);
    setSavedPosts((prev) =>
      isSaved ? prev.filter((id) => id !== postId) : [...prev, postId]
    );

    try {
      await axios.post(
        `http://localhost:8000/api/saved/${isSaved ? "remove" : "add"}`,
        { postId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch {
      toast.error("Save failed");
    }
  };

  /* ================= LIKE ================= */
  const handleToggleLikePost = async (postId) => {
    if (!user?.token) return toast.error("Login to like!");

    const isLiked = likedPosts.includes(postId);
    setLikedPosts((prev) =>
      isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
    );

    setArts((prev) =>
      prev.map((art) =>
        art._id === postId
          ? {
              ...art,
              likeCount: (art.likeCount || 0) + (isLiked ? -1 : 1),
            }
          : art
      )
    );

    try {
      await axios.post(
        `http://localhost:8000/api/posts/liked/${isLiked ? "remove" : "add"}`,
        { postId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch {
      toast.error("Like failed");
    }
  };

  /* ================= UI ================= */
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

        {/* FILTER BAR */}
        <div className="w-full max-w-[1300px] px-4 mt-6 mb-4 flex gap-3">
          {["", "image", "video", "audio", "text"].map((type) => (
            <button
              key={type || "all"}
              onClick={() => setFilters({ ...filters, mediaType: type })}
              className={`px-4 py-1.5 rounded-full border text-sm ${
                filters.mediaType === type
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {type || "All"}
            </button>
          ))}

          <select
            value={filters.sort}
            onChange={(e) =>
              setFilters({ ...filters, sort: e.target.value })
            }
            className="ml-auto px-4 py-2 border rounded-md text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>

        {/* GRID */}
        <div className="w-full max-w-[1300px] px-4 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24">
          {arts.map((art) => (
            <div
              key={art._id}
              className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
            >
              <div className="relative">
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

                <div className="absolute top-2 right-2 flex gap-2">
                  <button
  onClick={() => handleToggleLikePost(art._id)}
  className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow"
>
  {likedPosts.includes(art._id) ? (
    <FaHeart className="text-red-500" />
  ) : (
    <FaRegHeart />
  )}
  <span className="text-xs font-semibold">
    {art.likeCount || 0}
  </span>
</button>


                  <button
  onClick={() => handleToggleSavePost(art._id)}
  className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow"
>
  {savedPosts.includes(art._id) ? (
    <FaBookmark className="text-indigo-600" />
  ) : (
    <FaRegBookmark />
  )}
  <span className="text-xs font-semibold">
    {savedPosts.includes(art._id) ? 1 : 0}
  </span>
</button>

                </div>
              </div>

              <div className="p-3 flex-1">
                <h3 className="font-semibold">{art.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {art.description}
                </p>
              </div>

              <div className="border-t bg-gray-50 p-3">
                <CommentSection postId={art._id} />
              </div>
            </div>
          ))}
        </div>

        {loading && <p className="mb-10">Loading...</p>}
        {!hasMore && <p className="mb-10">End of posts</p>}
      </main>
    </>
  );
};

export default LandingPage;
