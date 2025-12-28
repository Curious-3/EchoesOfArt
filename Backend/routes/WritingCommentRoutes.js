import express from "express";
import {
  addComment,
  editComment,
  deleteComment,
  addReply,
  editReply,
  deleteReply,
  toggleReaction,
  unflagComment,
  deleteFlaggedComment,
  getCommentsByPost,
} from "../controllers/WritingCommentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 GET COMMENTS (THIS WAS MISSING)
router.get("/:id", getCommentsByPost);

// comments
router.post("/:id", protect, addComment);
router.put("/:id/:commentId", protect, editComment);
router.delete("/:id/:commentId", protect, deleteComment);

// replies
router.post("/:id/:commentId/reply", protect, addReply);
router.put("/:id/:commentId/reply/:replyId", protect, editReply);
router.delete("/:id/:commentId/reply/:replyId", protect, deleteReply);

// reactions
router.put("/:id/:commentId/reaction", protect, toggleReaction);

// 🚫 AI FLAGGED COMMENT — CREATOR ACTIONS
router.patch("/:id/:commentId/unflag", protect, unflagComment);
router.delete("/:id/:commentId/force-delete", protect, deleteFlaggedComment);

export default router;
