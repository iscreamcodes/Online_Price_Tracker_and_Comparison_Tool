// src/routes/userRoutes.js
import express from "express";
import { getUserPreferences } from "../controller/UserManagementController.js";
import { verifyToken } from "../Middleware/authMiddleware.js";

const router = express.Router();

// GET /api/users/:id/preferences
router.get("/:id/preferences", verifyToken, getUserPreferences);

export default router;
