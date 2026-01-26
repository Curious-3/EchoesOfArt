// controllers/postController.js
import Post from "../models/Post.js";
import Saved from "../models/Saved.js";
import Liked from "../models/Liked.js";
import cloudinary from "../config/cloudinary.js";
import { generateTagsFromImage } from "../utils/geminiTags.js";


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

    if (!req.files?.file) {
      return res.status(400).json({ message: "Media file is required" });
    }

    /* ================= UPLOAD MAIN MEDIA ================= */
  
    const mediaResult = await cloudinary.uploader.upload(
      req.files.file[0].path,
      { resource_type: "auto" }
    );
    

    /* ================= THUMBNAIL ================= */
    let thumbnailUrl = "";
    if (req.files.thumbnail) {
  
      const thumb = await cloudinary.uploader.upload(
        req.files.thumbnail[0].path,
        { resource_type: "image" }
      );
      thumbnailUrl = thumb.secure_url;
  
    }

    /* ================= TAG GENERATION ================= */
    let tags = [];

    if (req.body.tags && req.body.tags.trim() !== "") {
  
      tags = req.body.tags
        .split(",")
        .map((t) => t.trim().toLowerCase());

    } else{
      tags = await generateTagsFromImage({
  imagePath: req.files.file[0].path,
  title: req.body.title,
  description: req.body.description,
});


    
}

    /* ================= CREATE POST ================= */
  
    const post = await Post.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl: mediaResult.secure_url,
      mediaType: req.body.mediaType,
      thumbnailUrl,
      tags,
      category: req.body.category,
      createdBy: req.user._id,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("🔥 createPost error:", err);
    res.status(500).json({ message: err.message });
  }
};




/* ================= GET ALL POSTS ================= */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(await addLikeCount(posts));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET POST BY ID ================= */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("createdBy", "name profileImage email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

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

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.category = req.body.category || post.category;
    post.mediaType = req.body.mediaType || post.mediaType;

    if (req.body.tags) {
      post.tags = req.body.tags.split(",");
    }

    if (req.files?.file) {
      const mediaResult = await cloudinary.uploader.upload(
        req.files.file[0].path,
        { resource_type: "auto" }
      );
      post.mediaUrl = mediaResult.secure_url;
    }

    if (req.files?.thumbnail) {
      const thumb = await cloudinary.uploader.upload(
        req.files.thumbnail[0].path,
        { resource_type: "image" }
      );
      post.thumbnailUrl = thumb.secure_url;
    }

    await post.save();
    res.status(200).json({ message: "Post updated", post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE POST ================= */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= SIMILAR POSTS ================= */
export const getSimilarPosts = async (req, res) => {
  try {
    const current = await Post.findById(req.params.id);
    if (!current) return res.status(404).json([]);

    const posts = await Post.find({
      _id: { $ne: current._id },
      category: current.category,
    })
      .populate("createdBy", "name profileImage")
      .limit(6);

    res.status(200).json(posts);
  } catch {
    res.status(500).json([]);
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

    let sortQuery = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "views") sortQuery = { views: -1 };

    const posts = await Post.find(query)
      .populate("createdBy", "name profileImage")
      .sort(sortQuery);

    let postsWithLikes = await addLikeCount(posts);

    if (sort === "likes") {
      postsWithLikes.sort((a, b) => b.likeCount - a.likeCount);
    }

    const start = Number(page) * Number(limit);
    res.status(200).json(postsWithLikes.slice(start, start + Number(limit)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= MY UPLOADS ================= */
export const getMyUploads = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id })
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(await addLikeCount(posts));
  } catch (err) {
    res.status(500).json({ message: err.message });
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

export const addSavedPost = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let saved = await Saved.findOne({ user: userId });
    if (!saved) saved = await Saved.create({ user: userId });

    const key = `${post.mediaType}s`;
    if (!saved[key].includes(postId)) {
      saved[key].push(postId);
      await saved.save();
    }

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

    if (!post || !saved) {
      return res.status(404).json({ message: "Not found" });
    }

    const key = `${post.mediaType}s`;
    saved[key] = saved[key].filter((id) => id.toString() !== postId);
    await saved.save();

    res.status(200).json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ================= POSTS BY USER ================= */
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({
      createdBy: req.params.id,
    })
      .sort({ createdAt: -1 })
      .populate({
  path: "createdBy",
  select: "name profileImage followers following",
  populate: [
    { path: "followers", select: "name profileImage" },
    { path: "following", select: "name profileImage" }
  ]
});
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= LIKE SYSTEM ================= */
export const getLikedPosts = async (req, res) => {
  try {
    const likes = await Liked.find({ user: req.user._id })
      .populate({
        path: "post",
        populate: { path: "createdBy", select: "name profileImage" },
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

    if (exists) {
      return res.status(400).json({ message: "Already liked" });
    }

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

/* ================= ANALYTICS ================= */
export const getPostsByDate = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id });
    const data = {};

    for (const post of posts) {
      const date = post.createdAt.toISOString().split("T")[0];
      const likes = await Liked.countDocuments({ post: post._id });

      if (!data[date]) {
        data[date] = { date, posts: 0, likes: 0 };
      }

      data[date].posts += 1;
      data[date].likes += likes;
    }

    res.status(200).json(Object.values(data));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
