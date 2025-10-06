import React from "react";

const ArtCard = ({ art }) => {
  return (
    <div className="art-card">
      <img src={art.image} alt={art.title} />
      <h3>{art.title}</h3>
      <p>{art.story}</p>
    </div>
  );
};

export default ArtCard;