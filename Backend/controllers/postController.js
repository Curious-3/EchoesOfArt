import Post from "../models/Post.js";
import Saved from "../models/Saved.js";
import cloudinary from "../config/cloudinary.js";

// ================= CREATE NEW POST =================
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
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post", error });
  }
};

// ================= GET ALL POSTS =================
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

// ================= GET POST BY ID =================
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("createdBy", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post", error });
  }
};

// ================= UPDATE POST =================
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post", error });
  }
};

// ================= DELETE POST =================
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error });
  }
};

// ================= GET MY UPLOADS =================
export const getMyUploads = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).populate("createdBy", "name email").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user uploads:", error);
    res.status(500).json({ message: "Error fetching user uploads", error });
  }
};

// ================= GET EXPLORE POSTS =================
export const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: { $ne: req.user._id } }).populate("createdBy", "name email").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    res.status(500).json({ message: "Error fetching explore posts", error });
  }
};

// ================= GET SAVED POSTS =================
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const saved = await Saved.findOne({ user: userId })
      .populate("images")
      .populate("videos")
      .populate("audios");

    res.status(200).json({
      images: saved?.images || [],
      videos: saved?.videos || [],
      audios: saved?.audios || [],
    });
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    res.status(500).json({ message: "Error fetching saved posts", error });
  }
};

// ================= ADD A SAVED POST =================
export const addSavedPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    if (!postId) return res.status(400).json({ message: "Post ID required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let saved = await Saved.findOne({ user: userId });
    if (!saved) saved = await Saved.create({ user: userId });

    const type = post.mediaType;
    if (type === "image" && !saved.images.includes(postId)) saved.images.push(postId);
    if (type === "video" && !saved.videos.includes(postId)) saved.videos.push(postId);
    if (type === "audio" && !saved.audios.includes(postId)) saved.audios.push(postId);

    await saved.save();
    res.status(200).json({ message: "Post saved successfully", postId });
  } catch (error) {
    console.error("Error saving post:", error);
    res.status(500).json({ message: "Error saving post", error });
  }
};
