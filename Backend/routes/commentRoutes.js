import express from "express";
import {
  addReply,
  createComment,
  deleteComment,
  deleteReply,
  editReply,
  getCommentsByPost,
  reactToComment,
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
// reply to comment
router.post("/:commentId/reply", protect, addReply);

// emoji reaction
router.put("/:commentId/reaction", protect, reactToComment);

router.put("/:commentId/reply/:replyId", protect, editReply);
router.delete("/:commentId/reply/:replyId", protect, deleteReply);

export default router;
