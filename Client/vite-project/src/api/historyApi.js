// src/api/historyApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Changed from /api/history to /api
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Existing history functions
export const saveHistory = async (data) => {
  const res = await API.post("/history/save", data);
  return res.data;
};

export const getHistory = async (listingId) => {
  const res = await API.get(`/history/${listingId}`);
  return res.data;
};

// NEW: Track product function
export const trackProduct = async (userId, listingId) => {
  const res = await API.post("/track-product", {
    userId,
    listingId
  });
  return res.data;
};
