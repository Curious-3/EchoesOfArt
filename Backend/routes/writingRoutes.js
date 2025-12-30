import express from "express";
import {
  saveWriting,
  getUserWritings,
  getPublishedWritings,
  deleteWriting,
  getWritingById,
  toggleLike,
  toggleBookmark,
  generateTagsWithAI,
  reportWriting,
} from "../controllers/writingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/published", getPublishedWritings);
// 🤖 AI TAG GENERATION (GEMINI)
router.post("/generate-tags", protect, generateTagsWithAI);

router.post("/save", protect, saveWriting);
router.get("/my-writings", protect, getUserWritings);

router.get("/published", getPublishedWritings);
router.get("/:id", getWritingById);
router.delete("/:id", protect, deleteWriting);

// likes
router.put("/like/:id", protect, toggleLike);

// bookmarks
router.put("/bookmark/:id", protect, toggleBookmark);


//  report
router.post("/report/:id", protect, reportWriting);

export default router;
