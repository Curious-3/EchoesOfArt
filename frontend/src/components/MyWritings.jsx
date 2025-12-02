import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MyWritings = ({ userToken }) => {
  const [writings, setWritings] = useState([]);
  const [activeTab, setActiveTab] = useState("draft");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const finalToken = userToken || storedUser?.token;

  useEffect(() => {
    if (!finalToken) {
      toast.error("Login required!");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:8000/api/writing/my-writings",
          { headers: { Authorization: `Bearer ${finalToken}` } }
        );
        setWritings(res.data.writings);
      } catch (err) {
        toast.error("Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [finalToken]);

  const filtered = writings.filter((w) => w.status === activeTab);

  const handleEdit = (writing) => {
    localStorage.setItem("editingWriting", JSON.stringify(writing));
    navigate("/writing");
  };

  const deleteWriting = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/writing/${id}`, {
        headers: { Authorization: `Bearer ${finalToken}` },
      });

      setWritings((prev) => prev.filter((w) => w._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Couldn't delete");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-center text-xl mb-4">My Writings</h2>

      <div className="flex justify-center gap-4 mb-4">
        {["draft", "published"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No writings found.</p>
      ) : (
        filtered.map((w) => (
          <div
            key={w._id}
            onClick={() => handleEdit(w)}
            className="p-4 bg-white shadow rounded mb-3 relative cursor-pointer"
          >
            <h3 className="font-bold">{w.title}</h3>
            <p className="text-sm text-gray-600">
              {w.content.replace(/<[^>]+>/g, "").slice(0, 100)}...
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteWriting(w._id);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyWritings;
