import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Liked from "../models/Liked.js";
import Post from "../models/Post.js";

const router = express.Router();

//Get all liked posts by a specific user
router.get("/:userId", protect, async (req, res) => {
  try {
    const likedPosts = await Liked.find({ user: req.params.userId }).populate("post");
    res.status(200).json(likedPosts);
  } catch (err) {
    console.error("Error fetching liked posts:", err);
    res.status(500).json({ message: "Error fetching liked posts", error: err.message });
  }
});

//addlike to a post
router.post("/add", protect, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    // check if post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // check if already liked
    const exists = await Liked.findOne({ user: userId, post: postId });
    if (exists) return res.status(400).json({ message: "Already liked" });

    // create like
    const newLike = await Liked.create({ user: userId, post: postId });

    // increment like count in post
    post.likesCount = (post.likesCount || 0) + 1;
    await post.save();

    res.status(200).json({ message: "Post liked successfully", like: newLike });
  } catch (err) {
    console.error("Error adding like:", err);
    res.status(500).json({ message: "Error adding like", error: err.message });
  }
});

// Remove like from a post
router.post("/remove", protect, async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const like = await Liked.findOneAndDelete({ user: userId, post: postId });
    if (!like) return res.status(404).json({ message: "Like not found" });

    // decrement like count in post
    const post = await Post.findById(postId);
    if (post && post.likesCount > 0) {
      post.likesCount -= 1;
      await post.save();
    }

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (err) {
    console.error("Error removing like:", err);
    res.status(500).json({ message: "Error removing like", error: err.message });
  }
});

export default router;
