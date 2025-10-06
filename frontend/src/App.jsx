import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing"); // landing / login / register

  return (
    <>
      {page === "landing" && <LandingPage user={user} setPage={setPage} setUser={setUser} />}
      {page === "login" && <Login setUser={setUser} setPage={"landing"} />}
      {page === "register" && <Register setUser={setUser} setPage={setPage} />}
    </>
  );
};

export default App;