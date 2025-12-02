import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./../styles/Layout.css";

const Layout = ({ children, searchTerm, setSearchTerm }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout-wrapper">
      {/* Fixed Header */}
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Body Area */}
      <div className="layout-body">
        
        {/* Sidebar (fixed left) */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <main
          className={`main-content ${
            sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
