import express from "express";
import connectDB from "./Db.js";
import dotenv from "dotenv";
import router from "./Router/routes.js";
import cors from "cors";  // ✅ uncomment this
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); 

const PORT = process.env.PORT || 5000;
const app = express();

// ✅ Enable CORS for frontend URLs
app.use(cors({
  origin: "http://localhost:5173", // your Vite/React frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
connectDB();
app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
