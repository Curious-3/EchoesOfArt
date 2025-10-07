import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("landing"); // landing / login / register

  return (
    <>
      {page === "landing" && <LandingPage user={user} setPage={setPage} setUser={setUser} />}
      {page === "login" && <Login setUser={setUser} setPage={setPage} />}
      {page === "register" && <Register setUser={setUser} setPage={setPage} />}
    </>
  );
};

export default App;
