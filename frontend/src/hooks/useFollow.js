import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Normalize MongoDB / string ids
const asString = (id) => {
  if (id === undefined || id === null) return "";
  return typeof id === "string" ? id : String(id);
};

const useFollow = (creatorIdRaw, onFollowChange) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  // Normalize creatorId
  const creatorId = asString(creatorIdRaw?._id || creatorIdRaw);

  // -----------------------------
  // Load logged-in user once
  // -----------------------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedUser(user);
  }, []);

  // -----------------------------
  // Check follow status
  // -----------------------------
  const checkFollowStatus = useCallback(async () => {
  if (!loggedUser?.token || !creatorId) return;

  try {
    const res = await axios.get(
      `http://localhost:8000/api/users/${creatorId}`,
      {
        headers: {
          Authorization: `Bearer ${loggedUser.token}`,
        },
      }
    );

    const followers = res.data?.followers || [];
    const loggedId = loggedUser._id || loggedUser.id;

    const isFollowing = followers.some(user => String(user._id) === String(loggedId))


    setFollowing(isFollowing);

    // 🔍 DEBUG (optional)
    console.log("Followers:", followers);
    console.log("Logged user:", loggedId);
    console.log("Is following:", isFollowing);
  } catch (err) {
    console.log("❌ Follow status check failed", err);
  }
}, [creatorId, loggedUser]);


  // Run follow check when creatorId or user changes
  useEffect(() => {
    checkFollowStatus();
  }, [checkFollowStatus]);

  // -----------------------------
  // Follow / Unfollow toggle
  // -----------------------------
  const toggleFollow = async () => {
    if (!loggedUser?.token) {
      toast.error("Please login first!");
      return;
    }

    if (loading) return; // prevent double click

    setLoading(true);

    try {
      const endpoint = following
        ? `http://localhost:8000/api/auth/unfollow/${creatorId}`
        : `http://localhost:8000/api/auth/follow/${creatorId}`;

      await axios.put(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${loggedUser.token}`,
          },
        }
      );

      // ✅ Optimistic UI update
      setFollowing((prev) => !prev);

      // ✅ Notify parent (CreatorProfile) to refetch creator
      if (onFollowChange) {
        onFollowChange();
      }

      toast.success(following ? "Unfollowed!" : "Followed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return { following, toggleFollow, loading };
};

export default useFollow;