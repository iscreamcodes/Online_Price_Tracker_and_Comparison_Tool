// Model/Category.js - CORRECTED
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  Category_code: {
    type: String,  // CHANGED FROM ObjectId to String
    required: true,
    unique: true,
    trim: true
  },
  Category_Name: {
    type: String,
    required: true,
    trim: true
  },
  Category_Description: {
    type: String,
    default: "",
    trim: true
  },
  Category_Created_At: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Category", CategorySchema);