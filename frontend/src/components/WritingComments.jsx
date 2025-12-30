import { socket } from "../socket";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const EMOJIS = ["❤️", "🔥", "😂", "😢", "👏"];

const WritingComments = ({ id, token, userId, isCreator }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyCommentId, setActiveReplyCommentId] = useState(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

  const [expandedReplies, setExpandedReplies] = useState({});
  const [showAllComments, setShowAllComments] = useState(false);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
  `http://localhost:8000/api/comments/writing/${id}`
);
setComments(res.data || []);


      } catch {
        toast.error("Failed to load comments");
      }
    };

    fetchComments();
  }, [id]);


  useEffect(() => {
  socket.emit("join_post", id);

  socket.on("comment_added", (comment) => {
    setComments(prev => {
      if (prev.some(c => c._id === comment._id)) return prev;
      return [comment, ...prev];
    });
  });

  socket.on("comment_deleted", (commentId) => {
    setComments(prev => prev.filter(c => c._id !== commentId));
  });

  socket.on("comment_updated", (comment) => {
    setComments(prev =>
      prev.map(c => (c._id === comment._id ? comment : c))
    );
  });

  socket.on("reply_added", ({ commentId, reply }) => {
    setComments(prev =>
      prev.map(c =>
        c._id === commentId
          ? { ...c, replies: [...c.replies, reply] }
          : c
      )
    );
  });

  socket.on("reaction_updated", ({ commentId, reactions }) => {
    setComments(prev =>
      prev.map(c =>
        c._id === commentId ? { ...c, reactions } : c
      )
    );
  });

  return () => {
    socket.off("comment_added");
    socket.off("comment_deleted");
    socket.off("comment_updated");
    socket.off("reply_added");
    socket.off("reaction_updated");
  };
}, [id]);


  /* ================= ADD COMMENT ================= */
  const handleComment = async () => {
    if (!token) return toast.error("Login required");
    if (!commentText.trim()) return;

    const res = await axios.post(
  `http://localhost:8000/api/comments/writing/${id}`,
  { text: commentText },
  { headers: { Authorization: `Bearer ${token}` } }
);


   // setComments(prev => [res.data, ...prev]);
    setCommentText("");
  };

  /* ================= EDIT COMMENT ================= */
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    const res = await axios.put(
    `http://localhost:8000/api/comments/edit/${commentId}`,
      { text: editText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComments(prev =>
  prev.map(c =>
    c._id === commentId ? res.data : c
  )
);

    setEditingCommentId(null);
    setEditText("");
  };

  /* ================= DELETE COMMENT ================= */
  const handleDeleteComment = async (commentId) => {
    await axios.delete(
      `http://localhost:8000/api/comments/delete/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  /* ================= ADD REPLY ================= */
const handleReply = async (commentId) => {
  if (!replyText.trim()) return;

  await axios.post(
    `http://localhost:8000/api/comments/${commentId}/reply`,
    { text: replyText },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setReplyText("");
  setActiveReplyCommentId(null);
};


  /* ================= EDIT REPLY ================= */
 const handleEditReply = async (commentId, replyId) => {
  if (!editReplyText.trim()) return;

  const res = await axios.put(
    `http://localhost:8000/api/comments/${commentId}/reply/${replyId}`,
    { text: editReplyText },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setComments(prev =>
    prev.map(c =>
      c._id === commentId
        ? {
            ...c,
            replies: c.replies.map(r =>
              r._id === replyId ? { ...r, text: editReplyText } : r
              
            ),
          }
        : c
    )
  );

  setEditingReplyId(null);
  setEditReplyText("");
};



  /* ================= DELETE REPLY ================= */
const handleDeleteReply = async (commentId, replyId) => {
  await axios.delete(
    `http://localhost:8000/api/comments/${commentId}/reply/${replyId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setComments(prev =>
    prev.map(c =>
      c._id === commentId
        ? {
            ...c,
            replies: c.replies.filter(r => r._id !== replyId),
          }
        : c
    )
  );
};



  /* ================= REACTION ================= */
  const handleReaction = async (commentId, emoji) => {
  await axios.put(
    `http://localhost:8000/api/comments/${commentId}/reaction`,
    { emoji },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};



  const getReactionCount = (comment, emoji) =>
    comment.reactions?.filter((r) => r.emoji === emoji).length || 0;

  return (
    <div className="border-t pt-8 mt-10">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      {/* ADD COMMENT */}
      <div className="flex gap-3 mb-8">
        <input
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

      {(showAllComments ? comments : comments.slice(0, 2)).map((c) => (
     <div
  key={c._id}
  className="p-5 bg-white rounded-2xl border border-gray-300 mb-6"
>

          <p className="font-semibold text-sm">
              {c.username || c.userId?.name || "User"}
          </p>

          {editingCommentId === c._id ? (
            <div className="flex gap-2">
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
            </div>
          ) : (
            <p className="text-sm">{c.text}</p>
          )}

<span className="text-xs text-gray-500">
  {new Date(c.createdAt).toLocaleString()}
</span>

          {/* REACTIONS */}
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => {
            const count = getReactionCount(c, e);
            return (
                <button
                key={`${c._id}-${e}`}   
                onClick={() => handleReaction(c._id, e)}
                className="flex items-center gap-1 px-3 py-1 text-sm border rounded-full"
                >

                  <span>{e}</span>
                  {count > 0 && (
                    <span className="text-xs font-semibold">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* COMMENT ACTIONS */}
          {(c.userId?.toString() === userId?.toString()) && (
            <div className="flex gap-3 text-xs">
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

          {/* REPLIES */}
          {c.replies?.length > 0 && (
            <div className="ml-6 border-l pl-4 space-y-2">
              {(expandedReplies[c._id] ? c.replies : c.replies.slice(0, 1)).map((r, index) => (
  <div key={r._id || `${c._id}-reply-${index}`} className="text-sm">

                    {editingReplyId === r._id ? (
                      <div className="flex gap-2">
                        <input
                          value={editReplyText}
                          onChange={(e) => setEditReplyText(e.target.value)}
                          className="flex-grow p-1 border rounded"
                        />
                        <button
                          onClick={() => handleEditReply(c._id, r._id)}
                          className="text-xs bg-green-600 text-white px-2 rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p>{r.text}</p>
                    )}

                   {(r.userId?.toString() === userId?.toString()) && (
                      <div className="flex gap-3 text-xs">
                        <button
                          onClick={() => {
                            setEditingReplyId(r._id);
                            setEditReplyText(r.text);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReply(c._id, r._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              )}

              <button
                onClick={() =>
                  setExpandedReplies((p) => ({
                    ...p,
                    [c._id]: !p[c._id],
                  }))
                }
                className="text-xs text-blue-600 hover:underline"
              >
                {expandedReplies[c._id]
                  ? "Hide replies"
                  : `View replies (${c.replies.length})`}
              </button>
            </div>
          )}

          {/* ADD REPLY */}
          <button
            onClick={() =>
              setActiveReplyCommentId(
                activeReplyCommentId === c._id ? null : c._id
              )
            }
            className="text-xs text-blue-600 hover:underline"
          >
            ↩️ Reply
          </button>

          {activeReplyCommentId === c._id && (
            <div className="flex gap-2 mt-2">
              <input
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
        </div>
      ))}

      {comments.length > 2 && (
        <button
          onClick={() => setShowAllComments(!showAllComments)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showAllComments ? "Hide comments" : "View all comments"}
        </button>
      )}
    </div>
  );
};

export default WritingComments;
