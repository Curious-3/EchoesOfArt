import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
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

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  const menuItems = [
    { label: "Upload", path: "/upload", icon: <CloudArrowUpIcon className="w-6 h-6" /> },
    { label: "Edit Profile", path: "/profile", icon: <UserIcon className="w-6 h-6" /> },
    { label: "Saved Art", path: "/saved", icon: <BookmarkIcon className="w-6 h-6" /> },
    { label: "My Uploads", path: "/my-uploads", icon: <FolderIcon className="w-6 h-6" /> },
    { label: "Writing", path: "/writing", icon: <PencilSquareIcon className="w-6 h-6" /> },
    { label: "Explore Art", path: "/explore-art", icon: <EyeIcon className="w-6 h-6" /> },
  ];

  return (
    <>
      
      {!open && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md shadow-md transition-transform duration-300 hover:scale-110"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      )}

      
      <div
        style={{ width: open ? "16rem" : "4rem" }}
        className="fixed top-0 left-0 h-full z-50 bg-gradient-to-b from-blue-900 to-blue-600 text-white shadow-lg pt-16 transition-all duration-300 ease-in-out"
      >
      
        <button
          onClick={toggleSidebar}
          className="absolute top-3 -right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-11 h-11 flex items-center justify-center text-lg shadow-md transition-transform duration-300 hover:scale-110"
        >
          ☰
        </button>

      
        <div className="flex flex-col gap-3 mt-4 m-2">
          {user ? (
            menuItems.map((item) => (
              <div key={item.label} className="relative flex items-center group">
                <button
                  onClick={() => handleNavigation(item.path)}
                  className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500 hover:bg-blue-600 shadow-md transition-all duration-300"
                >
                  {item.icon}
                </button>

              
                {!open && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1 bg-blue-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}

               
                {open && (
                  <span className="ml-3 font-semibold">{item.label}</span>
                )}
              </div>
            ))
          ) : (
            open && (
              <p className="text-red-400 font-medium p-3 text-sm transition-all duration-300">
                Please login or register first
              </p>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
