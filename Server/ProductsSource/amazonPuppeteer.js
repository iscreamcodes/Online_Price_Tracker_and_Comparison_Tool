import { chromium } from "playwright";
import { normalizeProduct } from "../Utils/productUtils.js";
import { performance } from "perf_hooks";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// 🎯 LENIENT FILTERING - Fixes spelling issues
function filterRelevantProducts(products, query) {
  if (!query || !products.length) return products;

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(" ").filter(word => word.length > 2);

  if (!queryWords.length) return products;

  return products.filter((p) => {
    const productName = (p.name || "").toLowerCase();
    
    // 🎯 LENIENT MATCHING - Handle spelling variations
    let matches = 0;
    
    for (const word of queryWords) {
      // Exact match
      if (productName.includes(word)) {
        matches++;
        continue;
      }
      
      // 🎯 HANDLE COMMON SPELLING MISTAKES
      if (word === "vaccum" && productName.includes("vacuum")) {
        matches++;
        continue;
      }
      if (word === "vacuum" && productName.includes("vaccum")) {
        matches++;
        continue;
      }
      
      // Partial word matching
      for (const productWord of productName.split(/\s+/)) {
        if (productWord.includes(word) || word.includes(productWord)) {
          matches++;
          break;
        }
      }
    }
    
    // 🎯 LOWER THRESHOLD - Keep products that match at least one word
    return matches >= 1;
  });
}

export async function scrapeAmazon(searchTerm = "laptop") {
  console.log(`🚀 Scraping Amazon for "${searchTerm}"...`);
  const start = performance.now();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    viewport: { width: 1366, height: 768 },
  });

  // 🎯 LESS AGGRESSIVE BLOCKING - Allow more resources for Amazon
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    const url = route.request().url();
    
    // Only block heavy images and trackers
    if (type === "image" && !url.includes("amazon.com/images")) {
      route.abort();
    } else if (url.includes("google-analytics") || url.includes("adsystem")) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`;
    console.log(`🌍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // 🎯 BETTER WAITING FOR AMAZON
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });
    
    // Scroll to load more products
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await delay(500);
    }

    console.log("⏳ Extracting products...");

    // 🎯 BETTER AMAZON SELECTORS
    const products = await page.$$eval(
      '[data-component-type="s-search-result"]',
      (elements, searchTerm) => {
        return elements
          .map((el) => {
            try {
              const name =
                el.querySelector("h2 a span")?.textContent?.trim() ||
                el.querySelector("h2")?.textContent?.trim() ||
                el.querySelector(".a-text-normal")?.textContent?.trim();
              
              const linkElement = el.querySelector("h2 a") || el.querySelector("a.a-link-normal");
              const link = linkElement?.href;
              
              const image =
                el.querySelector("img.s-image")?.src ||
                el.querySelector("img")?.src;
              
              const priceText =
                el.querySelector(".a-price .a-offscreen")?.textContent ||
                el.querySelector(".a-price-whole")?.textContent ||
                el.querySelector(".a-color-base")?.textContent ||
                "0";
              
              const ratingText = el.querySelector(".a-icon-alt")?.textContent;
              const rating = ratingText ? parseFloat(ratingText.split(" ")[0]) : null;

              let price = null;
              if (priceText && priceText !== "0") {
                const match = priceText.replace(/[^\d.,]/g, "").match(/[\d.,]+/);
                if (match) price = parseFloat(match[0].replace(/,/g, ""));
              }

              // 🎯 BETTER VALIDATION
              if (name && price && price > 0 && image && link) {
                return {
                  name,
                  price,
                  currency: "USD", // Amazon is always USD
                  image,
                  url: link.startsWith("http") ? link : `https://amazon.com${link}`,
                  rating,
                  store: "Amazon",
                };
              }
            } catch (e) {
              // Silent fail for individual products
            }
            return null;
          })
          .filter(Boolean);
      },
      searchTerm
    );

    console.log(`📦 Raw Amazon results: ${products.length} products`);
    
    // 🎯 DEBUG: Show what Amazon found before filtering
    if (products.length > 0) {
      console.log("🔍 Amazon raw products (before filtering):");
      products.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} - $${p.price}`);
      });
    }

    const normalized = products.map((p) => normalizeProduct(p));

    // 🔍 LENIENT FILTERING
    const filtered = filterRelevantProducts(normalized, searchTerm);

    const duration = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`✅ Extracted ${filtered.length} relevant products in ${duration}s`);

    // 🎯 DEBUG: Show final results
    if (filtered.length === 0 && products.length > 0) {
      console.log("⚠️  All products were filtered out. Check filtering logic.");
    }

    return filtered;
  } catch (err) {
    console.error(`❌ Amazon scraper error: ${err.message}`);
    return [];
  } finally {
    await browser.close();
    console.log("✅ Browser closed (Amazon)");
  }
}

// 🧪 Standalone test with debug
if (import.meta.url === `file://${process.argv[1]}`) {
  const term = process.argv[2] || "vacuum cleaner";
  console.log(`🧪 Testing Amazon with: "${term}"`);
  scrapeAmazon(term).then((products) => {
    console.log(`\n🎉 Final: ${products.length} products:`);
    products.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} - $${p.price}`);
    });
  });
}