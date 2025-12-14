// Controller/ProductsController.js - COMPLETE FIXED VERSION
import { fetchAllStoresProducts } from "../services/ProductService.js";
import { saveMatchedProducts } from "../services/saveMatchedProducts.js";
import { addHistoricalPriceIfChanged } from "../services/historyService.js";
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";

export const getAllStoresProducts = async (req, res) => {
  const query = req.query.q || "laptop";
  const saveToDB = req.query.save === "true";

  console.log(`🔍 Searching all stores for: "${query}"`);

  try {
    // 🟢 Step 1: Find listings that match the query directly
    let listings = await Listings.find({
      Listing_Product_Name: { $regex: query, $options: "i" }
    })
      .sort({ Listing_Last_Updated: -1 })
      .limit(50);

    console.log(`📋 Found ${listings.length} listings from DB`);

    // 🟢 Step 2: Optionally run scrapers to fetch new listings
    let newListings = [];
    
    if (saveToDB) {
      console.log(`🔄 Scraping fresh data for: "${query}"`);
      const scraped = await fetchAllStoresProducts({ query });
      
      if (scraped.groupedProducts?.length) {
        console.log(`🔍 Processing ${scraped.groupedProducts.length} grouped products from scrapers...`);
        
        // 🛠️ CORRECT TRANSFORMATION for nested structure
        const transformedGroups = scraped.groupedProducts.map(group => {
          // Extract from baseProduct (primary) or first item in products array
          const base = group.baseProduct || (group.products && group.products[0]) || {};
          
          return {
            name: base.Product_Name || base.name || 'Unknown Product',
            store: base.Listing_Store_Name || base.store || base.Store_Name || 'Unknown Store',
            price: base.Listing_Price || base.price || base.Price || 0,
            currency: base.Listing_Currency || base.currency || 'KES',
            url: base.Listing_URL || base.url || base.URL || '',
            image: base.Listing_Image_URL || base.Product_Image_URL || base.image || base.Image_URL || ''
          };
        }).filter(group => {
          const isValid = group.name && group.store && group.name !== 'Unknown Product' && group.store !== 'Unknown Store' && group.price > 0;
          return isValid;
        });

        console.log(`📊 After transformation: ${transformedGroups.length} valid groups (from ${scraped.groupedProducts.length} total)`);
        
        if (transformedGroups.length > 0) {
          console.log('🔍 Sample transformed products:');
          transformedGroups.slice(0, 3).forEach((group, index) => {
            console.log(`   ${index + 1}. ${group.name.substring(0, 50)}... - ${group.store} - KES ${group.price}`);
          });
          
          console.log(`💾 Saving ${transformedGroups.length} product groups to database...`);
          newListings = await saveMatchedProducts(transformedGroups);
          
          // Save historical prices for new listings
          for (const listing of newListings) {
            await addHistoricalPriceIfChanged({
              History_listing_id: listing._id,
              History_Price: listing.Listing_Price,
            });
          }
          console.log(`💾 Saved ${newListings.length} new listings`);
        } else {
          console.log('❌ No valid product groups to save after transformation');
        }
      } else {
        console.log('❌ No grouped products returned from scraping');
      }
    }

    // Combine DB + newly scraped listings
    const allListings = [...listings, ...newListings];

    // 🟢 Prepare response for frontend
    const responseProducts = allListings.map((listing) => ({
      _id: listing._id,
      name: listing.Listing_Product_Name || "Unknown Product",
      price: listing.Listing_Price,
      currency: listing.Listing_Currency,
      store: listing.Listing_Store_Name,
      image: listing.Listing_Image_URL || "/placeholder.jpg",
      url: listing.Listing_URL,
      lastUpdated: listing.Listing_Last_Updated,
      productId: listing.listing_product_id || null,
    }));

    // Debug: Check what we're sending
    console.log('🔍 DEBUG - First 3 products being sent to frontend:');
    responseProducts.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. Name: "${product.name}", Store: ${product.store}, Price: ${product.price}`);
    });

    res.json({
      message: "✅ Products fetched successfully",
      query,
      products: responseProducts,
      totalFromDB: listings.length,
      totalNew: newListings.length,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: err.message });
  }
};