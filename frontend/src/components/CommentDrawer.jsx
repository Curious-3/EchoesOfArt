import React from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";

const CommentDrawer = ({
  isOpen,
  onClose,
  comments,
  text,
  setText,
  handleAddComment,
}) => {
  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed top-0 right-0 h-full w-[360px] bg-white shadow-2xl z-[9999]">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Comments</h2>
        <button onClick={onClose}>
          <FaTimes className="text-xl text-gray-600 hover:text-black" />
        </button>
      </div>

      {/* COMMENTS */}
      <div className="p-4 overflow-y-auto h-[75%] space-y-4">
        {comments.length ? (
          comments.map((c) => (
            <div key={c._id}>
              <div className="text-sm font-semibold">
                {c.username || "User"}
              </div>
              <div className="text-sm">{c.text}</div>
              <div className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No comments yet
          </p>
        )}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleAddComment}
        className="absolute bottom-0 w-full border-t p-3 flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-sm p-2 outline-none"
        />
        <button
          disabled={!text.trim()}
          className={`px-4 py-1 rounded-full ${
            text.trim()
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Send
        </button>
      </form>
    </div>,
    document.body
  );
};

export default CommentDrawer;
