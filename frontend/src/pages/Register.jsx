import React, { useState } from "react";
import axios from "axios";
import "./../styles/Register.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

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
        "http://localhost:8000/api/auth/register",
        { name, email, password, dob },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 201 || res.status === 200) {
        alert("Registration successful! Please login.");
        // If backend returns user, you can set it:
        // setUser(res.data.user);
        navigate("/login"); // redirect to login page
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <p className="error-msg">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <input
          type="date"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Login</span>
      </p>
    </div>
  );
};

export default Register;
