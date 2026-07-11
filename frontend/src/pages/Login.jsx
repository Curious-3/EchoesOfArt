import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../config/api";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Paintbrush } from "lucide-react";
import { getStoredUser } from "../utils/authStorage";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user?.token || getStoredUser()?.token) navigate("/home");
  }, [navigate, user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        identifier, // backend can accept either email or username
        password,
      });

      const { user, token } = res.data || {};
      if (!user || !token) {
        throw new Error("Invalid login response from server");
      }

      const userData = {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        token,
      };

      login(userData, token);

      // Redirect to home
      navigate("/home");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fef5e7] via-[#fffaf1] to-[#f8e7cd] px-4 py-10 flex items-center justify-center">
      <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-amber-200 bg-white/80 p-8 text-amber-950 shadow-[0_24px_70px_rgba(146,64,14,0.18)] backdrop-blur-xl md:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <Paintbrush className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-700">
            Echoes of Art
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-amber-950">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm leading-6 text-amber-800/80">
            Sign in to continue exploring art, stories, and creative voices.
          </p>
        </div>

        {error && (
          <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-amber-900/80">Email or Username</label>
            <input
              type="text"
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 placeholder:text-amber-500 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              placeholder="Enter your email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-amber-900/80">Password</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 placeholder:text-amber-500 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 py-3 font-semibold tracking-wide text-white shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-amber-900/70">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-amber-700 transition hover:text-amber-900 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
