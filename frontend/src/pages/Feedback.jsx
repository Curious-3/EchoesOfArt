import React, { useState } from "react";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: "5",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "", rating: "5" });
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 p-12 bg-amber-50 rounded-3xl shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-600 mb-3">
          We Value Your Feedback
        </h1>
        <p className="text-amber-800 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Your thoughts help us improve Echoes Of Art. Share your experience,
          suggestions, or ideas with us.
        </p>
      </div>

      {/* Form Section */}
      <div className="flex flex-col items-center">
        {submitted && (
          <p className="text-green-600 font-semibold text-lg mb-6 text-center">
            Thank you for your feedback!
          </p>
        )}
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Name */}
          <label className="flex flex-col font-medium text-amber-900 text-base">
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="mt-2 p-4 rounded-xl border border-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </label>

          {/* Email */}
          <label className="flex flex-col font-medium text-amber-900 text-base">
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              required
              className="mt-2 p-4 rounded-xl border border-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            />
          </label>

          {/* Rating */}
          <label className="flex flex-col font-medium text-amber-900 text-base">
            Rating
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="mt-2 p-4 rounded-xl border border-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            >
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Terrible</option>
            </select>
          </label>

          {/* Message */}
          <label className="flex flex-col font-medium text-gray-900 text-base">
            Message
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your feedback here..."
              rows="5"
              required
              className="mt-2 p-4 rounded-xl border border-amber-300 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
            ></textarea>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-3 py-4 bg-gradient-to-r from-amber-600 to-amber-400 text-white font-semibold text-lg rounded-2xl shadow-lg hover:from-amber-700 hover:to-amber-600 hover:-translate-y-1 transition-all"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
