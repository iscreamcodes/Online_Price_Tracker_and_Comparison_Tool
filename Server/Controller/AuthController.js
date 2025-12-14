import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../Model/Users.js";
import { sendEmail } from "../Utils/sendEmail.js";

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🟢 Register Normal User
export const registerUser = async (req, res) => {
  try {
    const { User_name, User_email, User_password } = req.body;

    // ✅ Check if user exists
    const existing = await Users.findOne({ User_email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // ✅ Hash password
    const hashed = await bcrypt.hash(User_password, 10);

    // ✅ Create user
    const user = await Users.create({
      User_name,
      User_email,
      User_password: hashed,
      User_role: "user",
      User_code: `USR${Math.floor(10000 + Math.random() * 90000)}`, // ensure code is added
    });

    // 🟢 Send welcome email with their user code
    await sendEmail(
      user.User_email,
      "Welcome to Price Tracker!",
      `Hi ${user.User_name},

Welcome to Price Tracker! 🎉  
Your unique user code is: **${user.User_code}**

Use this code when contacting support or receiving price alerts.

Start tracking prices and saving money!

- Price Tracker Team`
    );

    res.status(201).json({
      message: "✅ User registered successfully",
      user: {
        id: user._id,
        name: user.User_name,
        email: user.User_email,
        role: user.User_role,
        code: user.User_code
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// 🔑 Login for both users + admins
export const loginUser = async (req, res) => {
  try {
    const { User_email, User_password } = req.body;
    const user = await Users.findOne({ User_email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(User_password, user.User_password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.User_role,   // THIS FIXES THE ADMIN ROLE
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    

    // ✅ Respond with token + user info INCLUDING PREFERENCES
    res.json({
      message: "✅ Login successful",
      token,
      user: {
        id: user._id,
        name: user.User_name,
        email: user.User_email,
        role: user.User_role, // Changed from role to User_role
        User_preferences: user.User_preferences || { // ✅ ADD THIS LINE
          User_tracked_products: [],
          User_notification: true,
          User_currency: "USD"
        }
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🟢 Register Admin
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Users.findOne({ User_email: email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Users({
      User_name: name,
      User_email: email,
      User_password: hashedPassword,
      User_role: "admin", // Changed from role to User_role
    });

    await admin.save();
    res.status(201).json({ message: "✅ Admin registered successfully", admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};