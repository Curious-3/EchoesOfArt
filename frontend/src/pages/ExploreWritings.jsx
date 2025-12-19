import React, { useEffect, useState } from "react";
import WritingCard from "../components/WritingCard";
import useDebounce from "../hooks/useDebounce";

const ExploreWritings = ({ searchTerm = "" }) => {
  const [writings, setWritings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOG INSIDE COMPONENT
  console.log("SearchTerm:", searchTerm);

  // 🔥 Debounced search value
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchWritings = async () => {
      setLoading(true);
      try {
        const url = debouncedSearch
          ? `http://localhost:8000/api/writing/published?search=${encodeURIComponent(
              debouncedSearch
            )}`
          : `http://localhost:8000/api/writing/published`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setWritings(data.writings);
        }
      } catch (err) {
        console.error("Error fetching writings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWritings();
  }, [debouncedSearch]);

  if (loading) {
    return <div className="p-6 text-center">Loading writings...</div>;
  }

  return (
    <div className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-900">
        ✨ Explore Writings
      </h2>

      {writings.length === 0 ? (
        <p className="text-center text-gray-600">
          No writings found.
        </p>
      ) : (
        <div
          className="
            flex gap-6 overflow-x-auto pb-4
            snap-x snap-mandatory
            scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100
          "
        >
          {writings.map((w) => (
            <div key={w._id} className="snap-start">
              <WritingCard writing={w} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreWritings;
