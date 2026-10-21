import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("loggedInUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sync state if localStorage changes from another tab/window or event
  useEffect(() => {
    const handleStorageChange = () => {
      const logged = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(logged);
      try {
        const stored = localStorage.getItem("loggedInUser");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleStorageChange);
    };
  }, []);

  const login = (userData, remember = false) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loggedInUser", JSON.stringify(userData));
    if (remember) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
    setIsLoggedIn(true);
    setUser(userData);
    window.dispatchEvent(new Event("authChange"));
  };

  const loginWithGoogle = (googleUser) => {
    const profile = {
      name: googleUser.name || "Google User",
      email: (googleUser.email || "googleuser@gmail.com").toLowerCase(),
      avatar: googleUser.picture || null,
      provider: "google",
    };

    // If no signupData exists or new google user, save as account
    const existing = JSON.parse(localStorage.getItem("signupData") || "null");
    if (!existing || existing.email === profile.email) {
      localStorage.setItem(
        "signupData",
        JSON.stringify({
          name: profile.name,
          email: profile.email,
          password: existing?.password || "google_authenticated",
        })
      );
    }

    login(profile, true);
    return profile;
  };

  const resetUserPassword = (email, newPassword) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = JSON.parse(localStorage.getItem("signupData") || "null");

    if (existing && existing.email === cleanEmail) {
      existing.password = newPassword;
      localStorage.setItem("signupData", JSON.stringify(existing));
      return { success: true, user: existing };
    }

    return { success: false, message: "No account found with this email." };
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("rememberMe");
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        loginWithGoogle,
        resetUserPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
