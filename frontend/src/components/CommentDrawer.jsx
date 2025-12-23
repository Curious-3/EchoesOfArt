import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaEdit, FaTrash, FaReply } from "react-icons/fa";

const getReactionCount = (comment, emoji) =>
  comment.reactions?.filter((r) => r.emoji === emoji).length || 0;

const CommentDrawer = ({
  isOpen,
  onClose,
  comments,
  text,
  setText,
  userId,
  emojis,
  replyText,
  setReplyText,
  activeReplyId,
  setActiveReplyId,
  onAdd,
  onEdit,
  onDelete,
  onReply,
  onReact,
  onEditReply,
  onDeleteReply,
}) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showReplies, setShowReplies] = useState({});

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-[9999]">
      <div className="flex justify-between p-4 border-b">
        <h2 className="font-semibold">Comments</h2>
        <button onClick={onClose}><FaTimes /></button>
      </div>

      <div className="p-4 overflow-y-auto h-[78%] space-y-6">
        {comments.map((c) => {
          const isOwner = c.userId?.toString() === userId?.toString();
          const repliesVisible = showReplies[c._id];

          return (
            <div key={c._id} className="border rounded p-4">
              <p className="font-semibold">{c.username}</p>

              {editingCommentId === c._id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border p-2 flex-grow"
                  />
                  <button
                    onClick={() => {
                      onEdit(c._id, editText);
                      setEditingCommentId(null);
                    }}
                    className="bg-blue-600 text-white px-3 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-sm mt-1">{c.text}</p>
              )}

              <div className="flex gap-2 mt-3">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(c._id, emoji)}
                    className="border px-3 py-1 rounded-full text-sm"
                  >
                    {emoji} {getReactionCount(c, emoji) || ""}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-2 text-sm">
                <button onClick={() => setActiveReplyId(c._id)}>
                  <FaReply /> Reply
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setEditingCommentId(c._id);
                        setEditText(c.text);
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => onDelete(c._id)}>
                      <FaTrash /> Delete
                    </button>
                  </>
                )}
              </div>

              {activeReplyId === c._id && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="border p-2 flex-grow"
                  />
                  <button
                    onClick={() => onReply(c._id)}
                    className="bg-blue-600 text-white px-3 rounded"
                  >
                    Reply
                  </button>
                </div>
              )}

              {c.replies?.length > 0 && (
                <button
                  onClick={() =>
                    setShowReplies((p) => ({ ...p, [c._id]: !p[c._id] }))
                  }
                  className="text-sm text-blue-600 mt-2"
                >
                  {repliesVisible
                    ? "Hide replies"
                    : `View ${c.replies.length} replies`}
                </button>
              )}

            {repliesVisible &&
  c.replies.map((r) => {
    const isReplyOwner =
      r.userId?.toString() === userId?.toString();

    return (
      <div
        key={r._id}
        className="ml-4 mt-3 border-l-2 border-gray-200 pl-4"
      >
        {/* USER */}
        <p className="text-xs font-semibold text-gray-700">
          {r.username || "User"}
        </p>

        {/* EDIT MODE */}
        {editingReplyId === r._id ? (
          <div className="mt-1 flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-grow border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                onEditReply(c._id, r._id, editText);
                setEditingReplyId(null);
              }}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditingReplyId(null)}
              className="text-xs text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {/* NORMAL VIEW */}
            <p className="text-sm text-gray-800 mt-1">
              {r.text}
            </p>

            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>
                {new Date(r.createdAt).toLocaleString()}
              </span>

              {isReplyOwner && (
                <>
                  <button
                    onClick={() => {
                      setEditingReplyId(r._id);
                      setEditText(r.text);
                    }}
                    className="hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteReply(c._id, r._id)}
                    className="hover:text-red-600"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  })}

            </div>
          );
        })}
      </div>

      <form onSubmit={onAdd} className="border-t p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 flex-grow"
          placeholder="Add a comment..."
        />
        <button className="bg-blue-600 text-white px-4 rounded">
          Send
        </button>
      </form>
    </div>,
    document.body
  );
};

export default CommentDrawer;
