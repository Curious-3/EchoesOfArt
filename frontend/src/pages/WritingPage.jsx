import React, { useEffect, useState } from "react";
import WritingEditor from "../components/WritingEditor";
import MyWritings from "../components/MyWritings";
import ExploreWritings from "../pages/ExploreWritings";
import SavedWritings from "../pages/SavedWritings";
import FollowedAuthors from "../pages/FollowedAuthors";
import { useSearchParams } from "react-router-dom";

const WritingPage = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = storedUser?.token || null;

  const [activeTab, setActiveTab] = useState("write");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const isEditing = searchParams.get("edit");
    const storedDraft = localStorage.getItem("editingWriting");

    if (isEditing || storedDraft) {
      setActiveTab("write"); // force Write tab
    }
  }, [searchParams]);


  return (
    <div className="flex flex-col w-full px-4 md:px-8 py-10">

      {/* TABS */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveTab("write")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "write" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          ✍️ Write
        </button>

        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "my" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          📚 My Writings
        </button>

        <button
          onClick={() => setActiveTab("explore")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "explore" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          🔍 Explore
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "saved" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          🔖 Saved
        </button>

        <button
          onClick={() => setActiveTab("follow")}
          className={`px-4 py-2 rounded-full ${
            activeTab === "follow" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          👥 Following
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "write" && (
        <>
          <h2 className="text-3xl font-bold mb-6 text-center">Write Your Masterpiece</h2>
          <WritingEditor userToken={token} />
        </>
      )}

      {activeTab === "my" && (
        <>
          <h2 className="text-3xl font-bold mb-6 text-center">My Writings</h2>
          <MyWritings userToken={token} />
        </>
      )}

      {activeTab === "explore" && <ExploreWritings />}

      {activeTab === "saved" && <SavedWritings />}

      {activeTab === "follow" && <FollowedAuthors />}

    </div>
  );
};

export default WritingPage;
