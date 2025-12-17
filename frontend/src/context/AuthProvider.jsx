import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load user + token from localStorage
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [loading, setLoading] = useState(true);

  // On mount, verify token if present
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }

    const userObj = JSON.parse(stored);

    if (userObj.token) {
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${userObj.token}`;

      // Optionally verify token by /me endpoint
      axios
        .get("http://localhost:8000/api/auth/me")
        .then((res) => {
          // Update user state with fresh info
          const updatedUser = { ...userObj, ...res.data.user };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        })
        .catch((err) => {
          console.error("Token verification failed:", err);
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = (userData, token) => {
    const fullUser = { ...userData, token }; // store token inside user
    localStorage.setItem("user", JSON.stringify(fullUser));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(fullUser);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
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