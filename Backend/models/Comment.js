import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // 🔗 POST ya WRITING id
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // 🏷️ kis type ka comment hai
    targetType: {
      type: String,
      enum: ["post", "writing"],
      required: true,
    },

    // 👤 comment author
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 💬 comment text
    text: {
      type: String,
      required: true,
    },

    // ↩️ replies
     replies: [
      {
       _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        username: String,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // 😀 reactions
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
