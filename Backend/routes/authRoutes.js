import express from "express";
import { registerUser, loginUser,verifyEmail,resendOTP, getProfile, updateProfile, updateProfileImage, upload} from "../controllers/authController.js";
import { getMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/me',protect,getMe);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.get("/profile", protect, async (req, res, next) => {
  console.log("🔹 [GET /profile] Route hit");
  console.log("🔹 Authenticated user ID:", req.user?.id);
  next();
}, getProfile);

router.put("/profile", protect, async (req, res, next) => {
  console.log("🔸 [PUT /profile] Route hit");
  console.log("🔸 Authenticated user ID:", req.user?.id);
  console.log("🔸 Request body:", req.body);
  next();
}, updateProfile);
router.put("/profile-image", protect, upload.single("profileImage"), updateProfileImage);
export default router;
