import React, { useState } from "react";


const ArtCard = ({ art }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const renderMedia = () => {
    switch (art.mediaType || art.type) {
      case "image":
        return (
          <img
            src={art.mediaUrl}
            alt={art.title}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        );

      case "video":
        return (
          <div className="relative w-full h-64">
            {!isPlaying ? (
              <img
                src={art.thumbnailUrl || "fallback-thumbnail.jpg"}
                alt={art.title}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => setIsPlaying(true)}
              />
            ) : (
              <video
                src={art.mediaUrl}
                controls
                autoPlay
                className="w-full h-64 object-cover"
                onEnded={() => setIsPlaying(false)}
              />
            )}
          </div>
        );

      case "audio":
        return (
          <div className="p-4 bg-gray-100">
            <audio src={art.mediaUrl} controls className="w-full" />
          </div>
        );

      default:
        return (
          <img
            src={art.mediaUrl}
            alt={art.title}
            className="w-full h-64 object-cover"
          />
        );
    }
  };

  return (
    <div className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 hover:-translate-y-1 bg-white">
      {renderMedia()}

      <div className="p-4 bg-white/90">
        <h3 className="text-lg font-semibold text-gray-800">{art.title}</h3>

        {art.description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {art.description}
          </p>
        )}

        {art.tags && art.tags.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Tags: <span className="text-gray-700">{art.tags.join(", ")}</span>
          </p>
        )}

        {art.category && (
          <p className="text-xs text-gray-500 mt-1">
            Category: <span className="text-gray-700">{art.category}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtCard;
