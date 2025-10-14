import { fetchEbayProducts } from "../ProductsSource/ebayApi.js";
import { fetchJumiaProducts } from "../ProductsSource/jumiaPuppeteer.js";
import { fetchKilimallProducts } from "../ProductsSource/kilimallPuppeteer.js";
import { scrapeAmazon } from "../ProductsSource/amazonPuppeteer.js";
import { normalizeProduct } from "../Utils/productUtils.js";
import pLimit from "p-limit";
import { spawn } from "child_process";

const limit = pLimit(2);

// Helper to run scrapers with timeouts
const withTimeout = (promise, timeoutMs, storeName) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${storeName} timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);

// ✅ Python AI Matcher – batch comparison
const runAIMatcher = (products) => {
  return new Promise((resolve, reject) => {
    const py = spawn("python", [
      "D:/Desktop/Project_Implementation/Online_Price_Tracker_and_Comparison_Tool/Server/Ai/ai_matcher.py",
      JSON.stringify(products),
    ]);

    let output = "";
    let errorOutput = "";

    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (err) => (errorOutput += err.toString()));

    py.on("close", (code) => {
      if (errorOutput) console.error("AI Error:", errorOutput);
      try {
        const result = JSON.parse(output || "[]");
        resolve(result);
      } catch (err) {
        reject(new Error("Failed to parse AI output: " + err.message));
      }
    });
  });
};

// ✅ Main service: scrape + match
export const fetchAllStoresProducts = async ({ query, stores }) => {
  const results = {};
  const errors = {};
  const performance = {};

  const scrapeSources = {
    jumia: { fn: fetchJumiaProducts, timeout: 120000 },
    ebay: { fn: fetchEbayProducts, timeout: 30000 },
    kilimall: { fn: fetchKilimallProducts, timeout: 60000 },
    amazon: { fn: scrapeAmazon, timeout: 120000 },
  };

  // Select stores to scrape
  const selectedSources =
    stores && stores.length
      ? stores.map((name) => ({ name, ...scrapeSources[name] }))
      : Object.entries(scrapeSources).map(([name, cfg]) => ({
          name,
          ...cfg,
        }));

  // Run scrapers in parallel (2 at a time)
  await Promise.allSettled(
    selectedSources.map(({ name, fn, timeout }) =>
      limit(async () => {
        const start = Date.now();
        try {
          const data = await withTimeout(fn(query), timeout, name);
          const end = Date.now();
          performance[name] = `${end - start}ms`;

          results[name] = data?.length
            ? data.map((p) => normalizeProduct(p, name))
            : [];
          if (!data?.length) errors[name] = "No products found";
        } catch (err) {
          const end = Date.now();
          performance[name] = `${end - start}ms`;
          errors[name] = err.message;
          results[name] = [];
        }
      })
    )
  );

  // Merge all results
  const allProducts = Object.values(results).flat();
  if (!allProducts.length) {
    return {
      query,
      totalProducts: 0,
      groupedProducts: [],
      performance,
      errors,
    };
  }

  console.log(`🧠 Sending ${allProducts.length} products to AI matcher...`);

  // ✅ Run single AI batch matcher
  let groupedProducts = [];
  try {
    groupedProducts = await runAIMatcher(allProducts);
    console.log(`🤖 AI matched ${groupedProducts.length} product groups`);
  } catch (err) {
    console.error("AI Matching failed:", err.message);
  }

  return {
    query,
    totalProducts: allProducts.length,
    groupedProducts,
    performance,
    errors: Object.keys(errors).length ? errors : undefined,
  };
};
