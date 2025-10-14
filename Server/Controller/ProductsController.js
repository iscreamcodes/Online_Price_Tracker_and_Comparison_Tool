import { fetchAllStoresProducts } from "../services/ProductService.js";
import { saveMatchedProducts } from "../services/saveMatchedProducts.js";
//import { saveProducts } from "./saveProducts.js";

/**
 * ✅ Fetch products from all stores (Jumia, eBay, Kilimall, Amazon)
 * Includes AI grouping for similar items.
 */
export const getAllStoresProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  const sortBy = req.query.sortBy;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
  const minRating = req.query.minRating ? Number(req.query.minRating) : null;
  const saveToDB = req.query.save === "true";

  console.log(`🔍 Searching all stores for: "${query}"`);

  try {
    const result = await fetchAllStoresProducts({
      query,
      sortBy,
      minPrice,
      maxPrice,
      minRating,
    });

    // Handle AI-matched grouped products
    const allProducts = result.groupedProducts?.flatMap((g) => g.products) || [];

   /* if (saveToDB && allProducts.length > 0) {
      await saveProducts(allProducts);
      console.log(`💾 Saved ${allProducts.length} products to DB`);
    }*/
   await saveMatchedProducts(result.groupedProducts);

    res.json({
      message: "✅ Products fetched and matched successfully across stores",
      query,
      totalProducts: result.totalProducts,
      groupedProducts: result.groupedProducts,
      performance: result.performance,
      errors: result.errors,
     // savedToDB,
     // savedCount: saveToDB ? allProducts.length : 0,
    });
  } catch (err) {
    console.error("❌ Error fetching or saving products:", err);
    res.status(500).json({
      error: "Unexpected server error",
      details: err.message,
    });
  }
};

/**
 * ✅ Fetch products from Kilimall only
 */
export const getKilimallProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  console.log(`🛍️ Searching Kilimall for: "${query}"`);

  try {
    const result = await fetchAllStoresProducts({ query, stores: ["kilimall"] });
    res.json({
      message: "✅ Products fetched successfully (Kilimall only)",
      ...result,
    });
  } catch (err) {
    console.error("❌ Error fetching Kilimall products:", err);
    res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
};

/**
 * ✅ Fetch products from Jumia only
 */
export const getJumiaProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  console.log(`🛍️ Searching Jumia for: "${query}"`);

  try {
    const result = await fetchAllStoresProducts({ query, stores: ["jumia"] });
    res.json({
      message: "✅ Products fetched successfully (Jumia only)",
      ...result,
    });
  } catch (err) {
    console.error("❌ Error fetching Jumia products:", err);
    res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
};

/**
 * ✅ Fetch products from Amazon only
 */
export const getAmazonProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  console.log(`🛒 Searching Amazon for: "${query}"`);

  try {
    const result = await fetchAllStoresProducts({ query, stores: ["amazon"] });
    res.json({
      message: "✅ Products fetched successfully (Amazon only)",
      ...result,
    });
  } catch (err) {
    console.error("❌ Error fetching Amazon products:", err);
    res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
};

/**
 * ✅ Fetch products from eBay only
 */
export const getEbayProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  console.log(`💻 Searching eBay for: "${query}"`);

  try {
    const result = await fetchAllStoresProducts({ query, stores: ["ebay"] });
    res.json({
      message: "✅ Products fetched successfully (eBay only)",
      ...result,
    });
  } catch (err) {
    console.error("❌ Error fetching eBay products:", err);
    res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
};
