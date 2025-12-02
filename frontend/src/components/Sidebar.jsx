import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

import {
  CloudArrowUpIcon,
  UserIcon,
  BookmarkIcon,
  FolderIcon,
  PencilSquareIcon,
  EyeIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setOpen(!open);

  const menuItems = [
    { label: "Upload", path: "/upload", icon: <CloudArrowUpIcon className="w-6 h-6" /> },
    { label: "Edit Profile", path: "/profile", icon: <UserIcon className="w-6 h-6" /> },
    { label: "Saved Art", path: "/saved", icon: <BookmarkIcon className="w-6 h-6" /> },
    { label: "My Uploads", path: "/my-uploads", icon: <FolderIcon className="w-6 h-6" /> },
    { label: "Writing", path: "/writing", icon: <PencilSquareIcon className="w-6 h-6" /> },
    { label: "Explore Art", path: "/explore-art", icon: <EyeIcon className="w-6 h-6" /> },
    { label: "Explore Writings", path: "/explore-writings", icon: <EyeIcon className="w-6 h-6" /> },
    { label: "Saved Writings", path: "/saved-writings", icon: <BookmarkIcon className="w-6 h-6" /> },
    { label: "Following Authors", path: "/following", icon: <UserIcon className="w-6 h-6" /> },
  ];

  return (
    <>
      {/* Hamburger */}
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <Bars3Icon className="w-7 h-7" />
      </button>

      {/* Sidebar */}
      <div className={`sidebar-container ${open ? "sidebar-expanded" : ""}`}>
        {user ? (
          menuItems.map((item) => (
            <div key={item.label} className="sidebar-item">
              <button
                className="sidebar-item-button"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
              </button>

              {open && <span className="sidebar-label">{item.label}</span>}

              {!open && <span className="sidebar-tooltip">{item.label}</span>}
            </div>
          ))
        ) : (
          <p className="text-white ml-3 mt-6">Please log in</p>
        )}
      </div>
    </>
  );
};

export default Sidebar;
