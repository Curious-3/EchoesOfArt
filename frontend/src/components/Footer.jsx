import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-700 to-blue-500 text-white w-full border-t-4 border-white/20 font-sans">
      <div className="flex flex-wrap justify-between items-start gap-8 max-w-6xl mx-auto px-5 py-6">
        
        {/* 🔹 Left: Logo + Site Name */}
        <div className="flex items-center gap-4">
          <img
            src="/logo.jpeg"
            alt="Echoes of Art"
            className="w-12 h-12 rounded-xl object-cover shadow-md"
          />
          <span className="text-2xl font-extrabold tracking-wide">
            Echoes of Art
          </span>
        </div>

        {/* 🔹 Center: Links */}
        <div className="flex flex-wrap items-center gap-6 text-blue-100 text-[15px]">
          <a href="/" className="hover:text-white hover:-translate-y-0.5 transition-all">
            Home
          </a>
          <Link to="/about" className="hover:text-white hover:-translate-y-0.5 transition-all">
            About
          </Link>
          <Link to="/contact" className="hover:text-white hover:-translate-y-0.5 transition-all">
            Contact
          </Link>
          <Link to="/feedback" className="hover:text-white hover:-translate-y-0.5 transition-all">
            Feedback
          </Link>
        </div>

        {/* 🔹 Right: Social Icons */}
        <div className="flex gap-4">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white hover:text-blue-600 transition-all transform hover:scale-110"
          >
            <FaTwitter />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white hover:text-blue-600 transition-all transform hover:scale-110"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white hover:text-blue-600 transition-all transform hover:scale-110"
          >
            <FaInstagram />
          </a>
          <a
            href="https://t.me/username"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white hover:text-blue-600 transition-all transform hover:scale-110"
          >
            <FaTelegramPlane />
          </a>
        </div>
      </div>

      {/* 🔹 Copyright */}
      <div className="text-center text-blue-100 text-sm mt-4 pb-3">
        &copy; {new Date().getFullYear()} Echoes of Art. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
