// src/api/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to normalize user data structure
 // In AuthProvider.jsx, update the normalizeUser function:
// In AuthProvider.jsx - FIXED normalizeUser function
const normalizeUser = (userData) => {
  if (!userData) return null;
  
  console.log("🔄 Normalizing user data:", userData);
  
  // Handle both backend and frontend structures
  const normalized = {
    id: userData.id || userData._id,
    name: userData.name || userData.User_name,
    email: userData.email || userData.User_email,
    role: userData.role || userData.User_role,
    // ✅ CRITICAL FIX: Preserve existing User_preferences structure
    User_preferences: userData.User_preferences || {
      User_tracked_products: userData.tracked_products || [], // Check for alternative field names
      User_notification: userData.User_notification !== undefined ? userData.User_notification : true,
      User_currency: userData.User_currency || "KES"
    }
  };
  
  // ✅ SPECIAL FIX: If backend returns tracked_products at root level, move to User_preferences
  if (userData.tracked_products && !userData.User_preferences) {
    normalized.User_preferences.User_tracked_products = userData.tracked_products;
  }
  
  // ✅ SPECIAL FIX: If backend returns User_tracked_products at root level
  if (userData.User_tracked_products && !userData.User_preferences?.User_tracked_products) {
    normalized.User_preferences.User_tracked_products = userData.User_tracked_products;
  }
  
  console.log("✅ Normalized user:", normalized);
  console.log("✅ Tracked products in normalized:", normalized.User_preferences?.User_tracked_products?.length || 0);
  return normalized;
};

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
  
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("📦 Loading user from localStorage:", parsedUser);
      setUser(normalizeUser(parsedUser));
      setLoading(false);
    } else if (token) {
      console.log("🔄 Fetching user from /api/auth/me...");
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          console.log("✅ /api/auth/me raw response:", data);
          const normalizedUser = normalizeUser(data.user);
          console.log("✅ Normalized user:", normalizedUser);
          console.log("✅ Tracked products:", normalizedUser?.User_preferences?.User_tracked_products);
          
          setUser(normalizedUser);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        })
        .catch((error) => {
          console.error("❌ Error fetching /api/auth/me:", error);
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ LOGIN FUNCTION
  const login = (userData, token) => {
    console.log("🔐 AuthProvider login called:", { userData, token });
    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("token", token);
  };

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    console.log("🔐 AuthProvider logout called");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ✅ REFRESH USER FUNCTION
 // In AuthProvider.jsx - ENHANCED refreshUser function
const refreshUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found for refresh");
      return null;
    }

    console.log("🔄 Manually refreshing user data...");
    const response = await fetch("http://localhost:5000/api/auth/me", {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log("📡 Refresh response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("📦 Raw refresh response:", data);
      
      // Check if we have user data in different structures
      const userData = data.user || data;
      console.log("🔍 User data structure:", {
        hasUserPrefs: !!userData.User_preferences,
        hasTrackedAtRoot: !!userData.User_tracked_products,
        hasTrackedInPrefs: userData.User_preferences?.User_tracked_products?.length || 0,
        allKeys: Object.keys(userData)
      });
      
      const normalizedUser = normalizeUser(userData);
      console.log("✅ Refreshed normalized user:", {
        name: normalizedUser.name,
        trackedCount: normalizedUser.User_preferences?.User_tracked_products?.length || 0,
        sampleProducts: normalizedUser.User_preferences?.User_tracked_products?.slice(0, 2)
      });
      
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return normalizedUser;
    } else {
      console.error("❌ Refresh failed with status:", response.status);
      const errorText = await response.text();
      console.error("❌ Refresh error response:", errorText);
      return null;
    }
  } catch (error) {
    console.error("❌ Error refreshing user:", error);
    return null;
  }
};

// In AuthProvider.jsx - Add this function
const forceRefresh = async () => {
  try {
    console.log("🚀 Force refreshing user data...");
    localStorage.removeItem("user"); // Clear cached user data
    return await refreshUser(); // Do a fresh fetch
  } catch (error) {
    console.error("❌ Error in force refresh:", error);
    return null;
  }
};

  // Debug logging
  useEffect(() => {
    console.log("=== 🔐 AUTH PROVIDER STATE ===");
    console.log("User:", user);
    console.log("Loading:", loading);
    console.log("Token exists:", !!localStorage.getItem("token"));
    console.log("User in localStorage:", !!localStorage.getItem("user"));
    if (user) {
      console.log("User keys:", Object.keys(user));
      console.log("Has User_preferences:", !!user.User_preferences);
      console.log("Tracked products count:", user.User_preferences?.User_tracked_products?.length || 0);
    }
    console.log("=== 🔐 END AUTH STATE ===");
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      authLoading: loading,
      login,
      logout,
      refreshUser, // ✅ Add refresh function
      forceRefresh
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}