// Model/Store.js - UPDATED
import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
  Store_code: {
    type: String,
    required: true,
    unique: true
  },
  Store_Name: {
    type: String,
    required: true,
    trim: true
  },
  Store_Website: {
    type: String,
    trim: true
  },
  Store_URL: {
    type: String
  },
  Store_Country: {
    type: String,
    default: "Kenya"
  },
  Store_Active: {
    type: Boolean,
    default: true
  },
  Store_Created_At: {
    type: Date,
    default: Date.now
  }
});

// Improved auto-increment middleware with better error handling
StoreSchema.pre('save', async function(next) {
  if (this.isNew && !this.Store_code) {
    try {
      const Counter = mongoose.model('Counter');
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'store_code' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.Store_code = `STR${String(counter.seq).padStart(6, '0')}`;
      console.log(`🆕 Generated Store_code: ${this.Store_code} for ${this.Store_Name}`);
      next();
    } catch (error) {
      console.error('❌ Error generating Store_code:', error);
      // Fallback: generate a random code
      this.Store_code = `STR${Date.now().toString().slice(-6)}`;
      console.log(`🔄 Using fallback Store_code: ${this.Store_code}`);
      next();
    }
  } else {
    next();
  }
});

export default mongoose.model("Store", StoreSchema);