import React from "react";

const teamMembers = [
  { name: "Maria Rodriguez", role: "CEO & Founder", img: "FounderCumcCeo.jpeg" },
  { name: "Alex Johnson", role: "CTO", img: "Cto.jpeg" },
  { name: "Liam Smith", role: "Head of Design", img: "MD.jpeg" },
];

const AboutUs = () => {
  return (
    <div className="font-sans text-slate-800 max-w-5xl mx-auto px-5 pb-10">
      {/* Hero Section */}
      <section className="text-center py-16 px-6 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-2xl mb-10 shadow-md">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">
          Empowering Creativity Worldwide
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto">
          Echoes Of Art connects artists and enthusiasts, providing a platform
          to create, share, and inspire.
        </p>
      </section>

      {/* Mission / Vision / Values Section */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        <div className="bg-slate-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">
            Our Mission
          </h2>
          <p className="text-slate-700 leading-relaxed">
            To create a global community where creativity thrives, connecting
            artists and art lovers through technology.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">
            Our Vision
          </h2>
          <p className="text-slate-700 leading-relaxed">
            To be the leading platform for digital art exploration,
            collaboration, and innovation.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">
            Our Values
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Innovation</li>
            <li>Collaboration</li>
            <li>Integrity</li>
            <li>Excellence</li>
          </ul>
        </div>
      </section>

      {/* Team Section */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-8 text-blue-600">
          Meet Our Team
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-4 transform hover:-translate-y-2"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-full rounded-2xl mb-3 object-cover"
              />
              <h3 className="text-lg font-semibold text-slate-800">
                {member.name}
              </h3>
              <p className="text-sm text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
