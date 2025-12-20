import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";


/* ===== AUTH ===== */
import { AuthProvider } from "./context/AuthProvider";

/* ===== LAYOUT ===== */
import Layout from "./components/Layout";

/* ===== PAGES ===== */
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/verifyEmail";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import MyUploads from "./pages/MyUploads";
import PostDetails from "./pages/PostDetails";
import CreatorProfile from "./pages/CreatorProfile";
import WritingPage from "./pages/WritingPage";
import SingleWriting from "./pages/SingleWriting";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Feedback from "./pages/Feedback";
import ExploreWritings from "./pages/ExploreWritings";
import SavedWritings from "./pages/SavedWritings";
import FollowedAuthors from "./pages/FollowedAuthors";

/* ===== COMPONENTS (IMPORTANT FIX) ===== */
import MyWritings from "./components/MyWritings";
import WritingEditor from "./components/WritingEditor";

import "./App.css";
import CreatorPublishedWritings from "./pages/CreatorPublishedWritings";

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ================= HOME ================= */}
          <Route
            path="/"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <LandingPage searchTerm={searchTerm} />
              </Layout>
            }
          />

           <Route path="/explore-art" element={<Navigate to="/" replace />} />

          <Route
            path="/home"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <LandingPage searchTerm={searchTerm} />
              </Layout>
            }
          />

          {/* ================= POSTS ================= */}
          <Route
            path="/post/:id"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <PostDetails />
              </Layout>
            }
          />

          <Route
            path="/profile/:creatorId"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <CreatorProfile />
              </Layout>
            }
          />

          {/* ================= USER ================= */}
          <Route
            path="/profile"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <Profile />
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

          {/* ================= WRITINGS ================= */}
          <Route
            path="/writing"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <WritingPage />
              </Layout>
            }
          >
            <Route index element={<ExploreWritings searchTerm={searchTerm} />} />
            <Route path="write" element={<WritingEditor />} />
            <Route path="my" element={<MyWritings />} />
            <Route path="saved" element={<SavedWritings />} />
            <Route path="following" element={<FollowedAuthors />} />
            <Route path=":id" element={<SingleWriting />} /> </Route>
<Route
  path="/creator/:creatorId/writings"
  element={<CreatorPublishedWritings />}
/>
          {/* ================= STATIC PAGES ================= */}
          <Route
            path="/about"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <AboutUs />
              </Layout>
            }
          />

          <Route
            path="/contact"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <ContactUs />
              </Layout>
            }
          />

          <Route
            path="/feedback"
            element={
              <Layout searchTerm={searchTerm} setSearchTerm={setSearchTerm}>
                <Feedback />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
