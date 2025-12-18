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
    console.log("createComment route hit");
    const { text } = req.body;
    const { postId } = req.params;
    const userId = req.user._id;
  
    const comment = await Comment.create({ postId, userId, text });
    await comment.populate("userId", "name profileImage username followers following posts");
    console.log(comment.userId.username);
    
    // Return formatted comment matching getCommentsByPost structure
    const formattedComment = {
      _id: comment._id,
      text: comment.text,
      username: comment.userId?.name || comment.userId?.username,
      userId: {
        username: comment.userId?.username || comment.userId?.name
      },
      createdAt: comment.createdAt,
    };
    res.status(201).json({ comment: formattedComment });
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
  console.log(comments);
const formattedComments = comments.map(c => ({
  _id: c._id,
  text: c.text,
  username: c.userId?.name,
  createdAt: c.createdAt,
}));
res.json(formattedComments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};