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


  // Fetch profile from backend
  useEffect(() => {
    if (!user?.token || !user) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  // Update full name automatically
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      name: `${prev.firstName || ""} ${prev.lastName || ""}`.trim(),
    }));
  }, [profile.firstName, profile.lastName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfile({ ...profile, [parent]: { ...profile[parent], [child]: value } });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

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
      console.error("Upload error:", err.response || err);
      toast.error("Failed to upload image");
    }
  };
const [showPostsChart, setShowPostsChart] = useState(
  localStorage.getItem("showPostsChart") === "true"
);
useEffect(() => {
  // if reload hua aur showPostsChart true hai, to data dubara fetch karo
  if (showPostsChart) {
    fetchPostsGraph();
  }
}, [showPostsChart]);

const fetchPostsGraph = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = userData?.token;

    if (!token) {
      console.error("No token found, please login again");
      toast.error("Session expired, please login again");
      return;
    }

    const { data } = await axios.get(
      "http://localhost:8000/api/posts/likes/graph",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Normalize data (array ya object dono handle)
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
    console.error("Error fetching graph data:", err);
    toast.error("Failed to fetch posts graph");
  }
};

const handleTotalPostsToggle = () => {
  if (showPostsChart) {
    setGraphData([]); // hide chart
    setShowPostsChart(false);
    localStorage.setItem("showPostsChart", "false");
  } else {
    fetchPostsGraph(); // show chart
  }
};


  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6 md:p-10 bg-white shadow-2xl rounded-3xl border border-gray-200 transition-all duration-500 hover:shadow-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-600 animate-pulse mb-4 md:mb-0">
          My Profile
        </h2>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300"
        >
          {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>
       

      {/* Profile Image & Name */}
      <div className="flex flex-col items-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">{profile.name || "Your Name"}</h3>
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg transition-transform duration-500 hover:scale-110">
          <img
            src={profile.profileImage ? `http://localhost:8000${profile.profileImage}` : "/default-avatar.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          {editMode && (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute bottom-0 left-0 w-full opacity-0 cursor-pointer h-full"
            />
          )}
        </div>
        {editMode && <p className="text-sm mt-2 text-gray-500">Click to change profile picture</p>}

        {/* Social Links Display */}
        <div className="flex space-x-6 mt-4">
          {profile.socialLinks?.social1 && (
            <a
              href={profile.socialLinks.social1}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline transition-all duration-300"
            >
              Social 1
            </a>
          )}
          {profile.socialLinks?.social2 && (
            <a
              href={profile.socialLinks.social2}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 font-semibold hover:underline transition-all duration-300"
            >
              Social 2
            </a>
          )}
        </div>
      </div>
       {/* Followers */}
        <div className="flex justify-center gap-8 mt-4">
  <div className="text-center">
    <h4 className="text-lg font-semibold text-indigo-700">Followers</h4>
    <p className="text-2xl font-bold text-gray-800">{followers}</p>
  </div>
  <div className="text-center">
    <h4 className="text-lg font-semibold text-indigo-700">Following</h4>
    <p className="text-2xl font-bold text-gray-800">{following}</p>
  </div>
</div>
      {/* Stats Section */}
      {profile.stats && (
        <section className="mb-10">
          <h3 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Profile Statistics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Posts */}
            <div
              className="p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleTotalPostsToggle}
            >
              <h4 className="text-lg font-semibold text-purple-800 mb-2">📝 Total Posts</h4>
              <p className="text-4xl font-extrabold text-purple-900">
                {Object.values(profile.stats.categoryWise || {}).reduce((sum, count) => sum + count, 0)}
              </p>
               <p className="text-sm text-gray-600 mt-1">click to show/hide graph</p>
            </div>

            {/* Unique Categories */}
            <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl shadow-lg flex flex-col items-center hover:scale-105 transition-transform duration-300">
              <h4 className="text-lg font-semibold text-pink-800 mb-2">🏷️ Categories</h4>
              <p className="text-4xl font-extrabold text-pink-900">{Object.keys(profile.stats.categoryWise || {}).length}</p>
            </div>
          </div>

          {/* Category-wise Breakdown */}
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
            <h4 className="text-xl font-semibold text-indigo-700 mb-4 text-center">📊 Posts by Category</h4>
            {Object.keys(profile.stats.categoryWise).length > 0 ? (
              <ul className="space-y-3">
                {Object.entries(profile.stats.categoryWise).map(([category, count]) => (
                  <li
                    key={category}
                    className="flex justify-between items-center px-5 py-3 bg-indigo-50 rounded-xl shadow-sm hover:bg-indigo-100 transition-all duration-300"
                  >
                    <span className="font-medium text-gray-700 capitalize">{category}</span>
                    <span className="font-bold text-indigo-600">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center italic">No posts uploaded yet</p>
            )}
          </div>

          {/* Posts Over Time Chart */}
         {graphData.length > 0 && (
  <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg">
    <h4 className="text-xl font-bold mb-4 text-center">Posts Over Time</h4>
    <Line
  data={{
    labels: graphData.map(item => item.date),
    datasets: [
      {
        label: "Posts per Day",
        data: graphData.map(item => Math.round(item.count)), // integer data
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  }}
  options={{
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Posts Uploaded Per Day" },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: {
        title: { display: true, text: "Posts" },
        beginAtZero: true,
        ticks: {
          stepSize: 1, // ensures steps of 1
          callback: function(value) {
            return Number.isInteger(value) ? value : null; // only show integers
          },
        },
      },
    },
  }}
/>

  </div>
)}

        </section>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">Full Name</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profile.email}
            disabled
            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* DOB */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={profile.dob?.substring(0, 10) || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
          />
        </div>

        {/* About */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">About</label>
          <textarea
            name="about"
            value={profile.about}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Social Link 1</label>
            <input
              type="text"
              name="socialLinks.social1"
              value={profile.socialLinks.social1}
              onChange={handleChange}
              disabled={!editMode}
              placeholder="https://"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Social Link 2</label>
            <input
              type="text"
              name="socialLinks.social2"
              value={profile.socialLinks.social2}
              onChange={handleChange}
              disabled={!editMode}
              placeholder="https://"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
            />
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">Interests (comma separated)</label>
          <input
            type="text"
            name="interests"
            value={profile.interests.join(", ")}
            onChange={(e) =>
              setProfile({ ...profile, interests: e.target.value.split(",").map((i) => i.trim()) })
            }
            disabled={!editMode}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
          />
        </div>

        {editMode && (
          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 hover:scale-105 transform transition-all duration-300"
          >
            Save Changes
          </button>
        )}
      </form>

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Profile;
