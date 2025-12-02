import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true }, // e.g. "❤️", "🔥"
  createdAt: { type: Date, default: Date.now }
});

const ReplySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String },
  text: { type: String, required: true },
  reactions: [ReactionSchema],
  replies: [ReplySchema],
  createdAt: { type: Date, default: Date.now }
});

const WritingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },

  // likes
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  //  bookmarks
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  //  comments + replies + reactions
  comments: [CommentSchema],

  // reports
  reports: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Writing = mongoose.model('Writing', WritingSchema);
export default Writing;
