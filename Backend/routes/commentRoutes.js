import express from "express";
import {
  createComment,
  getCommentsByPost,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// get comments of a post
router.get("/:postId", getCommentsByPost);

// add comment (login required)
router.post("/:postId", protect, createComment);

export default router;
