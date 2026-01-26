import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import toast, { Toaster } from "react-hot-toast";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const Profile = () => {
  const { user } = useAuth();

  /* ================= PROFILE ================= */
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    interests: [],
    profileImage: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  /* ================= DATA ================= */
  const [posts, setPosts] = useState([]);
  const [writings, setWritings] = useState([]);

  const [activeStat, setActiveStat] = useState(null);
  const [filter, setFilter] = useState("7days");

  /* ================= GRAPHS ================= */
  const [postsGraph, setPostsGraph] = useState([]);
  const [writingsGraph, setWritingsGraph] = useState([]);
  const [uploadsGraph, setUploadsGraph] = useState([]);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!user?.token) return;

    const fetchProfile = async () => {
      const { data } = await axios.get(
        "http://localhost:8000/api/auth/profile",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setProfile(data.user);
      setFollowers(data.user.followers?.length || 0);
      setFollowing(data.user.following?.length || 0);
      setLoading(false);
    };

    fetchProfile();
  }, [user?.token]);

  /* ================= FETCH POSTS ================= */
  const fetchMyPosts = async () => {
    const id = user?._id || user?.id;
    const res = await axios.get(
      `http://localhost:8000/api/posts/user/${id}`
    );
    setPosts(res.data || []);
  };

  /* ================= FETCH WRITINGS ================= */
  const fetchMyWritings = async () => {
    const res = await axios.get(
      "http://localhost:8000/api/writing/published"
    );

    const id = user?._id || user?.id;
    const filtered = (res.data.writings || []).filter(
      (w) => w.userId?._id === id
    );

    setWritings(filtered);
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchMyPosts();
    fetchMyWritings();
  }, [user?.token]);

  /* ================= TOTALS ================= */
  const totalPosts = posts.length;
  const totalWritings = writings.length;
  const totalMyUploads = totalPosts + totalWritings;

  /* ================= DATE FILTER ================= */
  const applyDateFilter = (items) => {
    const now = new Date();
    return items.filter((i) => {
      const d = new Date(i.createdAt);

      if (filter === "7days") {
        const past = new Date();
        past.setDate(now.getDate() - 7);
        return d >= past;
      }

      if (filter === "1month") {
        const past = new Date();
        past.setMonth(now.getMonth() - 1);
        return d >= past;
      }

      if (filter === "1year") {
        const past = new Date();
        past.setFullYear(now.getFullYear() - 1);
        return d >= past;
      }

      return true;
    });
  };

  /* ================= GRAPH BUILDER ================= */
  const buildGraph = (items) => {
    const map = {};

    applyDateFilter(items).forEach((i) => {
      const date = new Date(i.createdAt)
        .toISOString()
        .split("T")[0];

      const delta = i.action === "delete" ? -1 : 1;
      map[date] = (map[date] || 0) + delta;
    });

    return Object.entries(map).map(([date, count]) => ({
      date,
      count,
    }));
  };

  useEffect(() => {
    setPostsGraph(buildGraph(posts));
    setWritingsGraph(buildGraph(writings));
    setUploadsGraph(buildGraph([...posts, ...writings]));
  }, [posts, writings, filter]);

  /* ================= PIE ================= */
  const pieData = {
    labels: ["Posts", "Writings", "My Uploads"],
    datasets: [
      {
        data: [totalPosts, totalWritings, totalMyUploads],
        backgroundColor: ["#D97706", "#EA580C", "#F59E0B"],
      },
    ],
  };

  /* ================= HANDLERS ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(
      "http://localhost:8000/api/auth/profile",
      profile,
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    toast.success("Profile updated");
    setEditMode(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("profileImage", file);

    const { data } = await axios.put(
      "http://localhost:8000/api/auth/profile-image",
      fd,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setProfile((p) => ({ ...p, profileImage: data.user.profileImage }));
  };
  const handleChange = (e) => {
  const { name, value } = e.target;
  setProfile((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="pb-32">
      <div className="max-w-4xl mx-auto mt-16 p-8 bg-amber-50 shadow-2xl rounded-3xl">

        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <h2 className="text-4xl font-bold text-amber-600">My Profile</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-6 py-2 bg-amber-600 text-white rounded-xl"
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* IMAGE + PIE */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-10">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3">{profile.name}</h3>

            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-amber-500">
              {profile.profileImage && (
                <img
                  src={`http://localhost:8000${profile.profileImage}`}
                  className="w-full h-full object-cover"
                  alt="profile"
                />
              )}
              {editMode && (
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>

          <div className="w-52 h-52">
            <Pie data={pieData} />
          </div>
        </div>

        {/* FOLLOW STATS (STATIC) */}
        <div className="flex justify-center gap-10 mb-8">
          <div className="text-center">
            <p className="font-semibold">Followers</p>
            <p className="text-2xl font-bold">{followers}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Following</p>
            <p className="text-2xl font-bold">{following}</p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <Stat title="Posts" value={totalPosts} onClick={() => setActiveStat("posts")} />
          <Stat title="Writings" value={totalWritings} onClick={() => setActiveStat("writings")} />
          <Stat title="My Uploads" value={totalMyUploads} onClick={() => setActiveStat("uploads")} />
          <Stat title="Followers" value={followers} onClick={() => setActiveStat("followers")} />
        </div>

        {/* FILTER */}
        {activeStat && (
          <div className="flex justify-center mb-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="7days">Last 7 Days</option>
              <option value="1month">Last 1 Month</option>
              <option value="1year">Last 1 Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        )}

        {/* GRAPHS */}
        {activeStat === "posts" && <Graph title="Posts Timeline" data={postsGraph} />}
        {activeStat === "writings" && <Graph title="Writings Timeline" data={writingsGraph} />}
        {activeStat === "uploads" && <Graph title="Uploads Timeline" data={uploadsGraph} />}
        {activeStat === "followers" && (
          <Graph title="Followers" data={[{ date: "Total", count: followers }]} />
        )}

        {/* FORM (ALL FIELDS SAFE) */}
     <form onSubmit={handleSubmit} className="space-y-4 mt-10">
  {/* ================= BASIC PROFILE FIELDS ================= */}

  {/* First Name */}
  <div>
    <label className="block text-sm font-medium text-amber-900 mb-1">
      First Name
    </label>
    <input
      type="text"
      name="firstName"
      value={profile.firstName || ""}
      onChange={handleChange}
      className="w-full p-3 border border-amber-300 rounded-xl bg-amber-50"
    />
  </div>

  {/* Last Name */}
  <div>
    <label className="block text-sm font-medium text-amber-900 mb-1">
      Last Name
    </label>
    <input
      type="text"
      name="lastName"
      value={profile.lastName || ""}
      onChange={handleChange}
      className="w-full p-3 border border-amber-300 rounded-xl bg-amber-50"
    />
  </div>

  {/* Full Name */}
  <div>
    <label className="block text-sm font-medium text-amber-900 mb-1">
      Full Name
    </label>
    <input
      type="text"
      name="name"
      value={profile.name || ""}
      onChange={handleChange}
      className="w-full p-3 border border-amber-300 rounded-xl bg-amber-50"
    />
  </div>

  {/* Email */}
  <div>
    <label className="block text-sm font-medium text-amber-900 mb-1">
      Email
    </label>
    <input
      type="email"
      value={profile.email || ""}
      disabled
      className="w-full p-3 border border-amber-300 rounded-xl bg-amber-200 cursor-not-allowed"
    />
  </div>

  {/* Interests */}
  <div>
    <label className="block text-sm font-medium text-amber-900 mb-1">
      Interests
    </label>
    <input
      type="text"
      value={(profile.interests || []).join(", ")}
      disabled={!editMode}
      onChange={(e) =>
        setProfile({
          ...profile,
          interests: e.target.value
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        })
      }
      className="w-full p-3 border rounded-xl"
      placeholder="e.g. coding, writing, design"
    />
  </div>

  {/* Save Button */}
  {editMode && (
    <button
      type="submit"
      className="w-full py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700"
    >
      Save Changes
    </button>
  )}
</form>



        <Toaster />
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const Stat = ({ title, value, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer p-6 bg-amber-100 rounded-xl text-center hover:scale-105"
  >
    <p className="font-semibold">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const Graph = ({ title, data }) => (
  <div className="mt-8 p-6 bg-amber-50 rounded-xl shadow">
    <h4 className="text-xl font-bold text-center mb-4 text-amber-900">{title}</h4>
    <Line
      data={{
        labels: data.map((i) => i.date),
        datasets: [
          {
            data: data.map((i) => i.count),
            borderColor: "#D97706",
            backgroundColor: "rgba(217,119,6,0.3)",
            fill: true,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            ticks: { stepSize: 1 }, // 🔒 INTEGER FIX
             callback: (value) => Math.round(value),
          },
        },
      }}
    />
  </div>
);

export default Profile;
