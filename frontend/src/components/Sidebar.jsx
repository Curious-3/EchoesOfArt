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
} from "@heroicons/react/24/outline";

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Upload", path: "/upload", icon: CloudArrowUpIcon },
    { label: "Edit Profile", path: "/profile", icon: UserIcon },
    { label: "Saved Art", path: "/saved", icon: BookmarkIcon },
    { label: "My Uploads", path: "/my-uploads", icon: FolderIcon },
    { label: "Writing", path: "/writing", icon: PencilSquareIcon },
    { label: "Explore Art", path: "/explore-art", icon: EyeIcon },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] 
      transition-all duration-300 
      ${open ? "w-56" : "w-16"} 
      bg-[#004aad] z-[120] overflow-visible`}
    >
      {user && (
        <nav className="flex flex-col mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="group relative flex items-center px-4 py-4 cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-5 h-5 text-black" />

                {open && (
                  <span className="ml-3 text-sm font-medium text-white">
                    {item.label}
                  </span>
                )}

                {!open && (
                  <span
                    className="absolute pointer-events-none left-full top-1/2 -translate-y-1/2 ml-3
                    bg-white text-black shadow-lg border border-gray-300 px-3 py-1 text-sm rounded 
                    whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-[999]"
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
