// kilimallApi.js - UPDATED with correct search endpoints
import axios from "axios";
import { normalizeProduct } from "../Utils/productUtils.js";

/**
 * Fetch Kilimall products with timing and better filtering
 */
export async function fetchKilimallProducts(searchQuery) {
  const startTime = Date.now();
  console.log(`🛍️ Fetching Kilimall results for "${searchQuery}"...`);
  
  try {
    // Try the correct search API first
    let products = await fetchKilimallSearch(searchQuery);
    
    if (products.length === 0) {
      console.log("🔍 No results from search, trying recommended products...");
      products = await fetchKilimallRecommendedWithSearch(searchQuery);
    }
    
    const relevant = filterRelevantProducts(products, searchQuery);
    const normalized = relevant.map(p => normalizeProduct(p, "kilimall"));
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Kilimall completed: ${normalized.length} products (${duration}ms)`);
    return normalized;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`❌ Kilimall fetch error after ${duration}ms:`, error.message);
    return [];
  }
}

/**
 * Try to search using Kilimall's CORRECT search API
 */
async function fetchKilimallSearch(searchQuery) {
  // Use the correct endpoint you discovered
  const endpoint = `https://www.kilimall.co.ke/search?q=${encodeURIComponent(searchQuery)}&page=1&source=search|enterSearch|${encodeURIComponent(searchQuery)}`;
  
  try {
    console.log(`🌍 Trying search endpoint: ${endpoint}`);
    const res = await axios.get(endpoint, {
      headers: getKilimallHeaders(),
      timeout: 10000,
    });

    console.log(`✅ Search endpoint status: ${res.status}`);
    
    const products = parseSearchResponse(res.data, searchQuery);
    if (products.length > 0) {
      console.log(`📦 Found ${products.length} products from search`);
      return products;
    }
  } catch (err) {
    console.log(`❌ Search endpoint failed: ${err.message}`);
    
    // If HTML page is returned, try to parse it
    if (err.response && typeof err.response.data === 'string') {
      console.log("🔄 Attempting to parse HTML response...");
      const products = parseHtmlResponse(err.response.data, searchQuery);
      if (products.length > 0) {
        console.log(`📦 Found ${products.length} products from HTML parsing`);
        return products;
      }
    }
  }
  
  return [];
}

/**
 * Parse HTML response from Kilimall search
 */
function parseHtmlResponse(html, searchQuery) {
  const products = [];
  
  try {
    // Look for product data in the HTML
    const productPatterns = [
      /data-product="({[^"]+})"/g,
      /window\.__INITIAL_STATE__\s*=\s*({[^;]+});/,
      /"products"\s*:\s*(\[[^\]]+\])/,
      /"listings"\s*:\s*(\[[^\]]+\])/
    ];
    
    for (const pattern of productPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`🔍 Found potential product data with pattern`);
        
        matches.forEach(match => {
          try {
            // Extract JSON from the match
            const jsonMatch = match.match(/(\{[^}]+\})|(\[[^\]]+\])/);
            if (jsonMatch) {
              const productData = JSON.parse(jsonMatch[0]);
              
              if (Array.isArray(productData)) {
                productData.forEach(item => {
                  products.push(createProductObject(item, searchQuery));
                });
              } else if (typeof productData === 'object') {
                products.push(createProductObject(productData, searchQuery));
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        });
        
        if (products.length > 0) break;
      }
    }
    
    // Alternative: Look for specific product elements in HTML
    if (products.length === 0) {
      const productSectionMatch = html.match(/<div[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
      if (productSectionMatch) {
        console.log(`🔍 Found ${productSectionMatch.length} product sections in HTML`);
      }
    }
    
  } catch (error) {
    console.error("❌ Error parsing HTML response:", error.message);
  }
  
  return products;
}

/**
 * Create product object from various data formats
 */
function createProductObject(item, searchQuery) {
  return {
    name: item.title || item.name || item.goods_name || searchQuery,
    price: item.minPrice || item.price || item.sale_price || item.minPrice || 0,
    originalPrice: item.maxListPrice || item.original_price || item.regular_price || 0,
    image: item.image || item.goods_image || item.image_url || "",
    url: item.url || `https://www.kilimall.co.ke/item/${item.listingId || item.id}.html`,
    store: "Kilimall",
    currency: "KES",
    reviews: item.reviews || 0,
    rating: item.reviewStar || item.rating || 0
  };
}

/**
 * Parse search API response
 */
function parseSearchResponse(data, searchQuery) {
  const products = [];
  
  try {
    // If data is a string (HTML), try to parse it
    if (typeof data === 'string') {
      return parseHtmlResponse(data, searchQuery);
    }
    
    // Try different JSON response formats
    if (data.data && Array.isArray(data.data.listings)) {
      // Format 1: Standard API response
      data.data.listings.forEach(item => {
        products.push(createProductObject(item, searchQuery));
      });
    } else if (Array.isArray(data.products)) {
      // Format 2: Alternative product array
      data.products.forEach(item => {
        products.push(createProductObject(item, searchQuery));
      });
    } else if (Array.isArray(data.listings)) {
      // Format 3: Direct listings array
      data.listings.forEach(item => {
        products.push(createProductObject(item, searchQuery));
      });
    } else if (data.products && typeof data.products === 'object') {
      // Format 4: Object with products
      Object.values(data.products).forEach(item => {
        products.push(createProductObject(item, searchQuery));
      });
    }
    
    console.log(`📊 Parsed ${products.length} products from JSON response`);
  } catch (error) {
    console.error("❌ Error parsing search response:", error.message);
  }
  
  return products;
}

