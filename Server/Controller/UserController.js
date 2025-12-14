import Users from "../Model/Users.js";
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";
import HistoricalPrice from "../Model/History.js";



export const trackListing = async (req, res) => {
  try {
    console.log("🟡 trackListing called with:", req.body);
    const { userId, listingId } = req.body;

    if (!userId || !listingId) {
      return res.status(400).json({ error: "Missing required fields: userId and listingId" });
    }

    console.log("🔍 Finding user...");
    const user = await Users.findById(userId).maxTimeMS(10000);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", user._id);
    console.log("🔍 Finding listing...");
    const listing = await Listings.findById(listingId).maxTimeMS(10000);

    if (!listing) {
      console.log("❌ Listing not found:", listingId);
      return res.status(404).json({ error: "Listing not found" });
    }

    console.log("✅ Listing found:", listing._id);
    
    const productName = listing.Listing_Product_Name || "Unknown Product";
    console.log("✅ Product name from listing:", productName);

    console.log("🔍 Finding price history for this listing...");
    const fullPriceHistory = await HistoricalPrice.find({ 
      History_listing_id: listingId 
    }).sort({ History_date: -1 }).limit(50);

    console.log(`📊 Found ${fullPriceHistory.length} historical price records`);

    // ✅ FIX: Create price history with REQUIRED History_price field
    const combinedPriceHistory = [];
    
    // Add current price as most recent entry
    if (listing.Listing_Price) {
      combinedPriceHistory.push({
        History_price: Number(listing.Listing_Price), // ✅ REQUIRED field
        History_date: new Date()
      });
    }

    // Add all historical prices (only if they have History_price)
    fullPriceHistory.forEach(history => {
      if (history.History_price !== undefined && history.History_price !== null) {
        combinedPriceHistory.push({
          History_price: history.History_price, // ✅ REQUIRED field
          History_date: history.History_date || new Date()
        });
      }
    });

    // ✅ FIX: If no price history, add at least one entry to satisfy validation
    if (combinedPriceHistory.length === 0) {
      combinedPriceHistory.push({
        History_price: 0, // Default price to satisfy validation
        History_date: new Date()
      });
    }

    console.log(`📊 Final price history count: ${combinedPriceHistory.length}`);

    // Check if already tracked
    console.log("🔍 Checking if already tracked...");
    const alreadyTracked = user.User_preferences.User_tracked_products.some(
      (tp) => tp.Tracked_product_id && tp.Tracked_product_id.toString() === listingId.toString()
    );

    if (alreadyTracked) {
      console.log("⏸️ Product already tracked");
      return res.json({ 
        message: "Product already tracked",
        alreadyTracked: true 
      });
    }

    console.log("📝 Adding to tracked products...");
    
    // ✅ FIX: Create tracked product with proper price history
    const newTrackedProduct = {
      Tracked_product_id: listingId,
      Tracked_name: productName,
      Tracked_url: listing.Listing_URL,
      Tracked_store: listing.Listing_Store_Name,
      Tracked_currency: listing.Listing_Currency || "USD",
      Tracked_price_history: combinedPriceHistory, // ✅ Now has required History_price
      Tracked_image: listing.Listing_Image_URL || "/placeholder-image.jpg",
      Tracked_since: new Date()
    };

    // Add to user's tracked products
    user.User_preferences.User_tracked_products.push(newTrackedProduct);

    console.log("💾 Saving user...");
    await user.save();
    console.log("✅ User saved successfully");

    res.json({
      message: "✅ Product tracked successfully",
      trackedProduct: {
        Tracked_product_id: listingId,
        Tracked_name: productName,
        Tracked_store: listing.Listing_Store_Name,
        currentPrice: listing.Listing_Price,
        historyCount: combinedPriceHistory.length
      },
      success: true
    });
  } catch (err) {
    console.error("❌ Error in trackListing:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};