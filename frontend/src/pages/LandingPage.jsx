import React, { useState } from "react";
import Header from "../components/Header";


const LandingPage = ({ user, setPage, setUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- lifted state

  const handleSignIn = () => setPage("login");

  const dummyArts = [
    { id: 1, title: "Sunset", image: "/art1.jpg", story: "Beautiful sunset at the beach" },
    { id: 2, title: "Mountain", image: "/art2.jpg", story: "Hiking adventure" },
    { id: 3, title: "Forest", image: "/art3.jpg", story: "Calm forest view" },
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
        <div className="art-grid">
          {filteredArts.map((art) => (
            <ArtCard key={art.id} art={art} />
          ))}
        </div>
          {/* // <Footer /> */}
      </div>
    </>
  );
};

export default LandingPage;
