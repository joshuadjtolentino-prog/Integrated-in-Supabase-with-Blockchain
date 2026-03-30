import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserBenefits.css";

const UserBenefits = () => {
  const navigate = useNavigate();

  const benefitData = [
    {
      title: "20% Discount & VAT Exemption",
      icon: "🛒",
      text: "Avail of a 20% discount plus 12% VAT exemption on medicines, medical/dental fees, and diagnostic laboratory tests."
    },
    {
      title: "Transportation Perks",
      icon: "🚆",
      text: "Enjoy significant discounts on domestic air and sea travel, as well as land transport including Jeepneys, Buses, Taxis, Grab, LRT, and MRT."
    },
    {
      title: "Dining & Leisure",
      icon: "🍽️",
      text: "Get discounts on food, beverages, and desserts at restaurants, including fast food, take-outs, and delivery services."
    },
    {
      title: "Entertainment & Culture",
      icon: "🎬",
      text: "Discounted admission fees to cinemas, theaters, concert halls, carnivals, and other places of culture and recreation."
    },
    {
      title: "Basic Necessities",
      icon: "📦",
      text: "A special 5% discount on basic necessities and prime commodities like rice, bread, milk, and eggs (up to ₱2,500/week)."
    },
    {
      title: "Mandatory PhilHealth",
      icon: "🏥",
      text: "All PWDs are automatically entitled to mandatory PhilHealth coverage and social insurance benefits."
    },
    {
      title: "Express Lanes",
      icon: "⚡",
      text: "Mandatory access to priority lanes in all government and commercial establishments for faster transactions."
    },
    {
      title: "Educational Assistance",
      icon: "🎓",
      text: "Financial aid and scholarships for primary, secondary, tertiary, and vocational education in public and private schools."
    },
    {
      title: "Lodging & Accommodations",
      icon: "🏨",
      text: "Discounted rates for room accommodations and amenities in hotels, resorts, and pension houses nationwide."
    },
    {
      title: "LGU-Specific Perks",
      icon: "🏙️",
      text: "Additional benefits depending on your city, such as free movies, reserved parking, and birthday/holiday cash gifts."
    }
  ];

  return (
    <div className="benefits-wrapper">
      <div className="benefits-container">
        <header className="benefits-header">
          <button className="back-link" onClick={() => navigate(-1)}>
            ← Back to Dashboard
          </button>
          <h1>PWD Benefits & Privileges</h1>
          <p>Explore the mandatory discounts and support systems provided by the Philippine government for PWDs.</p>
        </header>

        <div className="benefits-grid">
          {benefitData.map((benefit, index) => (
            <div className="benefit-card" key={index}>
              <div className="benefit-icon">{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          ))}
        </div>

        <footer className="benefits-footer">
          <p>Under Republic Act No. 10754 & the Magna Carta for PWDs.</p>
        </footer>
      </div>
    </div>
  );
};

export default UserBenefits;