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
  getPostsByUser,
  addSavedPost,
  removeSavedPost,
  getLikedPosts,
  addLike,
  removeLike,
  getPostsByDate,
  getSimilarPosts,
} from "../controllers/postController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ================= LIKE ================= */
router.post("/liked/add", protect, addLike);
router.post("/liked/remove", protect, removeLike);
router.get("/liked", protect, getLikedPosts);

/* ================= SAVED ================= */
router.post("/saved/add", protect, addSavedPost);
router.post("/saved/remove", protect, removeSavedPost);
router.get("/saved/:id", protect, getSavedPosts);

/* ================= USER POSTS ================= */
router.get("/user/my-uploads", protect, getMyUploads);
router.get("/user/:id", getPostsByUser); // 🔥 REQUIRED FOR CREATOR PROFILE

/* ================= EXPLORE & SIMILAR ================= */
// ⭐ MUST be above "/:id"
router.get("/explore", getExplorePosts);
router.get("/similar/:id", getSimilarPosts);

/* ================= ANALYTICS ================= */
router.get("/likes/graph", protect, getPostsByDate);

/* ================= ALL POSTS ================= */
router.get("/", getAllPosts);

/* ================= CREATE POST ================= */
router.post(
  "/",
  protect,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createPost
);

/* ================= SINGLE POST ================= */
// ❗ ALWAYS LAST
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
