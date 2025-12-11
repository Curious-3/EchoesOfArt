// controllers/postController.js
import Post from "../models/Post.js";
import Saved from "../models/Saved.js";
import Liked from "../models/Liked.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import OpenAI from "openai";

//  HELPER FUNCTION 
const addLikeCount = async (posts) => {
  if (!posts || !posts.length) return [];
  return await Promise.all(
    posts.map(async (post) => {
      const likeCount = await Liked.countDocuments({ post: post._id });
      return { ...post._doc, likeCount }; // _doc ensures plain JS object
    })
  );
};

// CREATE NEW POST 
// ================= CREATE NEW POST =================
export const createPost = async (req, res) => {
  console.log("Logged-in User ID:", req.user._id);
  console.log("Media Type:", req.body.mediaType);

  try {
    const files = req.files;
    if (!files || !files.file)
      return res.status(400).json({ message: "Media file is required" });

    // Upload main media
    const mediaResult = await cloudinary.uploader.upload(files.file[0].path, {
      resource_type: "auto",
    });

    // Upload thumbnail (optional)
    let thumbnailUrl = "";
    if (files.thumbnail) {
      const thumbResult = await cloudinary.uploader.upload(
        files.thumbnail[0].path,
        { resource_type: "image" }
      );
      thumbnailUrl = thumbResult.secure_url;
    }

    // Create new post
    const newPost = await Post.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: mediaResult.secure_url,
      mediaType: req.body.mediaType, // "image" | "video" | "audio"
      thumbnailUrl,
      tags: req.body.tags?.split(","),
      category: req.body.category,
      createdBy: req.user._id,
    });

    // ✅ Update user's postStats count dynamically
    const mediaType = req.body.mediaType; // e.g. image
    const updateField = `postStats.${mediaType}s`; // postStats.images

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { [updateField]: 1 },
    });

    res.status(201).json({ message: "Successfully Posted", post: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};


// ================= GET ALL POSTS =================
export const getAllPosts = async (req, res) => {
  try {
    // Pagination values from query params
    const page = parseInt(req.query.page) || 0;     // default page = 0
    const limit = parseInt(req.query.limit) || 10;  // default limit = 10

    // Fetch posts with pagination
    const posts = await Post.find()
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    // Add like count for each post
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Liked.countDocuments({ post: post._id });
        return { ...post._doc, likeCount };
      })
    );

    const totalPosts = await Post.countDocuments();

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalPosts,
      postsReturned: posts.length,
      posts: postsWithLikes,
    });

  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error: error.message
    });
  }
};


// ================= GET POST BY ID =================
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("createdBy", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();

    const likeCount = await Liked.countDocuments({ post: post._id });

    res.status(200).json({ ...post._doc, likeCount });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
};

// ================= UPDATE POST =================
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
};

// ================= DELETE POST =================
// ================= DELETE POST =================
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // ✅ Decrease user's postStats count
    const mediaType = post.mediaType; // e.g. image, video, audio
    const updateField = `postStats.${mediaType}s`;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { [updateField]: -1 },
    });

    // Then delete the post
    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

// ================= GET MY UPLOADS =================
export const getMyUploads = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).populate("createdBy", "name email").sort({ createdAt: -1 });
    const postsWithLikes = await addLikeCount(posts);
    res.status(200).json(postsWithLikes);
  } catch (error) {
    console.error("Error fetching user uploads:", error);
    res.status(500).json({ message: "Error fetching user uploads", error: error.message });
  }
};

// ================= GET EXPLORE POSTS =================
export const getExplorePosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: { $ne: req.user._id } }).populate("createdBy", "name email").sort({ createdAt: -1 });
    const postsWithLikes = await addLikeCount(posts);
    res.status(200).json(postsWithLikes);
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    res.status(500).json({ message: "Error fetching explore posts", error: error.message });
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
    res.status(500).json({ message: "Error fetching saved posts", error: error.message });
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
    res.status(500).json({ message: "Error saving post", error: error.message });
  }
};

// REMOVE A SAVED POST
export const removeSavedPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    if (!postId) return res.status(400).json({ message: "Post ID required" });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const saved = await Saved.findOne({ user: userId });
    if (!saved) return res.status(404).json({ message: "No saved posts found" });

    const type = post.mediaType;
    if (type === "image") saved.images = saved.images.filter((id) => id.toString() !== postId);
    if (type === "video") saved.videos = saved.videos.filter((id) => id.toString() !== postId);
    if (type === "audio") saved.audios = saved.audios.filter((id) => id.toString() !== postId);

    await saved.save();
    res.status(200).json({ message: "Post removed from saved posts", postId });
  } catch (error) {
    console.error("Error removing saved post:", error);
    res.status(500).json({ message: "Error removing saved post", error: error.message });
  }
};

// ================= GET LIKED POSTS =================
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Populate liked posts, include post and its creator
    const likedPosts = await Liked.find({ user: userId })
      .populate({
        path: "post",
        populate: { path: "createdBy", select: "name email" },
      });

    // Filter out deleted or null posts to avoid frontend crashes
    const validLikedPosts = likedPosts.filter((item) => item.post !== null);

    res.status(200).json(validLikedPosts);
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ message: "Error fetching liked posts", error: error.message });
  }
};

// ================= GET LIKES BY DATE FOR CHART =================
export const getLikesByDate = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all likes of the user
    const likes = await Liked.find({ user: userId }).select("createdAt");

    // Group likes by date
    const likesByDate = {};
    likes.forEach((like) => {
      const date = like.createdAt.toISOString().split("T")[0]; // format: YYYY-MM-DD
      likesByDate[date] = (likesByDate[date] || 0) + 1;
    });

    // Optional: sort dates ascending
    const sortedLikes = Object.keys(likesByDate)
      .sort()
      .reduce((acc, key) => {
        acc[key] = likesByDate[key];
        return acc;
      }, {});

    res.status(200).json(sortedLikes);
  } catch (err) {
    console.error("Error fetching likes by date:", err);
    res.status(500).json({ message: "Error fetching likes by date", error: err.message });
  }
}
// ----------Get Posts By Date-------------
export const getPostsByDate = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all posts of the user
    console.log(userId);
    const posts = await Post.find({ createdBy: userId }).select("createdAt");

    // Group posts by date
    
    console.log(posts);
    const postsByDate = {};
    posts.forEach((post) => {
      const date = post.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      postsByDate[date] = (postsByDate[date] || 0) + 1;
    });

    // Optional: sort dates ascending
    const sortedPosts = Object.keys(postsByDate)
      .sort()
      .reduce((acc, key) => {
        acc[key] = postsByDate[key];
        return acc;
      }, {});

    res.status(200).json(sortedPosts);
  } catch (err) {
    console.error("Error fetching posts by date:", err);
    res.status(500).json({ message: "Error fetching posts by date", error: err.message });
  }
};

