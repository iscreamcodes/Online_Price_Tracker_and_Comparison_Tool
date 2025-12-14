import express from "express";
import dotenv from "dotenv";
import connectDB from "./Db.js";
import cors from "cors";
import router from "./Router/routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ Debug middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// All API routes are prefixed with /api
app.use("/api", router);

// Minimal ping route to test server
app.get("/ping", (req, res) => {
  console.log("✅ /ping route hit");
  res.json({ message: "pong", status: "success" });
});

// ✅ FIXED: Catch-all for undefined routes
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.originalUrl}`);
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    message: "Check the API endpoint and try again"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Test server: http://localhost:${PORT}/ping`);
  console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
});