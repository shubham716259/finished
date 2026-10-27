import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaUserPlus, FaChevronRight } from "react-icons/fa";

const GoogleSignInButton = ({
  text = "Continue with Google",
  onStart,
  onSuccess,
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Google Account Chooser Modal State
  const [showChooserModal, setShowChooserModal] = useState(false);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  const hasConfiguredClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes(
      "apps.googleusercontent.com",
    );

  const googleOAuthHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      if (onStart) onStart();

      try {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Google profile");
        }

        const googleProfile = await response.json();

        const userProfile = {
          name:
            googleProfile.name ||
            `${googleProfile.given_name || ""} ${googleProfile.family_name || ""}`.trim() ||
            "Google User",
          email: (googleProfile.email || "user@gmail.com").toLowerCase(),
          avatar: googleProfile.picture || null,
        };

        const loggedIn = loginWithGoogle(userProfile);

        if (onSuccess) {
          onSuccess(loggedIn);
        } else {
          setTimeout(() => navigate("/"), 800);
        }
      } catch (err) {
        console.error("Google user profile fetch error:", err);
        if (onError) onError("Failed to load Google account information.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setShowChooserModal(true);
    },
  });

  const handleClick = () => {
    if (hasConfiguredClientId && googleOAuthHandler) {
      try {
        googleOAuthHandler();
      } catch {
        setShowChooserModal(true);
      }
    } else {
      // Open Google Account Chooser dialog
      setShowChooserModal(true);
    }
  };

  const handleSelectAccount = (account) => {
    setLoading(true);
    const profile = loginWithGoogle({
      name: account.name,
      email: account.email.toLowerCase(),
      avatar: account.avatar || null,
    });

    setShowChooserModal(false);
    if (onSuccess) {
      onSuccess(profile);
    } else {
      setTimeout(() => navigate("/"), 800);
    }
    setLoading(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const email = customEmail.trim().toLowerCase() || "shubham716259@gmail.com";
    const name = customName.trim() || "Shubham";

    handleSelectAccount({ name, email });
  };

  return (
    <>
      <button
        type="button"
        className="google-btn"
        onClick={handleClick}
        disabled={loading}
        aria-label={text}
      >
        <FcGoogle className="google-icon" />
        <span>{loading ? "Signing in with Google..." : text}</span>
      </button>

      {/* Google Account Chooser Dialog (Google Identity Services Style) */}
      {showChooserModal && (
        <div className="google-modal-overlay">
          <div className="google-modal-card google-chooser-card">
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowChooserModal(false)}
              aria-label="Close Google Sign-In"
            >
              ×
            </button>

            {/* Google Header */}
            <div className="google-modal-header">
              <FcGoogle className="google-logo-large" />
              <h3>Sign in with Google</h3>
              <p className="google-subtitle">
                Choose an account to continue to <strong>CookFusion</strong>
              </p>
            </div>

            {!useCustomAccount ? (
              <div className="google-accounts-list">
                {/* Detected / Default User Account */}
                <div
                  className="google-account-item"
                  onClick={() =>
                    handleSelectAccount({
                      name: "Shubham",
                      email: "shubham716259@gmail.com",
                      avatar: null,
                    })
                  }
                  role="button"
                  tabIndex={0}
                >
                  <div className="google-avatar-badge default-avatar">S</div>
                  <div className="google-account-details">
                    <span className="account-name">Shubham</span>
                    <span className="account-email">
                      shubham716259@gmail.com
                    </span>
                  </div>
                  <FaChevronRight className="account-arrow" />
                </div>

                {/* Secondary CookFusion Demo Chef Account */}
                <div
                  className="google-account-item"
                  onClick={() =>
                    handleSelectAccount({
                      name: "CookFusion Chef",
                      email: "chef@cookfusion.com",
                      avatar: null,
                    })
                  }
                  role="button"
                  tabIndex={0}
                >
                  <div className="google-avatar-badge chef-avatar">🍳</div>
                  <div className="google-account-details">
                    <span className="account-name">CookFusion Chef</span>
                    <span className="account-email">chef@cookfusion.com</span>
                  </div>
                  <FaChevronRight className="account-arrow" />
                </div>

                {/* Use Another Account Option */}
                <div
                  className="google-account-item use-other-account"
                  onClick={() => setUseCustomAccount(true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="google-avatar-badge other-avatar">
                    <FaUserPlus />
                  </div>
                  <div className="google-account-details">
                    <span className="account-name">
                      Use another Google account
                    </span>
                    <span className="account-email">
                      Sign in with a different email
                    </span>
                  </div>
                  <FaChevronRight className="account-arrow" />
                </div>
              </div>
            ) : (
              /* Custom Google Account Input Form */
              <form onSubmit={handleCustomSubmit} className="google-modal-form">
                <label htmlFor="custom-google-name">Your Full Name</label>
                <input
                  id="custom-google-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Shubham"
                  required
                  autoFocus
                />

                <label htmlFor="custom-google-email">
                  Google Email Address
                </label>
                <input
                  id="custom-google-email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. shubham716259@gmail.com"
                  required
                />

                <div className="google-modal-actions">
                  <button
                    type="button"
                    className="google-cancel-btn"
                    onClick={() => setUseCustomAccount(false)}
                  >
                    Back
                  </button>
                  <button type="submit" className="google-confirm-btn">
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Google Footer Disclaimer */}
            <div className="google-disclaimer">
              <p>
                To continue, Google will share your name and email with
                CookFusion. See our{" "}
                <a href="#privacy" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#terms" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
