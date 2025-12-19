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
  const [commentText, setCommentText] = useState("");
  const EMOJIS = ["❤️", "🔥", "😂", "😢", "👏"];
  const [editingCommentId, setEditingCommentId] = useState(null);
const [editText, setEditText] = useState("");
const [replyText, setReplyText] = useState("");
const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);
const [editingReplyId, setEditingReplyId] = useState(null);
const [editReplyText, setEditReplyText] = useState("");
const [expandedReplies, setExpandedReplies] = useState({});
const [showAllComments, setShowAllComments] = useState(false);


const getReactionCount = (comment, emoji) => {
  return comment.reactions?.filter(
    (r) => r.emoji === emoji
  ).length || 0;
};


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

  /* ================= ADD COMMENT ================= */
const handleComment = async () => {
  if (!token) return toast.error("Login required");
  if (!commentText.trim()) return;

  try {
    const res = await axios.post(
      `http://localhost:8000/api/writing/comment/${id}`,
      { text: commentText.trim() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 🔥 update comments from backend
    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));

    setCommentText("");
  } catch (err) {
    console.error(err);
    toast.error("Could not add comment");
  }
};

const handleReaction = async (commentId, emoji) => {
  if (!token) return toast.error("Login required");

  try {
    const res = await axios.put(
      `http://localhost:8000/api/writing/comment/${id}/${commentId}/reaction`,
      { emoji },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 🔥 refresh comments with reactions
    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));
  } catch (err) {
    console.error(err);
    toast.error("Could not react");
  }
};

const handleEditComment = async (commentId) => {
  if (!token) return toast.error("Login required");
  if (!editText.trim()) return;

  try {
    const res = await axios.put(
      `http://localhost:8000/api/writing/comment/${id}/${commentId}`,
      { text: editText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));

    setEditingCommentId(null);
    setEditText("");
  } catch (err) {
    console.error(err);
    toast.error("Could not edit comment");
  }
};



const handleDeleteComment = async (commentId) => {
  if (!token) return toast.error("Login required");

  try {
    const res = await axios.delete(
      `http://localhost:8000/api/writing/comment/${id}/${commentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));
  } catch (err) {
    console.error(err);
    toast.error("Could not delete comment");
  }
};

const handleReply = async (commentId) => {
  if (!token) return toast.error("Login required");
  if (!replyText.trim()) return;

  try {
    const res = await axios.post(
      `http://localhost:8000/api/writing/comment/${id}/${commentId}/reply`,
      { text: replyText.trim() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));

    setReplyText("");
    setActiveReplyCommentId(null);
  } catch (err) {
    console.error(err);
    toast.error("Could not add reply");
  }
};

// EDIT REPLY HANDLER

