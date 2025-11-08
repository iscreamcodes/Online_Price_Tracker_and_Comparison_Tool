// src/api/authApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth",
});

// ✅ Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ Register user
export const registerUser = async (userData) => {
  const res = await API.post("/register", userData);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
};

// ✅ Login user
export const loginUser = async (credentials) => {
  const res = await API.post("/login", credentials);
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
};

// ✅ Get current logged-in user (requires token)
export const getCurrentUser = async () => {
  const res = await API.get("/me");
  return res.data.user;
};

// ✅ Logout user
export const logoutUser = () => {
  localStorage.removeItem("token");
};
