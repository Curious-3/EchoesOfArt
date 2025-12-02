// src/pages/FollowedAuthors.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const FollowedAuthors = () => {
  const [authorData, setAuthorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowed = async () => {
      try {
        const followedIds = JSON.parse(
          localStorage.getItem("followedAuthors") || "[]"
        );

        if (!followedIds.length) {
          setAuthorData([]);
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "http://localhost:8000/api/writing/published"
        );
        const writings = res.data.writings || [];

        const map = {};

        writings.forEach((w) => {
          const authorId = w.userId?._id;
          if (!authorId) return;
          if (!followedIds.includes(authorId)) return;

          if (!map[authorId]) {
            map[authorId] = {
              id: authorId,
              name: w.userId.name,
              writings: [],
            };
          }
          map[authorId].writings.push(w);
        });

        setAuthorData(Object.values(map));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowed();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading followed authors...</div>;
  }

  return (
    <div className="px-4 md:px-8 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Authors You Follow ⭐
      </h2>

      {authorData.length === 0 ? (
        <p className="text-center text-gray-600">
          You&apos;re not following any authors yet.
        </p>
      ) : (
        <div className="space-y-6">
          {authorData.map((author) => {
            const latest = author.writings
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];

            return (
              <div
                key={author.id}
                className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${author.name}&background=random`}
                    alt={author.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{author.name}</h3>
                    <p className="text-xs text-gray-500">
                      {author.writings.length} writings • Last on{" "}
                      {latest &&
                        new Date(latest.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    Recent writings:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {author.writings.slice(0, 3).map((w) => (
                      <li key={w._id}>{w.title}</li>
                    ))}
                    {author.writings.length > 3 && (
                      <li className="text-xs text-gray-500">
                        + {author.writings.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FollowedAuthors;
