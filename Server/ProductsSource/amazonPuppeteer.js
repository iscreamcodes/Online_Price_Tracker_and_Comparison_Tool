import { chromium } from "playwright";
import { normalizeProduct } from "../Utils/productUtils.js";
import { performance } from "perf_hooks";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Add currency conversion rates
const CURRENCY_RATES = {
  USD: 150, // 1 USD = 150 KES (approximate)
  EUR: 160,
  GBP: 190
};
function filterRelevantProducts(products, query) {
  if (!query || !products.length) return products;

  const qWords = query
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);

  return products.filter((p) => {
    const name = (p.Product_Name || "").toLowerCase();
    let matches = 0;

    for (const w of qWords) {
      if (name.includes(w)) {
        matches++;
        continue;
      }
      if ((w === "vaccum" && name.includes("vacuum")) || (w === "vacuum" && name.includes("vaccum"))) {
        matches++;
        continue;
      }
      for (const word of name.split(/\s+/)) {
        if (word.includes(w) || w.includes(word)) {
          matches++;
          break;
        }
      }
    }
    return matches >= 1;
  });
}
// Extract and clean price with proper currency detection 
function extractPriceAndCurrency(priceElement) {
  if (!priceElement) return { price: 0, currency: 'USD' };
  
  const priceText = priceElement.textContent || '';
  
  // Extract currency symbol
  let currency = 'USD';
  if (priceText.includes('KES') || priceText.includes('KSh')) {
    currency = 'KES';
  } else if (priceText.includes('€') || priceText.includes('EUR')) {
    currency = 'EUR';
  } else if (priceText.includes('£') || priceText.includes('GBP')) {
    currency = 'GBP';
  }
  
  // Extract numeric price - handle various formats
  const priceMatch = priceText.match(/([\d,]+\.?\d*)/);
  if (priceMatch) {
    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
    return { price, currency };
  }
  
  return { price: 0, currency };
}
// Convert price to KES if needed 
function convertToKES(price, fromCurrency) {
  if (fromCurrency === 'KES') return price;
  return price * (CURRENCY_RATES[fromCurrency] || 150);
}

export async function scrapeAmazon(searchTerm = "laptop") {
  console.log(` Scraping Amazon for "${searchTerm}"...`);
  const start = performance.now();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    viewport: { width: 1366, height: 768 },
  });

  /** Block only heavy external images + trackers */
  await page.route("**/*", (route) => {
    const url = route.request().url();
    const type = route.request().resourceType();

    if (type === "image" && !url.includes("images-na.ssl-images-amazon.com")) {
      return route.abort();
    }
    if (url.includes("google-analytics") || url.includes("adsystem")) {
      return route.abort();
    }
    return route.continue();
  });

  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`;
    console.log(`🌍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 15000 });

    // Scroll to load enough results
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await delay(400);
    }

    console.log("⏳ Extracting Amazon products...");

    const products = await page.$$eval(
      '[data-component-type="s-search-result"]',
      (elements) => {
        return elements
          .map((el) => {
            try {
              // Get name - try multiple selectors
              const name = 
                el.querySelector("h2 a span")?.textContent?.trim() ||
                el.querySelector("h2 .a-text-normal")?.textContent?.trim() ||
                el.querySelector("h2")?.textContent?.trim() ||
                null;

              if (!name) return null;

              // Get URL
              const urlElement = el.querySelector("h2 a") || el.querySelector("a.a-link-normal");
              const url = urlElement?.href || null;

              // Get image
              const image = 
                el.querySelector("img.s-image")?.src ||
                el.querySelector("img")?.src ||
                null;

              // 🆕 IMPROVED PRICE EXTRACTION
              let price = 0;
              let currency = 'USD';
              
              // Method 1: Check for KES prices first
              const kesPriceElement = el.querySelector('.a-price .a-price-symbol');
              if (kesPriceElement?.textContent?.includes('KES')) {
                const whole = el.querySelector('.a-price-whole')?.textContent?.replace(/[^\d]/g, '');
                const fraction = el.querySelector('.a-price-fraction')?.textContent?.replace(/[^\d]/g, '');
                if (whole) {
                  price = parseFloat(whole + '.' + (fraction || '00'));
                  currency = 'KES';
                }
              }
              
              // Method 2: Standard price extraction (USD)
              if (!price) {
                const priceWhole = el.querySelector(".a-price-whole")?.textContent;
                const priceFraction = el.querySelector(".a-price-fraction")?.textContent;
                if (priceWhole) {
                  price = parseFloat(
                    (priceWhole.replace(/[^\d]/g, "") + "." + (priceFraction || "00").replace(/[^\d]/g, ""))
                  );
                  currency = 'USD';
                }
              }
              
              // Method 3: Price range or other formats
              if (!price) {
                const priceRange = el.querySelector(".a-price .a-offscreen")?.textContent;
                if (priceRange) {
                  const match = priceRange.match(/\$?([\d,]+\.?\d*)/);
                  if (match) {
                    price = parseFloat(match[1].replace(/,/g, ""));
                    currency = priceRange.includes('$') ? 'USD' : 'KES';
                  }
                }
              }

              // Get rating
              const ratingText = el.querySelector(".a-icon-alt")?.textContent;
              const rating = ratingText ? parseFloat(ratingText.split(" ")[0]) : null;

              // Return in format that normalizeProduct expects
              return {
                // Product schema fields
                Product_Name: name,
                Product_Category: "Electronics",
                Product_Category_code: "CAT_ELECTRONICS",
                Product_Image_URL: image || "",
                
                // Listing schema fields - STORE IN KES
                Listing_Price: currency === 'KES' ? price : price * 150, // Convert to KES
                Listing_Currency: "KES", // Always store in KES
                Listing_Store_Name: "Amazon",
                Listing_URL: url ? (url.startsWith("http") ? url : `https://amazon.com${url}`) : "",
                Listing_Image_URL: image || "",
                
                // Additional fields for debugging
                originalPrice: price,
                originalCurrency: currency,
                rating: rating,
                
                // Keep original fields for compatibility
                name: name,
                price: currency === 'KES' ? price : price * 150, // Convert to KES
                currency: "KES", // Always KES
                store: "Amazon",
                url: url ? (url.startsWith("http") ? url : `https://amazon.com${url}`) : "",
                image: image || "",
              };
            } catch (e) {
              console.log("Error parsing product:", e);
              return null;
            }
          })
          .filter(product => product && product.Product_Name && product.Product_Name.length > 3);
      }
    );

    console.log(`📦 Raw products found: ${products.length}`);

    // Debug: Show what we found with currency info
    if (products.length > 0) {
      console.log("\n🔍 DEBUG - First 3 products found:");
      products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i+1}. Product_Name: "${p.Product_Name}"`);
        console.log(`      Original Price: ${p.originalPrice} ${p.originalCurrency}`);
        console.log(`      Final Price: KES ${p.Listing_Price}`);
        console.log(`      Listing_URL: ${p.Listing_URL ? 'Yes' : 'No'}`);
      });
    }

    // Now normalizeProduct will work correctly
    const normalized = products.map((p) => normalizeProduct(p, "Amazon"));
    const filtered = filterRelevantProducts(normalized, searchTerm);

    const time = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`✅ Done. ${filtered.length} relevant products in ${time}s`);

    return filtered;
  } catch (err) {
    console.error(`❌ Amazon scraper failed:`, err.message);
    return [];
  } finally {
    await browser.close();
    console.log("🔒 Browser closed (Amazon)");
  }
}