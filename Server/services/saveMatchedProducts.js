import AI_Data from "../Model/AiData.js";
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";

/**
 * Saves grouped AI-matched products into MongoDB
 * @param {Array} groupedProducts - result from AI matcher [{ baseProduct, products: [...] }]
 */
export async function saveMatchedProducts(groupedProducts) {
  let savedCount = 0;

  for (const group of groupedProducts) {
    const base = group.baseProduct;

    // ✅ 1. Find or create the base product
    let product = await Products.findOne({
      Product_Name: base.title || base.name,
    });

    if (!product) {
      product = await Products.create({
        Product_Name: base.title || base.name,
        Product_Image_URL: base.image || base.img || "",
        Product_Created_At: new Date(),
        Product_Updated_At: new Date(),
      });
      console.log(`🆕 Created product: ${product.Product_Name}`);
    } else {
      // Update timestamp if already exists
      product.Product_Updated_At = new Date();
      await product.save();
    }

    // ✅ 2. Save or update listings (each store version)
    for (const storeProduct of group.products) {
      const existingListing = await Listings.findOne({
        Product_id: product._id,
        Listing_Store_Name: storeProduct.store || "Unknown",
      });

      if (!existingListing) {
        await Listings.create({
          Product_id: product._id,
          Listing_Store_Name: storeProduct.store || "Unknown",
          Listing_Price: storeProduct.price || 0,
          Listing_Currency: storeProduct.currency || "USD",
          Listing_URL: storeProduct.url || "",
          Listing_Image_URL: storeProduct.image || base.image || "",
          Listing_Last_Updated: new Date(),
        });
        savedCount++;
      } else if (existingListing.Listing_Price !== storeProduct.price) {
        existingListing.Listing_Price = storeProduct.price;
        existingListing.Listing_Last_Updated = new Date();
        await existingListing.save();
      }
    }

    // ✅ 3. Optionally store AI embeddings (if they exist)
    if (base.embeddings) {
      await AI_Data.findOneAndUpdate(
        { Listing_id: product._id },
        {
          Ai_Text_Embeddings: base.embeddings,
          Ai_Last_Updated: new Date(),
        },
        { upsert: true }
      );
    }
  }

  console.log(`✅ Saved or updated ${savedCount} listings successfully.`);
  return savedCount;
}
