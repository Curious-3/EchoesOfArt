import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EMOJIS = ["❤️", "🔥", "😂", "😢", "👏"];

const SingleWriting = () => {
  const { id } = useParams();
  const [writing, setWriting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
  const [reportReason, setReportReason] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = storedUser?.token || null;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false); // client-side follow

  // Fetch writing
  useEffect(() => {
    const fetchWriting = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/writing/${id}`);
        const w = res.data.writing;
        setWriting(w);
        setLikeCount(w.likes?.length || 0);

        // bookmark + follow state from localStorage
        const storedBookmarks = JSON.parse(
          localStorage.getItem("bookmarkedWritings") || "[]"
        );
        setBookmarked(storedBookmarks.includes(w._id));

        const storedFollows = JSON.parse(
          localStorage.getItem("followedAuthors") || "[]"
        );
        if (w.userId?._id && storedFollows.includes(w.userId._id)) {
          setFollowed(true);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load writing");
      } finally {
        setLoading(false);
      }
    };

    fetchWriting();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!writing) return <div className="p-6 text-center">Writing not found</div>;

  const readingTime = Math.ceil(writing.content.length / 900);

  // ❤️ Like
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

  // 🔖 Bookmark (client + backend)
  const handleBookmark = async () => {
    if (!token) return toast.error("Please login to bookmark");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/bookmark/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookmarked(res.data.bookmarked);

      // also track in localStorage so Saved page can easily use it later
      const stored = JSON.parse(
        localStorage.getItem("bookmarkedWritings") || "[]"
      );
      let updated;
      if (res.data.bookmarked) {
        updated = [...new Set([...stored, writing._id])];
      } else {
        updated = stored.filter((wid) => wid !== writing._id);
      }
      localStorage.setItem("bookmarkedWritings", JSON.stringify(updated));
    } catch {
      toast.error("Could not update bookmark");
    }
  };

  // ⭐ Follow author (client-side only – safe)
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

  // 📤 Share
  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: writing.title,
          text: "Check out this beautiful writing!",
          url
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // 🚩 Report
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

  // 💬 Add comment
  const handleComment = async () => {
    if (!token) return toast.error("Please login to comment");
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/writing/comment/${id}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWriting((prev) => ({ ...prev, comments: res.data.comments }));
      setCommentText("");
    } catch {
      toast.error("Could not add comment");
    }
  };

  // ✏️ Start edit
  const startEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  // ✏️ Save edited comment
  const saveEditedComment = async () => {
    if (!token) return toast.error("Please login");
    if (!editText.trim()) return;

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/comment/${id}/${editingCommentId}`,
        { commentId: editingCommentId, text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWriting((prev) => ({ ...prev, comments: res.data.comments }));
      setEditingCommentId(null);
      setEditText("");
    } catch {
      toast.error("Could not edit comment");
    }
  };

  // 🗑 Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!token) return toast.error("Please login");

    try {
      const res = await axios.delete(
        `http://localhost:8000/api/writing/comment/${id}/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWriting((prev) => ({ ...prev, comments: res.data.comments }));
    } catch {
      toast.error("Could not delete comment");
    }
  };

  // ↩️ Add reply
  const handleReply = async (commentId) => {
    if (!token) return toast.error("Please login");
    if (!replyText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/writing/comment/${id}/${commentId}/reply`,
        { text: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWriting((prev) => ({ ...prev, comments: res.data.comments }));
      setReplyText("");
      setActiveReplyCommentId(null);
    } catch {
      toast.error("Could not add reply");
    }
  };

  // 🗑 Delete reply
  const handleDeleteReply = async (commentId, replyId) => {
    if (!token) return toast.error("Please login");

    try {
      const res = await axios.delete(
        `http://localhost:8000/api/writing/comment/${id}/${commentId}/reply/${replyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWriting((prev) => ({ ...prev, comments: res.data.comments }));
    } catch {
      toast.error("Could not delete reply");
    }
  };

  // 😀 Toggle reaction
  const handleReaction = async (commentId, emoji) => {
    if (!token) return toast.error("Please login");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/comment/${id}/${commentId}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWriting((prev) => ({ ...prev, comments: res.data.comments }));
    } catch {
      toast.error("Could not react");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-10 border border-gray-200">

        {/* TITLE */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-6 
                       bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {writing.title}
        </h1>

        {/* AUTHOR + META */}
        <div className="flex flex-col items-center mb-8 text-gray-600">
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${writing.userId?.name || "A"}&background=random`}
              alt="avatar"
              className="w-10 h-10 rounded-full shadow"
            />
            <div className="flex flex-col items-start">
              <span className="font-semibold text-gray-800">
                {writing.userId?.name || "Anonymous"}
              </span>
              <button
                onClick={handleFollow}
                className={`mt-1 text-xs px-3 py-1 rounded-full border ${
                  followed ? "bg-blue-600 text-white" : "bg-white text-blue-600"
                }`}
              >
                {followed ? "Following" : "Follow"}
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-center">
            {new Date(writing.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}{" "}
            •{" "}
            {new Date(writing.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}{" "}
            • {readingTime} min read
          </div>
        </div>

        {/* ACTION ROW: like / bookmark / share / report */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-full shadow flex items-center gap-2 ${
              liked ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600"
            }`}
          >
            <span>❤️</span>
            <span>{likeCount} Likes</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`px-4 py-2 rounded-full shadow flex items-center gap-2 ${
              bookmarked ? "bg-yellow-400 text-white" : "bg-yellow-100 text-yellow-700"
            }`}
          >
            🔖 <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-full shadow bg-blue-100 text-blue-700 flex items-center gap-2"
          >
            📤 <span>Share</span>
          </button>
        </div>

        {/* CONTENT */}
        <div
          className="prose prose-xl leading-relaxed text-gray-900 max-w-none 
                     prose-headings:text-gray-900 prose-p:my-4 prose-p:tracking-wide
                     prose-li:marker:text-blue-600 prose-a:text-blue-600 
                     prose-a:underline hover:prose-a:text-blue-800 mb-10"
          dangerouslySetInnerHTML={{ __html: writing.content }}
        ></div>

        {/* REPORT BOX */}
        <div className="mb-10 border-t pt-6">
          <h3 className="font-semibold mb-2 text-sm text-gray-700 flex items-center gap-2">
            🚩 Report this writing
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason (optional but helpful)"
              className="flex-grow p-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleReport}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
            >
              Report
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>

          {/* Add comment */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              className="flex-grow p-2 border rounded-lg"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Post
            </button>
          </div>

          {/* Comment list */}
          <div className="space-y-4">
            {writing.comments?.map((c) => (
              <div key={c._id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-semibold text-sm">
                      {c.username || c.userId?.name || "User"}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => startEditComment(c)}
                      className="text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Comment text or edit box */}
                {editingCommentId === c._id ? (
                  <div className="mt-2">
                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 mt-1 text-xs">
                      <button
                        onClick={saveEditedComment}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm">{c.text}</p>
                )}

                {/* Reactions */}
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <div className="flex gap-1">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(c._id, emoji)}
                        className="px-2 py-1 bg-white border rounded-full hover:bg-gray-100"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.reactions?.length
                      ? `${c.reactions.length} reaction${
                          c.reactions.length > 1 ? "s" : ""
                        }`
                      : "No reactions yet"}
                  </div>
                </div>

                {/* Replies */}
                <div className="mt-3 pl-4 border-l">
                  {c.replies?.map((r) => (
                    <div
                      key={r._id}
                      className="mb-2 bg-white rounded-md p-2 text-sm flex justify-between"
                    >
                      <div>
                        <p className="font-semibold text-xs">
                          {r.username || r.userId?.name || "User"}
                        </p>
                        <p>{r.text}</p>
                        <span className="text-[10px] text-gray-500">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteReply(c._id, r._id)}
                        className="text-[11px] text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {/* Add reply */}
                  {activeReplyCommentId === c._id ? (
                    <div className="mt-2 flex gap-2 text-sm">
                      <input
                        type="text"
                        className="flex-grow p-1 border rounded-md"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <button
                        onClick={() => handleReply(c._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setReplyText("");
                          setActiveReplyCommentId(null);
                        }}
                        className="px-3 py-1 bg-gray-200 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReplyCommentId(c._id)}
                      className="mt-1 text-xs text-blue-500"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SingleWriting;
