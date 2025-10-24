import React, { useEffect, useState } from "react";
import axios from "axios";
import ArtCard from "../components/ArtCard";
import toast, { Toaster } from "react-hot-toast";

const Saved = () => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
          setError("Please login to view saved posts.");
          toast.error("Please login to view saved posts.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:8000/api/saved/${user.id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        setImages(response.data.images || []);
        setVideos(response.data.videos || []);
        setAudios(response.data.audios || []);
        toast.success("Saved posts loaded successfully!");
      } catch (err) {
        console.error("Error fetching saved posts:", err);
        setError("Failed to load saved posts.");
        toast.error("Failed to load saved posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium text-gray-600">
        Loading saved posts...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-medium">
        {error}
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64 p-8">
      {/* Page Heading */}
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Saved Posts</h1>

      {/* IMAGES SECTION */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-5 text-gray-700 border-b-2 border-gray-300 pb-2">
          Images
        </h2>
        {images.length === 0 ? (
          <p className="text-gray-500 italic">No saved images.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((item) => (
              <ArtCard key={item._id} art={item} />
            ))}
          </div>
        )}
      </section>

      {/* VIDEOS SECTION */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-5 text-gray-700 border-b-2 border-gray-300 pb-2">
          Videos
        </h2>
        {videos.length === 0 ? (
          <p className="text-gray-500 italic">No saved videos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((item) => (
              <ArtCard key={item._id} art={item} />
            ))}
          </div>
        )}
      </section>

      {/* AUDIOS SECTION */}
      <section>
        <h2 className="text-2xl font-semibold mb-5 text-gray-700 border-b-2 border-gray-300 pb-2">
          Audios
        </h2>
        {audios.length === 0 ? (
          <p className="text-gray-500 italic">No saved audios.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {audios.map((item) => (
              <ArtCard key={item._id} art={item} />
            ))}
          </div>
        )}
      </section>

      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

export default Saved;
