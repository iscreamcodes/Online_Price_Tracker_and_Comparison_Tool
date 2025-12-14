// routes/ReportRoutes.js
import express from "express";
import {
  generateUserActivityReport,
  generatePriceTrackingReport,
  generateStorePerformanceReport,
  generateSystemSummaryReport
} from "../Controller/ReportController.js";
import { verifyToken, adminOnly } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Report generation endpoints
router.get("/user-activity", verifyToken, adminOnly, generateUserActivityReport);
router.get("/price-tracking", verifyToken, adminOnly, generatePriceTrackingReport);
router.get("/store-performance", verifyToken, adminOnly, generateStorePerformanceReport);
router.get("/system-summary", verifyToken, adminOnly, generateSystemSummaryReport);

export default router;