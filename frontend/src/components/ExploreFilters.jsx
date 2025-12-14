import React from "react";

const mediaTypes = [
  { label: "All", value: "" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Text", value: "text" },
  { label: "Audio", value: "audio" },
];

const ExploreFilters = ({ filters, setFilters }) => {
  return (
    <div className="w-full bg-white rounded-xl p-4 shadow-sm mb-6">

      {/* Top row */}
      <div className="flex flex-wrap justify-between items-center gap-4">

        {/* Media Type Chips */}
        <div className="flex flex-wrap gap-2">
          {mediaTypes.map((type) => (
            <button
              key={type.value}
              onClick={() =>
                setFilters({ ...filters, mediaType: type.value })
              }
              className={`px-4 py-1.5 rounded-full text-sm border transition
                ${
                  filters.mediaType === type.value
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={(e) =>
            setFilters({ ...filters, sort: e.target.value })
          }
          className="px-4 py-2 border rounded-md text-sm"
        >
          <option value="recent">🆕 Most Recent</option>
          <option value="oldest">⏳ Oldest</option>
          <option value="views">👁️ Most Viewed</option>
          <option value="likes">❤️ Most Liked</option>
        </select>
      </div>

      {/* Bottom row */}
      <div className="flex flex-wrap gap-4 mt-4 items-center">

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
          className="px-4 py-2 border rounded-md text-sm"
        >
          <option value="">All Categories</option>
          <option value="abstract">Abstract</option>
          <option value="nature">Nature</option>
          <option value="portrait">Portrait</option>
          <option value="poetry">Poetry</option>
        </select>

        {/* Tag */}
        <select
          value={filters.tag}
          onChange={(e) =>
            setFilters({ ...filters, tag: e.target.value })
          }
          className="px-4 py-2 border rounded-md text-sm"
        >
          <option value="">All Tags</option>
          <option value="digital">Digital</option>
          <option value="sketch">Sketch</option>
          <option value="modern">Modern</option>
        </select>

        {/* Clear Filters */}
        <button
          onClick={() =>
            setFilters({
              search: "",
              sort: "recent",
              mediaType: "",
              category: "",
              tag: "",
            })
          }
          className="text-sm text-blue-600 hover:underline ml-auto"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default ExploreFilters;
