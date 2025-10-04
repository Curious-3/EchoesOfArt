import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

//  Create new post
export const createPost = async (req, res) => {
  try {
    const file = req.file; // multer se aayega
    if (!file) return res.status(400).json({ message: "Media file is required" });

    const result = await cloudinary.uploader.upload(file.path, { resource_type: "auto" });

    const newPost = await Post.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: result.secure_url,
      mediaType: req.body.mediaType,
      tags: req.body.tags?.split(","),
      category: req.body.category,
      createdBy: req.user
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};

//  Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

//  Get single post
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("createdBy", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });
    post.views += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.createdBy.toString() !== req.user) return res.status(403).json({ message: "Not authorized" });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating post", error });
  }
};


// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.createdBy.toString() !== req.user) return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