const handleEditReply = async (commentId, replyId) => {
  if (!token) return toast.error("Login required");
  if (!editReplyText.trim()) return;

  try {
    const res = await axios.put(
      `http://localhost:8000/api/writing/comment/${id}/${commentId}/reply/${replyId}`,
      { text: editReplyText.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));

    setEditingReplyId(null);
    setEditReplyText("");
  } catch (err) {
    toast.error("Could not edit reply");
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

  const handleDeleteReply = async (commentId, replyId) => {
  if (!token) return toast.error("Login required");

  try {
    const res = await axios.delete(
      `http://localhost:8000/api/writing/comment/${id}/${commentId}/reply/${replyId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setWriting((prev) => ({
      ...prev,
      comments: res.data.comments,
    }));
  } catch (err) {
    console.error(err);
    toast.error("Could not delete reply");
  }
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

         {/* 💬 COMMENTS */}
<div className="border-t pt-8 mt-10">
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
    {writing.comments?.length === 0 && (
      <p className="text-gray-500 text-sm">No comments yet.</p>
    )}

   {(showAllComments
  ? writing.comments
  : writing.comments.slice(0, 2)
)?.map((c) => (

      <div
        key={c._id}
        className="p-4 bg-gray-50 rounded-lg shadow-sm"
      >
        <p className="font-semibold text-sm">
          {c.username || c.userId?.name || "User"}
        </p>
       {editingCommentId === c._id ? (
  <div className="flex gap-2 mt-2">
    <input
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
      className="flex-grow p-2 border rounded"
    />
    <button
      onClick={() => handleEditComment(c._id)}
      className="px-3 py-1 bg-green-600 text-white rounded"
    >
      Save
    </button>
    <button
      onClick={() => setEditingCommentId(null)}
      className="px-3 py-1 bg-gray-300 rounded"
    >
      Cancel
    </button>
  </div>
) : (
  <p className="text-sm mt-1">{c.text}</p>
  
)}


        <span className="text-xs text-gray-500">
          {new Date(c.createdAt).toLocaleString()}
        </span>

{/* 🧵 Replies list */}
{c.replies?.length > 0 && (
  <div className="mt-3 ml-6 space-y-2 border-l pl-3">
   {(expandedReplies[c._id]
  ? c.replies
  : c.replies.slice(0, 0)
).map((r) => (

      <div key={r._id} className="bg-white p-2 rounded shadow-sm">
        <p className="text-xs font-semibold">
          {r.username || r.userId?.name || "User"}
        </p>

        {editingReplyId === r._id ? (
          // ✏️ EDIT MODE
          <div className="flex gap-2 mt-1">
            <input
              value={editReplyText}
              onChange={(e) => setEditReplyText(e.target.value)}
              className="flex-grow p-1 border rounded text-sm"
            />
            <button
              onClick={() => handleEditReply(c._id, r._id)}
              className="text-xs bg-green-600 text-white px-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingReplyId(null);
                setEditReplyText("");
              }}
              className="text-xs bg-gray-300 px-2 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          // 👀 NORMAL MODE
          <>
            <p className="text-sm">{r.text}</p>

            {(r.userId?._id || r.userId)?.toString() === userId?.toString() && (
              <div className="flex gap-3 mt-1 text-xs">
                <button
                  onClick={() => {
                    setEditingReplyId(r._id);
                    setEditReplyText(r.text);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDeleteReply(c._id, r._id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </>
        )}

        <span className="text-[10px] text-gray-400">
          {new Date(r.createdAt).toLocaleString()}
        </span>
      </div>
    ))}
  </div>
)}

{c.replies.length > 0 && (
  <button
    onClick={() =>
      setExpandedReplies((prev) => ({
        ...prev,
        [c._id]: !prev[c._id],
      }))
    }
    className="text-xs text-blue-600 mt-1 hover:underline"
  >
    {expandedReplies[c._id]
      ? "Hide replies"
      : `View all ${c.replies.length} replies`}
  </button>
)}



        <div className="flex gap-2 mt-2">
  {EMOJIS.map((emoji) => {
  const count = getReactionCount(c, emoji);

  return (
    <button
      key={emoji}
      onClick={() => handleReaction(c._id, emoji)}
      className={`flex items-center gap-1 px-3 py-1 text-sm border rounded-full hover:bg-gray-100 ${
        count > 0 ? "bg-gray-100" : "bg-white"
      }`}
    >
      <span>{emoji}</span>
      {count > 0 && (
        <span className="text-xs font-semibold">{count}</span>
      )}
    </button>
  );
})}


{/* ↩️ Reply button */}
<button
  onClick={() =>
    setActiveReplyCommentId(
      activeReplyCommentId === c._id ? null : c._id
    )
  }
  className="text-xs text-blue-600 mt-2 hover:underline"
>
  ↩️ Reply
</button>

{/* 🧵 Reply input box */}
{activeReplyCommentId === c._id && (
  <div className="mt-2 flex gap-2">
    <input
      type="text"
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      placeholder="Write a reply..."
      className="flex-grow p-2 border rounded-lg text-sm"
    />
    <button
      onClick={() => handleReply(c._id)}
      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
    >
      Reply
    </button>
  </div>
)}

  {(c.userId?._id || c.userId)?.toString() === userId?.toString() && (
  <div className="flex gap-3 mt-2 text-xs">
    <button
      onClick={() => {
        setEditingCommentId(c._id);
        setEditText(c.text);
      }}
      className="text-blue-600 hover:underline"
    >
      ✏️ Edit
    </button>

    <button
      onClick={() => handleDeleteComment(c._id)}
      className="text-red-600 hover:underline"
    >
      🗑️ Delete
    </button>
  </div>
)}

</div>

      </div>
    ))}
  </div>
</div>

{writing.comments?.length > 2 && (
  <button
    onClick={() => setShowAllComments(!showAllComments)}
    className="text-sm text-blue-600 mt-4 hover:underline"
  >
    {showAllComments
      ? "Hide comments"
      : `View all ${writing.comments.length} comments`}
  </button>
)}


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
