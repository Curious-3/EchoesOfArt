import mongoose from "mongoose";

const likedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
}, { timestamps: true });

export default mongoose.model("Liked", likedSchema);
