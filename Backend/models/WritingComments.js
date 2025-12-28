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
const WritingCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Writing",
    required: true,
  },

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

  /* 🚫 AI MODERATION FLAG */
  isFlagged: {
    type: Boolean,
    default: false,
  },

  reactions: {
    type: [ReactionSchema],
    default: [],
  },

  replies: {
    type: [ReplySchema],
    default: [],
  },

}, { timestamps: true });

WritingCommentSchema.index({ postId: 1, createdAt: -1 });


export default mongoose.model("WritingComment", WritingCommentSchema);
