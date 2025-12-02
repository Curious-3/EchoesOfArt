import React from "react";
import WritingEditor from "../components/WritingEditor";
import MyWritings from "../components/MyWritings";

const WritingPage = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = storedUser?.token || null;

  return (
    <div className="flex flex-col items-center w-full px-4 md:px-8 py-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 w-full text-center">
        Write Your Masterpiece
      </h2>

      <WritingEditor userToken={token} />

      <hr className="my-12 w-full border-gray-300" />

      <h2 className="text-3xl font-bold mb-6 w-full text-center">
        My Writings
      </h2>

      <MyWritings userToken={token} />
    </div>
  );
};

export default WritingPage;
