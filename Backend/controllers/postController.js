import Post from "../models/Post.js";
import cloudinary from "../config/cloudinary.js";

//  Create new post
export const createPost = async (req, res) => {
  try {
    const files = req.files;
    if (!files || !files.file) return res.status(400).json({ message: "Media file is required" });

    // Upload main media
    const mediaResult = await cloudinary.uploader.upload(files.file[0].path, { resource_type: "auto" });

    // Upload thumbnail if provided
    let thumbnailUrl = "";
    if (files.thumbnail) {
      const thumbResult = await cloudinary.uploader.upload(files.thumbnail[0].path, { resource_type: "image" });
      thumbnailUrl = thumbResult.secure_url;
    }

    const newPost = await Post.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: mediaResult.secure_url,
      mediaType: req.body.mediaType,
      thumbnailUrl,
      tags: req.body.tags?.split(","),
      category: req.body.category,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Successfully Posted", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Error In Creating Post", error });
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
// Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Fix authorization check
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description }, 
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

    // Fix authorization check
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};

// Get posts of logged-in user (My Uploads)
export const getMyUploads = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user uploads", error });
  }
};

// Get posts of other users (Explore Art)
export const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: { $ne: req.user._id } }) // not equal
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching explore posts", error });
  }
};