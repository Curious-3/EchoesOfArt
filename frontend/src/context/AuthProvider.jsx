import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  setAuthSession,
  updateStoredUser,
} from "../utils/authStorage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load user + token from the cookie-backed auth session
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  // On mount, verify token if present
  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getStoredUser();

    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    axios
      .get("http://localhost:8000/api/auth/me")
      .then((res) => {
        const updatedUser = { ...storedUser, ...res.data.user, token };
        setUser(updatedUser);
        updateStoredUser(updatedUser);
      })
      .catch((err) => {
        console.error("Token verification failed:", err);
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login function
  const login = (userData, token) => {
    const fullUser = { ...userData, token };
    setAuthSession(fullUser, token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(fullUser);
  };

  // Logout function
  const logout = () => {
    clearAuthSession();
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);