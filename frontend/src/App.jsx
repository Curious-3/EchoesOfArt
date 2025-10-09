import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Saved from "./pages/Saved";
import MyUploads from "./pages/MyUploads";
import VerifyEmail from "./pages/verifyEmail";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthProvider";
import "./App.css";

// Layout component to wrap all pages with Header, Sidebar, Footer
const Layout = ({ children, searchTerm, setSearchTerm }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Toaster position="top-right" reverseOrder={false} />
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`main-content ${sidebarOpen ? "shift" : ""}`}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Pages with layout */}
          <Route
            path="/"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <LandingPage searchTerm={searchTerm} />
              </Layout>
            }
          />
          <Route
            path="/home"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <LandingPage searchTerm={searchTerm} />
              </Layout>
            }
          />
          <Route
            path="/upload"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <Upload />
              </Layout>
            }
          />
          <Route
            path="/saved"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <Saved searchTerm={searchTerm} />
              </Layout>
            }
          />
          <Route
            path="/my-uploads"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <MyUploads searchTerm={searchTerm} />
              </Layout>
            }
          />
          <Route
            path="/explore-art"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <LandingPage searchTerm={searchTerm} explore={true} />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
