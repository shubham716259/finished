import React from "react";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaCalendarAlt,
  FaShoppingCart,
  FaHeart,
  FaDice,
  FaFire,
  FaGlobeAmericas,
} from "react-icons/fa";
import { GiKnifeFork } from "react-icons/gi";

const About = () => {
  return (
    <main className="recipes-page about-page" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <section className="recipes-header">
        <p className="recipes-small-title">ABOUT COOKFUSION</p>
        <h1>Your Ultimate Culinary Companion</h1>
        <p className="recipes-description">
          CookFusion empowers home chefs, foodies, and busy families to discover world recipes, organize weekly meals seamlessly, and auto-generate grocery shopping lists in seconds.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", margin: "40px 0" }}>
        <div style={{ background: "rgba(255,255,255,0.06)", padding: "30px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "36px", color: "#ff914d", marginBottom: "15px" }}>
            <FaUtensils />
          </div>
          <h3 style={{ fontSize: "22px", marginBottom: "10px", color: "#fff" }}>Multi-Filter Discovery</h3>
          <p style={{ color: "#bbb", lineHeight: "1.6" }}>
            Search thousands of international recipes by dish name, primary ingredient, cuisine origin (Italian, Indian, Mexican, Japanese), or meal category.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", padding: "30px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "36px", color: "#ff914d", marginBottom: "15px" }}>
            <FaCalendarAlt />
          </div>
          <h3 style={{ fontSize: "22px", marginBottom: "10px", color: "#fff" }}>Weekly Meal Planner</h3>
          <p style={{ color: "#bbb", lineHeight: "1.6" }}>
            Schedule your breakfast, lunch, and dinner from Monday to Sunday. Fill slots with your favorite dishes or use our 1-click Auto-Planner.
          </p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.06)", padding: "30px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "36px", color: "#ff914d", marginBottom: "15px" }}>
            <FaShoppingCart />
          </div>
          <h3 style={{ fontSize: "22px", marginBottom: "10px", color: "#fff" }}>Smart Grocery Lists</h3>
          <p style={{ color: "#bbb", lineHeight: "1.6" }}>
            Never forget an ingredient. CookFusion automatically extracts all ingredients from your planned meals, organizes them by supermarket aisle, and lets you check items off as you shop.
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "50px 0 30px" }}>
        <Link to="/recipes" className="explore-btn" style={{ textDecoration: "none" }}>
          Start Exploring Recipes &rarr;
        </Link>
      </div>
    </main>
  );
};

export default About;
