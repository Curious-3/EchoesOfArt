const User = require("../models/User");

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      about,
      profileImage,
      interests,
      socialLinks
    } = req.body;

    // Use findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          firstName,
          lastName,
          about,
          profileImage,
          interests,
          socialLinks
        }
      },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfile };
