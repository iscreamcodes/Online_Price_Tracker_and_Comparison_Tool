import express from "express";
import Listings from "../Model/Listings.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ GET /api/saved-listings/
router.get("/", verifyToken, async (req, res) => {
  try {
    const listings = await Listings.find().limit(20);
    res.json({ success: true, total: listings.length, listings });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;