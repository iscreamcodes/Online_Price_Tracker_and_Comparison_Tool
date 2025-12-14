// Model/Products.js - FIXED AUTO-INCREMENT
import mongoose from "mongoose";

// Make sure Counter model exists
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

const ProductSchema = new mongoose.Schema({
  Product_code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  Product_Name: { 
    type: String, 
    required: true 
  },
  Product_Category_code: { 
    type: String, 
    ref: "Category",
    required: true 
  },
  Product_Category: { 
    type: String 
  },
  Product_Image_URL: { 
    type: String 
  },
  Product_Created_At: { 
    type: Date, 
    default: Date.now 
  },
  Product_Updated_At: { 
    type: Date, 
    default: Date.now 
  },
});

// FIXED Auto-increment middleware for Product_code
ProductSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'product_code' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.Product_code = `PROD${String(counter.seq).padStart(6, '0')}`;
      console.log(`🆕 Generated Product_code: ${this.Product_code}`);
      next();
    } catch (error) {
      console.error('❌ Error generating Product_code:', error);
      // Fallback: generate a timestamp-based code
      this.Product_code = `PROD${Date.now().toString().slice(-8)}`;
      console.log(`🔄 Using fallback Product_code: ${this.Product_code}`);
      next();
    }
  } else {
    next();
  }
});

export default mongoose.model("Products", ProductSchema);