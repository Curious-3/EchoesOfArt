//Header.jsx
import React from "react";
import "./../styles/Header.css";

const Header = ({ user, onSignIn, onSearch }) => {
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
          onChange={(e) => onSearch(e.target.value)}
        />
        {!user ? (
          <button onClick={onSignIn} className="signin-btn">
            Sign In
          </button>
        ) : (
        
          <div className="profile-circle">{user.name?user.name[0]:user.email[0]}</div>
        )}
      </div>
    </header>
  );
};

export default Header;