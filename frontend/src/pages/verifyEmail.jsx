import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const email = localStorage.getItem("pendingEmail");
    if (!email) {
      toast.error("Session expired. Please register again.");
      navigate("/register");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/verify-email",
        { email, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200) {
        toast.success("Email verified successfully! You can now log in.");
        localStorage.removeItem("pendingEmail");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Verification failed.");
    }
  };

  const handleResend = async () => {
    const email = localStorage.getItem("pendingEmail");
    if (!email) {
      setError("No pending verification email found.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/auth/resend-otp",
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("OTP resent successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend OTP. Try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-pink-100">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          Email Verification
        </h2>
        <p className="text-gray-600 mb-4">Enter the 6-digit OTP sent to your email.</p>

        {message && (
          <p className="text-green-600 text-sm font-medium mb-3">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-sm font-medium mb-3">{error}</p>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="border border-gray-300 rounded-lg py-2 px-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-all font-semibold shadow-md"
          >
            Verify
          </button>
        </form>

        <p className="mt-4 text-gray-600">
          Didn’t receive the OTP?{" "}
          <span
            onClick={handleResend}
            className="text-purple-700 font-semibold cursor-pointer hover:underline"
          >
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
