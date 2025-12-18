import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const CommentDrawer = ({
  isOpen,
  onClose,
  comments,
  text,
  setText,
  handleAddComment,
  user,
  onEdit,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  if (!isOpen || typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed top-0 right-0 h-full w-[360px] bg-white shadow-2xl z-[9999]">

      {/* TOASTER */}
      <Toaster position="top-right" />

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
          comments.map((comment) => {
            const isOwner = user?._id === comment.userId;
            const isEditing = editingId === comment._id;
            const isDeleting = deleteId === comment._id;

            return (
              <div key={comment._id} className="border-b pb-3">

                {/* USER ROW */}
                <div className="flex items-start gap-3">
                  {/* USER IMAGE */}
                  <img
                    src={
                      comment.userImage
                        ? `http://localhost:8000${comment.userImage}`
                        : "/default-avatar.png"
                    }
                    alt="user"
                    className="w-9 h-9 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    {/* NAME + ACTIONS */}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">
                        {comment.username || "User"}
                      </span>

                      {isOwner && !isEditing && !isDeleting && (
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditText(comment.text);
                            }}
                            className="text-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setDeleteId(comment._id)}
                            className="text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* INLINE EDIT */}
                    {isEditing && (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={async () => {
                              await onEdit(comment, editText);
                              toast.success("Comment updated successfully");
                              setEditingId(null);
                            }}
                            className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-300 text-sm px-3 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* DELETE CONFIRMATION BOX */}
                    {isDeleting && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm">
                        <p className="text-red-700">
                          Are you sure you want to delete this comment?
                        </p>

                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-3 py-1 bg-gray-200 rounded text-sm"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={async () => {
                              await onDelete(comment._id);
                              toast.success("Comment deleted successfully");
                              setDeleteId(null);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* NORMAL TEXT */}
                    {!isEditing && !isDeleting && (
                      <p className="text-sm mt-1">{comment.text}</p>
                    )}

                    {/* TIME */}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500">No comments yet</p>
        )}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleAddComment}
        className="absolute bottom-0 w-full border-t p-3 flex gap-2 bg-white"
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
