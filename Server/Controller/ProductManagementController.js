import Products from "../Model/Products.js";
import Users from "../Model/Users.js";
import Listings from "../Model/Listings.js";

// 🟢 Get all products (basic)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Products.find()
      .sort({ Product_Created_At: -1 })
      .limit(200);

    res.json({ products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟢 Get products with tracked info
// 🟢 Get products with tracked info - FIXED VERSION
// 🟢 Get products with tracked info - CORRECTED VERSION

// 🟢 Get products with tracked info - IMPROVED MATCHING
// 🟢 Get all products with tracking status
export const getProductsWithTracked = async (req, res) => {
  try {
    const products = await Products.find()
      .sort({ Product_Created_At: -1 })
      .limit(200);

    const users = await Users.find({}, "User_preferences.User_tracked_products");

    const allTrackedListings = users.flatMap(
      (u) => u.User_preferences?.User_tracked_products || []
    );

    console.log("🔍 Total tracked listings found:", allTrackedListings.length);

    // Create map of tracked product names to stores
    const trackedMap = new Map();
    
    allTrackedListings.forEach((listing) => {
      if (!listing.Tracked_name) return;
      
      const productName = listing.Tracked_name.toLowerCase().trim();
      const store = listing.Tracked_store || "Unknown Store";
      
      // Store the first store we find for this product name
      if (!trackedMap.has(productName)) {
        trackedMap.set(productName, store);
      }
    });

    const productsWithTracked = products.map((p) => {
      const productName = p.Product_Name?.toLowerCase().trim();
      const isTracked = trackedMap.has(productName);
      const trackedStore = trackedMap.get(productName) || null;

      return {
        ...p.toObject(),
        isTracked: isTracked,
        trackedStore: trackedStore,
      };
    });

    console.log(`📊 ${productsWithTracked.filter(p => p.isTracked).length} products are tracked`);

    res.json({ products: productsWithTracked });
  } catch (err) {
    console.error("❌ Error fetching products with tracked:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟢 Get all tracked products from all users
export const getTrackedProducts = async (req, res) => {
  try {
    const users = await Users.find({}, "User_preferences.User_tracked_products"); // Changed field name

    const allTrackedListings = users.flatMap(
      (u) => u.User_preferences?.User_tracked_products || [] // Changed field name
    );

    if (allTrackedListings.length === 0) return res.json({ tracked: [] });

    // ✅ Build clean objects with new field names
    const trackedWithStore = allTrackedListings.map((listing) => ({
      Tracked_product_id: listing.Tracked_product_id || null, // Changed from productId
      Tracked_name: listing.Tracked_name || "Unknown Product", // Changed from name
      Tracked_store: listing.Tracked_store || "Unknown Store", // Changed from store
      Tracked_url: listing.Tracked_url || "", // Changed from url
      Tracked_currency: listing.Tracked_currency || "USD", // Changed from currency
      Tracked_price_history: listing.Tracked_price_history || [], // Changed from priceHistory
    }));

    // ✅ Remove duplicates (same Tracked_product_id + Tracked_store)
    const uniqueTracked = Array.from(
      new Map(
        trackedWithStore.map((item) => [item.Tracked_product_id + "-" + item.Tracked_store, item])
      ).values()
    );

    res.json({ tracked: uniqueTracked });
  } catch (err) {
    console.error("❌ Error fetching tracked products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟢 Admin — Delete product

// Soft delete version (recommended)
// Controller/ProductManagementController.js - PERMANENT DELETE VERSION
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    console.log(`🗑️ Starting PERMANENT delete for product: ${productId}`);
    
    // 1. Find the product first (to get its name for logging)
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productName = product.Product_Name;
    const productCode = product.Product_code;

    // 2. Find all listings for this product to get their IDs
    const productListings = await Listings.find({ listing_product_id: productId });
    const listingIds = productListings.map(listing => listing._id.toString());
    
    console.log(`📦 Found ${listingIds.length} listings to delete`);

    // 3. Delete ALL listings for this product PERMANENTLY
    const deleteListingsResult = await Listings.deleteMany({ listing_product_id: productId });
    console.log(`✅ Deleted ${deleteListingsResult.deletedCount} listings`);

    // 4. Remove from ALL users' tracked products
    const updateUsersResult = await Users.updateMany(
      { 
        "User_preferences.User_tracked_products.Tracked_product_id": { 
          $in: listingIds 
        } 
      },
      {
        $pull: {
          "User_preferences.User_tracked_products": {
            Tracked_product_id: { $in: listingIds }
          }
        }
      }
    );

    console.log(`👥 Removed from ${updateUsersResult.modifiedCount} users' tracked products`);

    // 5. Finally delete the product itself PERMANENTLY
    await Products.findByIdAndDelete(productId);

    console.log(`✅ Successfully PERMANENTLY deleted product: ${productName} (${productCode})`);

    res.json({ 
      message: "Product and all associated data PERMANENTLY deleted",
      stats: {
        product: productName,
        listingsDeleted: deleteListingsResult.deletedCount,
        usersAffected: updateUsersResult.modifiedCount
      }
    });

  } catch (err) {
    console.error("❌ Error in permanent delete:", err);
    res.status(500).json({ error: "Internal server error during deletion" });
  }
};

// 🟢 Get products with their tracked listings
// Controller/ProductManagementController.js - Updated
export const getProductsWithListings = async (req, res) => {
  try {
    const products = await Products.find()
      .sort({ Product_Created_At: -1 })
      .limit(100);

    const users = await Users.find({}, "User_preferences.User_tracked_products");

    const allTrackedListings = users.flatMap(
      (u) => u.User_preferences?.User_tracked_products || []
    );

    console.log("🔍 Total tracked listings found:", allTrackedListings.length);

    // Group listings by product name
    const listingsByProductName = new Map();
    
    allTrackedListings.forEach((listing) => {
      if (!listing.Tracked_name) return;
      
      const productName = listing.Tracked_name.toLowerCase().trim();
      const store = listing.Tracked_store || "Unknown Store";
      
      if (!listingsByProductName.has(productName)) {
        listingsByProductName.set(productName, []);
      }
      
      listingsByProductName.get(productName).push({
        listingId: listing.Tracked_product_id,
        store: store, // This shows the store
        url: listing.Tracked_url,
        currency: listing.Tracked_currency,
        priceHistory: listing.Tracked_price_history || [],
        originalName: listing.Tracked_name
      });
    });

    // Combine products with their listings
    const productsWithListings = products.map((product) => {
      const productName = product.Product_Name?.toLowerCase().trim();
      const listings = listingsByProductName.get(productName) || [];
      const stores = [...new Set(listings.map(l => l.store))];
      
      return {
        ...product.toObject(),
        isTracked: listings.length > 0,
        trackedListings: listings,
        trackedStores: stores,
        totalListings: listings.length
      };
    });

    console.log(`📊 Products with listings: ${productsWithListings.filter(p => p.isTracked).length}`);

    res.json({ 
      products: productsWithListings
    });
  } catch (err) {
    console.error("❌ Error fetching products with listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// 🟢 Get tracked listings for admin
export const getTrackedListings = async (req, res) => {
  try {
    const users = await Users.find({}, "User_preferences.User_tracked_products name email");
    
    const allTrackedListings = users.flatMap((user) => 
      (user.User_preferences?.User_tracked_products || []).map(listing => ({
        listingId: listing.Tracked_product_id,
        productName: listing.Tracked_name || "Unknown Product",
        store: listing.Tracked_store || "Unknown Store",
        url: listing.Tracked_url || "",
        currency: listing.Tracked_currency || "USD",
        priceHistory: listing.Tracked_price_history || [],
        trackedByUser: user.name || user.email,
        userId: user._id
      }))
    );

    console.log("🔍 Total tracked listings found:", allTrackedListings.length);

    // Remove duplicates (same listing + store combination)
    const uniqueListings = Array.from(
      new Map(
        allTrackedListings.map(item => [
          `${item.listingId}-${item.store}`,
          item
        ])
      ).values()
    );

    console.log("📊 Unique tracked listings:", uniqueListings.length);
    
    res.json({ listings: uniqueListings });
  } catch (err) {
    console.error("❌ Error fetching tracked listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🟢 Get ALL listings (not just tracked)
export const getAllListings = async (req, res) => {
  try {
    // Get all users and extract their tracked listings
    const users = await Users.find({}, "User_preferences.User_tracked_products");
    
    const allListings = users.flatMap((user) => 
      (user.User_preferences?.User_tracked_products || []).map(listing => ({
        id: listing.Tracked_product_id,
        name: listing.Tracked_name || "Unknown Product",
        store: listing.Tracked_store || "Unknown Store",
        url: listing.Tracked_url || "",
        currency: listing.Tracked_currency || "USD",
        priceHistory: listing.Tracked_price_history || []
      }))
    );

    console.log("📦 ALL listings found:", allListings.length);
    
    res.json({ listings: allListings });
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller/ProductManagementController.js - CORRECTED VERSION
export const getProductsWithAllListings = async (req, res) => {
  try {
    console.log("🔄 Fetching products with ALL listings...");
    
    // 1. Get all products
    const products = await Products.find()
      .sort({ Product_Created_At: -1 })
      .limit(100);

    // 2. Get ALL scraped listings from Listings collection
    const allListings = await Listings.find()
      .populate('listing_product_id', 'Product_Name Product_code')
      .populate('listing_store_id', 'Store_name Store_url');

    console.log(`📦 Found ${products.length} products and ${allListings.length} listings`);

    // 3. Get user tracked listings to see which ones are "starred"
    const users = await Users.find({}, "User_preferences.User_tracked_products");
    const trackedListingIds = new Set(
      users.flatMap(u => 
        u.User_preferences?.User_tracked_products?.map(t => t.Tracked_product_id?.toString()) || []
      ).filter(Boolean)
    );

    console.log(`⭐ ${trackedListingIds.size} listings are being tracked by users`);

    // 4. Combine: For each product, find ALL its listings + mark tracked ones
    const productsWithListings = products.map(product => {
      // Find ALL listings for this product (not just tracked ones)
      const productListings = allListings.filter(listing => {
        if (!listing.listing_product_id) return false;
        return listing.listing_product_id._id.toString() === product._id.toString();
      });

      // Convert listings to useful format and mark tracked status
      const listingsWithTracking = productListings.map(listing => ({
        _id: listing._id,
        listingId: listing._id,
        store: listing.Listing_Store_Name,
        price: listing.Listing_Price,
        currency: listing.Listing_Currency,
        url: listing.Listing_URL,
        image: listing.Listing_Image_URL,
        lastUpdated: listing.Listing_Last_Updated,
        isTracked: trackedListingIds.has(listing._id.toString()),
        listingCode: listing.Listing_code
      }));

      const trackedListings = listingsWithTracking.filter(l => l.isTracked);
      const stores = [...new Set(listingsWithTracking.map(l => l.store))];

      return {
        ...product.toObject(),
        allListings: listingsWithTracking,
        trackedListings: trackedListings,
        trackedStores: stores,
        totalListings: productListings.length,
        totalTracked: trackedListings.length,
        isTracked: trackedListings.length > 0 // Product is tracked if ANY listing is tracked
      };
    });

    // Log some stats
    const productsWithAnyListings = productsWithListings.filter(p => p.totalListings > 0);
    const productsWithTrackedListings = productsWithListings.filter(p => p.isTracked);
    
    console.log(`📊 Results: ${productsWithAnyListings.length} products have listings`);
    console.log(`📊 Results: ${productsWithTrackedListings.length} products have tracked listings`);

    res.json({ 
      products: productsWithListings,
      stats: {
        totalProducts: products.length,
        totalListings: allListings.length,
        productsWithListings: productsWithAnyListings.length,
        productsWithTrackedListings: productsWithTrackedListings.length,
        totalTrackedListings: trackedListingIds.size
      }
    });
  } catch (err) {
    console.error("❌ Error fetching products with all listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller/ProductManagementController.js


// Controller/ProductManagementController.js
export const deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    
    console.log(`🗑️ Deleting listing: ${listingId}`);
    
    // 1. Find the listing first
    const listing = await Listings.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const listingName = listing.Listing_Product_Name;
    const store = listing.Listing_Store_Name;

    // 2. Remove from ALL users' tracked products
    const updateUsersResult = await Users.updateMany(
      { 
        "User_preferences.User_tracked_products.Tracked_product_id": listingId 
      },
      {
        $pull: {
          "User_preferences.User_tracked_products": {
            Tracked_product_id: listingId
          }
        }
      }
    );

    console.log(`👥 Removed from ${updateUsersResult.modifiedCount} users' tracked products`);

    // 3. Delete the listing permanently (or soft delete if you prefer)
    await Listings.findByIdAndDelete(listingId);

    console.log(`✅ Successfully deleted listing: ${listingName} from ${store}`);

    res.json({ 
      message: "Listing deleted successfully",
      stats: {
        listing: listingName,
        store: store,
        usersAffected: updateUsersResult.modifiedCount
      }
    });

  } catch (err) {
    console.error("❌ Error deleting listing:", err);
    res.status(500).json({ error: "Internal server error during listing deletion" });
  }
};

// Controller/UserManagementController.js
export const untrackListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    
    console.log(`⭐ Untracking listing: ${listingId}`);
    
    // 1. Find the listing to get its details
    const listing = await Listings.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // 2. Remove from ALL users' tracked products
    const updateUsersResult = await Users.updateMany(
      { 
        "User_preferences.User_tracked_products.Tracked_product_id": listingId 
      },
      {
        $pull: {
          "User_preferences.User_tracked_products": {
            Tracked_product_id: listingId
          }
        }
      }
    );

    console.log(`✅ Removed from ${updateUsersResult.modifiedCount} users' tracked products`);

    res.json({ 
      message: "Listing removed from all users' tracked products",
      stats: {
        listing: listing.Listing_Product_Name,
        store: listing.Listing_Store_Name,
        usersAffected: updateUsersResult.modifiedCount
      }
    });

  } catch (err) {
    console.error("❌ Error untracking listing:", err);
    res.status(500).json({ error: "Internal server error during untracking" });
  }
};

// Controller/UserManagementController.js - SIMPLER VERSION


export const untrackProduct = async (req, res) => {
  try {
    const listingId = req.params.id;
    
    console.log(`⭐ Untracking listing ID: ${listingId}`);
    
    // Remove from ALL users' tracked products
    const updateResult = await Users.updateMany(
      { 
        "User_preferences.User_tracked_products.Tracked_product_id": listingId 
      },
      {
        $pull: {
          "User_preferences.User_tracked_products": {
            Tracked_product_id: listingId
          }
        }
      }
    );

    console.log(`✅ Successfully untracked listing from ${updateResult.modifiedCount} users`);

    res.json({ 
      success: true,
      message: "Product removed from all users' tracked products",
      usersAffected: updateResult.modifiedCount
    });

  } catch (err) {
    console.error("❌ Error untracking product:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to untrack product",
      message: err.message 
    });
  }
};

// Controller/ProductManagementController.js
export const softDeleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    
    console.log(`📦 Soft deleting listing: ${listingId}`);
    
    // 1. Find and soft delete the listing
    const listing = await Listings.findByIdAndUpdate(
      listingId,
      { 
        listing_status: "deleted",
        deletedAt: new Date(),
        Listing_Last_Updated: new Date()
      },
      { new: true }
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // 2. Remove from ALL users' tracked products
    const updateUsersResult = await Users.updateMany(
      { 
        "User_preferences.User_tracked_products.Tracked_product_id": listingId 
      },
      {
        $pull: {
          "User_preferences.User_tracked_products": {
            Tracked_product_id: listingId
          }
        }
      }
    );

    console.log(`✅ Soft deleted listing and removed from ${updateUsersResult.modifiedCount} users`);

    res.json({ 
      message: "Listing archived and removed from tracked products",
      listing: {
        name: listing.Listing_Product_Name,
        store: listing.Listing_Store_Name,
        status: "deleted"
      },
      usersAffected: updateUsersResult.modifiedCount
    });

  } catch (err) {
    console.error("❌ Error soft deleting listing:", err);
    res.status(500).json({ error: "Internal server error during listing archival" });
  }
};