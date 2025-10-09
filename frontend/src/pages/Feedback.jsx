import React, { useState } from "react";
import "./../styles/Feedback.css";

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
    <div className="feedback-container">
      <div className="feedback-header">
        <h1>We Value Your Feedback</h1>
        <p>
          Your thoughts help us improve Echoes Of Art. Share your experience,
          suggestions, or ideas with us.
        </p>
      </div>

      <div className="feedback-form-section">
        {submitted && <p className="thank-you">Thank you for your feedback!</p>}
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email"
              required
            />
          </label>

          <label>
            Rating
            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Terrible</option>
            </select>
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your feedback here..."
              rows="5"
              required
            ></textarea>
          </label>

          <button type="submit">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
