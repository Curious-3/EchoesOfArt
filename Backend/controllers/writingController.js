import Writing from "../models/Writing.js";
import User from "../models/User.js";


// CREATE / UPDATE writing
export const saveWriting = async (req, res) => {
  const { writingId, title, content, status, category } = req.body;

  try {
    let writing;

    if (writingId) {
      writing = await Writing.findOneAndUpdate(
        { _id: writingId, userId: req.user._id },
        { title, content, status,category, updatedAt: Date.now() },
        { new: true }
      );
    } else {
      writing = new Writing({
        userId: req.user._id,
        title,
        content,
        status,
        category,
      });
      await writing.save();
    }

    res.json({ success: true, writing });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ALL writings of logged in user
export const getUserWritings = async (req, res) => {
  try {
    const writings = await Writing.find({ userId: req.user._id });
    res.json({ success: true, writings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ALL published
export const getPublishedWritings = async (req, res) => {
  try {
    const { search = "" } = req.query;

    // 1️⃣ find users matching creator name
    const users = await User.find(
      { name: { $regex: search, $options: "i" } },
      "_id"
    );

    const userIds = users.map((u) => u._id);

    // 2️⃣ build query
    const query = {
      status: "published",
      $or: [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } } // 🔥 creator match
      ]
    };

    // 3️⃣ fetch writings
    const writings = await Writing.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, writings });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// SINGLE writing
export const getWritingById = async (req, res) => {
  try {
    const writing = await Writing.findById(req.params.id)
      .populate("userId", "name email")
      .populate("comments.userId", "name")
      .populate("comments.replies.userId", "name");

    if (!writing) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, writing });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// DELETE writing
export const deleteWriting = async (req, res) => {
  try {
    const writing = await Writing.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!writing) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, message: "Writing deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  LIKE / UNLIKE
//  LIKE / UNLIKE  (FIXED - minimal change)
export const toggleLike = async (req, res) => {
  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    const userId = req.user._id;

    const alreadyLiked = writing.likes.some(
      (id) => id.toString() === userId.toString()
    );

    const updatedWriting = await Writing.findByIdAndUpdate(
      req.params.id,
      alreadyLiked
        ? { $pull: { likes: userId } }
        : { $addToSet: { likes: userId } },
      { new: true }
    );

    res.json({
      success: true,
      liked: !alreadyLiked,
      totalLikes: updatedWriting.likes.length
    });
  } catch (error) {
    console.error("LIKE ERROR:", error);
    res.status(500).json({ success: false, message: "Like failed" });
  }
};



//  BOOKMARK / UNBOOKMARK
//  BOOKMARK / UNBOOKMARK (FIXED - minimal change)
export const toggleBookmark = async (req, res) => {
  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    const userId = req.user._id;

    const alreadySaved = writing.bookmarkedBy.some(
      (id) => id.toString() === userId.toString()
    );

    const updatedWriting = await Writing.findByIdAndUpdate(
      req.params.id,
      alreadySaved
        ? { $pull: { bookmarkedBy: userId } }
        : { $addToSet: { bookmarkedBy: userId } },
      { new: true }
    );

    res.json({
      success: true,
      bookmarked: !alreadySaved,
      totalBookmarks: updatedWriting.bookmarkedBy.length
    });
  } catch (error) {
    console.error("BOOKMARK ERROR:", error);
    res.status(500).json({ success: false, message: "Bookmark failed" });
  }
};


//  ADD COMMENT
export const addComment = async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) return res.status(404).json({ success: false, message: "Not found" });

    writing.comments.push({
      userId: req.user._id,
      username: req.user.name,
      text
    });

    await writing.save();

    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  EDIT COMMENT
export const editComment = async (req, res) => {
  const commentId = req.params.commentId;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Empty comment" });
  }

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    const comment = writing.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    comment.text = text;
    await writing.save();

    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Edit comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// DELETE COMMENT
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) return res.status(404).json({ success: false, message: "Not found" });

    const comment = writing.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    comment.deleteOne();
    await writing.save();

    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  ADD REPLY
export const addReply = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Reply cannot be empty" });
  }

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) return res.status(404).json({ success: false, message: "Not found" });

    const comment = writing.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    comment.replies.push({
      userId: req.user._id,
      username: req.user.name,
      text
    });

    await writing.save();

    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE REPLY
export const deleteReply = async (req, res) => {
  const { commentId, replyId } = req.params;

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) return res.status(404).json({ success: false, message: "Not found" });

    const comment = writing.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ success: false, message: "Reply not found" });

    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    reply.deleteOne();
    await writing.save();

    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✏️ EDIT REPLY
export const editReply = async (req, res) => {
  const { commentId, replyId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Reply cannot be empty" });
  }

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) {
      return res.status(404).json({ success: false, message: "Writing not found" });
    }

    const comment = writing.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    // 🔐 only reply owner can edit
    if (reply.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    reply.text = text;
    await writing.save();

    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Edit reply error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//  ADD / TOGGLE REACTION on comment
export const toggleReaction = async (req, res) => {
  const { commentId } = req.params;
  const { emoji } = req.body;

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) return res.status(404).json({ success: false, message: "Not found" });

    const comment = writing.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const userId = req.user._id.toString();
    const existingIndex = comment.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.emoji === emoji
    );

    if (existingIndex === -1) {
      comment.reactions.push({ userId, emoji });
    } else {
      comment.reactions.splice(existingIndex, 1);
    }

    await writing.save();
    res.json({ success: true, comments: writing.comments });
  } catch (error) {
    console.error("Toggle reaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//  REPORT WRITING
export const reportWriting = async (req, res) => {
  const { reason } = req.body;

  try {
    const writing = await Writing.findById(req.params.id);
    if (!writing) return res.status(404).json({ success: false, message: "Not found" });

    writing.reports.push({
      userId: req.user._id,
      reason: reason || "No reason provided"
    });

    await writing.save();
    res.json({ success: true, message: "Report submitted" });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
