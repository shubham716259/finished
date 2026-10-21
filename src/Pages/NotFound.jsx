import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaUtensils, FaDice, FaCalendarAlt } from "react-icons/fa";
import "../styles/NotFound.css";

const NotFound = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/recipes`);
    }
  };

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-number">404</div>
        <div className="not-found-icon">🍲💔</div>

        <p className="not-found-small">CHEF'S SPECIAL ERROR</p>

        <h1>Recipe Not Found</h1>

        <p className="not-found-description">
          Looks like this recipe slipped off the cutting board and vanished! Don't worry, the kitchen is full of other mouth-watering dishes.
        </p>

        {/* QUICK SEARCH */}
        <form onSubmit={handleSearch} className="not-found-search">
          <input
            type="text"
            placeholder="Search for another recipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">
            <FaSearch /> Search
          </button>
        </form>

        <div className="not-found-actions">
          <Link to="/" className="not-found-btn home-btn">
            <FaHome /> Back Home
          </Link>
          <Link to="/recipes" className="not-found-btn recipes-btn">
            <FaUtensils /> Explore Recipes
          </Link>
          <Link to="/planner" className="not-found-btn planner-btn">
            <FaCalendarAlt /> Meal Planner
          </Link>
          <Link to="/surprise" className="not-found-btn surprise-btn">
            <FaDice /> Surprise Me
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;