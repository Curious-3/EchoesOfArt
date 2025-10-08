// ArtCard.jsx
import React from "react";

const ArtCard = ({ art }) => {
  return (
    <div className="art-card">
      {/* Use mediaUrl from backend */}
      <img src={art.mediaUrl} alt={art.title} />
      <h3>{art.title}</h3>
      <p>{art.description}</p>
      {art.tags && <p>Tags: {art.tags.join(", ")}</p>}
      {art.category && <p>Category: {art.category}</p>}
    </div>
  );
};

export default ArtCard;
