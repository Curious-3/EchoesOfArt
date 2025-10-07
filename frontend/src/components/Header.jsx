// Header.jsx
import React from "react";
import "./../styles/Header.css";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Header = ({ onSearch }) => {
  const { user, logout } = useAuth(); // get logout from context
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout(); // clear localStorage + reset user
    navigate("/"); // redirect after logout
  };
;
  return (
    <header className="header">
      <div className="logo-section">
        <img src="logo.png" alt="Logo" className="logo" />
        <span className="site-name">Echoes Of Art</span>
      </div>

      <div className="search-profile">
        <input
          type="text"
          placeholder="Search Art..."
          className="search-bar"
          onChange={(e) => onSearch(e.target.value)}
        />

        {!user ? (
          <button onClick={handleSignIn} className="signin-btn">
            Sign In
          </button>
        ) : (
          <div className="user-actions">
            <div className="profile-circle">
              {user.name ? user.name[0] : user.email[0]}
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
