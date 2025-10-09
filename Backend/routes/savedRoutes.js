import express from "express";
import { getSavedPosts, addSavedPost, removeSavedPost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", protect, getSavedPosts); // logged-in user
router.post("/add", protect, addSavedPost); // logged-in user can add
router.post("/remove", protect, removeSavedPost); 

export default router;
