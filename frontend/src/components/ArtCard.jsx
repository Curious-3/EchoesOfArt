import {
  BookmarkIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const ArtCard = ({ art, onLike, onSave, liked, saved }) => {
  const navigate = useNavigate();

  const creatorName =
    art?.createdBy?.name || "Unknown Creator";

  return (
    <div
      onClick={() => navigate(`/post/${art._id}`)}
      className="bg-white rounded-2xl shadow hover:shadow-xl transition cursor-pointer overflow-hidden relative"
    >
      {/* ================= MEDIA ================= */}
      <img
        src={art.mediaUrl}
        alt={art.title}
        className="w-full h-56 object-cover"
      />

      {/* ================= RIGHT TOP (LIKE + SAVE) ================= */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {/* LIKE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(art._id);
          }}
          className="flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow"
        >
          <HeartIcon
            className={`w-5 h-5 ${
              liked ? "text-red-500" : "text-gray-400"
            }`}
          />
          <span className="text-xs">{art.likeCount || 0}</span>
        </button>

        {/* SAVE */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(art._id);
          }}
          className="bg-white/90 backdrop-blur p-2 rounded-full shadow"
        >
          <BookmarkIcon
            className={`w-5 h-5 ${
              saved ? "text-blue-600" : "text-gray-400"
            }`}
          />
        </button>
      </div>

      {/* ================= RIGHT BOTTOM (COMMENTS) ================= */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow text-gray-600">
        <ChatBubbleOvalLeftIcon className="w-5 h-5" />
        <span className="text-xs">{art.commentsCount || 0}</span>
      </div>

      {/* ================= TEXT ================= */}
      <div className="p-4 pt-6">
        <h3 className="font-semibold text-lg text-blue-900">
          {art.title}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          By <span className="font-medium">{creatorName}</span>
        </p>

        {art.category && (
          <p className="text-xs text-gray-400 mt-1">
            Category:{" "}
            <span className="font-medium">{art.category}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtCard;
