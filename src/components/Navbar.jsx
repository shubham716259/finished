import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlanner } from "../context/PlannerContext";
import { selectFavoritesCount } from "../store/favoritesSlice";

import "../styles/navbar.css";

import { GiKnifeFork } from "react-icons/gi";

import {
  FaHome,
  FaHeart,
  FaInfoCircle,
  FaUser,
  FaUserCheck,
  FaSignOutAlt,
  FaCalendarAlt,
  FaShoppingCart,
  FaDice,
  FaChevronDown,
} from "react-icons/fa";

import { MdRestaurantMenu } from "react-icons/md";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { isLoggedIn, user, logout } = useAuth();
  const favoritesCount = useSelector(selectFavoritesCount);
  const { totalPlannedCount } = usePlanner();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      {/* Brand Logo on the left */}
      <Link to="/" className="logo" aria-label="CookFusion Home">
        <GiKnifeFork />
        <span>CookFusion</span>
      </Link>

      {/* Unified Single Glass Navigation Panel */}
      <ul className="nav-links">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaHome />
            <span>Home</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/recipes"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <MdRestaurantMenu />
            <span>Recipes</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/planner"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaCalendarAlt />
            <span>Planner</span>
            {totalPlannedCount > 0 && (
              <span className="nav-badge planner-badge">{totalPlannedCount}</span>
            )}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/favorites"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaHeart />
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="nav-badge fav-badge">{favoritesCount}</span>
            )}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/shopping"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaShoppingCart />
            <span>Shopping</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/surprise"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaDice />
            <span>Surprise Me</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaInfoCircle />
            <span>About</span>
          </NavLink>
        </li>
      </ul>

      {/* Auth State Button */}
      {isLoggedIn ? (
        <div className="user-menu-container" ref={dropdownRef}>
          <button
            type="button"
            className="already-logged-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-label="User Account Menu"
          >
            <div className="status-indicator"></div>
            <FaUserCheck className="logged-icon" />
            <span className="logged-text">{user?.name ? `${user.name.split(" ")[0]} · Logged In` : "Logged In"}</span>
            <FaChevronDown className={`chevron-icon ${dropdownOpen ? "open" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown-panel">
              <div className="user-dropdown-header">
                <div className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="user-info-text">
                  <span className="user-display-name">{user?.name || "CookFusion Chef"}</span>
                  <span className="user-display-email">{user?.email || "chef@cookfusion.com"}</span>
                  <div className="logged-status-pill">
                    <span className="pulse-dot"></span>
                    Logged In
                  </div>
                </div>
              </div>

              <div className="dropdown-divider"></div>

              <div className="user-dropdown-actions">
                <Link
                  to="/login"
                  className="dropdown-action-btn view-account"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FaUser />
                  <span>Account Status</span>
                </Link>

                <button
                  type="button"
                  className="dropdown-action-btn logout-action"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="login-btn">
          <FaUser />
          <span>Login</span>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
