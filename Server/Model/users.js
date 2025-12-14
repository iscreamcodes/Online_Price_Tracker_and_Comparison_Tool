import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema({
  History_price: { type: Number, required: true },
  History_date: { type: Date, default: Date.now },
});

const TrackedProductSchema = new mongoose.Schema({
  Tracked_product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
  Tracked_name: { type: String, required: true },
  Tracked_url: { type: String, required: true },
  Tracked_store: { type: String, required: true },
  Tracked_currency: { type: String, required: true },
  Tracked_price_history: [PriceHistorySchema],
});

const UserSchema = new mongoose.Schema(
  {
    User_code: { type: String, required: false, unique: true },
    User_name: { type: String, required: true },
    User_email: { type: String, required: true, unique: true },
    User_password: { type: String, required: true },
    User_role: { type: String, enum: ["user", "admin"], default: "user" },
    User_preferences: {
      User_notification: { type: Boolean, default: true },
      User_currency: { type: String, default: "USD" },
      User_tracked_products: [TrackedProductSchema],
    },
  },
  { 
    timestamps: { 
      createdAt: 'User_createdAt', 
      updatedAt: 'User_updatedAt' 
    }
  }
);
UserSchema.pre("save", function (next) {
  if (!this.User_code) {
    this.User_code =
      "USR-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

export default mongoose.model("Users", UserSchema);