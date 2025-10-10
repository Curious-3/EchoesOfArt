// controllers/writingController.js
import Writing from '../models/Writing.js';

// Save or update writing (draft or published)
export const saveWriting = async (req, res) => {
  const { writingId, title, content, status } = req.body;

  try {
    let writing;
    if (writingId) {
      writing = await Writing.findByIdAndUpdate(
        writingId,
        { title, content, status, updatedAt: Date.now() },
        { new: true }
      );
    } else {
      writing = new Writing({
        userId: req.user.id, // Assuming you have user auth middleware
        title,
        content,
        status
      });
      await writing.save();
    }

    res.json({ success: true, writing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all writings of a user
export const getUserWritings = async (req, res) => {
  try {
    const writings = await Writing.find({ userId: req.user.id });
    res.json({ success: true, writings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
