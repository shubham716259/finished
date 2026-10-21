import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaLock, FaKey, FaEnvelope, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import "../styles/forgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetUserPassword } = useAuth();

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter New Password, 3 = Success
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [verifiedName, setVerifiedName] = useState("");

  // Step 1: Verify Email
  const handleVerifyEmail = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your registered email.");
      setMessageType("error");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("signupData") || "null");

    if (!stored || stored.email !== cleanEmail) {
      setMessage("No account found with this email address. Please check and try again.");
      setMessageType("error");
      return;
    }

    setVerifiedName(stored.name || "Chef");
    setMessage(`Account verified for ${stored.name}! Please enter your new password below.`);
    setMessageType("success");
    setStep(2);
  };

  // Step 2: Update Password
  const handleResetPassword = (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    const res = resetUserPassword(email, newPassword);

    if (res.success) {
      setMessage("Your password has been successfully updated!");
      setMessageType("success");
      setStep(3);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setMessage(res.message || "Failed to update password.");
      setMessageType("error");
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        {/* Close */}
        <button
          type="button"
          className="close-btn"
          onClick={() => navigate("/login")}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <h1>🍽️ CookFusion</h1>
        <h2>Reset Password</h2>
        <p className="forgot-description">
          {step === 1 && "Enter your registered email to locate your account and set a new password."}
          {step === 2 && `Hello ${verifiedName}, please create and confirm your new password.`}
          {step === 3 && "Password updated! Redirecting to login..."}
        </p>

        {/* Step Indicator */}
        <div className="reset-steps-bar">
          <div className={`step-dot ${step >= 1 ? "active" : ""}`}>
            <span>1</span>
            <label>Verify</label>
          </div>
          <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
          <div className={`step-dot ${step >= 2 ? "active" : ""}`}>
            <span>2</span>
            <label>Reset</label>
          </div>
          <div className={`step-line ${step === 3 ? "active" : ""}`}></div>
          <div className={`step-dot ${step === 3 ? "active" : ""}`}>
            <span>3</span>
            <label>Done</label>
          </div>
        </div>

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail}>
            <label htmlFor="forgot-email">Registered Email Address</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. chef@cookfusion.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <button type="submit" className="forgot-submit-btn">
              Verify Account
            </button>
          </form>
        )}

        {/* Step 2: New Password Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <label htmlFor="new-password">New Password</label>
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                autoComplete="new-password"
                autoFocus
              />
            </div>

            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="forgot-submit-btn">
              Update Password
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="reset-success-box">
            <FaCheckCircle className="success-icon" />
            <h3>Password Reset Complete!</h3>
            <p>You can now sign in with your new password.</p>
            <button
              type="button"
              className="forgot-submit-btn"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Message Alert */}
        {message && <p className={`forgot-message ${messageType}`}>{message}</p>}

        {/* Back to Login Link */}
        <div className="back-login-wrapper">
          <Link to="/login" className="back-login-link">
            <FaArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
