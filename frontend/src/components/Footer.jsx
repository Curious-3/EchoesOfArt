import React from "react";
import "./../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left: Logo + Site Name */}
        <div className="footer-left">
          <img src="/logo.png" alt="Echoes of Art" className="footer-logo" />
          <span className="footer-site-name">Echoes of Art</span>
        </div>

        {/* Center: Quick Links */}
        <div className="footer-center">
          <a href="#upload">Upload</a>
          <a href="#profile">Profile</a>
          <a href="#saved">Saved Art</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        {/* Right: Social Links */}
        <div className="footer-right">
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Echoes of Art. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
