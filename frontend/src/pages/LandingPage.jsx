import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ArtCard from "../components/ArtCard";
import "./../styles/LandingPage.css"; // The CSS file where centering styles are applied
import Footer from "../components/Footer";

const LandingPage = ({ user, setPage, setUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- lifted state

  const handleSignIn = () => setPage("login");

  // Corrected dummyArts with unique IDs to prevent React key warnings
  const dummyArts = [
    { id: 1, title: "Sunset", image: "/art1.jpg", story: "Beautiful sunset at the beach" },
    { id: 2, title: "Mountain", image: "/art2.jpg", story: "Hiking adventure" },
    { id: 3, title: "Forest", image: "/art3.jpg", story: "Calm forest view" },
    { id: 4, title: "Ocean", image: "/art1.jpg", story: "Vast ocean view" },
    { id: 5, title: "Desert", image: "/art2.jpg", story: "Arid landscape" },
    { id: 6, title: "Cityscape", image: "/art3.jpg", story: "Busy city night" },
    { id: 7, title: "Abstract 1", image: "/art1.jpg", story: "Modern art piece" },
    { id: 8, title: "Portrait", image: "/art2.jpg", story: "A smiling face" },
    { id: 9, title: "Still Life", image: "/art3.jpg", story: "Fruit bowl on a table" },
    { id: 10, title: "Starry Night", image: "/art1.jpg", story: "Sky full of stars" },
    { id: 11, title: "Rainy Day", image: "/art2.jpg", story: "Street in the rain" },
    { id: 12, title: "Countryside", image: "/art3.jpg", story: "Green fields and hills" },
    { id: 13, title: "Volcano", image: "/art1.jpg", story: "Lava flow" },
    { id: 14, title: "Ice Cave", image: "/art2.jpg", story: "Frozen wonder" },
    { id: 15, title: "Canyon", image: "/art3.jpg", story: "Deep rocky path" },
    { id: 16, title: "Aurora", image: "/art1.jpg", story: "Northern lights spectacle" },
    { id: 17, title: "Marketplace", image: "/art2.jpg", story: "A vibrant market" },
    { id: 18, title: "Lighthouse", image: "/art3.jpg", story: "Guard of the sea" },
    { id: 19, title: "Balloon", image: "/art1.jpg", story: "Hot air balloon flight" },
    { id: 20, title: "Bridge", image: "/art2.jpg", story: "A massive steel structure" },
    { id: 21, title: "Train", image: "/art3.jpg", story: "Old steam engine" },
    { id: 22, title: "Lake", image: "/art1.jpg", story: "Calm waters reflection" },
    { id: 23, title: "Castle", image: "/art2.jpg", story: "Ancient stone fortress" },
    { id: 24, title: "Dunes", image: "/art3.jpg", story: "Windswept sand hills" },
    { id: 25, title: "Garden", image: "/art1.jpg", story: "Lush botanical beauty" },
    { id: 26, title: "Harbor", image: "/art2.jpg", story: "Boats at rest" },
    { id: 27, title: "Meadow", image: "/art3.jpg", story: "Flowers and open field" },    
  ];


  const filteredArts = dummyArts.filter((art) =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Sidebar is fixed; pass controlled props */}
      <Sidebar user={user} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* main area (header + content) that will shift right when sidebarOpen true */}
      <div className={`main ${sidebarOpen ? "shift" : ""}`}>
        <Header user={user} onSignIn={handleSignIn} onSearch={setSearchTerm} />

        {/* This h2 is centered and styled using the .featured-work CSS class */}
        <h2 className="featured-work">Featured Work</h2> 


        <div className="art-grid">
          {filteredArts.map((art) => (
            // Ensure ArtCard has a unique key, like art.id
            <ArtCard key={art.id} art={art} />
          ))}
        </div>
          <Footer/>
      </div>
    </>
  );
};

export default LandingPage;