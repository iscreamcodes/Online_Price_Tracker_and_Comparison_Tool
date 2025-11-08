import express from "express";
import { registerUser, loginUser } from "../Controller/AuthController.js";
import { registerAdmin } from "../Controller/AdminRegister.js";
import { verifyToken, adminOnly } from "../Middleware/authMiddleware.js";
import User from "../Model/Users.js"; // ✅ import your User model


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ New: Get currently logged-in user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // remove password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Only admins (or for setup) can register another admin
router.post("/register-admin", verifyToken, adminOnly, registerAdmin);


export default router;
