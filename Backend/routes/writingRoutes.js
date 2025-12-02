import express from "express";
import {
  saveWriting,
  getUserWritings,
  getPublishedWritings,
  deleteWriting,
  getWritingById,
  toggleLike,
  toggleBookmark,
  addComment,
  editComment,
  deleteComment,
  addReply,
  deleteReply,
  toggleReaction,
  reportWriting
} from "../controllers/writingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", protect, saveWriting);
router.get("/my-writings", protect, getUserWritings);

router.get("/published", getPublishedWritings);
router.get("/:id", getWritingById);
router.delete("/:id", protect, deleteWriting);

// likes
router.put("/like/:id", protect, toggleLike);

// bookmarks
router.put("/bookmark/:id", protect, toggleBookmark);

// comments
router.post("/comment/:id", protect, addComment);
router.put("/comment/:id/:commentId", protect, editComment);
router.delete("/comment/:id/:commentId", protect, deleteComment);

// replies
router.post("/comment/:id/:commentId/reply", protect, addReply);
router.delete("/comment/:id/:commentId/reply/:replyId", protect, deleteReply);

//  reactions
router.put("/comment/:id/:commentId/reaction", protect, toggleReaction);

//  report
router.post("/report/:id", protect, reportWriting);

export default router;
