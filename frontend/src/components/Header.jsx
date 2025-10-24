import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Header = ({ searchTerm, setSearchTerm }) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => navigate("/login");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAvatarClick = () => navigate("/profile");
  const handleLogoClick = () => navigate("/");

  if (loading) {
    return (
      <header className="flex items-center bg-gradient-to-r from-blue-700 to-blue-500 text-white h-[70px] px-10 shadow-md sticky top-0 z-[150] w-full">
        <div className="flex items-center gap-3 ml-16">
          <img
            src="logo.jpeg"
            alt="Logo"
            onClick={handleLogoClick}
            className="w-12 h-12 rounded-full cursor-pointer transition-transform duration-300 hover:scale-125 hover:shadow-lg"
          />
          <span className="text-2xl font-bold tracking-wide text-sky-100">
            Echoes Of Art
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="grid grid-cols-[auto_1fr_auto] items-center h-[70px] px-10 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md sticky top-0 z-[150] w-full">
      {/* Left Section (Logo) */}
      <div className="flex items-center gap-3 ml-16">
        <img
          src="logo.jpeg"
          alt="Logo"
          onClick={handleLogoClick}
          className="w-12 h-12 rounded-full cursor-pointer transition-transform duration-300 hover:scale-125 hover:shadow-lg"
        />
        <span className="text-2xl font-bold tracking-wide text-sky-100">
          Echoes Of Art
        </span>
      </div>

      {/* Center (Search Bar) */}
      <div className="flex justify-center items-center">
        <input
          type="text"
          placeholder="Search Art..."
          className="w-full max-w-[550px] px-5 py-2.5 rounded-full bg-sky-50 text-blue-900 text-base shadow-sm outline-none transition-all duration-300 mr-16 focus:shadow-lg focus:shadow-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Right Section (Avatar / Buttons) */}
      {!user ? (
        <button
          onClick={handleSignIn}
          className="justify-self-end px-6 py-2.5 rounded-full bg-blue-100 text-blue-700 font-semibold hover:bg-blue-300 hover:-translate-y-0.5 transition-all duration-300"
        >
          Sign In
        </button>
      ) : (
        <div className="flex items-center gap-3 justify-self-end">
          {/* Avatar */}
          <div
            onClick={handleAvatarClick}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-lg overflow-hidden"
          >
            {user?.profileImage ? (
              <img
                src={
                  user.profileImage.startsWith("http")
                    ? user.profileImage
                    : `http://localhost:8000${user.profileImage}`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {user?.name
                  ? user.name[0].toUpperCase()
                  : user?.email[0].toUpperCase()}
              </span>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-full bg-blue-100 text-blue-700 font-semibold hover:bg-blue-300 hover:-translate-y-0.5 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
