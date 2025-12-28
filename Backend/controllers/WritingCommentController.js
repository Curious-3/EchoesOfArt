import Writing from "../models/Writing.js";
import WritingComment from "../models/WritingComments.js";
import { moderateCommentWithGemini } from "../utils/geminiTags.js";

// ⚠️ socket io OPTIONAL (future ready)
// import { io } from "../server.js";


/* ================= GET COMMENTS BY WRITING ================= */
export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await WritingComment.find({
      postId: req.params.id,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/* ================= ADD COMMENT ================= */
export const addComment = async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    // 🤖 AI moderation
    const moderationResult = await moderateCommentWithGemini(text);
    const isFlagged = moderationResult !== "SAFE";

    const comment = await WritingComment.create({
      postId: req.params.id,
      userId: req.user._id,
      username: req.user.name,
      text,
      isFlagged,
    });

    // 🔢 update counter
    await Writing.findByIdAndUpdate(req.params.id, {
      $inc: { commentCount: 1 },
    });

    // 🔌 socket emit (safe to keep commented)
    // io.to(req.params.id).emit("comment-added", comment);

    res.json({
      success: true,
      comment,
      moderated: isFlagged,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= EDIT COMMENT ================= */
export const editComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Empty comment" });
  }

  try {
    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    comment.text = text;
    await comment.save();

    // io.to(comment.postId.toString()).emit("comment-edited", comment);

    res.json({ success: true, comment });
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE COMMENT ================= */
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await comment.deleteOne();

    await Writing.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -1 },
    });

    // io.to(comment.postId.toString()).emit("comment-deleted", commentId);

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= ADD REPLY ================= */
export const addReply = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Reply cannot be empty" });
  }

  try {
    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    comment.replies.push({
      userId: req.user._id,
      username: req.user.name,
      text,
    });

    await comment.save();

    // io.to(comment.postId.toString()).emit("reply-added", comment);

    res.json({ success: true, comment });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= EDIT REPLY ================= */
export const editReply = async (req, res) => {
  const { commentId, replyId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Reply cannot be empty" });
  }

  try {
    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    reply.text = text;
    await comment.save();

    res.json({ success: true, comment });
  } catch (error) {
    console.error("Edit reply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE REPLY ================= */
export const deleteReply = async (req, res) => {
  const { commentId, replyId } = req.params;

  try {
    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    reply.deleteOne();
    await comment.save();

    res.json({ success: true, comment });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= TOGGLE REACTION ================= */
export const toggleReaction = async (req, res) => {
  const { commentId } = req.params;
  const { emoji } = req.body;

  try {
    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const userId = req.user._id.toString();

    const index = comment.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.emoji === emoji
    );

    if (index === -1) {
      comment.reactions.push({ userId, emoji });
    } else {
      comment.reactions.splice(index, 1);
    }

    await comment.save();

    res.json({ success: true, comment });
  } catch (error) {
    console.error("Toggle reaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= CREATOR UNFLAG COMMENT ================= */
export const unflagComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const writing = await Writing.findById(id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    if (writing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    comment.isFlagged = false;
    await comment.save();

    res.json({ success: true, message: "Comment approved" });
  } catch (error) {
    console.error("Unflag comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= CREATOR DELETE FLAGGED COMMENT ================= */
export const deleteFlaggedComment = async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const writing = await Writing.findById(id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    if (writing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const comment = await WritingComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    await comment.deleteOne();

    await Writing.findByIdAndUpdate(id, {
      $inc: { commentCount: -1 },
    });

    res.json({ success: true, message: "Flagged comment deleted" });
  } catch (error) {
    console.error("Delete flagged comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
