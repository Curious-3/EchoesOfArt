import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import API from "../config/api";
import toast, { Toaster } from "react-hot-toast";
import { debounce } from "lodash";
import ArtCard from "../components/ArtCard";
import ExploreWritings from "./ExploreWritings";
import useDebounce from "../hooks/useDebounce";
import { getStoredUser } from "../utils/authStorage";

const LandingPage = ({ searchTerm = "" }) => {
  const [arts, setArts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("posts");

  const [page, setPage] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Refs to avoid stale closures in useEffect without causing infinite loops
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const [filters, setFilters] = useState({
    sort: "recent",
    mediaType: "",
    category: "",
    tag: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const loggedUser = getStoredUser();
    setUser(loggedUser);
    if (!loggedUser?.token) return;

    axios
      .get(`${API}/api/saved/${loggedUser.id}`, {
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
      .get(`${API}/api/posts/liked`, {
        headers: { Authorization: `Bearer ${loggedUser.token}` },
      })
      .then((res) => {
        const ids = res.data.map((p) => p.post?._id).filter(Boolean);
        setLikedPosts(ids);
      });
  }, []);

  useEffect(() => {
    if (activeTab !== "posts") return;
    // Guard using refs to avoid infinite loop (loading/hasMore in deps would re-trigger)
    if (loadingRef.current || !hasMoreRef.current) return;

    const fetchPosts = async () => {
      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/posts/explore`, {
          params: {
            page,
            limit,
            search: debouncedSearchTerm,
            ...filters,
          },
        });

        const newPosts = res.data || [];
        setArts((prev) => (page === 0 ? newPosts : [...prev, ...newPosts]));

        if (newPosts.length < limit) {
          hasMoreRef.current = false;
          setHasMore(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, activeTab, debouncedSearchTerm, filters]);

  useEffect(() => {
    setArts([]);
    setPage(0);
    hasMoreRef.current = true;
    setHasMore(true);
  }, [filters, debouncedSearchTerm, activeTab]);

  /* ================= INFINITE SCROLL ================= */
  useEffect(() => {
    if (activeTab !== "posts") return;

    const onScroll = debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300 &&
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        setPage((p) => p + 1);
      }
    }, 200);

    window.addEventListener("scroll", onScroll);
    return () => {
      onScroll.cancel();
      window.removeEventListener("scroll", onScroll);
    };
  }, [activeTab]);

  /* ================= SAVE ================= */
  const handleToggleSavePost = async (postId) => {
    if (!user?.token) return toast.error("Login first");

    const isSaved = savedPosts.includes(postId);
    setSavedPosts((p) =>
      isSaved ? p.filter((id) => id !== postId) : [...p, postId]
    );

    try {
      await axios.post(
        `${API}/api/saved/${isSaved ? "remove" : "add"}`,
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
          ? {
              ...art,
              likeCount:
                (art.likeCount || 0) + (isLiked ? -1 : 1),
            }
          : art
      )
    );

    try {
      await axios.post(
        `${API}/api/posts/liked/${isLiked ? "remove" : "add"}`,
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

      {/* 🔘 STICKY HEADER */}
      <div className="sticky top-0 z-50 flex justify-center gap-4 py-4 bg-[#FEF5E7] border-b">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-6 py-2 rounded-full font-semibold ${
            activeTab === "posts"
              ? "bg-amber-600 text-white"
              : "bg-gray-200"
          }`}
        >
          🖼️ Posts
        </button>

        <button
          onClick={() => setActiveTab("writings")}
          className={`px-6 py-2 rounded-full font-semibold ${
            activeTab === "writings"
              ? "bg-purple-600 text-white"
              : "bg-gray-200"
          }`}
        >
          ✍️ Writings
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="min-h-screen bg-[#FEF5E7]">
        {activeTab === "posts" ? (
          <>
            <h2 className="text-3xl font-bold text-center mt-6">
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

            {loading && <p className="text-center">Loading…</p>}
            {!hasMore && <p className="text-center">End of posts</p>}
          </>
        ) : (
          <ExploreWritings searchTerm={searchTerm} />
        )}
      </main>
    </>
  );
};

export default LandingPage;
