// Model/Listings.js - FIXED VERSION
import mongoose from "mongoose";
import Products from "./Products.js"; 

const ListingSchema = new mongoose.Schema({
  Listing_code: {
    type: String,
    required: true,
    unique: true
  },
  listing_product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Products", 
    required: false
  },
  Listing_Product_Name: {
    type: String,
    required: true
  },
  Listing_Store_Name: { 
    type: String, 
    required: true 
  },
  listing_store_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: false
  },
  Listing_Price: { 
    type: Number, 
    required: true 
  },
  Listing_Currency: { 
    type: String, 
    default: "KES"
  },
  Listing_URL: { 
    type: String, 
    required: true 
  },
  Listing_Image_URL: { 
    type: String 
  },
  Listing_Last_Updated: { 
    type: Date, 
    default: Date.now 
  },
});

// FIXED: Auto-increment middleware for Listing_code
ListingSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Ensure Counter model is available
      let Counter;
      if (mongoose.models.Counter) {
        Counter = mongoose.models.Counter;
      } else {
        Counter = mongoose.model('Counter', new mongoose.Schema({
          _id: { type: String, required: true },
          seq: { type: Number, default: 0 }
        }));
      }
      
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'listing_code' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      this.Listing_code = `LIST${String(counter.seq).padStart(6, '0')}`;
      console.log(`🆕 Generated Listing_code: ${this.Listing_code}`);
      next();
    } catch (error) {
      console.error('❌ Error generating Listing_code:', error.message);
      // Fallback: generate a timestamp-based code
      this.Listing_code = `LIST${Date.now().toString().slice(-8)}`;
      console.log(`🔄 Using fallback Listing_code: ${this.Listing_code}`);
      next();
    }
  } else {
    next();
  }
});

export default mongoose.model("Listings", ListingSchema);