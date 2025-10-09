import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.token]);

  // Auto-update full name when firstName or lastName changes
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      name: `${prev.firstName || ""} ${prev.lastName || ""}`.trim()
    }));
  }, [profile.firstName, profile.lastName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nested fields like socialLinks.social1
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "http://localhost:8000/api/auth/profile",
        profile,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert(data.message);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const { data } = await axios.put(
        "http://localhost:8000/api/auth/profile-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile({ ...profile, profileImage: data.user.profileImage });
      alert("Profile image updated successfully!");
    } catch (err) {
      console.error("Upload error:", err.response || err);
      alert("Failed to upload image");
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
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
          {profile.name || "Your Name"}
        </h3>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={profile.firstName || ""}
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
              value={profile.lastName || ""}
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
            value={profile.name || ""}
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
            value={profile.email || ""}
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
            value={profile.about || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 resize-none"
          />
        </div>

        {/* Custom Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-2 text-gray-700">Social Link 1</label>
            <input
              type="text"
              name="socialLinks.social1"
              value={profile.socialLinks?.social1 || ""}
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
              value={profile.socialLinks?.social2 || ""}
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
            value={profile.interests?.join(", ") || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                interests: e.target.value.split(",").map((i) => i.trim()),
              })
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
    </div>
  );
};

export default Profile;
