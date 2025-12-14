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

    // 🔥 NEW (SAFE ADDITIONS)
    views: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },

  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
