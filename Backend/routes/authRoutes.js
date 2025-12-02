import express from "express";
import { registerUser, loginUser,verifyEmail,resendOTP, getProfile, updateProfile, updateProfileImage, upload} from "../controllers/authController.js";
import { followUser, getFollowers, getFollowing, getMe, unfollowUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/me',protect,getMe);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.get("/profile", protect,  getProfile);

router.put("/profile", protect,  updateProfile);


// Follow routes
router.put("/follow/:id", protect,  followUser);

router.put("/unfollow/:id", protect, (req, res, next) => {
    console.log(`unfollow me:`);
    next(); // pass control to postRoutes
},  unfollowUser);


router.get("/followers/:id", protect, getFollowers);
router.get("/following/:id", protect, getFollowing);
router.put("/profile-image", protect, upload.single("profileImage"), updateProfileImage);
export default router;
