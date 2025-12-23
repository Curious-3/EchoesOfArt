// controllers/commentController.js
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { io } from "../server.js";

// ✏️ Edit comment (only comment owner)
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.text = text;
    await comment.save();

    await comment.populate("userId", "name profileImage");

    const formattedComment = {
      _id: comment._id,
      text: comment.text,
      username: comment.userId.name,
      userId: comment.userId._id,
      createdAt: comment.createdAt,
      replies: comment.replies,
      reactions: comment.reactions,
    };

    res.json(formattedComment);
    io.to(comment.postId.toString()).emit("comment_updated", formattedComment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🗑️ Delete comment (comment owner OR post owner)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const post = await Post.findById(comment.postId);

    const isCommentOwner =
      comment.userId.toString() === req.user._id.toString();

    const isPostOwner =
      post?.userId?.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted", commentId });

    io.to(comment.postId.toString()).emit("comment_deleted", commentId);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE COMMENT ================= */
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      text,
    });

    await comment.populate("userId", "name profileImage");

    const formattedComment = {
      _id: comment._id,
      text: comment.text,
      username: comment.userId.name,
      userId: comment.userId._id,
      createdAt: comment.createdAt,
      replies: [],
      reactions: [],
    };

    res.status(201).json(formattedComment);
    io.to(postId.toString()).emit("comment_added", formattedComment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET COMMENTS BY POST ================= */
export const getCommentsByPost = async (req, res) => {
  const comments = await Comment.find({ postId: req.params.postId })
    .populate("userId", "name profileImage")
    .sort({ createdAt: -1 });

  const formatted = comments.map(c => ({
  _id: c._id,
  text: c.text,
  username: c.userId.name,
  userId: c.userId._id,
  createdAt: c.createdAt,
  replies: c.replies.map(r => ({
    _id: r._id,
    text: r.text,
    userId: r.userId,
    username: r.username || "User", // ✅ SAFE
    createdAt: r.createdAt,
  })),
  reactions: c.reactions,
}));

  res.json(formatted);
};

export const addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    const reply = {
      _id: new Comment()._id,
      userId: req.user._id,
      username: req.user.name,   // ✅ IMPORTANT
      text,
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await comment.save();

    res.json({ reply });

    io.to(comment.postId.toString()).emit("reply_added", {
      commentId,
      reply,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // check if already reacted
    const existing = comment.reactions.find(
      (r) =>
        r.userId.toString() === req.user._id.toString() &&
        r.emoji === emoji
    );

    if (existing) {
      // remove reaction
      comment.reactions = comment.reactions.filter(
        (r) => r !== existing
      );
    } else {
      // add reaction
      comment.reactions.push({
        userId: req.user._id,
        emoji,
      });
    }

    await comment.save();

    const comments = await Comment.find({ postId: comment.postId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 });

    res.json({ comments });
io.to(comment.postId.toString()).emit("reaction_updated", {
  commentId,
  reactions: comment.reactions,
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const editReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    reply.text = text;
    await comment.save();

    res.json({ success: true });

    // 🔥 SEND ONLY REPLY, NOT COMMENT
    io.to(comment.postId.toString()).emit("reply_updated", {
      commentId,
      reply: {
        _id: reply._id,
        text: reply.text,
        userId: reply.userId,
        createdAt: reply.createdAt,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const deleteReply = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.replies = comment.replies.filter(
      r => r._id.toString() !== replyId
    );

    await comment.save();

    res.json({ success: true });

    // 🔥 DO NOT EMIT comment_deleted
    io.to(comment.postId.toString()).emit("reply_deleted", {
      commentId,
      replyId,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

