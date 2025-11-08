import { chromium } from "playwright";
import { normalizeProduct } from "../Utils/productUtils.js";

// 🧹 Filter products by query words to remove irrelevant items
function filterRelevantProducts(products, query) {
  if (!query || !products.length) return products;

  const queryWords = query
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  if (!queryWords.length) return products;

  return products.filter((p) =>
    queryWords.every((word) =>
      (p.title || p.name || "").toLowerCase().includes(word)
    )
  );
}

export async function fetchJijiProducts(searchQuery, maxProducts = 30) { // 🎯 CHANGED FROM 10 TO 30
  console.log(`🔍 Fetching Jiji products for: "${searchQuery}"...`);
  const startTime = Date.now();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    viewport: { width: 1366, height: 768 },
  });

  // Block heavy/irrelevant requests
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "font", "stylesheet", "media"].includes(type)) route.abort();
    else route.continue();
  });

  const searchUrl = `https://jiji.co.ke/search?query=${encodeURIComponent(searchQuery)}`;
  console.log(`🌍 Navigating to: ${searchUrl}`);
  await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 40000 });

  await page.waitForSelector(".b-list-advert__gallery__item", { timeout: 15000 });

  // 🎯 GET ALL PRODUCTS WITHOUT SLICING FIRST
  const allListings = await page.$$eval(
    ".b-list-advert__gallery__item",
    (els) =>
      els.map((el) => {
        const title =
          el.querySelector(".b-advert-title-inner")?.textContent?.trim() || "No title";
        const linkPart = el.querySelector("a")?.getAttribute("href") || "";
        const link = linkPart.startsWith("https")
          ? linkPart
          : `https://jiji.co.ke${linkPart}`;
        const image = el.querySelector("img")?.src || "";
        
        // Try to get price from listing page to avoid unnecessary detail page visits
        const priceText = el.querySelector(".qa-advert-price, .b-list-advert-base__item-price")?.textContent?.trim() || "N/A";
        
        return { title, link, image, priceText };
      })
  );

  console.log(`🔗 Found ${allListings.length} total product links`);

  // 🎯 APPLY LIMIT AFTER GETTING ALL LISTINGS
  const listings = allListings.slice(0, maxProducts);
  console.log(`🔗 Scraping ${listings.length} product links — scraping details...`);

  const results = [];
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });

  // 🎯 BATCH PROCESSING FOR BETTER PERFORMANCE
  const batchSize = 5;
  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (item, batchIndex) => {
        const globalIndex = i + batchIndex + 1;
        const detailPage = await context.newPage();
        try {
          await detailPage.goto(item.link, { waitUntil: "domcontentloaded", timeout: 15000 });

          const details = await detailPage.evaluate(() => {
            const price =
              document.querySelector(".qa-advert-price-view-value")?.textContent?.trim() ||
              document.querySelector(".qa-advert-price")?.textContent?.trim() ||
              "N/A";
            const description =
              document.querySelector(".qa-advert-description .qa-description-text")?.textContent?.trim() ||
              "";
            return { price, description };
          });

          // Use detail page price if available, otherwise use listing page price
          const finalPrice = details.price !== "N/A" ? details.price : item.priceText;
          
          results.push({ 
            ...item, 
            price: finalPrice,
            description: details.description,
            source: "Jiji" 
          });
          console.log(`✅ [${globalIndex}/${listings.length}] Scraped: ${item.title}`);
        } catch (err) {
          console.warn(`⚠️ [${globalIndex}/${listings.length}] Failed: ${item.title} (${err.message})`);
          // Still add the product with listing page data
          results.push({ 
            ...item, 
            price: item.priceText,
            description: "",
            source: "Jiji" 
          });
        } finally {
          await detailPage.close();
        }
      })
    );
  }

  await context.close();
  await browser.close();

  const normalized = results.map((p) => normalizeProduct(p, "jiji"));

  // 🔍 FILTER RELEVANT PRODUCTS
  const filtered = filterRelevantProducts(normalized, searchQuery);

  console.log(
    `🎯 Extracted ${filtered.length} verified & relevant products from Jiji in ${(
      (Date.now() - startTime) /
      1000
    ).toFixed(2)}s`
  );

  // 🎯 DEBUG: Show what we found
  console.log(`\n📊 Jiji Results Breakdown:`);
  filtered.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.name} - ${product.price} KES`);
  });

  return filtered;
}

// 🧪 Standalone test
if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv[2] || "vacuum cleaner";
  fetchJijiProducts(query, 20).then((data) => { // 🎯 Test with 20 products
    console.log(`\n🎉 Found ${data.length} listings:`);
    data.forEach((item, i) => {
      console.log(`${i + 1}. ${item.name} - ${item.price} KES`);
    });
  });
}