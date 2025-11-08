// Controller/UserManagementController.js
import Users from "../Model/Users.js";

// ✅ Get all users (for admin dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({}, "-User_password"); // Exclude passwords
    res.json({ users });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Dashboard stats — total users & active trackers
export const getDashboardStats = async (req, res) => {
  try {
    const users = await Users.find({}, "User_preferences.tracked_products");
    const totalUsers = users.length;

    const activeTrackers = users.reduce((acc, user) => {
      const trackers = user.User_preferences?.tracked_products?.length || 0;
      return acc + trackers;
    }, 0);

    res.json({ totalUsers, activeTrackers });
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete a user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Update user role (e.g., promote to admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-User_password" }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("❌ Error updating user role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id, "-User_password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("❌ Error fetching user by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Search users by email
export const searchUsers = async (req, res) => {
  const { query } = req.query;
  try {
    const users = await Users.find(
      { User_email: { $regex: query, $options: "i" } },
      "-User_password"
    );
    res.json({ users });
  } catch (err) {
    console.error("❌ Error searching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Count total users
export const getUserCount = async (req, res) => {
  try {
    const count = await Users.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("❌ Error getting user count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Count total tracked products
export const getActiveTrackersCount = async (req, res) => {
  try {
    const users = await Users.find({}, "User_preferences.tracked_products");
    const activeTrackers = users.reduce(
      (acc, u) => acc + (u.User_preferences?.tracked_products?.length || 0),
      0
    );
    res.json({ activeTrackers });
  } catch (err) {
    console.error("❌ Error getting active trackers count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Count stores monitored
export const getStoresMonitoredCount = async (req, res) => {
  try {
    const users = await Users.find({}, "User_preferences.tracked_products");
    const stores = new Set();

    users.forEach((u) => {
      u.User_preferences?.tracked_products?.forEach((p) => {
        if (p.store) stores.add(p.store);
      });
    });

    res.json({ storesMonitored: stores.size });
  } catch (err) {
    console.error("❌ Error getting stores monitored count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ System health info (basic metrics)
export const getSystemHealth = async (req, res) => {
  try {
    res.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    });
  } catch (err) {
    console.error("❌ Error getting system health:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id, "User_preferences");
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ preferences: user.User_preferences });
  } catch (err) {
    console.error("❌ Error fetching user preferences:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { User_preferences: req.body },
      { new: true, select: "User_preferences" }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({ preferences: updatedUser.User_preferences });
  } catch (err) {
    console.error("❌ Error updating user preferences:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getAllTrackedProducts = async (req, res) => {
  try {
    const users = await Users.find({}, "User_name User_email User_preferences.tracked_products");

    // Combine all tracked products into one flat list
    const allTrackedProducts = users.flatMap(u =>
      (u.User_preferences?.tracked_products || []).map(p => ({
        userName: u.User_name,
        userEmail: u.User_email,
        ...p
      }))
    );

    res.json({
      totalTrackedProducts: allTrackedProducts.length,
      trackedProducts: allTrackedProducts,
    });
  } catch (err) {
    console.error("Error fetching tracked products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

