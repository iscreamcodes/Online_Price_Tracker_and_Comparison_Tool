import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    alert_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    alert_productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    alert_type: {
      type: String, 
      enum: ["price_drop", "price_rise", "back_in_stock"],
      required: true,
    },

    alert_triggerPrice: {
      type: Number,
      required: false,
    },

    alert_price: {
      type: Number,
      required: false,
    },

    alert_status: {
      type: String,
      enum: ["active", "triggered", "disabled"],
      default: "active",
    },

    alert_lastSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "alert_createdAt",
      updatedAt: "alert_updatedAt",
    },
  }
);

export default mongoose.model("Alert", AlertSchema);
