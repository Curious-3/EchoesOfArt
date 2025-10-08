import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ArtCard from "../components/ArtCard";
import "./../styles/LandingPage.css";
import Footer from "../components/Footer";
import axios from "axios";

const LandingPage = ({ searchTerm }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arts, setArts] = useState([]);

  // Fetch arts from backend (Cloudinary media from /api/posts)
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/posts")
      .then((res) => setArts(res.data))
      .catch((err) => console.error("Error fetching arts:", err));
  }, []);

  // Filter arts by search term
  const filteredArts = arts.filter((art) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`main ${sidebarOpen ? "shift" : ""}`}>
        {/* Art grid */}
        <div className="art-grid">
          {filteredArts.length > 0 ? (
            filteredArts.map((art) => <ArtCard key={art._id} art={art} />)
          ) : (
            <p>No arts found</p>
          )}
        </div>
      </div>
    </>
  );
};

export default LandingPage;
