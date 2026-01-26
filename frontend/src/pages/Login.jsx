import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) navigate("/home");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        identifier, // backend can accept either email or username
        password,
      });

      const { user, token } = res.data || {};
      if (!user || !token) {
        throw new Error("Invalid login response from server");
      }

      // Save user + token in localStorage
      const userData = {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        token,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update global context
      setUser(userData);

      // Set default axios header for authenticated requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Redirect to home
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-amber-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-white">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-3xl font-bold tracking-wide">Echoes of Art</h1>
        </div>

        <h2 className="text-center text-xl font-semibold mb-6">Welcome Back</h2>

        {error && (
          <p className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded-md text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 ml-1">Email or Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="Enter your email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
                         focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-2 rounded-lg 
                       font-semibold tracking-wide shadow-md hover:scale-105 transition-transform duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-200">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-pink-400 hover:underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
