import React from "react";
import "./../styles/Header.css";
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

  if (loading) {
    // You can replace this with a spinner if you like
    return (
      <header className="header">
        <div className="logo-section">
          <img src="logo.jpeg" alt="Logo" className="logo" />
          <span className="site-name">Echoes Of Art</span>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="logo-section">
        <img src="logo.jpeg" alt="Logo" className="logo" />
        <span className="site-name">Echoes Of Art</span>
      </div>

      <div className="search-profile">
        <input
          type="text"
          placeholder="Search Art..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {!user ? (
          <button onClick={handleSignIn} className="signin-btn">
            Sign In
          </button>
        ) : (
          <div className="user-actions">
            <div className="profile-circle">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
