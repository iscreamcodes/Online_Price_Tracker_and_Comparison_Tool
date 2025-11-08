import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Users from "./Model/Users.js"; // adjust path if needed

// === 1. Connect to your MongoDB ===
const MONGO_URI = "mongodb://localhost:27017/price_tracker_db"; // replace with your DB
await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

// === 2. Define the admin credentials ===
const name = "Super Admin";
const email = "admin@example.com";
const password = "securepassword123";

// === 3. Check if admin exists ===
const existingAdmin = await Users.findOne({ User_email: email });
if (existingAdmin) {
  console.log("⚠️ Admin already exists with that email");
  process.exit(0);
}

// === 4. Hash the password and create admin ===
const hashedPassword = await bcrypt.hash(password, 10);

const admin = new Users({
  User_name: name,
  User_email: email,
  User_password: hashedPassword,
  role: "admin",
});

await admin.save();
console.log("✅ Admin created successfully:", admin.User_email);

await mongoose.disconnect();
process.exit(0);
