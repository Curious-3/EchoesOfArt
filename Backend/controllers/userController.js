import User from "../models/User.js"; 

export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, about, profileImage, interests, socialLinks } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { firstName, lastName, about, profileImage, interests, socialLinks } },
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged-in user
export const getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error("Error in getMe:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
