// routes/postRoutes.js

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

// ======================= USER-SPECIFIC ROUTES =======================
router.get("/user/my-uploads", protect, getMyUploads);
router.get("/user/explore", protect, getExplorePosts);
router.get("/saved/:id", protect, getSavedPosts);
router.get("/liked", protect, getLikedPosts);

// Likes & Posts Analytics (for graph views)
router.get("/likes/graph", protect, getLikesByDate);
router.get("/posts/graph", protect, getPostsByDate);

// ======================= PUBLIC ROUTES =======================
router.get("/", getAllPosts);
router.get("/:id", getPostById);

// ======================= POST CREATION & MODIFICATION =======================
router.post(
  "/",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createPost
);

router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
