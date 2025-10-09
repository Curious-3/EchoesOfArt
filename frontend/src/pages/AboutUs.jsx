import React from "react";
import "./../styles/AboutUs.css";

const teamMembers = [
  { name: "Maria Rodriguez", role: "CEO & Founder", img: "FounderCumcCeo.jpeg" },
  { name: "Alex Johnson", role: "CTO", img: "Cto.jpeg" },
  { name: "Liam Smith", role: "Head of Design", img: "MD.jpeg" },
];

const AboutUs = () => {
  return (
    <div className="about-page">
      <section className="hero-section">
        <h1>Empowering Creativity Worldwide</h1>
        <p>
          Echoes Of Art connects artists and enthusiasts, providing a platform to create, share, and inspire.
        </p>
      </section>

      <section className="mission-section">
        <div className="section-content">
          <h2>Our Mission</h2>
          <p>
            To create a global community where creativity thrives, connecting artists and art lovers through technology.
          </p>
        </div>
        <div className="section-content">
          <h2>Our Vision</h2>
          <p>
            To be the leading platform for digital art exploration, collaboration, and innovation.
          </p>
        </div>
        <div className="section-content">
          <h2>Our Values</h2>
          <ul>
            <li>Innovation</li>
            <li>Collaboration</li>
            <li>Integrity</li>
            <li>Excellence</li>
          </ul>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div className="team-card" key={index}>
              <img src={member.img} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
