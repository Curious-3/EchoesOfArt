import React from "react";
import { FaEnvelope, FaPhone, FaFax, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="font-poppins text-slate-800 max-w-6xl mx-auto px-5 py-10">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-2xl mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold mb-5">
          Get in Touch with Echoes Of Art
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto">
          Whether you want to collaborate, have inquiries, or just want to say hello,
          our Delhi office is ready to assist you.
        </p>
      </section>

      {/* Contact Cards */}
      <section className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all">
          <FaEnvelope className="text-3xl text-blue-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Email Us</h3>
          <p className="text-slate-700">contact@echoesofart.com</p>
        </div>

        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all">
          <FaPhone className="text-3xl text-blue-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Call Us</h3>
          <p className="text-slate-700">+91 98765 43210</p>
        </div>

        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all">
          <FaFax className="text-3xl text-blue-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Fax</h3>
          <p className="text-slate-700">+91 11 2345 6789</p>
        </div>

        <div className="bg-white p-8 rounded-2xl text-center shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all">
          <FaMapMarkerAlt className="text-3xl text-blue-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Our Office</h3>
          <p className="text-slate-700">Echoes Of Art HQ</p>
          <p className="text-slate-700">Connaught Place, Delhi</p>
          <p className="text-slate-700">India</p>
        </div>
      </section>

      {/* Map Section */}
      <section className="mb-16">
        <iframe
          title="EchoesOfArt Office Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.9409882001123!2d77.21672171502508!3d28.632792582420466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1c5c2a1b8e0b%3A0x80f5f2f5b5f5b5f5!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%2C%20India!5e0!3m2!1sen!2sin!4v1698934567890!5m2!1sen!2sin"
          className="w-full h-96 rounded-2xl shadow-lg border-0"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default ContactUs;
