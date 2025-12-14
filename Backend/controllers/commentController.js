import Comment from "../models/Comment.js";
import User from "../models/User.js";

export const createComment = async (req, res) => {
  try {
    console.log("createComment route hit");
    const { text } = req.body;
    const { postId } = req.params;
    const userId = req.user._id;
  
    const comment = await Comment.create({ postId, userId, text });
    await comment.populate("userId", "name profileImage username followers following posts");
    console.log(comment.userId.username);
    
    // Return formatted comment matching getCommentsByPost structure
    const formattedComment = {
      _id: comment._id,
      text: comment.text,
      username: comment.userId?.name || comment.userId?.username,
      userId: {
        username: comment.userId?.username || comment.userId?.name
      },
      createdAt: comment.createdAt,
    };
    res.status(201).json({ comment: formattedComment });
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

export const getCommentsByPost = async (req, res) => {
  try {

    const { postId } = req.params;
       const comments = await Comment.find({ postId })
  .populate("userId", "name profileImage")
  .sort({ createdAt: -1 });
  console.log(comments);
const formattedComments = comments.map(c => ({
  _id: c._id,
  text: c.text,
  username: c.userId?.name,
  createdAt: c.createdAt,
}));
res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};