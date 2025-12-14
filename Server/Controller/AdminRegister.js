import bcrypt from "bcryptjs";
import Users from "../Model/Users.js";

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
      User_role: "admin",   // 🔥 FIXED (correct field name)
      User_preferences: {
        User_notification: true,
        User_currency: "USD",
        User_tracked_products: []
      }
    });

    await admin.save();

    res.status(201).json({
      message: "✅ Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.User_name,
        email: admin.User_email,
        role: admin.User_role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
