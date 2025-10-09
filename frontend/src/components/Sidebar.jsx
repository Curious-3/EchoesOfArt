import React, { useState } from "react";
import "./../styles/Sidebar.css";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setOpen(!open);

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false); // Close sidebar after navigation
  };

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <button className="slide-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>

      <div className="sidebar-content">
        {open ? (
          user ? (
            <div className="options">
              <button onClick={() => handleNavigation("/upload")}>Upload</button>
              <button onClick={() => handleNavigation("/profile")}>Edit Profile</button>
              <button onClick={() => handleNavigation("/saved")}>Saved Art</button>
              <button onClick={() => handleNavigation("/my-uploads")}>My Uploads</button>
              <button onClick={() => handleNavigation("/explore-art")}>Explore Art</button>
            </div>
          ) : (
            <p className="register-msg">Please login or register first</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;
