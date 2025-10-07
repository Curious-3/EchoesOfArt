import React, { useState } from "react";
import axios from "axios"; // import axios
import "./../styles/Login.css";

const Login = ({ setUser, setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", { email, password });
      const userData = res.data.user || res.data;

      if (res.data.token) {
        localStorage.setItem("token", res.data.token); // store JWT token
      }

      setUser(userData);      // store logged-in user
      setPage("landing");     // redirect to landing page
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <span onClick={() => setPage("register")}>Register</span>
      </p>
    </div>
  );
};

export default Login;
