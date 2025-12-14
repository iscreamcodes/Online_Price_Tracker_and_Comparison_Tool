// src/api/authApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
  timeout: 10000, // Add timeout
});

// ✅ Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Handle token expiration automatically
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

// ✅ Register user
export const registerUser = async (userData) => {
  try {
    const res = await API.post("/register", userData);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error.response?.data || { message: "Registration failed" };
  }
};

// ✅ Login user
export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/login", credentials);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

// ✅ Get current logged-in user (requires token)
export const getCurrentUser = async () => {
  try {
    const res = await API.get("/me");
    return res.data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    // Clear invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    throw error.response?.data || { message: "Failed to get user data" };
  }
};

// ✅ Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const res = await API.put("/profile", profileData);
    return res.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

// ✅ Get user preferences
export const getUserPreferences = async () => {
  try {
    const res = await API.get("/preferences");
    return res.data.preferences;
  } catch (error) {
    console.error("Get preferences error:", error);
    throw error.response?.data || { message: "Failed to get preferences" };
  }
};

// ✅ Update user preferences
export const updateUserPreferences = async (preferences) => {
  try {
    const res = await API.put("/preferences", preferences);
    return res.data;
  } catch (error) {
    console.error("Update preferences error:", error);
    throw error.response?.data || { message: "Failed to update preferences" };
  }
};

// ✅ Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
  // Optional: Clear any other user-related storage
  localStorage.removeItem("userData");
  sessionStorage.clear();
};

// ✅ Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// ✅ Get stored token
export const getToken = () => {
  return localStorage.getItem("token");
};