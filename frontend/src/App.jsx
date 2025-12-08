import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import SavedWritings from "./pages/SavedWritings";
import FollowedAuthors from "./pages/FollowedAuthors";
import ExploreWritings from "./pages/ExploreWritings";
import SingleWriting from "./pages/SingleWriting";
import WritingPage from "./pages/WritingPage";
import LandingPage from "./pages/LandingPage";
import WritingEditor from './components/WritingEditor';
import MyWritings from './components/MyWritings';
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
import Profile from "./pages/Profile";
import Layout from "./components/Layout";

import Feedback from "./pages/Feedback"
import AboutUs from "./pages/AboutUs"
import ContactUs from "./pages/ContactUs"


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
            path="/profile"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <Profile />
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
            path="/writing"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <WritingPage />
              </Layout>
            }
          />

           <Route
            path="/writing/:id"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <SingleWriting />
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


          <Route
            path="/about"
            element={
              <>
                <Header />
                <AboutUs />
                <Footer />
              </>
            }
          />

         

          <Route
            path="/contact"
            element={
              <>
                <Header />
                <ContactUs />
                <Footer />
              </>
            }
          />

          <Route
            path="/feedback"
            element={
              <>
                <Header />
                <Feedback />
                <Footer />
              </>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
