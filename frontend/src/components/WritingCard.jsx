import React from "react";
import { BookmarkIcon, HeartIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

/* 🔹 Helper: strip HTML + limit chars */
const getPreviewText = (html, limit = 50) => {
  const text = html.replace(/<[^>]+>/g, "");
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};

const WritingCard = ({ writing }) => {
  return (
    <Link
      to={`/writing/${writing._id}`}
      className="
        group 
        bg-white/70 backdrop-blur-xl
        rounded-2xl shadow-lg hover:shadow-2xl
        transition-all duration-300 
        hover:-translate-y-2 
        p-5 
        w-[320px]
        cursor-pointer
        flex flex-col
        justify-between
      "
    >
      {/* 🔹 CATEGORY BADGE */}
      {writing.category && (
        <span
          className="
            inline-block mb-2 
            px-3 py-1 
            text-xs font-semibold 
            bg-blue-100 text-blue-700 
            rounded-full w-fit
          "
        >
          {writing.category}
        </span>
      )}

      {/* 🔹 TITLE */}
      <h2
        className="
          text-xl font-bold 
          text-blue-900 
          group-hover:text-blue-700
          transition-colors
          line-clamp-2
        "
      >
        {writing.title}
      </h2>

      {/* 🔹 CONTENT PREVIEW (50 chars max) */}
      <p className="mt-3 text-gray-700 text-sm leading-relaxed">
        {getPreviewText(writing.content, 50)}
      </p>

      {/* 🔹 FOOTER */}
      <div className="mt-4 flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-semibold">
            {writing.userId?.name?.[0]?.toUpperCase() || "A"}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              {writing.userId?.name || "Anonymous"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(writing.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {/* Icons */}
        <div className="flex gap-2">
          <button
            className="
              bg-white/80 backdrop-blur-md 
              p-2 rounded-full shadow-md 
              hover:scale-110 transition-transform
            "
          >
            <BookmarkIcon className="w-5 h-5 text-blue-700" />
          </button>

          <button
            className="
              bg-white/80 backdrop-blur-md 
              p-2 rounded-full shadow-md 
              hover:scale-110 transition-transform
            "
          >
            <HeartIcon className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default WritingCard;
