import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { FaRegCommentDots } from "react-icons/fa";
import CommentDrawer from "./CommentDrawer";
import { socket } from "../socket";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* ================= FETCH COMMENTS (ON OPEN) ================= */
  useEffect(() => {
    if (!isDrawerOpen) return;

    const fetchComments = async () => {
      try {
      const res = await axios.get(
  `http://localhost:8000/api/comments/${postId}`,
  {
    headers: {
      Authorization: `Bearer ${user?.token || localStorage.getItem("token")}`,
    },
  }
);
   
        setComments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Fetch comments error:", err);
        setComments([]);
      }
    };

    fetchComments();
  }, [isDrawerOpen, postId]);

  /* ================= SOCKET (ATTACH ONCE) ================= */
  useEffect(() => {
    socket.emit("join_post", postId);

    const handleNewComment = (newComment) => {
      setComments((prev) => {
        // 🔥 DUPLICATE PROTECTION
        if (prev.some((c) => c._id === newComment._id)) {
          return prev;
        }
        return [newComment, ...prev];
      });
    };

    socket.on("comment_added", handleNewComment);

    return () => {
      socket.off("comment_added", handleNewComment);
    };
  }, [postId]);

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/comments/${postId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      // ❌ UI update HERE मत करो
      // ✅ Socket will update UI

      socket.emit("new_comment", {
        postId,
        comment: res.data,
      });

      setText("");
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };
const handleDeleteComment = async (commentId) => {
  await axios.delete(
    `http://localhost:8000/api/comments/delete/${commentId}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  );

  setComments(prev => prev.filter(c => c._id !== commentId));
};

const handleEditComment = async (comment, newText) => {
  if (!newText.trim()) return;

  const res = await axios.put(
    `http://localhost:8000/api/comments/edit/${comment._id}`,
    { text: newText },
    {
      headers: {
        Authorization: `Bearer ${user?.token || localStorage.getItem("token")}`,
      },
    }
  );

  setComments((prev) =>
    prev.map((c) =>
      c._id === comment._id ? res.data.comment : c
    )
  );
};


  return (
    <div className="mt-2">
      {/* Comment Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <FaRegCommentDots />
        <span>{comments.length}</span>
      </button>

      {/* Drawer */}
     <CommentDrawer
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  comments={comments}
  text={text}
  setText={setText}
  handleAddComment={handleAddComment}
  user={user}
  onEdit={handleEditComment}
  onDelete={handleDeleteComment}
/>

    </div>
  );
};

export default CommentSection;
