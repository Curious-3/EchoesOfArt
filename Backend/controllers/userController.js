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


// 🟢 GET USER BY ID (Required for Creator Profile)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name profileImage email")
      .populate("following", "name profileImage email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Follow a user
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    console.log("Inside folowuser",userToFollow);
    const loggedUser = await User.findById(req.user._id);

    if (!userToFollow) return res.status(404).json({ message: "User not found" });

    // prevent self-follow
    if (userToFollow._id.equals(loggedUser._id)) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // check if already following
    if (loggedUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    loggedUser.following.push(userToFollow._id);
    userToFollow.followers.push(loggedUser._id);

    await loggedUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔴 Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    console.log("Inside unfollowuser",unfollowUser);
    const loggedUser = await User.findById(req.user._id);

    if (!userToUnfollow) return res.status(404).json({ message: "User not found" });

    loggedUser.following = loggedUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== loggedUser._id.toString()
    );

    await loggedUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET FOLLOWERS OF A USER
export const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name profileImage email"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ followers: user.followers });
  } catch (err) {
    console.error("Get followers error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET FOLLOWING OF A USER
export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name profileImage email"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ following: user.following });
  } catch (err) {
    console.error("Get following error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
