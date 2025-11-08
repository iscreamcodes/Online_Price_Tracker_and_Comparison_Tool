// Controller/UserController.js - FIXED VERSION
import Listings from "../Model/Listings.js";
import User from "../Model/Users.js";
import Products from "../Model/Products.js";
import HistoricalPrice from "../Model/History.js";

export const trackListing = async (req, res) => {
  try {
    console.log("🟡 trackListing called with:", req.body);
    
    const { userId, listingId } = req.body;

    if (!userId || !listingId) {
      return res.status(400).json({ 
        error: "Missing required fields: userId and listingId" 
      });
    }

    console.log("🔍 Finding user...");
    const user = await User.findById(userId).maxTimeMS(10000);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ User found:", user._id);

    console.log("🔍 Finding listing...");
    const listing = await Listings.findById(listingId).maxTimeMS(10000); // ✅ MOVED HERE
    if (!listing) {
      console.log("❌ Listing not found:", listingId);
      return res.status(404).json({ error: "Listing not found" });
    }
    console.log("✅ Listing found:", listing._id);
    console.log("🟠 Listing found details:", listing);
console.log("🟠 Listing.Product_id:", listing?.Product_id);


    console.log("🔍 Finding product for name...");
    const product = await Products.findById(listing.Product_id).maxTimeMS(10000);
    const productName = product ? product.Product_Name : "Unknown Product";
    console.log("✅ Product name:", productName);

    console.log("🔍 Finding FULL price history for this listing...");
    
    // ✅ GET COMPLETE PRICE HISTORY from HistoricalPrice collection
    const fullPriceHistory = await HistoricalPrice.find({ 
      Listing_id: listingId 
    })
    .sort({ createdAt: -1 }) // Most recent first
    .limit(50);

    console.log(`📊 Found ${fullPriceHistory.length} historical price records`);

    // ✅ COMBINE: Current price + Full historical data
    const combinedPriceHistory = [
      // Add current price as most recent entry
      {
        price: Number(listing.Listing_Price) || 0,
        date: new Date()
      },
      // Add all historical prices
      ...fullPriceHistory.map(history => ({
        price: history.History_Price,
        date: history.createdAt
      }))
    ];

    // Check if already tracked
    console.log("🔍 Checking if already tracked...");
    const alreadyTracked = user.User_preferences.tracked_products.some(
      (tp) => tp.productId && tp.productId.toString() === listingId.toString()
    );
    
    if (alreadyTracked) {
      console.log("⏸️ Product already tracked");
      return res.json({ message: "Product already tracked" });
    }

    console.log("📝 Adding to tracked products with FULL history...");
    user.User_preferences.tracked_products.push({
      productId: listing._id,
      name: productName,
      url: listing.Listing_URL,
      store: listing.Listing_Store_Name,
      currency: listing.Listing_Currency || "USD",
      priceHistory: combinedPriceHistory,
    });

    console.log("💾 Saving user...");
    await user.save();
    console.log("✅ User saved successfully");

    res.json({ 
      message: "✅ Product tracked successfully with full price history", 
      trackedProduct: {
        productId: listing._id,
        name: productName,
        store: listing.Listing_Store_Name,
        price: listing.Listing_Price,
        currency: listing.Listing_Currency,
        historyRecords: combinedPriceHistory.length
      }
    });
    
  } catch (err) {
    console.error("❌ Error in trackListing:", err);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};

