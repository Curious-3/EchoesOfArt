import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import axios from "axios";

const LandingPage = ({ searchTerm }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [arts, setArts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/posts")
      .then((res) => setArts(res.data))
      .catch((err) => console.error("Error fetching arts:", err));
  }, []);

  const filteredArts = arts.filter((art) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main
        className={`transition-all duration-500 min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f9fbff] to-[#eef2ff] flex flex-col items-center ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <div className="w-full text-center mt-24 mb-12">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
            Featured Artworks
          </h2>
          <div className="w-24 h-1 mt-4 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto rounded-full shadow-lg"></div>
        </div>

        {/* Art Grid */}
        <div className="w-full max-w-7xl px-6 md:px-10 grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-24">
          {filteredArts.length > 0 ? (
            filteredArts.map((art) => (
              <div
                key={art._id}
                className="group bg-white/60 backdrop-blur-lg rounded-2xl overflow-hidden shadow-[0_6px_25px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.15)] hover:-translate-y-2"
              >
                <img
                  src={art.mediaUrl}
                  alt={art.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {art.description}
                  </p>

                  {/* Tags */}
                  {art.tags && art.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {art.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category */}
                  {art.category && (
                    <p className="mt-2 text-sm font-medium text-gray-700">
                      Category: <span className="text-indigo-600">{art.category}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 text-lg font-medium">
              No artworks found 🎨
            </p>
          )}
        </div>
      </main>
    </>
  );
};

export default LandingPage;
