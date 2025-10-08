import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { createPost, getAllPosts, getPostById, updatePost, deletePost } from "../controllers/postController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", protect, upload.single("file"), createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
