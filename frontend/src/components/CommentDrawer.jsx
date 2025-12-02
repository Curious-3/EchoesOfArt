import React from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";

const CommentDrawer = ({
  isOpen,
  onClose,
  comments,
  text,
  setText,
  handleAddComment
}) => {

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div
      className="fixed top-0 right-0 h-full w-[350px] bg-white shadow-2xl 
                 transform transition-transform duration-300 z-[9999] 
                 translate-x-0"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Comments</h2>
        <button onClick={onClose}>
          <FaTimes className="text-gray-600 hover:text-black text-xl" />
        </button>
      </div>

      {/* Comments list */}
      <div className="p-4 overflow-y-auto h-[75%] space-y-3">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="border-b pb-2">
              <div className="font-semibold text-sm">
                {comment.username || "User"}
              </div>
              <div className="text-sm">{comment.text}</div>

              <div className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No comments yet.</p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleAddComment}
        className="absolute bottom-0 w-full flex items-center gap-2 
                   border-t px-3 py-2 bg-white"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 p-2 text-sm focus:outline-none"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className={`px-3 py-1 rounded-full ${
            text.trim()
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
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
