// routes/savedRoutes.js

import express from "express";
import { getSavedPosts, addSavedPost, removeSavedPost } from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================= SAVED POSTS ROUTES =======================

// Get all saved posts of a user
router.get("/:id", protect, getSavedPosts);

// Add a post to saved list
router.post("/add", protect, addSavedPost);

// Remove a post from saved list
router.post("/remove", protect, removeSavedPost);

export default router;
