// Server/services/ProductsService.js
import pLimit from "p-limit";
import { fetchJumiaProducts } from "../ProductsSource/jumiaPuppeteer.js";
import { fetchKilimallProducts } from "../ProductsSource/kilimallPuppeteer.js";
import { scrapeAmazon } from "../ProductsSource/amazonPuppeteer.js";
import { safeScrapeMasoko as scrapeMasoko } from "../ProductsSource/safeMasoko.js";
import { fetchJijiProducts } from "../ProductsSource/jijiPuppeteer.js";
import { normalizeProduct } from "../Utils/productUtils.js";

// 🧩 Limit concurrency (avoid browser overload)
const CONCURRENCY = 3;
const limit = pLimit(CONCURRENCY);

/** 🧠 Helper: sanitize and extract query string */
function getQueryString(queryOrObj) {
  if (!queryOrObj) return "";
  if (typeof queryOrObj === "string") return queryOrObj.trim();
  if (typeof queryOrObj === "object") {
    const possibleKeys = ["q", "query", "search"];
    for (const key of possibleKeys) {
      const value = queryOrObj[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  try {
    const str = String(queryOrObj);
    return str !== "[object Object]" ? str : "";
  } catch {
    return "";
  }
}

/** 🚀 Main multi-store aggregator for API (no timeout) */
export async function fetchAllStoresProducts({ query, stores } = {}) {
  const q = getQueryString(query);
  if (!q) throw new Error("❌ Missing search query");

  console.log(`\n🚀 Starting scraping for: "${q}"\n`);

  // 🏪 Active scrapers
  const allScrapers = {
    jumia: fetchJumiaProducts,
    kilimall: fetchKilimallProducts,
    amazon: scrapeAmazon,
   // masoko: scrapeMasoko,
    jiji: fetchJijiProducts,
  };

  const activeScrapers = stores?.length
    ? Object.fromEntries(Object.entries(allScrapers).filter(([k]) => stores.includes(k)))
    : allScrapers;

  const normalizedPerStore = {};
  const performance = {};
  const errors = {};

  // ⚙️ Run scrapers with concurrency
  const tasks = Object.entries(activeScrapers).map(([store, fn]) =>
    limit(async () => {
      const start = Date.now();
      try {
        const products = await fn(q);

        // Log each product individually
        products.forEach((p, idx) =>
          console.log(`[${store}] Product ${idx + 1}: ${p.name || p.title || "Unnamed"} - ${p.price || "N/A"}${p.currency ? " " + p.currency : ""}`)
        );

        normalizedPerStore[store] = products.map((p) => normalizeProduct(p, store));
        const duration = Date.now() - start;
        performance[store] = `${duration}ms`;
      } catch (err) {
        errors[store] = err.message || String(err);
        normalizedPerStore[store] = [];
        const duration = Date.now() - start;
        performance[store] = `${duration}ms`;
        console.error(`❌ Error scraping ${store}: ${err.message || err}`);
      }
    })
  );

  await Promise.all(tasks);

  // 📦 Flatten products
  const allProducts = Object.values(normalizedPerStore).flat();

  // Log summary for debugging
  console.log("\n📊 Scraping Summary:");
  Object.entries(normalizedPerStore).forEach(([store, products]) => {
    console.log(`   ⏱️ ${store}: ${performance[store]} (${products.length} items)`);
  });
  if (Object.keys(errors).length) console.warn("⚠️ Scraper errors:", errors);

  // 🧠 Basic identity grouping
  const groupedProducts = allProducts.map((p) => ({ baseProduct: p, products: [p] }));

  return {
    query: q,
    totalProducts: allProducts.length,
    groupedProducts,
    performance,
    errors: Object.keys(errors).length ? errors : undefined,
  };
}
