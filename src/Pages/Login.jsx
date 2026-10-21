import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCheckCircle, FaSignOutAlt, FaUtensils, FaCalendarAlt } from "react-icons/fa";
import GoogleSignInButton from "../components/GoogleSignInButton";
import FormField from "../components/FormField";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    // Get saved account
    const storedUser = JSON.parse(localStorage.getItem("signupData") || "null");

    // No account
    if (!storedUser) {
      setMessage("No account found. Please sign up first.");
      setMessageType("error");
      return;
    }

    // Check credentials
    if (cleanEmail === storedUser.email && password === storedUser.password) {
      // Save login state via AuthContext
      login(
        {
          name: storedUser.name,
          email: storedUser.email,
        },
        remember
      );

      setMessage(`Welcome back, ${storedUser.name}!`);
      setMessageType("success");

      // Go Home
      setTimeout(() => {
        navigate("/");
      }, 900);
    } else {
      setMessage("Invalid email or password.");
      setMessageType("error");
    }
  }

  const handleGoogleSuccess = (googleProfile) => {
    setMessage(`Signed in successfully with Google as ${googleProfile.name}!`);
    setMessageType("success");
    setTimeout(() => {
      navigate("/");
    }, 900);
  };

  const handleGoogleError = (errorMsg) => {
    setMessage(errorMsg || "Google sign in was not completed.");
    setMessageType("error");
  };

  const handleLogout = () => {
    logout();
    setMessage("Logged out successfully.");
    setMessageType("info");
  };

  // If already logged in, show 'Already Logged In' status card
  if (isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-container already-logged-card">
          <button
            type="button"
            className="close-btn"
            onClick={() => navigate("/")}
            aria-label="Close"
          >
            ×
          </button>

          <h1>🍽️ CookFusion</h1>
          
          <div className="already-logged-badge">
            <FaCheckCircle className="badge-check-icon" />
            <span>Logged In</span>
          </div>

          <div className="logged-user-profile">
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <h3>{user?.name || "CookFusion Chef"}</h3>
            <p className="profile-email">{user?.email || "Signed in"}</p>
            <p className="status-note">
              You are currently signed in. You can continue cooking or switch accounts.
            </p>
          </div>

          {message && <p className={`login-message ${messageType}`}>{message}</p>}

          <div className="logged-actions-container">
            <button
              type="button"
              className="login-btn-modal primary-action"
              onClick={() => navigate("/recipes")}
            >
              <FaUtensils style={{ marginRight: "8px" }} />
              Explore Recipes
            </button>

            <button
              type="button"
              className="planner-shortcut-btn"
              onClick={() => navigate("/planner")}
            >
              <FaCalendarAlt style={{ marginRight: "8px" }} />
              Open Meal Planner
            </button>

            <button
              type="button"
              className="logout-secondary-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt style={{ marginRight: "8px" }} />
              Log Out of Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Close */}
        <button
          type="button"
          className="close-btn"
          onClick={() => navigate("/")}
          aria-label="Close login"
        >
          ×
        </button>

        {/* Heading */}
        <h1>🍽️ CookFusion</h1>
        <h2>Welcome Back</h2>
        <p className="login-description">
          Sign in to continue your cooking journey.
        </p>

        {/* Google Sign In Button (Real Google OAuth Popup Flow) */}
        <GoogleSignInButton
          text="Continue with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        {/* Divider */}
        <div className="divider">
          <span>OR</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <FormField
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />

          {/* Password */}
          <FormField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {/* Remember Me & Forgot Password Row */}
          <div className="remember-forgot-row">
            <div className="remember">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Remember Me</label>
            </div>

            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          {/* Login */}
          <button type="submit" className="login-btn-modal">
            Login
          </button>
        </form>

        {/* Message */}
        {message && <p className={`login-message ${messageType}`}>{message}</p>}

        {/* Signup */}
        <p className="signup-text">
          Don't have an account?
          <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
