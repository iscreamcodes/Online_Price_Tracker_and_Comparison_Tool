// Router/routes.js
import express from "express";
import productRoutes from "./ProductRoutes.js";
import savedListingsRoutes from "./SavedListingRoutes.js";
import authRoutes from "./AuthRoutes.js";
import historyRoutes from "./HistoryRoutes.js";
import adminRoutes from "./AdminRoutes.js";
import userRoutes from "./UserRoutes.js";
import reportRoutes from "./ReportRoutes.js";
const router = express.Router();

// ✅ Mount all routes
router.use("/products", productRoutes);
router.use("/saved-listings", savedListingsRoutes);
router.use("/auth", authRoutes);
router.use("/history", historyRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/reports", reportRoutes);


// ✅ Test route - this should work at /api/test
router.get("/test", (req, res) => {
  console.log("✅ /api/test route hit");
  res.json({ 
    message: "API is working!",
    timestamp: new Date().toISOString(),
    status: "success"
  });
});

export default router;