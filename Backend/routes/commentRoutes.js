import express from "express"
import { protect } from "../middleware/authMiddleware.js";  // only logged users
import { createComment, getCommentsByPost } from "../controllers/commentController.js";

const router = express.Router();

router.post("/:postId", protect, createComment);

router.get("/:postId", protect, (req, res, next) => {
  console.log("🛠️ [DEBUG] GET /api/comments/:postId called");
  console.log("🔹 Params:", req.params);
  console.log("🔹 User from token (req.user):", req.user);
  next(); // proceed to the controller
}, getCommentsByPost);
export default router;
