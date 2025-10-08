import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { createPost, getAllPosts, getPostById, updatePost, deletePost, getExplorePosts, getMyUploads } from "../controllers/postController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 }
]), createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.get("/user/my-uploads", protect, getMyUploads);
router.get("/user/explore", protect, getExplorePosts);
export default router;