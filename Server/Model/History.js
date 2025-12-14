import mongoose from "mongoose";

const HistoricalPriceSchema = new mongoose.Schema(
  {
    History_listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listings",
      required: true,
    },
    History_Price: { type: Number, required: true },
  },
  { 
    timestamps: { 
      createdAt: 'History_createdAt', 
      updatedAt: 'History_updatedAt' 
    }
  }
);

export default mongoose.model("Historical_Prices", HistoricalPriceSchema);
