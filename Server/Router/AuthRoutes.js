import express from "express";
import { registerUser, loginUser } from "../Controller/AuthController.js";
import { registerAdmin } from "../Controller/AdminRegister.js";
import { verifyToken, adminOnly } from "../Middleware/authMiddleware.js";
import Users from "../Model/Users.js"; // ✅ Use consistent naming (Users instead of User)

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Get currently logged-in user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-User_password"); // Changed from -password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ 
      user: {
        id: user._id,
        User_name: user.User_name,
        User_email: user.User_email,
        User_role: user.User_role, // Changed from role
        User_preferences: user.User_preferences,
        User_createdAt: user.User_createdAt,
        User_updatedAt: user.User_updatedAt
      }
    });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Only admins (or for setup) can register another admin
router.post("/register-admin", verifyToken, adminOnly, registerAdmin);

// ✅ Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { User_name, User_preferences } = req.body;
    
    const updatedUser = await Users.findByIdAndUpdate(
      req.user.id,
      {
        User_name,
        User_preferences,
        User_updatedAt: new Date()
      },
      { new: true, select: "-User_password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        User_name: updatedUser.User_name,
        User_email: updatedUser.User_email,
        User_role: updatedUser.User_role,
        User_preferences: updatedUser.User_preferences,
        User_createdAt: updatedUser.User_createdAt,
        User_updatedAt: updatedUser.User_updatedAt
      }
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get user preferences
router.get("/preferences", verifyToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("User_preferences");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ preferences: user.User_preferences });
  } catch (err) {
    console.error("❌ Error fetching preferences:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update user preferences
router.put("/preferences", verifyToken, async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.user.id,
      { 
        User_preferences: req.body,
        User_updatedAt: new Date()
      },
      { new: true, select: "User_preferences User_updatedAt" }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Preferences updated successfully",
      preferences: updatedUser.User_preferences,
      updatedAt: updatedUser.User_updatedAt
    });
  } catch (err) {
    console.error("❌ Error updating preferences:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this to your AuthRoutes.js for debugging
// In your AuthRoutes.js - FIXED me-debug endpoint
router.get("/me-debug", verifyToken, async (req, res) => {
  try {
    console.log("🔍 /me-debug called for user:", req.user.id);
    
    const user = await Users.findById(req.user.id);
    
    if (!user) {
      console.log("❌ User not found in /me-debug");
      return res.status(404).json({ message: "User not found" });
    }

    // Convert to plain object safely
    const userObject = user.toObject ? user.toObject() : user;
    
    console.log("📊 User data structure:", {
      id: userObject._id,
      hasUserPreferences: !!userObject.User_preferences,
      hasTrackedProducts: !!userObject.User_preferences?.User_tracked_products,
      trackedProductsCount: userObject.User_preferences?.User_tracked_products?.length || 0,
      userPreferencesKeys: userObject.User_preferences ? Object.keys(userObject.User_preferences) : 'No User_preferences'
    });

    // Return the debug info
    res.json({
      success: true,
      debug: "Raw user data from database",
      user: {
        _id: userObject._id,
        User_name: userObject.User_name,
        User_email: userObject.User_email,
        User_role: userObject.User_role,
        User_preferences: userObject.User_preferences || null
      },
      structure: {
        hasUserPreferences: !!userObject.User_preferences,
        hasTrackedProducts: !!userObject.User_preferences?.User_tracked_products,
        trackedProductsCount: userObject.User_preferences?.User_tracked_products?.length || 0,
        allUserKeys: Object.keys(userObject)
      },
      sampleTrackedProducts: userObject.User_preferences?.User_tracked_products?.slice(0, 2) || []
    });

  } catch (error) {
    console.error("❌ Error in /me-debug:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error in me-debug",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;