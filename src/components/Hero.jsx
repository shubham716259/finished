import React from "react";
import { Link } from "react-router-dom";
import "../styles/hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="welcome">WELCOME TO</div>

        <h1>CookFusion</h1>

        <h2>
          Your Ultimate Recipe Discovery
          <br />& Food Planner
        </h2>

        <p>
          Discover delicious recipes from around the world, save your favourites
          and organize your weekly meal plans.
        </p>

        <Link to="/recipes" className="explore-btn">
          Explore Recipes
        </Link>
      </div>
    </section>
  );
};

export default Hero;
