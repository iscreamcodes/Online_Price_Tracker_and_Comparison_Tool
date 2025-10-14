import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    Product_Name: { type: String, required: true },
    Product_Category: { type: String },
    Product_Image_URL: { type: String },
    Product_Description: { type: String },
    Product_Specs: { type: Object }, // e.g. { color: 'black', brand: 'Samsung' }
    Product_Created_At: { type: Date, default: Date.now },
    Product_Updated_At: { type: Date, default: Date.now },
  });

export default mongoose.model("Products", ProductSchema);
