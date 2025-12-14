import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { FaRegCommentDots } from "react-icons/fa";
import CommentDrawer from "./CommentDrawer";

// ⭐ SOCKET IMPORT
import { socket } from "../socket";

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ⭐ Fetch comments when drawer opens
  useEffect(() => {
    if (!isDrawerOpen) return;

    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/comments/${postId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        setComments(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      }
    };

    fetchComments();
  }, [isDrawerOpen, postId]);

  // ⭐ Real-time listener
  useEffect(() => {
    if (!isDrawerOpen) return;

    // join room
    socket.emit("join_post", postId);

    // listen for realtime comments
    const handleCommentAdded = (newComment) => {
      console.log("📨 Received new comment:", newComment);
      setComments((prev) => {
        // Prevent duplicates
        const exists = prev.some((c) => c._id === newComment._id);
        if (exists) return prev;
        return [newComment, ...prev];
      });
    };

    socket.on("comment_added", handleCommentAdded);

    // cleanup to avoid duplicate listeners
    return () => {
      socket.off("comment_added", handleCommentAdded);
    };
  }, [isDrawerOpen, postId]);

  // ⭐ Add comment (with socket emit)
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/comments/${postId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const newComment = res.data.comment;

      // send real-time comment - server will broadcast to all including sender
      socket.emit("new_comment", { postId, comment: newComment });

      setText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="mt-2">
      {/* Comment Button */}
      <button
        onClick={() => {
          setIsDrawerOpen(false);          // close any open drawer
          setTimeout(() => setIsDrawerOpen(true), 50); // reopen safely
        }}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <FaRegCommentDots className="text-lg" />
        <span>
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </button>

      {/* Drawer */}
      <CommentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        comments={comments}
        text={text}
        setText={setText}
        handleAddComment={handleAddComment}
      />
    </div>
  );
};

export default CommentSection;
