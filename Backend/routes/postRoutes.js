import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getExplorePosts,
  getMyUploads,
  getSavedPosts,
  getLikedPosts,
  getLikesByDate,
  getPostsByDate,
} from "../controllers/postController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/// User-specific routes first
router.get("/user/my-uploads", protect, getMyUploads);
router.get("/user/explore", protect, getExplorePosts);
router.get("/saved/:id", protect, getSavedPosts);
router.get("/liked", protect, getLikedPosts);

router.get("/likes/graph", protect, (req, res, next) => {
    console.log("Route /likes/graph called");
    console.log("User ID (from protect middleware):", req.user ? req.user._id : "No user");
    console.log("Query params:", req.query);
    next(); // pass control to the actual handler
}, getPostsByDate);

// Public routes
router.get("/", getAllPosts);

// Post by ID
router.get("/:id", getPostById);

// Update / delete posts
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

// Create post
router.post(
  "/",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createPost
);

export default router;
