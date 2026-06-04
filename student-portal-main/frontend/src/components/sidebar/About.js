import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <header className="page-header">
        <h1>About Us</h1>
        <p className="lead">Empowering young minds with practical IT skills since 2016</p>
      </header>

      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          We aim to equip students and professionals with hands-on, career-focused IT skills.
          Our vision is to help young minds become confident, skilled, and financially independent 
          in today’s digital-first world.
        </p>
      </section>

      <section className="about-section">
        <h2>Journey Highlights</h2>
        <ul className="highlight-list">
          <li>Established in 2021 under Hello World Technologies</li>
          <li>3,500+ students trained across 40+ batches</li>
          <li>Community of 400+ professionals inside Cubicle Co-working</li>
          <li>20+ IT companies working within Cubicle</li>
          <li>Partnerships with PSEB & PITB</li>
          <li>2,000+ success stories — jobs, freelancing & career launches</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <ul>
              <li>Free Career Guidance</li>
              <li>Freelancing Mentorship</li>
              <li>Real-Time Projects</li>
              <li>Quizzes & Tests</li>
              <li>Resume Building</li>
              <li>Career Counseling</li>
            </ul>
          </div>
          <div className="feature-card">
            <ul>
              <li>Interview Preparation</li>
              <li>Industry Exposure</li>
              <li>Internship Opportunities</li>
              <li>Placement Assistance</li>
              <li>Completion Certificate</li>
              <li>Outsourcing Opportunities</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
