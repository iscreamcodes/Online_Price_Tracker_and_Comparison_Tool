// services/saveMatchedProducts.js - FIXED VERSION
import AI_Data from "../Model/AiData.js";
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";

export async function saveMatchedProducts(groupedProducts) {
  const savedListings = [];

  if (!Array.isArray(groupedProducts) || groupedProducts.length === 0) {
    console.warn("⚠️ No grouped products to save.");
    return [];
  }

  console.log(`💾 Starting to save ${groupedProducts.length} product groups...`);

  for (const group of groupedProducts) {
    try {
      const base = group.baseProduct || {};
      const storeProducts = group.products || [];

      console.log(`🔍 Processing group with ${storeProducts.length} products`);

      // 1️⃣ Find or create the base product
      const productName = base.title || base.name || base.Product_Name || "Unnamed Product";
      console.log(`💾 Saving product: "${productName.substring(0, 50)}..."`);

      let product = await Products.findOne({ 
        Product_Name: { $regex: productName, $options: 'i' }
      });

      if (!product) {
        product = await Products.create({
          Product_Name: productName,
          Product_Image_URL: base.image || base.img || "",
          Product_Description: base.description || "",
          Product_Specs: base.specs || {},
          Product_Created_At: new Date(),
          Product_Updated_At: new Date(),
        });
        console.log(`🆕 Created product: "${product.Product_Name.substring(0, 50)}..." (ID: ${product._id})`);
      } else {
        console.log(`🔍 Found existing product: "${product.Product_Name.substring(0, 50)}..." (ID: ${product._id})`);
        product.Product_Updated_At = new Date();
        await product.save();
      }

      // 2️⃣ 🚀 CRITICAL FIX: Save listings for EACH store product
      for (const storeProduct of storeProducts) {
        try {
          const storeName = storeProduct.store || "Unknown";
          const price = Number(storeProduct.price) || 0;
          
          // Clean and validate URL
          let productUrl = storeProduct.url || "";
          if (productUrl && !productUrl.startsWith('http')) {
            productUrl = `https://${productUrl}`;
          }

          // 🚀 Check if listing already exists
          let listing = await Listings.findOne({
            Product_id: product._id,
            Listing_Store_Name: storeName,
            Listing_URL: productUrl
          });

          if (!listing) {
            listing = await Listings.create({
              Product_id: product._id,
              Listing_Store_Name: storeName,
              Listing_Price: price,
              Listing_Currency: storeProduct.currency || "KES",
              Listing_URL: productUrl,
              Listing_Image_URL: storeProduct.image || base.image || product.Product_Image_URL || "",
              Listing_Last_Updated: new Date(),
            });
            console.log(`💾 Created NEW listing: ${storeName} - KES ${price}`);
            savedListings.push(listing);
          } else {
            // Update existing listing
            const priceChanged = listing.Listing_Price !== price;
            if (priceChanged) {
              listing.Listing_Price = price;
              listing.Listing_Last_Updated = new Date();
              await listing.save();
              console.log(`🔄 Updated price for ${storeName}: KES ${price}`);
            }
            savedListings.push(listing);
          }
        } catch (innerErr) {
          console.error("❌ Error saving listing:", innerErr.message);
          continue;
        }
      }

    } catch (err) {
      console.error("❌ Error saving product group:", err.message);
      continue;
    }
  }

  console.log(`💾 Saved/updated ${savedListings.length} listings total.`);
  return savedListings;
}