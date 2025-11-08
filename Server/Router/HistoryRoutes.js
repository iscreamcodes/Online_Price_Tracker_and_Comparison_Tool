// Router/HistoryRoutes.js - CLEANED UP VERSION
import express from "express";
import { saveHistoricalPrice, getHistoryByListing } from "../Controller/HistoryController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";
import User from "../Model/Users.js"; // ✅ ADD THIS IMPORT

const router = express.Router();

// Save new history
router.post("/save", verifyToken, saveHistoricalPrice);

// Get price history for one listing - ✅ THIS IS THE CORRECT ROUTE
router.get("/:listingId", verifyToken, getHistoryByListing);

// Get tracked product price history for a user


export default router;