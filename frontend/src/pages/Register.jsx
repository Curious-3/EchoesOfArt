import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Paintbrush } from "lucide-react";
import toast from "react-hot-toast";
const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://echoesofart-backend.onrender.com/api/auth/register",
        { name, email, password, dob },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 201) {
        localStorage.setItem("pendingEmail", email);
        toast.success("OTP sent to your email! Please verify before login.");
        navigate("/verify-email");
      }
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message;
      if (message === "User already exists") {
        localStorage.setItem("pendingEmail", email);
        toast("User already exists! Please verify your email.", {
          icon: "📧",
        });
        navigate("/verify-email");
      } else {
        toast.error(message || "Registration failed. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-white">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Paintbrush className="w-8 h-8 text-pink-400" />
          <h1 className="text-3xl font-bold tracking-wide">Echoes of Art</h1>
        </div>

        <h2 className="text-center text-xl font-semibold mb-6">Create Your Account</h2>

        {error && (
          <p className="bg-red-500/20 border border-red-400 text-red-200 px-3 py-2 rounded-md text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 ml-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 ml-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 ml-1">Date of Birth</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-2 rounded-lg font-semibold tracking-wide shadow-md hover:scale-105 transition-transform duration-200"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-200">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-pink-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
