// Header.jsx
import React from "react";
import "./../styles/Header.css";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Header = ({ onSearch }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login"); // redirect to login page
  };

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
          <div className="profile-circle">
            {user.name ? user.name[0] : user.email[0]}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
