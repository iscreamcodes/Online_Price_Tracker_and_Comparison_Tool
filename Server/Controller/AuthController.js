import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../Model/Users.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🟢 Register Normal User
export const registerUser = async (req, res) => {
  try {
    const { User_name, User_email, User_password } = req.body;

    // ✅ Check if user exists
    const existing = await Users.findOne({ User_email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // ✅ Hash password
    const hashed = await bcrypt.hash(User_password, 10);

    // ✅ Save user
    const user = await Users.create({
      User_name,
      User_email,
      User_password: hashed,
      role: "user", // default role
    });

    res.status(201).json({
      message: "✅ User registered successfully",
      user: {
        id: user._id,
        name: user.User_name,
        email: user.User_email,
        role: user.role,
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
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Respond with token + user info
    res.json({
      message: "✅ Login successful",
      token,
      user: {
        id: user._id,
        name: user.User_name,
        email: user.User_email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
