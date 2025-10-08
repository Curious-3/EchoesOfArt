import express from "express";
import { registerUser, loginUser,verifyEmail,resendOTP} from "../controllers/authController.js";
import { getMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/me',protect,getMe);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
export default router;
