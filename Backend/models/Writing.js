import mongoose from "mongoose";

/* ================= REACTION ================= */
const ReactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= REPLY ================= */
const ReplySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: String,
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= COMMENT ================= */
const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: String,
  text: {
    type: String,
    required: true,
  },
  reactions: {
    type: [ReactionSchema],
    default: [],
  },
  replies: {
    type: [ReplySchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= WRITING ================= */
const WritingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },

  /* 🔥 CATEGORY (COMPULSORY) */
  category: {
    type: String,
    enum: [
      "Poetry",
      "Story",
      "Thoughts",
      "Love",
      "Life",
      "Motivation",
      "Sad / Healing",
      "Spiritual",
    ],
    required: true,
  },

  /* 🎨 BACKGROUND STYLE */
  bgStyle: {
    type: String,
    default: "",
  },

  /* ❤️ LIKES */
  likes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },

  /* 🔖 BOOKMARKS */
  bookmarkedBy: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },

  /* 💬 COMMENTS */
  comments: {
    type: [CommentSchema],
    default: [],
  },

  /* 🚩 REPORTS */
  reports: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [],
  },

  /* ⏰ TIMESTAMPS (MANUAL — AS YOU WANTED) */
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Writing = mongoose.model("Writing", WritingSchema);
export default Writing;
