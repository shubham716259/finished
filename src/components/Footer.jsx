import React from "react";
import { Link } from "react-router-dom";
import { GiKnifeFork } from "react-icons/gi";
import { FaHeart, FaCalendarAlt, FaShoppingCart, FaDice, FaUtensils } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <GiKnifeFork />
            <span>CookFusion</span>
          </Link>
          <p className="footer-tagline">
            Your ultimate culinary companion. Discover world flavors, organize your weekly meals, and auto-generate grocery lists with ease.
          </p>
        </div>

        <div className="footer-links-group">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/recipes">Browse All Recipes</Link></li>
            <li><Link to="/surprise">Surprise Me</Link></li>
            <li><Link to="/favorites">My Favorites</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Planning</h4>
          <ul>
            <li><Link to="/planner">Weekly Meal Planner</Link></li>
            <li><Link to="/shopping">Shopping List</Link></li>
            <li><Link to="/about">About & Tips</Link></li>
          </ul>
        </div>

        <div className="footer-links-group">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/signup">Create Account</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} CookFusion. Crafted with passion for food lovers everywhere.</p>
      </div>
    </footer>
  );
};

export default Footer;
