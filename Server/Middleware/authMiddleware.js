// authMiddleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Verify Token Middleware
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// 👑 FIXED: Admin Only middleware
export const adminOnly = (req, res, next) => {
  // Check both possible role property names
  if (req.user && (req.user.User_role === "admin" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};