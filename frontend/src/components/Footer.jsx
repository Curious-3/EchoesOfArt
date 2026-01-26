import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="
      bg-gradient-to-r from-amber-900 to-amber-600
      text-white shadow-md
      flex items-center justify-center
      h-20 px-6
      fixed bottom-0 left-0 w-full
      z-50
    ">
      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between">

        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="w-10 h-10 rounded-xl shadow-md"
          />
          <span className="font-semibold text-lg tracking-wide">Echoes of Art</span>
        </div>

        {/* Center Links */}
        <div className="flex gap-6 text-amber-100 font-medium text-sm">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/about" className="hover:text-white transition">About</Link>
          <Link to="/contact" className="hover:text-white transition">Contact</Link>
          <Link to="/feedback" className="hover:text-white transition">Feedback</Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-4">
          {[FaTwitter, FaFacebookF, FaInstagram, FaTelegramPlane].map((Icon, i) => (
            <div
              key={i}
              className="w-9 h-9 flex justify-center items-center bg-white/20 
                         rounded-full hover:bg-white hover:text-amber-600 
                         transition cursor-pointer"
            >
              <Icon className="text-lg" />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
