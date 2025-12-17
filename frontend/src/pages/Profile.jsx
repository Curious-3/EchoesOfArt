import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import toast, { Toaster } from "react-hot-toast";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Profile = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    dob: "",
    about: "",
    profileImage: "",
    socialLinks: { social1: "", social2: "" },
    interests: [],
    stats: { totalLikes: 0, categoryWise: {} },
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [graphData, setGraphData] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  // Date filter state
  const [dateFilter, setDateFilter] = useState("7days");

  // Fetch profile
  useEffect(() => {
    if (!user?.token) return;

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const fetchedProfile = {
          ...profile,
          ...data.user,
          postStats: data.user.postStats || { images: 0, videos: 0, audios: 0, others: 0 },
          totalLikes: data.user.totalLikes || 0,
        };

        setProfile(fetchedProfile);
        setFollowers(data.user.followers?.length || 0);
        setFollowing(data.user.following?.length || 0);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.token]);

  // Update full name auto
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: `${prev.firstName || ""} ${prev.lastName || ""}`.trim(),
    }));
  }, [profile.firstName, profile.lastName]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfile({ ...profile, [parent]: { ...profile[parent], [child]: value } });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  // Profile update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put("http://localhost:8000/api/auth/profile", profile, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success(data.message || "Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const { data } = await axios.put("http://localhost:8000/api/auth/profile-image", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile((prev) => ({ ...prev, profileImage: data.user.profileImage }));
      toast.success("Profile image updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    }
  };

  // State for showing chart
  const [showPostsChart, setShowPostsChart] = useState(
    localStorage.getItem("showPostsChart") === "true"
  );

  useEffect(() => {
    if (showPostsChart) fetchPostsGraph();
  }, [showPostsChart]);

  // Fetch posts graph
  const fetchPostsGraph = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const token = userData?.token;

      const { data } = await axios.get(
        "http://localhost:8000/api/posts/likes/graph",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formattedData = Array.isArray(data)
        ? data.map(item => ({ date: item.date, count: Math.round(item.count) }))
        : Object.entries(data).map(([date, count]) => ({
            date,
            count: Math.round(count),
          }));

      setGraphData(formattedData);
      setShowPostsChart(true);
      localStorage.setItem("showPostsChart", "true");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch posts graph");
    }
  };

  const handleTotalPostsToggle = () => {
    if (showPostsChart) {
      setGraphData([]);
      setShowPostsChart(false);
      localStorage.setItem("showPostsChart", "false");
    } else {
      fetchPostsGraph();
    }
  };

  // ⭐ FILTERING FUNCTION — 7 DAYS / 1 MONTH / 1 YEAR
  const getFilteredGraphData = () => {
    if (!graphData.length) return [];
    const now = new Date();

    return graphData.filter((item) => {
      const itemDate = new Date(item.date);

      if (dateFilter === "7days") {
        const past = new Date();
        past.setDate(now.getDate() - 7);
        return itemDate >= past;
      }

      if (dateFilter === "1month") {
        const past = new Date();
        past.setMonth(now.getMonth() - 1);
        return itemDate >= past;
      }

      if (dateFilter === "1year") {
        const past = new Date();
        past.setFullYear(now.getFullYear() - 1);
        return itemDate >= past;
      }

      return true; // ALL TIME
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="pb-32">

      <div className="max-w-4xl mx-auto mt-16 p-6 md:p-10 bg-white shadow-2xl rounded-3xl border border-gray-200">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-600">My Profile</h2>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">{profile.name}</h3>

          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg">
          {profile.profileImage && (
  <img
    src={`http://localhost:8000${profile.profileImage}`}
    alt="Profile"
    className="w-full h-full object-cover"
  />
)}

            {editMode && (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute bottom-0 left-0 w-full opacity-0 h-full cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Followers */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-indigo-700">Followers</h4>
            <p className="text-2xl font-bold">{followers}</p>
          </div>
          <div className="text-center">
            <h4 className="text-lg font-semibold text-indigo-700">Following</h4>
            <p className="text-2xl font-bold">{following}</p>
          </div>
        </div>

        {/* Stats Section */}
        <section className="mb-10 mt-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Total Posts */}
            <div
              className="p-6 bg-purple-100 rounded-2xl shadow-lg text-center cursor-pointer hover:scale-105"
              onClick={handleTotalPostsToggle}
            >
              <h4 className="text-xl font-semibold">📝 Total Posts</h4>
              <p className="text-4xl font-bold">
                {Object.values(profile.stats.categoryWise || {}).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-sm mt-1 text-gray-600">Click to show/hide graph</p>
            </div>

            {/* Categories */}
            <div className="p-6 bg-pink-100 rounded-2xl shadow-lg text-center">
              <h4 className="text-xl font-semibold">🏷️ Categories</h4>
              <p className="text-4xl font-bold">
                {Object.keys(profile.stats.categoryWise || {}).length}
              </p>
            </div>
          </div>

          {/* Posts Graph */}
          {graphData.length > 0 && (
            <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">

              <h4 className="text-xl font-bold text-center mb-4">Posts Over Time</h4>

              {/* Filter Dropdown */}
              <div className="flex justify-center mb-4">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-lg"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="1month">Last 1 Month</option>
                  <option value="1year">Last 1 Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* ChartJS */}
              <Line
                data={{
                  labels: getFilteredGraphData().map((i) => i.date),
                  datasets: [
                    {
                      label: "Posts per Day",
                      data: getFilteredGraphData().map((i) => i.count),
                      borderColor: "rgba(75,192,192,1)",
                      backgroundColor: "rgba(75,192,192,0.3)",
                      fill: true,
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      ticks: {
                        stepSize: 1,
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />

            </div>
          )}
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                disabled={!editMode}
                className="w-full p-3 border rounded-xl"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* Email */}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full p-3 border rounded-xl bg-gray-200"
            />
          </div>

          {/* Interests */}
          <div>
            <label>Interests</label>
            <input
              type="text"
              name="interests"
              value={profile.interests.join(", ")}
              disabled={!editMode}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  interests: e.target.value.split(",").map((i) => i.trim()),
                })
              }
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {editMode && (
            <button
              type="submit"
              className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
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

export default Profile;
