// controllers/commentController.js
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

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

    res.json({ message: "Comment updated", comment });
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= CREATE COMMENT ================= */
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    // 🔹 ensure post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 1️⃣ create comment
    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      text: text.trim(),
    });

    // 2️⃣ increment commentsCount (🔥 FIX)
    post.commentsCount += 1;
    await post.save();

    // 3️⃣ populate user
    await comment.populate("userId", "name profileImage");

    // 4️⃣ send clean response (frontend safe)
    res.status(201).json({
      _id: comment._id,
      text: comment.text,
      createdAt: comment.createdAt,
      username: comment.userId.name,
      userImage: comment.userId.profileImage,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

/* ================= GET COMMENTS BY POST ================= */
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 });

    const formattedComments = comments.map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      userId: c.userId?._id?.toString(),
      username: c.userId?.name || "User",
      userImage: c.userId?.profileImage || "",
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};
