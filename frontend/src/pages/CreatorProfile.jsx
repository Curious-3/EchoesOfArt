import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FollowButton from "../components/FollowButton";

const CreatorProfile = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  // ======================== FIX IMAGE URL ========================
  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  // ======================== FETCH CREATOR ========================
  useEffect(() => {
    fetchCreator();
    fetchPosts();
  }, [creatorId]);

  const fetchCreator = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/users/${creatorId}`);
      const data = await res.json();
      setCreator(data);
    } catch (err) {
      console.error("Creator fetch error", err);
    }
  };

  // ======================== FETCH POSTS ========================
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

      {/* ======================== PROFILE HEADER ======================== */}
      <div className="flex items-center justify-between w-full">

        <div className="flex items-center gap-4">

          {creator.profileImage ? (
            <img
              src={getImageUrl(creator.profileImage)}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
              No Image
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">{creator.name}</h2>

            <div className="flex gap-6 mt-2">
              <p className="text-sm font-semibold">
                {creator.followers?.length || 0} Followers
              </p>
              <p className="text-sm font-semibold">
                {creator.following?.length || 0} Following
              </p>
            </div>

            <p className="text-sm text-gray-500">{posts.length} Posts</p>
          </div>
        </div>

        {loggedUser && loggedUser._id !== creatorId && (
          <FollowButton
            creatorId={creatorId}
            onFollowChange={fetchCreator}
          />
        )}
      </div>

      {/* ======================== POSTS GRID ======================== */}
      {loading ? (
        <p className="mt-6">Loading posts…</p>
      ) : posts.length === 0 ? (
        <p className="mt-6 text-gray-500">No posts uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {posts.map((post) => (
            <div
              key={post._id}
              onClick={() => navigate(`/post/${post._id}`)}
              className="cursor-pointer border rounded p-2"
            >
              <p className="text-red-500 font-semibold">{post.title}</p>

              {post.mediaUrl && (
                <img
                  src={getImageUrl(post.mediaUrl)}
                  alt={post.title}
                  className="h-40 w-full object-cover rounded-lg bg-gray-300"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorProfile;
