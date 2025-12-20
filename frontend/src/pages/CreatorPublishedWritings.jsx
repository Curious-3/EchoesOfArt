import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CreatorPublishedWritings = () => {
  const { creatorId } = useParams();
  const navigate = useNavigate();

  const [creator, setCreator] = useState(null);
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  useEffect(() => {
    fetchCreator();
    fetchWritings();
  }, [creatorId]);

  /* ================= FETCH CREATOR ================= */
  const fetchCreator = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/users/${creatorId}`
      );
      setCreator(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH PUBLISHED WRITINGS ================= */
  const fetchWritings = async () => {
  try {
    const res = await axios.get(
      "http://localhost:8000/api/writing/published"
    );

    const allWritings = res.data.writings || [];

    // ✅ FILTER BY CREATOR
    const filtered = allWritings.filter(
      (w) => w.userId?._id === creatorId
    );

    setWritings(filtered);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <p className="text-center mt-20">Loading writings...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* ================= CREATOR HEADER ================= */}
      {creator && (
        <div className="flex items-center gap-4 mb-10">

          {creator.profileImage ? (
            <img
              src={getImageUrl(creator.profileImage)}
              className="w-20 h-20 rounded-full object-cover border"
              alt="profile"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              👤
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">{creator.name}</h2>

            <button className="mt-2 px-4 py-1.5 text-sm rounded-full bg-purple-600 text-white">
              Total Published · {writings.length}
            </button>
          </div>
        </div>
      )}

      {/* ================= WRITING CARDS ================= */}
      {writings.length === 0 ? (
        <p className="text-center text-gray-500">
          No published writings yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {writings.map((w) => (
            <div
              key={w._id}
              onClick={() => navigate(`/writing/${w._id}`)}
              className="
                cursor-pointer
                border rounded-xl p-5
                bg-white
                hover:shadow-lg transition
              "
            >
              {/* AUTHOR */}
              <div className="flex items-center gap-3 mb-4">
                {creator?.profileImage ? (
                  <img
                    src={getImageUrl(creator.profileImage)}
                    className="w-10 h-10 rounded-full object-cover"
                    alt="author"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    👤
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold">
                    {creator?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(w.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              {/* TITLE */}
              <h3 className="text-lg font-bold line-clamp-2">
                {w.title}
              </h3>

              <p className="mt-4 text-sm text-blue-600 font-medium">
                Read →
              </p>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default CreatorPublishedWritings;
