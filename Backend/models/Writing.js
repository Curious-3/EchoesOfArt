import mongoose from "mongoose";

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

  commentCount: {
  type: Number,
  default: 0,
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


    /* 🏷️ TAGS (AI GENERATED + EDITABLE BY CREATOR) */
  tags: {
    type: [String],
    default: [],
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
