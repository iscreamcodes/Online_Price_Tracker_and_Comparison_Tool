import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Token attached to request:", token.substring(0, 20) + "...");
  } else {
    console.log("❌ No token found in localStorage");
  }
  return config;
});

// ✅ Fetch tracked products using the new preferences route
export const getTrackedProducts = async (userId) => {
  console.log("📤 API Call - getTrackedProducts:", { userId });

  try {
    const res = await API.get(`/users/${userId}/preferences`);
    console.log("✅ API Response:", res.data);

    // Return tracked products array
    return res.data.preferences?.User_tracked_products || [];
  } catch (error) {
    console.error("❌ API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Optional: track a product via your existing route if needed
export const trackProduct = async (userId, listingId) => {
  try {
    const res = await API.post("/products/user/track-listing", { userId, listingId });
    console.log("✅ API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error);
    throw error;
  }
};
