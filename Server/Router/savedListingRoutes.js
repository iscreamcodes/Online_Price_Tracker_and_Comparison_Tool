// Server/Router/savedListingsRoutes.js
import express from "express";
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";

const router = express.Router();

// Get saved listings from database
router.get("/saved-listings", async (req, res) => {
  try {
    const { query = "", limit = 50, page = 1 } = req.query;
    
    console.log("🔍 Fetching saved listings from database...", { query, limit });
    
    // Build search filter
    let filter = {};
    if (query && query.trim() !== "") {
      filter = {
        $or: [
          { 'Product_id.Product_Name': { $regex: query, $options: 'i' } },
          { Listing_Store_Name: { $regex: query, $options: 'i' } }
        ]
      };
    }

    console.log("📊 Database filter:", filter);

    // Find listings with product details populated
    const listings = await Listings.find(filter)
      .populate('Product_id', 'Product_Name Product_Image_URL')
      .sort({ Listing_Last_Updated: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    console.log(`✅ Found ${listings.length} saved listings`);
    
    // Transform to frontend format
    const products = listings.map(listing => {
      const productData = {
        _id: listing._id, // MongoDB ID for tracking - THIS IS CRUCIAL
        name: listing.Product_id?.Product_Name || "Unknown Product",
        price: listing.Listing_Price || 0,
        currency: listing.Listing_Currency || "USD",
        store: listing.Listing_Store_Name,
        image: listing.Listing_Image_URL || listing.Product_id?.Product_Image_URL || "/placeholder-image.jpg",
        url: listing.Listing_URL || "#",
        lastUpdated: listing.Listing_Last_Updated,
        // Include original IDs for reference
        productId: listing.Product_id?._id,
        listingId: listing._id
      };
      
      console.log(`📦 Product: ${productData.name} | ID: ${productData._id} | Price: ${productData.price}`);
      return productData;
    });
    
    res.json({ 
      success: true,
      products,
      total: products.length,
      message: `Found ${products.length} saved products`
    });
    
  } catch (error) {
    console.error("❌ Error fetching saved listings:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch saved listings",
      details: error.message 
    });
  }
});

export default router;