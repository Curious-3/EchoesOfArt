import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const SingleWriting = () => {
  const { id } = useParams();
  const [writing, setWriting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reportReason, setReportReason] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = storedUser?.token || null;
  const userId = storedUser?.id || storedUser?._id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);

  /* ================= FETCH WRITING ================= */
  useEffect(() => {
    const fetchWriting = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/writing/${id}`
        );

        const w = res.data.writing;
        setWriting(w);

        // ❤️ likes
        setLikeCount(w.likes?.length || 0);
        setLiked(w.likes?.some((uid) => uid.toString() === userId));

        // 🔖 bookmarks
        const storedBookmarks = JSON.parse(
          localStorage.getItem("bookmarkedWritings") || "[]"
        );
        setBookmarked(storedBookmarks.includes(w._id));

        // 👤 follow
        const storedFollows = JSON.parse(
          localStorage.getItem("followedAuthors") || "[]"
        );
        setFollowed(
          w.userId?._id && storedFollows.includes(w.userId._id)
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load writing");
      } finally {
        setLoading(false);
      }
    };

    fetchWriting();
  }, [id, userId]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!writing) return <div className="p-6 text-center">Writing not found</div>;

  const readingTime = Math.ceil(writing.content.length / 900);

  /* ================= LIKE ================= */
  const handleLike = async () => {
    if (!token) return toast.error("Please login to like");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLiked(res.data.liked);
      setLikeCount(res.data.totalLikes);
    } catch {
      toast.error("Could not update like");
    }
  };

  /* ================= BOOKMARK ================= */
  const handleBookmark = async () => {
    if (!token) return toast.error("Please login to bookmark");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/bookmark/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookmarked(res.data.bookmarked);

      const stored = JSON.parse(
        localStorage.getItem("bookmarkedWritings") || "[]"
      );

      const updated = res.data.bookmarked
        ? [...new Set([...stored, writing._id])]
        : stored.filter((wid) => wid !== writing._id);

      localStorage.setItem(
        "bookmarkedWritings",
        JSON.stringify(updated)
      );
    } catch {
      toast.error("Could not update bookmark");
    }
  };

  /* ================= FOLLOW ================= */
  const handleFollow = () => {
    if (!writing.userId?._id) return;

    const stored = JSON.parse(
      localStorage.getItem("followedAuthors") || "[]"
    );

    let updated;
    if (followed) {
      updated = stored.filter((id) => id !== writing.userId._id);
      setFollowed(false);
      toast("Unfollowed author");
    } else {
      updated = [...new Set([...stored, writing.userId._id])];
      setFollowed(true);
      toast.success("You are now following this author!");
    }

    localStorage.setItem("followedAuthors", JSON.stringify(updated));
  };

  /* ================= REPORT ================= */
  const handleReport = async () => {
    if (!token) return toast.error("Please login to report");
    if (!reportReason.trim()) return toast.error("Please provide a reason");

    try {
      await axios.post(
        `http://localhost:8000/api/writing/report/${id}`,
        { reason: reportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Report submitted");
      setReportReason("");
    } catch {
      toast.error("Could not submit report");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-10">

        <h1 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {writing.title}
        </h1>

        <div className="text-center text-gray-600 mb-6">
          <p className="font-semibold">{writing.userId?.name || "Anonymous"}</p>
          <button
            onClick={handleFollow}
            className={`mt-2 px-3 py-1 text-xs rounded-full border ${
              followed
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-600"
            }`}
          >
            {followed ? "Following" : "Follow"}
          </button>
          <div className="mt-2 text-sm">
            {new Date(writing.createdAt).toLocaleDateString()} • {readingTime} min read
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-full ${
              liked
                ? "bg-pink-500 text-white"
                : "bg-pink-100 text-pink-600"
            }`}
          >
            ❤️ {likeCount}
          </button>

          <button
            onClick={handleBookmark}
            className={`px-4 py-2 rounded-full ${
              bookmarked
                ? "bg-yellow-400 text-white"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            🔖 {bookmarked ? "Saved" : "Save"}
          </button>
        </div>

        <div
          className="p-8 rounded-xl mb-10"
          style={{ background: writing.bgStyle || "#fff" }}
        >
          <div
            className="prose prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: writing.content }}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-2 text-sm">🚩 Report</h3>
          <div className="flex gap-2">
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason"
              className="flex-grow p-2 border rounded"
            />
            <button
              onClick={handleReport}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SingleWriting;
