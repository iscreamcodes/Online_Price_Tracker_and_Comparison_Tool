// routes/AdminRoutes.js
import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole,
  getStoresMonitoredCount,
  getSystemHealth,
    getUserPreferences
} from "../Controller/UserManagementController.js";
import { verifyToken, adminOnly } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ Fetch all users
router.get("/users", verifyToken, adminOnly, getAllUsers);

// ✅ Dashboard stats
router.get("/dashboard-stats", verifyToken, adminOnly, getDashboardStats);

// ✅ Delete a user
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

// ✅ Update user role
router.put("/users/:id/role", verifyToken, adminOnly, updateUserRole);

// ✅ Stores monitored count
router.get("/stores-monitored", verifyToken, adminOnly, getStoresMonitoredCount);

// ✅ System health info
router.get("/system-health", verifyToken, adminOnly, getSystemHealth);

router.get("/users/:id/preferences", verifyToken, adminOnly, getUserPreferences);

export default router;
