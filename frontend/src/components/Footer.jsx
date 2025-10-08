import React from "react";
import "./../styles/Footer.css";
import { FaTwitter, FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left: Logo + Site Name */}
        <div className="footer-left">
          <img src="/logo.jpeg" alt="Echoes of Art" className="footer-logo" />
          <span className="footer-site-name">Echoes of Art</span>
        </div>

        {/* Center: Quick Links */}
        <div className="footer-center">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#Feedback">Feedback</a>
        </div>

        {/* Right: Social Links with Rounded Bubbles */}
        <div className="footer-right footer-social">
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://t.me/username" target="_blank" rel="noreferrer">
            <FaTelegramPlane />
          </a>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Echoes of Art. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
