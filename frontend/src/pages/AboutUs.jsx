// AboutUs.jsx
import React from "react";
import "../styles/AboutUs.css";
import { TfiBrush } from "react-icons/tfi";
import { FiUsers, FiLock, FiCalendar } from "react-icons/fi";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const Navigate = useNavigate();
  const features = [
    {
      icon: <TfiBrush size={40} />,
      title: "Artist-Centric Platform",
      desc: "Built by artists, for artists",
    },
    {
      icon: <FiUsers size={40} />,
      title: "Community Focused",
      desc: "10,000+ creative members",
    },
    // {
    //   icon: <FiLock size={40} />,
    //   title: "Secure Transactions",
    //   desc: "Bank-level encryption",
    // },
    {
      icon: <FiCalendar size={40} />,
      title: "500+ Events",
      desc: "Hosted annually",
    },
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="content-wrapper-about">
          <h1>Welcome to Artestry Hub</h1>
          <p className="subtitle">Where Creativity Meets Community</p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-section">
        <div className="content-wrapper">
          <h2>Our Mission</h2>
          <div className="mission-content">
            <p className="mission-text">
              At Artestry Hub, we empower artists and creators to showcase their
              work, connect with audiences, and manage events through our
              innovative platform. Founded in 2023, we've become the trusted
              home for 15,000+ creatives worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="content-wrapper">
          <h2>Why Choose Artestry Hub?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="content-wrapper">
          <h2>Ready to Join Our Creative Community?</h2>
          <button className="cta-button" onClick={() => Navigate("/SignupPg")}>
            Start Your Artistic Journey
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
