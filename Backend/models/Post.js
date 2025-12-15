// models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    mediaUrl: { type: String, required: true },
    mediaType: {
      type: String,
      enum: ["image", "video", "text", "audio"],
      required: true,
    },

    tags: [String],
    category: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    thumbnailUrl: String,

    // views system (already used)
    views: { type: Number, default: 0 },

    // likes system (already used)
    likeCount: { type: Number, default: 0 },

    // 🔥 ADDITION (SAFE & REQUIRED)
    // 👉 used only for display, comments never disappear
    commentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ VIRTUAL CREATOR (DO NOT REMOVE)
postSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

// ✅ required for populate + frontend usage
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export default mongoose.model("Post", postSchema);
