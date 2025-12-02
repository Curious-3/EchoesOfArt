import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-10 mt-10 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-10">

        {/* Left: Logo + Tagline */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="w-12 h-12 rounded-xl shadow-lg"
          />
          <div>
            <h2 className="text-xl font-bold">Echoes of Art</h2>
            <p className="text-blue-200 text-sm">Where creativity finds its voice</p>
          </div>
        </div>

        {/* Center Links */}
        <div className="flex flex-col text-center gap-2 text-blue-100">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/contact" className="hover:text-white transition">Contact</Link>
          <Link to="/feedback" className="hover:text-white transition">Feedback</Link>
        </div>

        {/* Right Icons */}
        <div className="flex gap-4">
          {[FaTwitter, FaFacebookF, FaInstagram, FaTelegramPlane].map((Icon, i) => (
            <div
              key={i}
              className="w-10 h-10 flex justify-center items-center bg-white/20 rounded-full hover:bg-white hover:text-blue-600 transition cursor-pointer"
            >
              <Icon />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-blue-200 text-sm mt-8">
        © 2025 Echoes of Art — All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
