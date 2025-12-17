import React from "react";
import useFollow from "../hooks/useFollow";
const FollowButton = ({ creatorId, onFollowChange }) => {
  const { following, toggleFollow, loading } = useFollow(
    creatorId,
    onFollowChange
  );

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition
        ${following ? "bg-gray-900 text-white" : "bg-blue-600 text-white"}
      `}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;

