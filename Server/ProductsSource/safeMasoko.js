import { scrapeMasoko } from "./masokoPuppeteer.js";

export async function safeScrapeMasoko(term, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`\n🌀 Attempt ${attempt}/${maxRetries} for Masoko...`);
    try {
      const products = await scrapeMasoko(term, 2);
      if (products.length > 0) {
        console.log(`✅ Masoko success on attempt ${attempt}: ${products.length} products`);
        return products;
      }
      console.log(`❌ Attempt ${attempt}: No products found`);
      if (attempt < maxRetries) {
        const backoff = 1500 * attempt; // 1.5 s / 3 s
        console.log(`⏳ Waiting ${backoff} ms before retry...`);
        await new Promise((r) => setTimeout(r, backoff));
      }
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed:`, err.message);
      if (attempt === maxRetries) console.error("💥 All Masoko attempts failed");
    }
  }
  return [];
}

// 🧪 Stand-alone test
if (import.meta.url === `file://${process.argv[1]}`) {
  safeScrapeMasoko("Samsung Galaxy").then((p) => {
    console.log(`\n📊 FINAL RESULTS: ${p.length} products`);
    console.log("Sample products:", p.slice(0, 3));
  });
}

