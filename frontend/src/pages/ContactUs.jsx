import React from "react";
import "./../styles/ContactUs.css";
import { FaEnvelope, FaPhone, FaFax, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="contact-page">
      <section className="hero-section">
        <h1>Get in Touch with Echoes Of Art</h1>
        <p>
          Whether you want to collaborate, have inquiries, or just want to say hello,
          our Delhi office is ready to assist you.
        </p>
      </section>

      <section className="contact-cards">
        <div className="card">
          <FaEnvelope className="icon" />
          <h3>Email Us</h3>
          <p>contact@echoesofart.com</p>
        </div>
        <div className="card">
          <FaPhone className="icon" />
          <h3>Call Us</h3>
          <p>+91 98765 43210</p>
        </div>
        <div className="card">
          <FaFax className="icon" />
          <h3>Fax</h3>
          <p>+91 11 2345 6789</p>
        </div>
        <div className="card">
          <FaMapMarkerAlt className="icon" />
          <h3>Our Office</h3>
          <p>Echoes Of Art HQ</p>
          <p>Connaught Place, Delhi</p>
          <p>India</p>
        </div>
      </section>

      <section className="map-section">
        <iframe
          title="EchoesOfArt Office Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.9409882001123!2d77.21672171502508!3d28.632792582420466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1c5c2a1b8e0b%3A0x80f5f2f5b5f5b5f5!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%2C%20India!5e0!3m2!1sen!2sin!4v1698934567890!5m2!1sen!2sin"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactUs;
