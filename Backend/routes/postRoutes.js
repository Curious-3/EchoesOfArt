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
  addSavedPost,
  removeSavedPost,
  getLikedPosts,
  addLike,
  removeLike,
  getPostsByDate,
} from "../controllers/postController.js";


const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ---------------- LIKE ROUTES ---------------- */
router.post("/liked/add", protect, addLike);
router.post("/liked/remove", protect, removeLike);
router.get("/liked", protect, getLikedPosts);

/* ---------------- USER ROUTES ---------------- */
router.get("/user/my-uploads", protect, getMyUploads);

/* ---------------- EXPLORE (PUBLIC) ---------------- */
// ⭐ MUST be above "/:id"
router.get("/explore", getExplorePosts);

/* ---------------- SAVED ---------------- */
router.get("/saved/:id", protect, getSavedPosts);

/* ---------------- ANALYTICS ---------------- */
router.get("/likes/graph", protect, getPostsByDate);

/* ---------------- ALL POSTS ---------------- */
router.get("/", getAllPosts);

/* ---------------- SINGLE POST ---------------- */
// ❗ ALWAYS LAST
router.get("/:id", getPostById);

/* ---------------- UPDATE / DELETE ---------------- */
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

/* ---------------- CREATE POST ---------------- */
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
