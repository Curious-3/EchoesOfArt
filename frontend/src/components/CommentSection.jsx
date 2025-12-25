import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegCommentDots } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";
import CommentDrawer from "./CommentDrawer";
import { socket } from "../socket";

const EMOJIS = ["❤️", "🔥", "😂", "😢", "👏"];

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = user?._id || storedUser?._id;
  const token = user?.token || storedUser?.token;

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    if (!isDrawerOpen || !postId) return;

    axios
      .get(`http://localhost:8000/api/comments/${postId}`)
      .then((res) => setComments(res.data))
      .catch(console.error);
  }, [isDrawerOpen, postId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!postId) return;

    socket.emit("join_post", postId);

    socket.on("comment_added", (comment) => {
      setComments((prev) => [comment, ...prev]);
    });

    socket.on("comment_updated", (updated) => {
      setComments((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
    });

    socket.on("comment_deleted", (commentId) => {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    });

    socket.on("reply_added", ({ commentId, reply }) => {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...c.replies, reply] }
            : c
        )
      );
    });

    socket.on("reply_updated", ({ commentId, reply }) => {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r._id === reply._id ? { ...r, text: reply.text } : r
                ),
              }
            : c
        )
      );
    });

    socket.on("reply_deleted", ({ commentId, replyId }) => {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        )
      );
    });

    socket.on("reaction_updated", ({ commentId, reactions }) => {
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, reactions } : c
        )
      );
    });

    return () => {
      socket.off();
    };
  }, [postId]);

  /* ================= API HANDLERS ================= */

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await axios.post(
      `http://localhost:8000/api/comments/${postId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setText("");
  };

  const handleEditComment = async (commentId, newText) => {
    if (!newText.trim()) return;

    await axios.put(
      `http://localhost:8000/api/comments/edit/${commentId}`,
      { text: newText },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleDeleteComment = async (commentId) => {
    await axios.delete(
      `http://localhost:8000/api/comments/delete/${commentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;

    await axios.post(
      `http://localhost:8000/api/comments/${commentId}/reply`,
      { text: replyText },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReplyText("");
    setActiveReplyId(null);
  };

  const handleEditReply = async (commentId, replyId, text) => {
    if (!text.trim()) return;

    await axios.put(
      `http://localhost:8000/api/comments/${commentId}/reply/${replyId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleDeleteReply = async (commentId, replyId) => {
    await axios.delete(
      `http://localhost:8000/api/comments/${commentId}/reply/${replyId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleReaction = async (commentId, emoji) => {
    await axios.put(
      `http://localhost:8000/api/comments/${commentId}/reaction`,
      { emoji },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center gap-2 text-gray-600"
      >
        <FaRegCommentDots />
        <span>{comments.length}</span>
      </button>

      <CommentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        comments={comments}
        text={text}
        setText={setText}
        userId={currentUserId}
        emojis={EMOJIS}
        replyText={replyText}
        setReplyText={setReplyText}
        activeReplyId={activeReplyId}
        setActiveReplyId={setActiveReplyId}
        onAdd={handleAddComment}
        onEdit={handleEditComment}
        onDelete={handleDeleteComment}
        onReply={handleReply}
        onReact={handleReaction}
        onEditReply={handleEditReply}
        onDeleteReply={handleDeleteReply}
      />
    </div>
  );
};

export default CommentSection;
