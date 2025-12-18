import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import CommentSection from "../components/CommentSection";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ON ID CHANGE ================= */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" }); // 🔥 UX FIX
    setLoading(true);
    setPost(null);

    fetchPost();
    fetchSimilarPosts();
  }, [id]);

  /* ================= FETCH POST ================= */
  const fetchPost = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/posts/${id}`
      );
      setPost(res.data);
    } catch (err) {
      console.error("Post fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH SIMILAR ================= */
  const fetchSimilarPosts = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/posts/similar/${id}`
      );
      setSimilarPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Similar posts error", err);
      setSimilarPosts([]);
    }
  };

  /* ================= STATES ================= */
  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading post...
      </p>
    );

  if (!post)
    return (
      <p className="text-center mt-20 text-gray-500">
        Post not found
      </p>
    );

  const date = new Date(post.createdAt);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* ================= MEDIA ================= */}
      {post.mediaType === "image" && (
        <img
          src={post.mediaUrl}
          alt={post.title}
          className="w-full max-h-[500px] object-contain rounded-xl"
        />
      )}

      {post.mediaType === "video" && (
        <video
          controls
          className="w-full max-h-[500px] rounded-xl"
        >
          <source src={post.mediaUrl} />
        </video>
      )}

      {post.mediaType === "audio" && (
        <audio
          controls
          src={post.mediaUrl}
          className="w-full mt-4"
        />
      )}

      {/* ================= DETAILS ================= */}
      <div className="mt-5">
        <span
          onClick={() =>
            navigate(`/profile/${post.createdBy?._id}`)
          }
          className="font-semibold cursor-pointer hover:underline"
        >
          {post.createdBy?.name || "Unknown Creator"}
        </span>

        <p className="text-sm text-gray-500">
          {date.toLocaleDateString()} •{" "}
          {date.toLocaleTimeString()}
        </p>

        {post.description && (
          <p className="mt-3 text-gray-800">
            {post.description}
          </p>
        )}
      </div>

      {/* ================= COMMENTS (BEST PRACTICE) ================= */}
      <div className="mt-10">
        <CommentSection postId={post._id} />
      </div>

      {/* ================= SIMILAR POSTS ================= */}
      {similarPosts.length > 0 && (
        <div className="mt-14">
          <h3 className="font-semibold text-lg mb-4">
            Similar Posts
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {similarPosts.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/post/${p._id}`)}
                className="cursor-pointer group"
              >
                <img
                  src={p.mediaUrl}
                  alt={p.title}
                  className="h-40 w-full object-cover rounded-lg 
                             group-hover:opacity-80 transition"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
