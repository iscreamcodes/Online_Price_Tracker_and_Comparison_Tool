import express from "express";
import { getAllStoresProducts } from "../Controller/ProductsController.js";
import { untrackProduct } from "../Controller/UserManagementController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";
import { trackListing } from "../Controller/UserController.js";
import { getTrackedProducts } from "../Controller/ProductManagementController.js";

const router = express.Router();

// ✅ This will be available at /api/products/all-stores
router.get("/all-stores", getAllStoresProducts);
router.post("/user/track-listing", verifyToken, trackListing);
router.delete("/untrack/:productId", verifyToken, untrackProduct);
router.get("/user/tracked-products", verifyToken, getTrackedProducts);

export default router;