// controllers/postController.js
import Post from "../models/Post.js";
import Saved from "../models/Saved.js";
import Liked from "../models/Liked.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

/* ================= HELPER ================= */
const addLikeCount = async (posts) => {
  if (!posts || !posts.length) return [];
  return Promise.all(
    posts.map(async (post) => {
      const likeCount = await Liked.countDocuments({ post: post._id });
      return { ...post._doc, likeCount };
    })
  );
};

/* ================= CREATE POST ================= */
export const createPost = async (req, res) => {
  try {
    const files = req.files;
    if (!files?.file)
      return res.status(400).json({ message: "Media file is required" });

    const mediaResult = await cloudinary.uploader.upload(files.file[0].path, {
      resource_type: "auto",
    });

    let thumbnailUrl = "";
    if (files.thumbnail) {
      const thumb = await cloudinary.uploader.upload(
        files.thumbnail[0].path,
        { resource_type: "image" }
      );
      thumbnailUrl = thumb.secure_url;
    }

    const post = await Post.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: mediaResult.secure_url,
      mediaType: req.body.mediaType,
      thumbnailUrl,
      tags: req.body.tags?.split(","),
      category: req.body.category,
      createdBy: req.user._id,
    });

    const updateField = `postStats.${req.body.mediaType}s`;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { [updateField]: 1 },
    });

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET ALL POSTS ================= */
export const getAllPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 0;
    const limit = Number(req.query.limit) || 10;

    const posts = await Post.find()
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit);

    const postsWithLikes = await addLikeCount(posts);
    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalPosts,
      posts: postsWithLikes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET POST BY ID ================= */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();

    const likeCount = await Liked.countDocuments({ post: post._id });
    res.status(200).json({ ...post._doc, likeCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE POST ================= */
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, description: req.body.description },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE POST ================= */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updateField = `postStats.${post.mediaType}s`;
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { [updateField]: -1 },
    });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= MY UPLOADS ================= */
export const getMyUploads = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(await addLikeCount(posts));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= EXPLORE POSTS ================= */
export const getExplorePosts = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      search = "",
      sort = "recent",
      mediaType = "",
      category = "",
      tag = "",
    } = req.query;

    const query = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (mediaType) query.mediaType = mediaType;
    if (category) query.category = category;
    if (tag) query.tags = tag;

    // 🔹 BASE SORT (not likes)
    let baseSort = { createdAt: -1 };
    if (sort === "oldest") baseSort = { createdAt: 1 };
    if (sort === "views") baseSort = { views: -1 };

    // 🔹 STEP 1: fetch ALL matching posts (NO pagination yet)
    const posts = await Post.find(query)
      .populate("createdBy", "name profileImage")
      .sort(baseSort);

    // 🔹 STEP 2: attach likeCount
    let postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likeCount = await Liked.countDocuments({ post: post._id });
        return { ...post._doc, likeCount };
      })
    );

    // 🔹 STEP 3: MOST LIKED SORT (🔥 IMPORTANT)
    if (sort === "likes") {
      postsWithLikes.sort((a, b) => b.likeCount - a.likeCount);
    }

    // 🔹 STEP 4: PAGINATION AFTER SORT
    const start = Number(page) * Number(limit);
    const end = start + Number(limit);
    const paginatedPosts = postsWithLikes.slice(start, end);

    res.status(200).json(paginatedPosts);
  } catch (error) {
    console.error("Explore posts error:", error);
    res.status(500).json({
      message: "Failed to fetch explore posts",
      error: error.message,
    });
  }
};


/* ================= SAVED POSTS ================= */
export const getSavedPosts = async (req, res) => {
  try {
    const saved = await Saved.findOne({ user: req.params.id })
      .populate("images")
      .populate("videos")
      .populate("audios");

    res.status(200).json({
      images: saved?.images || [],
      videos: saved?.videos || [],
      audios: saved?.audios || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD / REMOVE SAVED ================= */
export const addSavedPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let saved = await Saved.findOne({ user: userId });
    if (!saved) saved = await Saved.create({ user: userId });

    if (!saved[`${post.mediaType}s`].includes(postId))
      saved[`${post.mediaType}s`].push(postId);

    await saved.save();
    res.status(200).json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeSavedPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    const saved = await Saved.findOne({ user: userId });

    saved[`${post.mediaType}s`] = saved[`${post.mediaType}s`].filter(
      (id) => id.toString() !== postId
    );

    await saved.save();
    res.status(200).json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LIKE SYSTEM ================= */
export const getLikedPosts = async (req, res) => {
  try {
    const likes = await Liked.find({ user: req.user._id }).populate({
      path: "post",
      populate: { path: "createdBy", select: "name email" },
    });

    res.status(200).json(likes.filter((l) => l.post));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const exists = await Liked.findOne({
      user: req.user._id,
      post: postId,
    });

    if (exists) return res.status(400).json({ message: "Already liked" });

    await Liked.create({ user: req.user._id, post: postId });
    res.status(201).json({ message: "Liked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeLike = async (req, res) => {
  try {
    await Liked.findOneAndDelete({
      user: req.user._id,
      post: req.body.postId,
    });
    res.status(200).json({ message: "Unliked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
// ================= GET POSTS BY DATE =================
export const getPostsByDate = async (req, res) => {
  try {
    const userId = req.user._id;

    const posts = await Post.find({ createdBy: userId }).select("createdAt");

    const postsByDate = {};
    posts.forEach((post) => {
      const date = post.createdAt.toISOString().split("T")[0];
      postsByDate[date] = (postsByDate[date] || 0) + 1;
    });

    res.status(200).json(postsByDate);
  } catch (error) {
    console.error("Error fetching posts by date:", error);
    res.status(500).json({ message: "Error fetching posts by date" });
  }
};
