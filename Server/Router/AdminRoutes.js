// routes/AdminRoutes.js
import express from "express";
import {
  getAllUsers,
  getDashboardStats,
  deleteUser,
  updateUserRole,
  getStoresMonitoredCount,
  getSystemHealth,
    getUserPreferences,
   
} from "../Controller/UserManagementController.js";
import {
  getAllProducts,
  getTrackedProducts,
  deleteProduct,
  getProductsWithTracked,
  getProductsWithListings,
  getAllListings,
  getProductsWithAllListings,
   deleteListing,
  untrackListing,
  softDeleteListing,
  untrackProduct

} from "../Controller/ProductManagementController.js";
import { verifyToken, adminOnly } from "../Middleware/authMiddleware.js";
import Products from "../Model/Products.js";

const router = express.Router();

// ✅ Fetch all users
router.get("/users", verifyToken, adminOnly, getAllUsers);

// ✅ Dashboard stats
router.get("/dashboard-stats", getDashboardStats);


// ✅ Delete a user
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

// ✅ Update user role
router.put("/users/:id/role", verifyToken, adminOnly, updateUserRole);

// ✅ Stores monitored count
router.get("/stores-monitored", verifyToken, adminOnly, getStoresMonitoredCount);

// ✅ System health info
router.get("/system-health", verifyToken, adminOnly, getSystemHealth);

router.get("/users/:id/preferences", verifyToken, adminOnly, getUserPreferences);


router.get("/products", verifyToken, adminOnly, getAllProducts);
router.get("/tracked-products", verifyToken, adminOnly, getTrackedProducts);
router.delete("/products/:id", verifyToken, adminOnly, deleteProduct);
router.get("/products-with-listings", verifyToken, adminOnly, getProductsWithListings);
//router.get("/tracked-listings", verifyToken, adminOnly, getTrackedListings);
router.get("/listings", verifyToken, adminOnly, getAllListings);

router.delete("/tracked-products/:id", verifyToken, adminOnly, untrackProduct);
// Product restoration


// Listing management
router.delete("/listings/:id", verifyToken, adminOnly, deleteListing); // OR use softDeleteListing
router.put("/listings/:id/soft-delete", verifyToken, adminOnly, softDeleteListing); // Optional

// User tracking management
router.delete("/tracked-products/:id", verifyToken, adminOnly, untrackListing);






router.get("/products-with-tracked",   getProductsWithTracked);
// routes/AdminRoutes.js - Add this route
router.get("/products-with-all-listings",  getProductsWithAllListings);
// Add this temporary debug route to your AdminRoutes.js
router.get("/debug-tracked",   async (req, res) => {
  try {
    const products = await Products.find().limit(10);
    const productIds = products.map(p => ({
      id: p._id.toString(),
      name: p.Product_Name
    }));
    
    res.json({ productIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
