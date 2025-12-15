import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreator();
    fetchPosts();
  }, [creatorId]);

  /* ================= FETCH CREATOR ================= */
  const fetchCreator = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/users/${creatorId}`
      );
      const data = await res.json();
      setCreator(data);
    } catch (err) {
      console.error("Creator fetch error", err);
    }
  };

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/posts/user/${creatorId}`
      );
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Posts fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (!creator) return <p className="text-center mt-20">Loading profile…</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* ================= PROFILE HEADER ================= */}
      <div className="flex items-center gap-4">
        <img
          src={creator.profileImage || "/default-avatar.png"}
          alt={creator.name}
          className="w-20 h-20 rounded-full object-cover"
        />

        <div>
          <h2 className="text-2xl font-bold">{creator.name}</h2>
          <p className="text-sm text-gray-500">
            {posts.length} Posts
          </p>
        </div>
      </div>

      {/* ================= POSTS ================= */}
      {loading ? (
        <p className="mt-6">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-gray-500">
          No posts uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => navigate(`/post/${post._id}`)}
              className="cursor-pointer"
            >
              <img
                src={post.mediaUrl}
                alt={post.title}
                className="h-40 w-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorProfile;
