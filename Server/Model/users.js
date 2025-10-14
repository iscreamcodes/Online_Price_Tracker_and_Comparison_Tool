import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    User_name: { type: String, required: true },
    User_email: { type: String, required: true, unique: true },
    User_password: { type: String, required: true }, // hashed password
    User_preferences: {
      notification: { type: Boolean, default: true },
      currency: { type: String, default: "USD" },
      tracked_products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }],
    },
    User_Created_At: { type: Date, default: Date.now },
    User_Updated_At: { type: Date, default: Date.now },
  });

export default mongoose.model("Users", UserSchema);
