// src/pages/SavedWritings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const SavedWritings = () => {
  const [savedWritings, setSavedWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = storedUser?.token || null;

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const ids = JSON.parse(
          localStorage.getItem("bookmarkedWritings") || "[]"
        );

        if (!ids.length) {
          setSavedWritings([]);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:8000/api/writing/published"
        );

        const all = res.data.writings || [];
        const filtered = all.filter((w) => ids.includes(w._id));

        setSavedWritings(filtered);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load saved writings");
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const handleUnsave = async (id) => {
    try {
      // Call backend to remove bookmark (if logged in)
      if (token) {
        await axios.put(
          `http://localhost:8000/api/writing/bookmark/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update localStorage
      const stored = JSON.parse(
        localStorage.getItem("bookmarkedWritings") || "[]"
      );
      const updated = stored.filter((wid) => wid !== id);
      localStorage.setItem("bookmarkedWritings", JSON.stringify(updated));

      // Update state
      setSavedWritings((prev) => prev.filter((w) => w._id !== id));
      toast.success("Removed from saved");
    } catch (err) {
      console.error(err);
      toast.error("Could not update saved list");
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading your saved writings...</div>;
  }

  return (
    <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Saved Writings 🔖
      </h2>

      {savedWritings.length === 0 ? (
        <p className="text-center text-gray-600">
          You haven&apos;t saved any writings yet.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedWritings.map((w) => (
            <div
              key={w._id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition relative"
            >
              <button
                onClick={() => handleUnsave(w._id)}
                className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-red-100 text-red-600"
              >
                Remove
              </button>

              <Link to={`/writing/${w._id}`}>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {w.title}
                </h3>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {w.content.replace(/<[^>]+>/g, "")}
                </p>
                <div className="mt-3 text-xs text-gray-500 flex justify-between">
                  <span>{w.userId?.name || "Anonymous"}</span>
                  <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedWritings;
