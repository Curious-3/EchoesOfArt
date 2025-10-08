import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

//  Create a new post
export const createPost = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Media file is required" });
    }

    //  Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, { resource_type: "auto" });

    console.log("req.user:", req.user._id); // Debugging: check user ID

    //  Create new post document
    const newPost = await Post.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: result.secure_url,
      mediaType: req.body.mediaType,
      tags: req.body.tags?.split(","),
      category: req.body.category,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Successfully Posted", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ message: "Error in creating post", error: error.message });
  }
};

//  Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
};

//  Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("createdBy", "name email");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.views += 1;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error.message);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};

//  Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //  FIX: Compare with req.user._id
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};

//  Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //  Compare with req.user._id
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
};
