// src/pages/Register.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { Paintbrush } from "lucide-react";
import toast from "react-hot-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [dobError, setDobError] = useState("");

  const navigate = useNavigate();
  const { setUser } = useAuth();

  // ===================== VALIDATION FUNCTIONS =====================
  const validateName = (value) => {
    if (!/^[A-Za-z\s]+$/.test(value)) {
      setNameError("Only alphabets and spaces are allowed");
    } else {
      setNameError("");
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const validateUsername = (value) => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
      setUsernameError(
        "Username must be 3–20 characters long and contain only letters, numbers, or underscores"
      );
    } else {
      setUsernameError("");
    }
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
    } else {
      setPasswordError("");
    }
  };

  const validateDob = (value) => {
    const today = new Date().toISOString().split("T")[0];
    if (value > today) {
      setDobError("Date of birth cannot be in the future");
    } else {
      setDobError("");
    }
  };

  // ===================== INPUT HANDLERS =====================
  const handleNameChange = (e) => {
    setName(e.target.value);
    validateName(e.target.value);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setEmail(value);
    validateEmail(value);
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value.trim();
    setUsername(value);
    validateUsername(value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    validatePassword(e.target.value);
  };

  const handleDobChange = (e) => {
    setDob(e.target.value);
    validateDob(e.target.value);
  };

  // ===================== FORM SUBMIT =====================
  const handleRegister = async (e) => {
    e.preventDefault();

    // Final validation check
    validateName(name);
    validateEmail(email);
    validateUsername(username);
    validatePassword(password);
    validateDob(dob);

    if (nameError || emailError || usernameError || passwordError || dobError) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        dob,
      };

      const res = await axios.post("http://localhost:8000/api/auth/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 201) {
        localStorage.setItem("pendingEmail", email.trim().toLowerCase());
        toast.success(res.data.message || "Registration successful! Please verify your email.");
        navigate("/verify-email");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registration failed. Try again.";

      if (message === "User already exists") {
        localStorage.setItem("pendingEmail", email);
        toast("User already exists! Please verify your email.", { icon: "📧" });
        navigate("/verify-email");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================== UI =====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-amber-900 px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-white">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Paintbrush className="w-8 h-8 text-pink-400" />
          <h1 className="text-3xl font-bold tracking-wide">Echoes of Art</h1>
        </div>

        <h2 className="text-center text-xl font-semibold mb-6">Create Your Account</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm mb-1 ml-1">Full Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
              focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              required
            />
            {nameError && <p className="text-red-400 text-sm mt-1 ml-1">{nameError}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm mb-1 ml-1">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
              focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && <p className="text-red-400 text-sm mt-1 ml-1">{emailError}</p>}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm mb-1 ml-1">Username</label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
              focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="Choose a username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            {usernameError && <p className="text-red-400 text-sm mt-1 ml-1">{usernameError}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm mb-1 ml-1">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
              focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {passwordError && <p className="text-red-400 text-sm mt-1 ml-1">{passwordError}</p>}
          </div>

          {/* DOB */}
          <div>
            <label htmlFor="dob" className="block text-sm mb-1 ml-1">Date of Birth</label>
            <input
              id="dob"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 
              focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-300 text-white"
              value={dob}
              onChange={handleDobChange}
              required
            />
            {dobError && <p className="text-red-400 text-sm mt-1 ml-1">{dobError}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-pink-500 to-purple-600 py-2 rounded-lg 
            font-semibold tracking-wide shadow-md hover:scale-105 transition-transform duration-200
            ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login link */}
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
