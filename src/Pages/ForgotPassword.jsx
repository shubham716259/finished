import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaLock, FaKey, FaEnvelope, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import FormField from "../components/FormField";
import "../styles/forgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetUserPassword } = useAuth();

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter New Password, 3 = Success
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [verifiedName, setVerifiedName] = useState("");

  // Step 1: Verify Email
  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setEmailError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      const error = "Please enter your registered email.";
      setEmailError(error);
      setMessage(error);
      setMessageType("error");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("signupData") || "null");

    if (!stored || stored.email !== cleanEmail) {
      const error = "No account found with this email address. Please check and try again.";
      setEmailError(error);
      setMessage(error);
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
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!newPassword || !confirmPassword) {
      const error = "Please fill in both password fields.";
      if (!newPassword) setNewPasswordError(error);
      if (!confirmPassword) setConfirmPasswordError(error);
      setMessage(error);
      setMessageType("error");
      return;
    }

    if (newPassword.length < 6) {
      const error = "Password must be at least 6 characters long.";
      setNewPasswordError(error);
      setMessage(error);
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      const error = "Passwords do not match.";
      setConfirmPasswordError(error);
      setMessage(error);
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
            <FormField
              id="forgot-email"
              label="Registered Email Address"
              type="email"
              name="email"
              aria-required="true"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              placeholder="e.g. chef@cookfusion.com"
              autoComplete="email"
              autoFocus
              error={emailError}
              inputWrapperClassName="input-group"
              inputPrefix={<FaEnvelope className="input-icon" />}
            />

            <button type="submit" className="forgot-submit-btn">
              Verify Account
            </button>
          </form>
        )}

        {/* Step 2: New Password Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <FormField
              id="new-password"
              label="New Password"
              type="password"
              name="new-password"
              aria-required="true"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError("");
              }}
              placeholder="Enter new password (min. 6 characters)"
              autoComplete="new-password"
              autoFocus
              error={newPasswordError}
              inputWrapperClassName="input-group"
              inputPrefix={<FaKey className="input-icon" />}
            />

            <FormField
              id="confirm-new-password"
              label="Confirm New Password"
              type="password"
              name="confirm-new-password"
              aria-required="true"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              error={confirmPasswordError}
              inputWrapperClassName="input-group"
              inputPrefix={<FaLock className="input-icon" />}
            />

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
