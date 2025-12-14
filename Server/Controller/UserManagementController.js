// Controller/UserManagementController.js
import Users from "../Model/Users.js";

/* ============================================================
   GET ALL USERS (Without Passwords)
============================================================ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await Users.find({}, "-User_password");
    res.json({ users });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   DASHBOARD STATS – TOTAL USERS & ACTIVE TRACKERS
============================================================ */



/* ============================================================
   DELETE USER
============================================================ */
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   UPDATE USER ROLE
============================================================ */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { User_role: role },
      { new: true, select: "-User_password" }
    );

    if (!updatedUser)
      return res.status(404).json({ error: "User not found" });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error("❌ Error updating user role:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   GET SINGLE USER
============================================================ */
export const getUserById = async (req, res) => {
  try {
    const user = await Users.findById(req.params.id, "-User_password");

    if (!user)
      return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("❌ Error fetching user by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   SEARCH USERS BY EMAIL
============================================================ */
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


/* ============================================================
   COUNT TOTAL USERS
============================================================ */
export const getUserCount = async (req, res) => {
  try {
    const count = await Users.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("❌ Error getting user count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   COUNT ACTIVE TRACKERS
============================================================ */
export const getActiveTrackersCount = async (req, res) => {
  try {
    const users = await Users.find({}, "User_preferences.User_tracked_products");

    const activeTrackers = users.reduce(
      (acc, u) =>
        acc + (u.User_preferences?.User_tracked_products?.length || 0),
      0
    );

    res.json({ activeTrackers });
  } catch (err) {
    console.error("❌ Error getting active trackers count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   COUNT UNIQUE STORES TRACKED
============================================================ */
export const getStoresMonitoredCount = async (req, res) => {
  try {
    const users = await Users.find(
      {},
      "User_preferences.User_tracked_products.Tracked_store"
    );

    const storeSet = new Set();

    users.forEach((u) => {
      u.User_preferences?.User_tracked_products?.forEach((p) => {
        if (p.Tracked_store) storeSet.add(p.Tracked_store);
      });
    });

    res.json({ storesMonitored: storeSet.size });
  } catch (err) {
    console.error("❌ Error getting stores monitored count:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   SYSTEM HEALTH
============================================================ */
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


/* ============================================================
   GET USER PREFERENCES
============================================================ */
export const getUserPreferences = async (req, res) => {
  try {
    const user = await Users.findById(
      req.params.id,
      "User_preferences"
    );

    if (!user)
      return res.status(404).json({ error: "User not found" });

    res.json({ preferences: user.User_preferences });
  } catch (err) {
    console.error("❌ Error fetching user preferences:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   UPDATE USER PREFERENCES
============================================================ */
export const updateUserPreferences = async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      { User_preferences: req.body },
      { new: true, select: "User_preferences" }
    );

    if (!updatedUser)
      return res.status(404).json({ error: "User not found" });

    res.json({ preferences: updatedUser.User_preferences });
  } catch (err) {
    console.error("❌ Error updating user preferences:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   GET ALL TRACKED PRODUCTS (Admin)
============================================================ */
export const getAllTrackedProducts = async (req, res) => {
  try {
    const users = await Users.find(
      {},
      "User_name User_email User_preferences.User_tracked_products"
    );

    const allTrackedProducts = users.flatMap((u) =>
      (u.User_preferences?.User_tracked_products || []).map((p) => ({
        userName: u.User_name,
        userEmail: u.User_email,
        ...p.toObject(),
      }))
    );

    res.json({
      totalTrackedProducts: allTrackedProducts.length,
      trackedProducts: allTrackedProducts,
    });
  } catch (err) {
    console.error("❌ Error fetching tracked products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


/* ============================================================
   UNTRACK PRODUCT (User)
============================================================ */
export const untrackProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const user = await Users.findByIdAndUpdate(
      userId,
      {
        $pull: {
          "User_preferences.User_tracked_products": {
            Tracked_product_id: productId,
          },
        },
      },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Product untracked successfully",
      preferences: user.User_preferences,
    });
  } catch (err) {
    console.error("❌ Error untracking product:", err);
    res.status(500).json({ message: "Failed to untrack product" });
  }
};

// Controller/UserManagementController.js - UPDATED getDashboardStats
// Controller/UserManagementController.js - SIMPLE DEBUG VERSION
export const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Starting dashboard stats generation...");

    // 1. Basic user stats only (remove complex calculations for now)
    const totalUsers = await Users.countDocuments();
    
    const usersWithTrackedProducts = await Users.countDocuments({
      "User_preferences.User_tracked_products.0": { $exists: true }
    });

    // 2. Basic product stats
    let totalProducts = 0;
    let totalListings = 0;
    
    try {
      totalProducts = await Products.countDocuments();
      totalListings = await Listings.countDocuments();
    } catch (err) {
      console.log("⚠️ Products/Listings collection not accessible:", err.message);
    }

    // 3. Simple tracking stats
    const users = await Users.find({}, "User_preferences.User_tracked_products");
    const totalTrackedItems = users.reduce(
      (acc, user) => acc + (user.User_preferences?.User_tracked_products?.length || 0),
      0
    );

    // 4. Simple store count
    const storeSet = new Set();
    users.forEach((user) => {
      user.User_preferences?.User_tracked_products?.forEach((product) => {
        if (product.Tracked_store) storeSet.add(product.Tracked_store);
      });
    });

    const stats = {
      users: {
        total: totalUsers,
        activeTrackers: usersWithTrackedProducts,
        newThisWeek: 0, // Simplified for now
        percentageActive: totalUsers > 0 ? Math.round((usersWithTrackedProducts / totalUsers) * 100) : 0
      },
      
      products: {
        total: totalProducts,
        totalListings: totalListings,
        activeListings: totalListings, // Simplified
        newListingsThisWeek: 0
      },
      
      tracking: {
        totalTrackedItems: totalTrackedItems,
        averagePerUser: totalUsers > 0 ? (totalTrackedItems / totalUsers).toFixed(1) : 0,
        totalPriceChanges: 0, // Simplified
        productsWithPriceDrops: 0
      },
      
      stores: {
        uniqueStoresTracked: storeSet.size,
        mostPopularStores: [] // Simplified for now
      },
      
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };

    console.log("✅ Dashboard stats generated successfully");
    console.log("📊 Stats:", {
      users: stats.users.total,
      products: stats.products.total,
      listings: stats.products.totalListings,
      trackedItems: stats.tracking.totalTrackedItems,
      stores: stats.stores.uniqueStoresTracked
    });

    res.json(stats);

  } catch (err) {
    console.error("❌ CRITICAL ERROR in getDashboardStats:", err);
    res.status(500).json({ 
      error: "Internal server error in dashboard stats",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Helper function to get most popular stores
const getMostPopularStores = async () => {
  try {
    const users = await Users.find({}, "User_preferences.User_tracked_products.Tracked_store");
    
    const storeCounts = {};
    users.forEach(user => {
      user.User_preferences?.User_tracked_products?.forEach(product => {
        if (product.Tracked_store) {
          storeCounts[product.Tracked_store] = (storeCounts[product.Tracked_store] || 0) + 1;
        }
      });
    });

    // Convert to array and sort by count
    return Object.entries(storeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5) // Top 5 stores
      .map(([store, count]) => ({ store, count }));
  } catch (err) {
    console.error("Error getting popular stores:", err);
    return [];
  }
};
