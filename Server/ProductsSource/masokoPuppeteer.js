// scrapeMasoko.js — Optimized and reliable Masoko scraper
import { chromium } from "playwright";

export async function scrapeMasoko(searchTerm = "Samsung Galaxy", maxPages = 2) {
  console.log(`🚀 Scraping Masoko (GraphQL mode) for "${searchTerm}"...`);
  const baseUrl = `https://www.masoko.com/search-results?query=${encodeURIComponent(searchTerm)}`;
  const graphqlEndpoint = "https://masoko.com/graphql";

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  const allProducts = [];

  console.time("Masoko Scrape Time");

  try {
    // 🎯 Listen for GraphQL responses
    page.on("response", async (response) => {
      if (response.url().includes(graphqlEndpoint) && response.request().method() === "POST") {
        try {
          const json = await response.json();
          const items = json?.data?.search?.items || [];
          for (const item of items) {
            allProducts.push({
              name: item.name?.trim() || "Unknown Product",
              price: parseFloat(item.price) || null,
              image: item.thumbnail?.startsWith("http")
                ? item.thumbnail
                : `https://masoko.com${item.thumbnail || ""}`,
              url: item.url_key
                ? `https://www.masoko.com/catalog/${item.url_key}`
                : `${baseUrl}&page=1`,
              store: "Masoko",
              currency: "KES",
            });
          }
          console.log(`📦 Extracted ${items.length} products from GraphQL response`);
        } catch {}
      }
    });

    // 🔄 Load two pages sequentially (fast but safe)
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const pageUrl = `${baseUrl}&page=${pageNum}`;
      console.log(`📄 Loading page ${pageNum}: ${pageUrl}`);

      try {
        const res = await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 35000 });
        if (!res?.ok()) console.warn(`⚠️ Page ${pageNum} load failed: ${res.status()}`);

        // ⏳ Wait briefly for GraphQL calls (shortened from 2000 → 900 ms)
        await page.waitForTimeout(900);

        const productCount = await page.$$eval(
          ".product-item, [data-product]",
          (els) => els.length
        ).catch(() => 0);
        console.log(`✅ Page ${pageNum} loaded — ${productCount} product elements found`);
      } catch (err) {
        console.warn(`⚠️ Error on page ${pageNum}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Scraping error:", err);
  } finally {
    await context.close();
    await browser.close();
    console.timeEnd("Masoko Scrape Time");
    console.log(`🎯 Total extracted: ${allProducts.length} products`);
  }

  // ✨ Deduplicate by name + price
  const uniqueProducts = allProducts.filter(
    (p, i, self) => i === self.findIndex((x) => x.name === p.name && x.price === p.price)
  );
  console.log(`✨ After deduplication: ${uniqueProducts.length} unique products`);
  return uniqueProducts;
}

// ✅ Retry wrapper with lighter settings
