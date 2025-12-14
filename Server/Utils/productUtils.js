import { normalizePriceToKES } from "./normalizePrice.js";

export function normalizeProduct(item, source) {
  const priceText = String(item.price || item.Listing_Price || "").replace(/[^\d.,]/g, "");
  const price = parseFloat(priceText.replace(/,/g, "")) || 0;
  const priceKES = normalizePriceToKES(price, item.currency || item.Listing_Currency || "USD");

  // Extract product name from various possible fields
  const productName = item.name || item.title || item.Product_Name || "Unknown Product";
  
  // Extract category information
  const category = item.category || item.Product_Category || "General";
  const categoryCode = item.category_code || item.Product_Category_code || "CAT_GENERAL";

  return {
    // Product schema fields
    Product_code: item.Product_code || `PROD_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    Product_Name: productName,
    Product_Category_code: categoryCode,
    Product_Category: category,
    Product_Image_URL: item.image || item.imageUrl || item.img || item.Listing_Image_URL || item.Product_Image_URL || null,
    
    // Listing schema fields (for reference)
    Listing_Price: priceKES,
    Listing_Currency: "KES", // unified currency
    Listing_Store_Name: item.store || source || item.Listing_Store_Name || "Unknown Store",
    Listing_URL: item.url || item.link || item.href || item.Listing_URL || null,
    Listing_Image_URL: item.image || item.imageUrl || item.img || item.Listing_Image_URL || null,
    
    // Additional fields for processing
    rating: item.rating ? Number(item.rating) : null,
    last_checked: new Date(),
  };
}

/**
 * Special normalizer for tracked products in user preferences
 */
export function normalizeTrackedProductForUser(item, listing, product) {
  return {
    Tracked_product_id: product?._id || listing?.listing_product_id || item.Tracked_product_id,
    Tracked_name: product?.Product_Name || item.Tracked_name || item.name || "Unknown Product",
    Tracked_url: listing?.Listing_URL || item.Tracked_url || item.url || "",
    Tracked_store: listing?.Listing_Store_Name || item.Tracked_store || item.store || "Unknown Store",
    Tracked_currency: listing?.Listing_Currency || item.Tracked_currency || item.currency || "KES",
    Tracked_price_history: item.Tracked_price_history || [
      {
        History_price: listing?.Listing_Price || item.price || 0,
        History_date: new Date()
      }
    ],
    Tracked_since: item.Tracked_since || new Date()
  };
}

/**
 * Normalizer specifically for historical price data
 */
export function normalizeHistoricalPrice(listing, currentPrice) {
  return {
    History_listing_id: listing._id || listing.History_listing_id,
    History_Price: currentPrice || listing.Listing_Price || 0,
    History_createdAt: new Date()
  };
}

/**
 * Backward compatibility wrapper for existing code
 */
export function normalizeProductLegacy(item, source) {
  const normalized = normalizeProduct(item, source);
  
  // Return legacy format for code that hasn't been updated yet
  return {
    name: normalized.Product_Name,
    price: normalized.Listing_Price,
    currency: normalized.Listing_Currency,
    store: normalized.Listing_Store_Name,
    rating: normalized.rating,
    image: normalized.Product_Image_URL,
    url: normalized.Listing_URL,
    last_checked: normalized.last_checked,
    
    // New schema fields for forward compatibility
    Product_Name: normalized.Product_Name,
    Product_Category: normalized.Product_Category,
    Product_Category_code: normalized.Product_Category_code,
    Listing_Store_Name: normalized.Listing_Store_Name,
  };
}