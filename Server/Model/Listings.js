import mongoose from "mongoose";
const ListingSchema = new mongoose.Schema({
    Product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
    Listing_Store_Name: { type: String, required: true }, // Jumia, Amazon, Kilimall, etc.
    Listing_Price: { type: Number, required: true },
    Listing_Currency: { type: String, default: "USD" },
    Listing_URL: { type: String, required: true },
    Listing_Image_URL: { type: String },
    Listing_Last_Updated: { type: Date, default: Date.now },
  });
  
  export default mongoose.model("Listings", ListingSchema);
  