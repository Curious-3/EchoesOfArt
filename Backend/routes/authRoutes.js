import express from "express";
import User from "../models/User.js";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendOTP,
  getProfile,
  updateProfile,
  updateProfileImage,
  upload
} from "../controllers/authController.js";

import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getMe,
  getUserById
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* AUTH */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.get("/me", protect, getMe);

/* PROFILE */
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put(
  "/profile-image",
  protect,
  upload.single("profileImage"),
  updateProfileImage
);

/* FOLLOW SYSTEM */
router.put(
  "/follow/:id",
  (req, res, next) => {
    console.log("🚀 [ROUTE HIT] PUT /follow/:id");
    console.log("🚀 Params:", req.params);
    next();
  },
  protect,
  followUser
);
router.put("/unfollow/:id", protect, unfollowUser);
router.get("/followers/:id", protect, getFollowers);
router.get("/following/:id", protect, getFollowing);

router.get("/:id", getUserById);

/* ================= PUBLIC CREATOR PROFILE ================= */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("name profileImage");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
