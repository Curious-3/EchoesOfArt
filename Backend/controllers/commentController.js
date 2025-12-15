// controllers/commentController.js
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

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
      username: c.userId?.name || "User",
      userImage: c.userId?.profileImage || "",
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};
