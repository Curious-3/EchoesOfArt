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

/* ================= REPLY ROUTES (MUST BE ON TOP) ================= */
router.post("/:commentId/reply", protect, addReply);
router.put("/:commentId/reply/:replyId", protect, editReply);
router.delete("/:commentId/reply/:replyId", protect, deleteReply);

/* ================= REACTION ================= */
router.put("/:commentId/reaction", protect, reactToComment);

/* ================= COMMENT ACTIONS ================= */
router.put("/edit/:commentId", protect, updateComment);
router.delete("/delete/:commentId", protect, deleteComment);

/* ================= FETCH / CREATE COMMENTS ================= */
router.get("/:targetType/:targetId", getCommentsByPost);
router.post("/:targetType/:targetId", protect, createComment);

export default router;
