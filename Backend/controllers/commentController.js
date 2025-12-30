// controllers/commentController.js
import Comment from "../models/Comment.js";
//import Post from "../models/Post.js";
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
    io.to(comment.targetId.toString()).emit("comment_updated", formattedComment);

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

    

    const isCommentOwner =
      comment.userId.toString() === req.user._id.toString();

      if (!isCommentOwner) {
  return res.status(403).json({ message: "Not authorized" });
}

    await comment.deleteOne();
    res.json({ message: "Comment deleted", commentId });

    io.to(comment.targetId.toString()).emit("comment_deleted", commentId);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE COMMENT ================= */
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { targetId, targetType } = req.params;

const comment = await Comment.create({
  targetId,
  targetType, // "post" OR "writing"
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
 io.to(targetId.toString()).emit("comment_added", formattedComment);


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET COMMENTS BY POST ================= */
export const getCommentsByPost = async (req, res) => {
  const { targetId, targetType } = req.params;

  const comments = await Comment.find({
    targetId,
    targetType,
  })
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
    console.log("🔥 ADD REPLY CONTROLLER HIT");

    const { commentId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Reply text missing" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // ✅ DO NOT manually create _id
    const reply = {
      userId: req.user._id,
      username: req.user.name,
      text,
      createdAt: new Date(),
    };

      //console.log(reply.username);
    comment.replies.push(reply);
    await comment.save();

    const savedReply = comment.replies[comment.replies.length - 1];

    res.status(200).json({ reply: savedReply });

    // socket emit
    io.to(comment.targetId.toString()).emit("reply_added", {
      commentId,
      reply: savedReply,
    });

  } catch (err) {
    console.error("❌ ADD REPLY ERROR:", err);
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

    const comments = await Comment.find({ targetId: comment.targetId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 });

    res.json({
  commentId,
  reactions: comment.reactions,
});


io.to(comment.targetId.toString()).emit("reaction_updated", {
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

    res.json({
      commentId,
      reply: {
        _id: reply._id,
        text: reply.text,
        userId: reply.userId,
        createdAt: reply.createdAt,
      },
    });

    io.to(comment.targetId.toString()).emit("reply_updated", {
      commentId,
      reply: {
        _id: reply._id,
        text: reply.text,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Edit reply failed" });
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

    reply.deleteOne();
    await comment.save();

    res.json({ commentId, replyId });

    io.to(comment.targetId.toString()).emit("reply_deleted", {
      commentId,
      replyId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete reply failed" });
  }
};


