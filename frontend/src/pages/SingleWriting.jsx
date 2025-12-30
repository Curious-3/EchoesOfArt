import { socket } from "../socket";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import WritingComments from "../components/WritingComments";
import WritingPost from "../components/WritingPost";




const SingleWriting = () => {
  const { id } = useParams();
const [writing, setWriting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reportReason, setReportReason] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = storedUser?.token || null;
  const userId = storedUser?.id || storedUser?._id;
  // 🔐 check if logged-in user is creator of this writing
const isCreator =
  writing?.userId?._id?.toString() === userId?.toString();

  const navigate = useNavigate();


  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);
  

  useEffect(() => {
  if (!id) return;

  socket.emit("join_post", id);

  return () => {
    socket.off("comment_added");
    socket.off("comment_updated");
    socket.off("comment_deleted");
    socket.off("reply_added");
    socket.off("reply_updated");
    socket.off("reply_deleted");
    socket.off("reaction_updated");
  };
}, [id]);

  /* ================= FETCH WRITING ================= */
  useEffect(() => {
    const fetchWriting = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/writing/${id}`
        );

        const w = res.data.writing;
        setWriting(w);

        // ❤️ likes
        setLikeCount(w.likes?.length || 0);
        setLiked(w.likes?.some((uid) => uid.toString() === userId));

        // 🔖 bookmarks
        const storedBookmarks = JSON.parse(
          localStorage.getItem("bookmarkedWritings") || "[]"
        );
        setBookmarked(storedBookmarks.includes(w._id));

        // 👤 follow
        const storedFollows = JSON.parse(
          localStorage.getItem("followedAuthors") || "[]"
        );
        setFollowed(
          w.userId?._id && storedFollows.includes(w.userId._id)
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load writing");
      } finally {
        setLoading(false);
      }
    };

    fetchWriting();
  }, [id, userId]);


  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!writing) return <div className="p-6 text-center">Writing not found</div>;

  /* ================= LIKE ================= */
  const handleLike = async () => {
    if (!token) return toast.error("Please login to like");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/like/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLiked(res.data.liked);
      setLikeCount(res.data.totalLikes);
    } catch {
      toast.error("Could not update like");
    }
  };

  /* ================= BOOKMARK ================= */
  const handleBookmark = async () => {
    if (!token) return toast.error("Please login to bookmark");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/writing/bookmark/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookmarked(res.data.bookmarked);

      const stored = JSON.parse(
        localStorage.getItem("bookmarkedWritings") || "[]"
      );

      const updated = res.data.bookmarked
        ? [...new Set([...stored, writing._id])]
        : stored.filter((wid) => wid !== writing._id);

      localStorage.setItem(
        "bookmarkedWritings",
        JSON.stringify(updated)
      );
    } catch {
      toast.error("Could not update bookmark");
    }
  };

  /* ================= FOLLOW ================= */
  const handleFollow = () => {
    if (!writing.userId?._id) return;

    const stored = JSON.parse(
      localStorage.getItem("followedAuthors") || "[]"
    );

    let updated;
    if (followed) {
      updated = stored.filter((id) => id !== writing.userId._id);
      setFollowed(false);
      toast("Unfollowed author");
    } else {
      updated = [...new Set([...stored, writing.userId._id])];
      setFollowed(true);
      toast.success("You are now following this author!");
    }

    localStorage.setItem("followedAuthors", JSON.stringify(updated));
  };

 /* ================= REPORT ================= */
  const handleReport = async () => {
    if (!token) return toast.error("Please login to report");
    if (!reportReason.trim()) return toast.error("Please provide a reason");

    try {
      await axios.post(
        `http://localhost:8000/api/writing/report/${id}`,
        { reason: reportReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Report submitted");
      setReportReason("");
    } catch {
      toast.error("Could not submit report");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-transparent shadow-xl rounded-2xl p-10">

<WritingPost
  writing={writing}
  userId={userId}
  liked={liked}
  likeCount={likeCount}
  bookmarked={bookmarked}
  followed={followed}
  onLike={handleLike}
  onBookmark={handleBookmark}
  onFollow={handleFollow}
  onReport={handleReport}
  reportReason={reportReason}
  setReportReason={setReportReason}
/>

<WritingComments
  id={id}
  token={token}
  userId={userId}
  isCreator={isCreator}
/>


      </div>

    </div>
  );
};

export default SingleWriting;
