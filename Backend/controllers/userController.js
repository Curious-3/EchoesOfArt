import User from "../models/User.js";
import Post from "../models/Post.js";
import Liked from "../models/Liked.js";

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, about, profileImage, interests, socialLinks } = req.body;

    // Ensure only allowed socialLinks keys are stored
    const sanitizedSocialLinks = {
      social1: socialLinks?.social1 || "",
      social2: socialLinks?.social2 || "",
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { firstName, lastName, about, profileImage, interests, socialLinks: sanitizedSocialLinks } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged-in user + post stats
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch user's posts
    const posts = await Post.find({ createdBy: user._id });

    // Total likes received
    const totalLikes = await Liked.countDocuments({
      post: { $in: posts.map((p) => p._id) },
    });

    // Category-wise count
    const categoryCounts = {};
    posts.forEach((post) => {
      const cat = post.category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    res.status(200).json({
      user,
      stats: {
        totalLikes,
        categoryWise: categoryCounts,
        postStats: user.postStats,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
