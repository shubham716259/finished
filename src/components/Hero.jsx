import { Link } from "react-router-dom";
import ReactPlayer from "react-player";
import "../styles/hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <ReactPlayer
        className="hero-video"
        src="https://media.istockphoto.com/id/2210389292/video/professional-caucasian-chef-skillfully-preparing-steak-in-modern-kitchen.mp4?s=mp4-640x640-is&k=20&c=3RFWpxLYmecc5B1jRKJQ_PQwDv9Wqmo5pMgayarMQXI="
        playing
        muted
        loop
        playsInline
        aria-hidden="true"
      />
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