/**
 * Fetch recommended products and filter by search query
 */
async function fetchKilimallRecommendedWithSearch(searchQuery) {
  try {
    // Use the working recommended endpoint
    const url = `https://mall-api.kilimall.com/recommended/1?skip=0&limit=50&isOver=false&loading=true`;
    console.log(`📦 Fetching recommended products from: ${url}`);
    
    const res = await axios.get(url, {
      headers: getKilimallHeaders(),
      timeout: 15000,
    });

    const listings = res.data?.data?.listings || [];
    console.log(`✅ Retrieved ${listings.length} recommended products`);
    
    // Convert to product format
    const products = listings.map(item => createProductObject(item, searchQuery));
    return products;
  } catch (error) {
    console.error("❌ Recommended products fetch failed:", error.message);
    return [];
  }
}

/**
 * Get proper headers for Kilimall requests
 */
function getKilimallHeaders() {
  return {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/html, application/xhtml+xml, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.kilimall.co.ke/",
    "Origin": "https://www.kilimall.co.ke",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site"
  };
}

/**
 * IMPROVED filtering that removes irrelevant promoted products
 */
function filterRelevantProducts(products, searchTerm, options = {}) {
    if (!products.length) return [];
  
    const searchLower = searchTerm.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(w => w.length > 2);
  
    // detect fallback usage
    const { source = "search" } = options;
    const isFallback = source === "recommended";
  
    console.log(`🔍 Filtering ${products.length} ${isFallback ? "(fallback)" : ""} products for "${searchTerm}"...`);
  
    const categoryKeywords = {
      phone: ["phone", "smartphone", "infinix", "tecno", "samsung", "iphone", "nokia", "xiaomi", "vivo", "oppo"],
      laptop: ["laptop", "notebook", "computer", "macbook", "hp", "dell", "lenovo", "asus", "acer"],
      tv: ["tv", "television", "android tv", "smart tv"],
      fridge: ["fridge", "refrigerator", "freezer"],
    };
  
    // detect search category
    let detectedCategory = null;
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => searchLower.includes(k))) {
        detectedCategory = cat;
        break;
      }
    }
  
    const relevant = products
      .map(p => {
        const name = (p.name || "").toLowerCase();
        let score = 0;
  
        if (!name.match(/[a-z]/)) return null;
  
        if (name.includes(searchLower)) score += 100;
        searchWords.forEach(word => {
          if (name.includes(word)) score += 40;
        });
  
        if (detectedCategory) {
          const allowedKeywords = categoryKeywords[detectedCategory];
          const hasCategoryWord = allowedKeywords.some(k => name.includes(k));
          if (!hasCategoryWord) score -= 40;
        }
  
        // Slightly less harsh penalties if we're in fallback mode
        const unrelatedGroups = Object.entries(categoryKeywords)
          .filter(([cat]) => cat !== detectedCategory)
          .flatMap(([_, words]) => words);
  
        unrelatedGroups.forEach(w => {
          if (name.includes(w)) score -= isFallback ? 30 : 80;
        });
  
        return { ...p, relevanceScore: score };
      })
      .filter(p => p && p.relevanceScore >= (isFallback ? 20 : 40))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  
    console.log(`✅ Kept ${relevant.length} relevant products after filtering`);
    return relevant;
  }
  
  

/**
 * Test function with correct endpoints
 */
export async function testKilimallAPI() {
  console.log("🚀 Testing Kilimall API with correct endpoints...\n");
  
  const testQueries = ["samsung phone", "laptop", "infinix hot 30", "tecno"];
  let totalDuration = 0;
  let totalProducts = 0;
  
  for (const query of testQueries) {
    const queryStart = Date.now();
    console.log(`\n🔍 Testing: "${query}"`);
    
    const products = await fetchKilimallProducts(query);
    const queryDuration = Date.now() - queryStart;
    totalDuration += queryDuration;
    totalProducts += products.length;
    
    console.log(`📊 Found: ${products.length} products in ${queryDuration}ms`);
    
    if (products.length > 0) {
      products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      💰 KES ${p.price} | ⭐ ${p.rating || 'N/A'} | 📝 ${p.reviews || '0'} reviews`);
      });
    } else {
      console.log("   ❌ No relevant products found");
    }
  }
  
  console.log(`\n🎉 Test Summary:`);
  console.log(`   Total queries: ${testQueries.length}`);
  console.log(`   Total products: ${totalProducts}`);
  console.log(`   Total time: ${totalDuration}ms`);
  console.log(`   Average time per query: ${Math.round(totalDuration / testQueries.length)}ms`);
  console.log(`   Average products per query: ${(totalProducts / testQueries.length).toFixed(1)}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testKilimallAPI().catch(console.error);
}