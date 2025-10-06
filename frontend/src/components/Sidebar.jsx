//Sidebar

import React from "react";
import "./../styles/Sidebar.css";

const Sidebar = ({ user, open, setOpen }) => {
  const toggleSidebar = () => setOpen(!open);

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      <button className="slide-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </button>

      {/* content area inside sidebar */}
      <div className="sidebar-content">
        {open ? (
          user ? (
            <div className="options">
              <button>Upload</button>
              <button>Edit Profile</button>
              <button>Saved Art</button>
            </div>
          ) : (
            <p className="register-msg">Please register first</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;