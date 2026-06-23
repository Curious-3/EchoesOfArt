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
            Create Your Account
          </h1>
          <p className="mt-2 text-sm leading-6 text-amber-800/80">
            Join the community to share art, writing, and creative inspiration.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-amber-900/80">Full Name</label>
            <input
              id="name"
              type="text"
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 placeholder:text-amber-500 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              placeholder="Enter your name"
              value={name}
              onChange={handleNameChange}
              required
            />
            {nameError && <p className="mt-2 text-sm text-red-600">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-amber-900/80">Email</label>
            <input
              id="email"
              type="email"
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 placeholder:text-amber-500 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              required
            />
            {emailError && <p className="mt-2 text-sm text-red-600">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-amber-900/80">Username</label>
            <input
              id="username"
              type="text"
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 placeholder:text-amber-500 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              placeholder="Choose a username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            {usernameError && <p className="mt-2 text-sm text-red-600">{usernameError}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-amber-900/80">Password</label>
            <input
              id="password"
              type="password"
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 placeholder:text-amber-500 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="dob" className="mb-2 block text-sm font-medium text-amber-900/80">Date of Birth</label>
            <input
              id="dob"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-amber-950 shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60"
              value={dob}
              onChange={handleDobChange}
              required
            />
            {dobError && <p className="mt-2 text-sm text-red-600">{dobError}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 py-3 font-semibold tracking-wide text-white shadow-lg shadow-amber-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 ${loading ? "cursor-not-allowed opacity-60 hover:translate-y-0" : ""}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-amber-900/70">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-semibold text-amber-700 transition hover:text-amber-900 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
