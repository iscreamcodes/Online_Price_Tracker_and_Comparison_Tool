// Controller/ProductsController.js
import { fetchAllStoresProducts } from "../services/ProductService.js";
import { saveMatchedProducts } from "../services/saveMatchedProducts.js";
import { addHistoricalPriceIfChanged } from "../services/historyService.js";
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";
import HistoricalPrice from "../Model/History.js";

export const getAllStoresProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  const saveToDB = req.query.save === "true";

  console.log(`🔍 Searching all stores for: "${query}"`);

  try {
    // 🟢 PHASE 1: Check for existing products in DB
    let existingProducts = [];

    if (query.trim()) {
      const matchingProducts = await Products.find({
        Product_Name: { $regex: query, $options: "i" },
      });

      console.log(`📚 Found ${matchingProducts.length} matching products in DB`);

      if (matchingProducts.length > 0) {
        const productIds = matchingProducts.map((p) => p._id);
        existingProducts = await Listings.find({
          Product_id: { $in: productIds },
        })
          .populate("Product_id")
          .limit(20);

        console.log(`📋 Found ${existingProducts.length} listings`);
      }
    } else {
      existingProducts = await Listings.find()
        .populate("Product_id")
        .sort({ Listing_Last_Updated: -1 })
        .limit(20);
    }

    // 🟢 PHASE 2: Run scrapers (now includes Masoko!)
    let scrapedResults = { groupedProducts: [] };
    let savedListings = [];

    if (saveToDB) {
      try {
        scrapedResults = await fetchAllStoresProducts({ query });
        console.log("🧭 Scraper performance:", scrapedResults.performance);

        if (scrapedResults.groupedProducts?.length > 0) {
          savedListings = await saveMatchedProducts(scrapedResults.groupedProducts);
          console.log(`💾 Saved ${savedListings.length} NEW listings`);

          // Save historical prices
          for (const listing of savedListings) {
            await addHistoricalPriceIfChanged({
              Listing_id: listing._id,
              History_Price: listing.Listing_Price,
            });
          }
        }
      } catch (scrapeErr) {
        console.error("❌ Scraping failed:", scrapeErr.message);
      }
    }

    // 🟢 PHASE 3: Combine existing and new listings
    const allListings = [...existingProducts];
    const newListingIds = new Set(savedListings.map((l) => l._id.toString()));

    savedListings.forEach((newListing) => {
      if (!allListings.some((existing) => existing._id.toString() === newListing._id.toString())) {
        allListings.push(newListing);
      }
    });

    // 🧠 Clean & unified product structure for frontend
    const productsWithNames = allListings.map((listing) => {
      let productName =
        listing.Product_id?.Product_Name ||
        listing.Product_Name ||
        listing.title ||
        listing.name ||
        "Unknown Product";

      // Try extracting name from URL if still unknown
      if (productName === "Unknown Product" && listing.Listing_URL) {
        const lastPart = listing.Listing_URL.split("/").pop();
        if (lastPart && lastPart.length > 5) {
          productName = decodeURIComponent(lastPart.replace(/-/g, " "));
        }
      }

      return {
        _id: listing._id,
        name: productName,
        price: listing.Listing_Price,
        currency: listing.Listing_Currency,
        store: listing.Listing_Store_Name,
        image:
          listing.Listing_Image_URL ||
          listing.Product_id?.Product_Image_URL ||
          "/placeholder-image.jpg",
        url: listing.Listing_URL,
        isNew: newListingIds.has(listing._id.toString()),
        lastUpdated: listing.Listing_Last_Updated,
      };
    });

    console.log(`🎯 Sending ${productsWithNames.length} products to frontend`);

    // ✅ Final Response
    res.json({
      message: "✅ Products fetched successfully",
      query,
      products: productsWithNames,
      performance: scrapedResults.performance || {},
      errors: scrapedResults.errors || {},
      scrapingCompleted: !!scrapedResults.groupedProducts,
      totalFromDB: existingProducts.length,
      totalNew: savedListings.length,
    });
  } catch (err) {
    console.error("❌ Error in getAllStoresProducts:", err);
    res.status(500).json({
      error: "Unexpected server error",
      details: err.message,
    });
  }
};
