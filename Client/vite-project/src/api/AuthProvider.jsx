// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import AuthContext from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Add axios interceptor to include token in all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

// In your AuthProvider, update the checkAuth function:
// In your AuthProvider.jsx, update the checkAuth function:
const checkAuth = async () => {
    try {
      console.log("🔐 Checking authentication...");
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("❌ No token found");
        setUser(null);
        setAuthLoading(false);
        return;
      }
  
      const res = await axios.get("http://localhost:5000/api/auth/me");
      console.log("✅ RAW Authentication response:", res.data);
      console.log("✅ Response data type:", typeof res.data);
      console.log("✅ Response data keys:", Object.keys(res.data));
      
      // Store whatever the backend returns
      setUser(res.data);
      
    } catch (error) {
      console.log("❌ Authentication failed:", error);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await axios.post("http://localhost:5000/api/auth/login", credentials);
    
    // Store token and user data
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout,
      login,
      checkAuth,
      authLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};