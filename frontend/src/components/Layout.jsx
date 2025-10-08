// Layout.jsx
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "./../styles/Layout.css";


const Layout = ({ children, searchTerm, setSearchTerm }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="app-layout">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`main-content ${sidebarOpen ? "shift" : ""}`}>
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
