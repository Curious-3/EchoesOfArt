import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ArtCard from "../components/ArtCard";
import "../styles/main.css";

const Home = () => {
  const [user, setUser] = useState(null);

  const artList = [
    { title: "Sunset", artist: "Alice" },
    { title: "Abstract", artist: "Bob" },
    { title: "Nature", artist: "Charlie" },
  ];

  return (
    <div>
      <Header user={user} setUser={setUser} />
      <main>
        <Sidebar user={user} />
        <div className="art-grid">
          {artList.map((art, index) => (
            <ArtCard key={index} title={art.title} artist={art.artist} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;