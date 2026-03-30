import React from "react";
import { useNavigate } from "react-router-dom";
import "./AboutUs.css";

const AboutUs = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. System Overview",
      icon: "🌐",
      content: "This system is a specialized Web-Based Identification and Validation Platform designed for Persons with Disabilities (PWD). It serves as a centralized hub for managing records, ensuring that beneficiaries can easily access their data while providing administrators with a secure environment to validate and approve registrations."
    },
    {
      title: "2. Features & Functionalities",
      icon: "🚀",
      content: "Our platform includes a robust Secure Login/Signup system, an interactive User Dashboard, and streamlined Data Input forms. Key highlights include real-time status tracking (Pending/Approved), automated QR Code generation for easy validation, and comprehensive administrative tools for record management."
    },
    {
      title: "3. UI/UX Design",
      icon: "🎨",
      content: "Built with a 'Mobile-First' philosophy, the interface features a clean, modern glassmorphism aesthetic. We prioritize accessibility with high-contrast elements, intuitive navigation menus, and a responsive layout that works seamlessly across desktops, tablets, and smartphones."
    },
    {
      title: "4. System Architecture",
      icon: "🏗️",
      content: "The system utilizes a modern Full-Stack architecture: React.js for a dynamic Frontend, Node.js and Express for the Backend logic, and Supabase as our high-performance Cloud Database. This ensures smooth data flow from user input to secure cloud storage."
    },
    {
      title: "5. Performance & Efficiency",
      icon: "⚡",
      content: "By digitizing the PWD registration process, this system significantly reduces manual paperwork and processing time. The lightweight architecture ensures fast load times and the ability to handle multiple concurrent users without performance degradation."
    },
    {
      title: "6. Security & Privacy",
      icon: "🛡️",
      content: "Security is our top priority. The system implements Row Level Security (RLS) via Supabase, encrypted authentication protocols, and strict data protection measures to ensure that sensitive personal information remains private and accessible only to authorized personnel."
    }
  ];

  return (
    <div className="about-wrapper">
      <div className="about-container">
        <header className="about-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>About Our System</h1>
          <p>Learn more about the technology and purpose behind our platform.</p>
        </header>

        <div className="about-grid">
          {sections.map((section, index) => (
            <div key={index} className="about-card">
              <div className="card-icon">{section.icon}</div>
              <h3>{section.title}</h3>
              <p>{section.content}</p>
            </div>
          ))}
        </div>

        <footer className="about-footer">
          <p>© 2026 PWD Validation System | Built for Accessibility</p>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;