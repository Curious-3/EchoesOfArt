import React, { useState } from "react";
import { BookmarkIcon, HeartIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const ArtCard = ({ art }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const notify = (msg, type = "error") => {
    if (type === "error") toast.error(msg);
  };

  // Render correct media type
  const renderMedia = () => {
    switch (art.mediaType || art.type) {
      case "image":
        return (
          <img
            src={art.mediaUrl}
            alt={art.title}
            className="
              w-full h-56 object-cover 
              rounded-xl 
              transition-transform duration-500 group-hover:scale-105
            "
            onError={() => notify("Failed to load image")}
          />
        );

      case "video":
        return (
          <div className="relative w-full h-56 rounded-xl overflow-hidden">
            {!isPlaying ? (
              <img
                src={art.thumbnailUrl || art.mediaUrl}
                alt={art.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsPlaying(true)}
              />
            ) : (
              <video
                src={art.mediaUrl}
                autoPlay
                controls
                className="w-full h-full object-cover"
                onEnded={() => setIsPlaying(false)}
                onError={() => notify("Video failed to play")}
              />
            )}

            {!isPlaying && (
              <div className="
                absolute inset-0 
                flex items-center justify-center 
                bg-black/40
              ">
                <div className="
                  w-14 h-14 
                  bg-white/90 text-blue-700 
                  rounded-full 
                  flex items-center justify-center
                  text-xl font-bold
                  shadow-xl
                ">
                  ▶
                </div>
              </div>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="w-full h-20 rounded-xl bg-blue-50 flex items-center px-4">
            <audio
              controls
              src={art.mediaUrl}
              className="w-full"
              onError={() => notify("Audio failed to load")}
            />
          </div>
        );

      default:
        return (
          <img
            src={art.mediaUrl}
            alt={art.title}
            className="w-full h-56 object-cover rounded-xl"
            onError={() => notify("Media failed to load")}
          />
        );
    }
  };

  return (
    <div
      className="
        group 
        bg-white/70 backdrop-blur-xl 
        shadow-lg 
        hover:shadow-2xl 
        hover:-translate-y-2 
        transition-all duration-300 
        rounded-2xl 
        overflow-hidden
        cursor-pointer
        w-[280px]
      "
    >
      {/* Media */}
      <div className="relative">
        {renderMedia()}

        {/* Bookmark & Like */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <div className="
            bg-white/80 backdrop-blur-md 
            p-2 rounded-full shadow-md 
            hover:scale-110 transition-transform
          ">
            <BookmarkIcon className="w-5 h-5 text-blue-700" />
          </div>
          <div className="
            bg-white/80 backdrop-blur-md 
            p-2 rounded-full shadow-md 
            hover:scale-110 transition-transform
          ">
            <HeartIcon className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-blue-900">
          {art.title}
        </h3>

        {art.description && (
          <p className="text-sm text-gray-700 mt-1 line-clamp-2 leading-relaxed">
            {art.description}
          </p>
        )}

        {art.category && (
          <p className="text-xs text-gray-500 mt-2">
            Category: <span className="font-medium">{art.category}</span>
          </p>
        )}

        {art.tags?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Tags:
            <span className="text-gray-700 ml-1">
              {art.tags.slice(0, 3).join(", ")}
              {art.tags.length > 3 && "…"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtCard;
