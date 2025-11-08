import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const TrackedProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  store: { type: String, required: true },
  currency: { type: String, required: true },
  priceHistory: [PriceHistorySchema], // stores historical prices
});

const UserSchema = new mongoose.Schema(
  {
    User_name: { type: String, required: true },
    User_email: { type: String, required: true, unique: true },
    User_password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    User_preferences: {
      notification: { type: Boolean, default: true },
      currency: { type: String, default: "USD" },
      tracked_products: [TrackedProductSchema],
    },
  },
  { timestamps: true } // 🕒 Automatically adds createdAt & updatedAt
);


export default mongoose.model("Users", UserSchema);
