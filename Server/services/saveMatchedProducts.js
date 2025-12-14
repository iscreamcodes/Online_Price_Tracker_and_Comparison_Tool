// services/saveMatchedProducts.js - FULLY INTEGRATED
import Listings from "../Model/Listings.js";
import Products from "../Model/Products.js";
import Store from "../Model/Store.js";
import Category from "../Model/Category.js";
import mongoose from "mongoose";

export async function saveMatchedProducts(groupedProducts) {
  const savedListings = [];
  
  console.log(`💾 Processing ${groupedProducts.length} product groups for saving...`);
  
  for (const group of groupedProducts) {
    try {
      // 🚨 VALIDATE REQUIRED FIELDS
      if (!group.name || !group.store) {
        console.log('⚠️ Skipping product group - missing name or store', group);
        continue;
      }

      if (!group.price || group.price === 0) {
        console.log('⚠️ Skipping product group - invalid price:', group.price);
        continue;
      }

      console.log(`✅ Processing: "${group.name.substring(0,50)}..." from ${group.store} - KES ${group.price}`);
      
      // 🏪 Step 1: Find or create store
      let store = await Store.findOne({
        Store_Name: { $regex: new RegExp(escapeRegex(group.store), 'i') }
      });
      
      if (!store) {
        console.log(`🆕 Creating new store: ${group.store}`);
        store = new Store({
          Store_Name: group.store,
          Store_Country: group.store.toLowerCase() === 'amazon' ? 'USA' : 'Kenya',
          Store_Website: getStoreWebsite(group.store)
        });
        await store.save();
        console.log(`✅ Created store: ${store.Store_Name} (${store.Store_code})`);
      } else {
        console.log(`🏪 Found existing store: ${store.Store_Name} (${store.Store_code})`);
      }

      // 📦 Step 2: Find or create product
      let product = await Products.findOne({
        Product_Name: { $regex: new RegExp(escapeRegex(group.name), 'i') }
      });

      if (!product) {
        const categoryCode = determineCategory(group.name);
        const categoryName = await getCategoryName(categoryCode);
        
        console.log(`🆕 Creating new product: ${group.name.substring(0,50)}...`);
        console.log(`   Category: ${categoryName} (${categoryCode})`);
        
        // 🛠️ Manual Product_code generation
        const productCount = await Products.countDocuments();
        const productCode = `PROD${String(productCount + 1).padStart(6,'0')}`;
        
        product = new Products({
          Product_code: productCode,
          Product_Name: group.name,
          Product_Category_code: categoryCode,
          Product_Category: categoryName,
          Product_Image_URL: group.image || ""
        });
        
        await product.save();
        console.log(`✅ Created product: ${product.Product_code} - ${product.Product_Name.substring(0,50)}...`);
      } else {
        console.log(`📦 Found existing product: ${product.Product_code} - ${product.Product_Name.substring(0,50)}...`);
      }

      // 🏷️ Step 3: Avoid duplicate listings
      let existingListing = await Listings.findOne({
        listing_product_id: product._id,
        listing_store_id: store._id,
        Listing_URL: group.url
      });

      if (existingListing) {
        console.log(`ℹ️ Listing already exists: ${existingListing.Listing_code}`);
        if (existingListing.Listing_Price !== group.price) {
          console.log(`💰 Price update: ${existingListing.Listing_Price} → ${group.price}`);
          existingListing.Listing_Price = group.price;
          existingListing.Listing_Last_Updated = new Date();
          await existingListing.save();
        }
        savedListings.push(existingListing);
        continue;
      }

      // 🆕 Step 4: Create new listing with backup manual code
      console.log(`📝 Creating new listing for: ${product.Product_Name.substring(0,50)}...`);

      try {
        const listing = new Listings({
          listing_product_id: product._id,
          listing_store_id: store._id,
          Listing_Product_Name: group.name,
          Listing_Store_Name: group.store,
          Listing_Price: group.price,
          Listing_Currency: group.currency || "KES",
          Listing_URL: group.url,
          Listing_Image_URL: group.image || ""
        });

        await listing.save();
        savedListings.push(listing);
        console.log(`✅ Created listing: ${listing.Listing_code} for ${product.Product_code} in ${store.Store_Name}`);
      } catch (listingError) {
        console.error('❌ Listing save failed, trying manual Listing_code...', listingError.message);
        // Manual Listing_code backup
        const listingCount = await Listings.countDocuments();
        const listingCode = `LIST${String(listingCount + 1).padStart(6,'0')}`;

        const listing = new Listings({
          Listing_code: listingCode,
          listing_product_id: product._id,
          listing_store_id: store._id,
          Listing_Product_Name: group.name,
          Listing_Store_Name: group.store,
          Listing_Price: group.price,
          Listing_Currency: group.currency || "KES",
          Listing_URL: group.url,
          Listing_Image_URL: group.image || ""
        });

        await listing.save();
        savedListings.push(listing);
        console.log(`✅ Created listing (manual): ${listing.Listing_code}`);
      }

    } catch (error) {
      console.error(`❌ Error saving product group: ${error.message}`);
      console.error(`   Product: ${group.name}`);
      console.error(`   Store: ${group.store}`);
    }
  }

  console.log(`💾 Saved ${savedListings.length} listings total`);
  return savedListings;
}

// ----------------------
// HELPER FUNCTIONS
// ----------------------
function escapeRegex(text) {
  if (!text) return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
}

function determineCategory(productName) {
  if (!productName) return 'CAT_ELECTRONICS';
  const name = productName.toLowerCase();
  if (name.includes('phone') || name.includes('mobile')) return 'CAT_PHONES';
  if (name.includes('laptop') || name.includes('computer')) return 'CAT_COMPUTERS';
  if (name.includes('headphone') || name.includes('audio') || name.includes('pods')) return 'CAT_AUDIO';
  if (name.includes('tv') || name.includes('screen')) return 'CAT_ELECTRONICS';
  if (name.includes('fridge') || name.includes('washing') || name.includes('home') || name.includes('heater')) return 'CAT_HOME';
  if (name.includes('shirt') || name.includes('shoe') || name.includes('fashion')) return 'CAT_FASHION';
  return 'CAT_ELECTRONICS';
}

async function getCategoryName(categoryCode) {
  try {
    const category = await Category.findOne({ Category_code: categoryCode });
    return category ? category.Category_Name : 'Electronics';
  } catch (error) {
    console.error(`❌ Error getting category name for ${categoryCode}:`, error.message);
    return 'Electronics';
  }
}

function getStoreWebsite(storeName) {
  if (!storeName) return '';
  const sites = {
    'jumia':'https://www.jumia.co.ke',
    'kilimall':'https://www.kilimall.co.ke',
    'amazon':'https://www.amazon.com',
    'jiji':'https://jiji.co.ke',
    'masoko':'https://masoko.com'
  };
  const lowerName = storeName.toLowerCase();
  for (const [key,url] of Object.entries(sites)) {
    if (lowerName.includes(key)) return url;
  }
  return '';
}
