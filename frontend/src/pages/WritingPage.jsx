import React from "react";
import WritingEditor from "../components/WritingEditor";
import MyWritings from "../components/MyWritings";

const WritingPage = () => {
  const userToken = localStorage.getItem("token"); // Or get from your Auth context

  return (
    <div>
      <h2>Write Your Masterpiece</h2>
      <WritingEditor userToken={userToken} />
      <hr />
      <h2>My Writings</h2>
      <MyWritings userToken={userToken} />
    </div>
  );
};

export default WritingPage;
