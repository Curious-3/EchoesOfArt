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
} from "../controllers/postController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

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

// Get all posts
router.get("/", getAllPosts); // <-- ensure res is automatically passed here

// Get post by ID
router.get("/:id", getPostById);

// Update post
router.put("/:id", protect, updatePost);

// Delete post
router.delete("/:id", protect, deletePost);

// User uploads
router.get("/user/my-uploads", protect, getMyUploads);

// Explore posts
router.get("/user/explore", protect, getExplorePosts);

// Saved posts
router.get("/saved/:id", protect, getSavedPosts);

export default router;
