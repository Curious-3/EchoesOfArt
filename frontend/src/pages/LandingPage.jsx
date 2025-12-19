import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { debounce } from "lodash";
import ArtCard from "../components/ArtCard";

const LandingPage = ({ searchTerm = "" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arts, setArts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [user, setUser] = useState(null);

  const [page, setPage] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    sort: "recent",
    mediaType: "",
    category: "",
    tag: "",
  });

  /* ================= LOAD USER ================= */
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
        const ids = res.data.map((p) => p.post?._id).filter(Boolean);
        setLikedPosts(ids);
      });
  }, []);

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
    if (loading || !hasMore) return;
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

      const newPosts = res.data || [];

      setArts((prev) =>
        page === 0 ? newPosts : [...prev, ...newPosts]
      );

      if (newPosts.length < limit) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  /* ❌ NO arts clear → flicker fix */
  useEffect(() => {
    setPage(0);
    setHasMore(true);
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
        setPage((p) => p + 1);
      }
    }, 200);

    window.addEventListener("scroll", onScroll);
    return () => {
      onScroll.cancel();
      window.removeEventListener("scroll", onScroll);
    };
  }, [loading, hasMore]);

  /* ================= SAVE ================= */
  const handleToggleSavePost = async (postId) => {
    if (!user?.token) return toast.error("Login first");

    const isSaved = savedPosts.includes(postId);
    setSavedPosts((p) =>
      isSaved ? p.filter((id) => id !== postId) : [...p, postId]
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
    if (!user?.token) return toast.error("Login first");

    const isLiked = likedPosts.includes(postId);
    setLikedPosts((p) =>
      isLiked ? p.filter((id) => id !== postId) : [...p, postId]
    );

    setArts((prev) =>
      prev.map((art) =>
        art._id === postId
          ? { ...art, likeCount: (art.likeCount || 0) + (isLiked ? -1 : 1) }
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

  return (
    <>
      <Toaster />

      <main
        className={`min-h-screen bg-[#f0f9ff] transition-all ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <h2 className="text-3xl mt-24 font-bold text-center">
          Featured Artworks
        </h2>

        <div className="max-w-[1300px] mx-auto px-4 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24 mt-8">
          {arts.map((art) => (
            <ArtCard
              key={art._id}
              art={art}
              liked={likedPosts.includes(art._id)}
              saved={savedPosts.includes(art._id)}
              onLike={handleToggleLikePost}
              onSave={handleToggleSavePost}
            />
          ))}
        </div>

        {loading && <p className="text-center mb-6">Loading…</p>}
        {!hasMore && <p className="text-center mb-6">End of posts</p>}
      </main>
    </>
  );
};

export default LandingPage;
