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

  const HeaderShell = ({ children }) => (
    <header className="fixed top-0 left-0 w-full z-[150]">
      <div className="backdrop-blur-2xl bg-gradient-to-r from-blue-900/90 via-blue-700/85 to-blue-500/90 shadow-lg border-b border-white/15">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          {children}
        </div>
      </div>
    </header>
  );

  if (loading) {
    return (
      <HeaderShell>
        {/* Left: Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
          <img
            src="logo.jpeg"
            alt="Logo"
            className="w-11 h-11 rounded-2xl object-cover shadow-md border border-white/40"
          />
          <span className="text-2xl font-extrabold tracking-wide text-sky-100">
            Echoes Of Art
          </span>
        </div>
        {/* Center: Placeholder */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[550px] h-[40px] rounded-full bg-white/10 animate-pulse" />
        </div>
        {/* Right: Skeleton */}
        <div className="w-24 h-9 rounded-full bg-white/10 animate-pulse" />
      </HeaderShell>
    );
  }

  return (
    <HeaderShell>
      {/* Left: Logo & Name */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
        <img
          src="logo.jpeg"
          alt="Logo"
          className="w-11 h-11 rounded-2xl object-cover shadow-md border border-white/40 transition-transform duration-300 hover:scale-110"
        />
        <span className="text-2xl font-extrabold tracking-wide text-sky-100 drop-shadow-sm">
          Echoes Of Art
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[550px] relative">
          <input
            type="text"
            placeholder="Search art, writings, creators..."
            className="w-full px-5 py-2.5 rounded-full bg-sky-50/95 text-blue-900 text-sm md:text-base shadow-md outline-none transition-all duration-300 focus:shadow-xl focus:shadow-blue-300 focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-500">
            ⌕
          </span>
        </div>
      </div>

      {/* Right: Auth / Profile */}
      {!user ? (
        <button
          onClick={handleSignIn}
          className="px-5 py-2.5 rounded-full bg-white text-blue-700 text-sm font-semibold shadow-md hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-300"
        >
          Sign In
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {/* User badge */}
          <div
            onClick={handleAvatarClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 cursor-pointer hover:bg-white/25 transition-all duration-300"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 font-semibold shadow-md">
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
                    : user?.email?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-blue-100">Welcome</span>
              <span className="text-sm font-semibold text-white truncate max-w-[120px]">
                {user?.name || user?.email}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-white/90 text-blue-700 text-xs md:text-sm font-semibold shadow-md hover:bg-blue-100 hover:-translate-y-0.5 transition-all duration-300"
          >
            Logout
          </button>
        </div>
      )}
    </HeaderShell>
  );
};

export default Header;
