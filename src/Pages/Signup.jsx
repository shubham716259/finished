import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import FormField from "../components/FormField";
import "../styles/signup.css";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setConfirmPasswordError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Empty fields
    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    // Password length
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    // Check existing account
    const existingUser = JSON.parse(
      localStorage.getItem("signupData") || "null"
    );

    if (existingUser && existingUser.email === cleanEmail) {
      setMessage("Account already exists. Please login.");
      setMessageType("error");
      return;
    }

    // Create user
    const userData = {
      name: cleanName,
      email: cleanEmail,
      password: password,
    };

    // Save account
    localStorage.setItem("signupData", JSON.stringify(userData));

    setMessage("Account created successfully! Redirecting to login...");
    setMessageType("success");

    // Go to login
    setTimeout(() => {
      navigate("/login");
    }, 1200);
  }

  const handleGoogleSuccess = (googleProfile) => {
    setMessage(`Welcome to CookFusion, ${googleProfile.name}!`);
    setMessageType("success");
    setTimeout(() => {
      navigate("/");
    }, 900);
  };

  const handleGoogleError = (errorMsg) => {
    setMessage(errorMsg || "Google sign up was not completed.");
    setMessageType("error");
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Close */}
        <button
          type="button"
          className="close-btn"
          onClick={() => navigate("/")}
          aria-label="Close signup"
        >
          ×
        </button>

        {/* Heading */}
        <h1>🍽️ CookFusion</h1>
        <h2>Create Account</h2>
        <p className="signup-description">
          Start your cooking journey with us.
        </p>

        {/* Google Sign In/Up Button */}
        <GoogleSignInButton
          text="Continue with Google"
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        {/* Divider */}
        <div className="divider">
          <span>OR</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <FormField
            id="signup-name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            required
          />

          {/* Email */}
          <FormField
            id="signup-email"
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
            id="signup-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={6}
            required
          />

          {/* Confirm Password */}
          <FormField
            id="signup-confirm"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError("");
            }}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            error={confirmPasswordError}
          />

          {/* Button */}
          <button type="submit" className="signup-btn">
            Create Account
          </button>
        </form>

        {/* Message */}
        {message && <p className={`message ${messageType}`}>{message}</p>}

        {/* Login */}
        <p className="login-link">
          Already have an account?
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
