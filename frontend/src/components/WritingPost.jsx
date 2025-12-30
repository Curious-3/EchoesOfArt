import { useNavigate } from "react-router-dom";

const WritingPost = ({
  writing,
  userId,
  liked,
  likeCount,
  bookmarked,
  followed,
  onLike,
  onBookmark,
  onFollow,
  onReport,
  reportReason,
  setReportReason,
}) => {
  const navigate = useNavigate();
  const readingTime = Math.ceil(writing.content.length / 900);

  return (
    <>
      <h1 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {writing.title}
      </h1>

      {/* Author */}
      <div className="text-center text-gray-600 mb-6">
        <p
          onClick={() =>
            writing.userId?._id &&
            navigate(`/creator/${writing.userId._id}/writings`)
          }
          className="font-semibold text-blue-600 cursor-pointer hover:underline"
        >
          {writing.userId?.name || "Anonymous"}
        </p>

        <button
          onClick={onFollow}
          className={`mt-2 px-3 py-1 text-xs rounded-full border ${
            followed ? "bg-blue-600 text-white" : "bg-white text-blue-600"
          }`}
        >
          {followed ? "Following" : "Follow"}
        </button>

        <div className="mt-2 text-sm">
          {new Date(writing.createdAt).toLocaleDateString()} • {readingTime} min read
        </div>
      </div>

      {/* Like / Bookmark */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={onLike}
          className={`px-4 py-2 rounded-full ${
            liked ? "bg-pink-500 text-white" : "bg-pink-100 text-pink-600"
          }`}
        >
          ❤️ {likeCount}
        </button>

        <button
          onClick={onBookmark}
          className={`px-4 py-2 rounded-full ${
            bookmarked
              ? "bg-yellow-400 text-white"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          🔖 {bookmarked ? "Saved" : "Save"}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 rounded bg-transparent">
        <div
          className="writing-content"
          dangerouslySetInnerHTML={{ __html: writing.content }}
        />
      </div>

      {/* Report */}
      <div className="border-t pt-6 mt-10">
        <h3 className="font-semibold mb-2 text-sm">🚩 Report</h3>
        <div className="flex gap-2">
          <input
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason"
            className="flex-grow p-2 border rounded"
          />
          <button
            onClick={onReport}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Report
          </button>
        </div>
      </div>
    </>
  );
};

export default WritingPost;
