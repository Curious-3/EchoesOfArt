import express from "express";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  updateComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// get comments of a post
router.get("/:postId", getCommentsByPost);

// add comment (login required)
router.post("/:postId", protect, createComment);
router.put("/edit/:commentId", protect, updateComment);
router.delete("/delete/:commentId", protect, deleteComment);

export default router;
