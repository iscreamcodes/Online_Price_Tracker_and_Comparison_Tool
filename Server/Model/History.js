import mongoose from "mongoose";
const HistoricalPriceSchema = new mongoose.Schema({
    Listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listings", required: true },
    History_Price: { type: Number, required: true },
    History_Timestamp: { type: Date, default: Date.now },
  });
  
  export default mongoose.model("Historical_Prices", HistoricalPriceSchema);
  