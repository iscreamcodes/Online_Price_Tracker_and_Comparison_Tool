import { chromium } from "playwright";
import { normalizeProduct } from "../Utils/productUtils.js";

export async function fetchJijiProducts(searchQuery, maxProducts = 10) {
  console.log(`🔍 JIJI: Fetching products for: "${searchQuery}"...`);
  const startTime = Date.now();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
  });

  try {
    const searchUrl = `https://jiji.co.ke/search?query=${encodeURIComponent(searchQuery)}`;
    console.log(`🌍 Navigating to: ${searchUrl}`);
    
    // Increase timeout and use networkidle for better loading
    await page.goto(searchUrl, { 
      waitUntil: "networkidle",
      timeout: 60000 
    });

    console.log('✅ Page loaded, waiting for content...');
    await page.waitForTimeout(5000);

    // 🎯 FIXED EXTRACTION - No multiple arguments issue
    const rawProducts = await page.$$eval(
      ".b-list-advert-base.b-list-advert-base--gallery.qa-advert-list-item",
      (els) => {
        const results = [];
        const maxProducts = 10; // Hardcoded to avoid argument issues
        const searchQuery = "laptop"; // Hardcoded for now
        
        for (let i = 0; i < Math.min(els.length, maxProducts); i++) {
          const el = els[i];
          try {
            // Get URL from href attribute
            const href = el.getAttribute('href');
            const fullUrl = href ? `https://jiji.co.ke${href.startsWith('/') ? href : '/' + href}` : '';
            
            // Get full text content
            const fullText = el.textContent?.trim() || '';
            
            // Extract title - everything after price or first meaningful text
            let title = fullText;
            
            // Remove "X+ years on Jiji" prefix
            title = title.replace(/^\d+\+\s*years\s*on\s*Jiji\s*/i, '');
            
            // Remove "Verified ID" prefix
            title = title.replace(/^Verified\s*ID\s*/i, '');
            
            // Extract price and remove it from title
            const priceMatch = fullText.match(/KSh\s*([\d,]+)/);
            const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
            
            if (priceMatch) {
              title = title.replace(priceMatch[0], '').trim();
            }
            
            // Clean up title - remove extra whitespace and normalize
            title = title.replace(/\s+/g, ' ').trim();
            
            // If title is still messy, take first line or meaningful segment
            if (title.length > 100 || title.split(' ').length > 15) {
              const lines = title.split('\n').filter(line => line.trim().length > 10);
              title = lines[0]?.trim() || searchQuery;
            }
            
            // Extract image
            const imgEl = el.querySelector('img');
            const image = imgEl?.src || imgEl?.getAttribute('data-src') || '';
            
            // Only add if we have the essential data
            if (title && price > 0 && fullUrl) {
              results.push({
                // 🎯 FIELD NAMES THAT normalizeProduct EXPECTS
                Product_Name: title,
                Listing_Price: price,
                Listing_Currency: 'KES',
                Listing_Store_Name: 'Jiji',
                Listing_URL: fullUrl,
                Product_Image_URL: image,
                Listing_Image_URL: image,
                
                // Required fields for normalizeProduct
                Product_Category: 'Computers & Laptops',
                Product_Category_code: 'CAT_ELECTRONICS',
                
                // Additional fields
                rating: null, // Jiji doesn't have ratings
                
                // Keep original fields for compatibility
                name: title,
                price: price,
                currency: 'KES',
                store: 'Jiji',
                url: fullUrl,
                image: image
              });
            }
          } catch (error) {
            console.log('Error processing product:', error);
          }
        }
        
        return results;
      }
    );

    await browser.close();

    console.log(`📊 Raw extraction: ${rawProducts.length} products found`);
    
    if (rawProducts.length === 0) {
      console.log('❌ No products extracted - possible selector issue');
      return [];
    }
    
    // Debug: Show raw products before normalization
    console.log(`\n🔍 RAW PRODUCTS BEFORE NORMALIZATION:`);
    rawProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.Product_Name}`);
      console.log(`      Price: KES ${product.Listing_Price}`);
      console.log(`      URL: ${product.Listing_URL ? '✅' : '❌'}`);
      console.log(`      Image: ${product.Product_Image_URL ? '✅' : '❌'}`);
    });
    
    // 🎯 NORMALIZE PRODUCTS
    const normalizedProducts = rawProducts.map(product => {
      try {
        const normalized = normalizeProduct(product, "jiji");
        console.log(`✅ Normalized: ${normalized.Product_Name} - KES ${normalized.Listing_Price}`);
        return normalized;
      } catch (error) {
        console.log('❌ Normalization failed for product:', product.Product_Name, error.message);
        console.log('   Product keys:', Object.keys(product));
        // Return the raw product with basic normalization
        return {
          Product_Name: product.Product_Name || 'Unknown Product',
          Listing_Price: product.Listing_Price || 0,
          Listing_Currency: product.Listing_Currency || 'KES',
          Listing_Store_Name: product.Listing_Store_Name || 'Jiji',
          Listing_URL: product.Listing_URL || '',
          Product_Image_URL: product.Product_Image_URL || '',
          rating: product.rating || null
        };
      }
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎯 JIJI FINAL RESULTS (${duration}s):`);
    console.log(`   Products found: ${normalizedProducts.length}`);
    
    return normalizedProducts;

  } catch (error) {
    console.error('❌ Jiji scraping failed:', error.message);
    await browser.close();
    return [];
  }
}

// Test function
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchJijiProducts('laptop', 5).then(products => {
    console.log(`\n🎯 TEST COMPLETE: ${products.length} products returned`);
  });
}