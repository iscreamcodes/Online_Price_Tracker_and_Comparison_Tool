import { chromium } from "playwright";
import { performance } from "perf_hooks";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** 🧹 Filter products by query words to remove irrelevant items */
function filterRelevantProducts(products, query) {
  if (!query || !products.length) return products;

  const queryWords = query
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  if (!queryWords.length) return products;

  return products.filter((p) =>
    queryWords.every((word) => p.name.toLowerCase().includes(word))
  );
}

export async function fetchJumiaProducts(searchTerm = "laptop") {
  console.log(`🚀 Starting Jumia scraper for "${searchTerm}"...`);
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

  // Block non-essential resources
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    const url = route.request().url();
    if (
      ["image", "font", "stylesheet", "media", "other"].includes(type) ||
      url.includes("analytics") ||
      url.includes("ads") ||
      url.includes("tracking")
    ) {
      route.abort();
    } else route.continue();
  });

  const searchUrl = `https://www.jumia.co.ke/catalog/?q=${encodeURIComponent(
    searchTerm
  )}`;
  console.log(`🌍 Navigating to: ${searchUrl}`);

  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Accept cookies if popup appears
    const cookieButton = await page.locator('button:has-text("accept")').first();
    if (await cookieButton.isVisible()) {
      await cookieButton.click();
      console.log("🍪 Accepted cookies popup");
    }

    // Light scroll to trigger lazy-load
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(300);
    }

    console.log("⏳ Extracting products...");

    let products = await page.$$eval("article.prd, .c-prd", (elements) =>
      elements
        .map((el) => {
          // --- FIXED NAME EXTRACTION ---
          const name =
            el.querySelector("h3.name")?.textContent?.trim() ||
            el.querySelector("div.info h3")?.textContent?.trim() ||
            el.querySelector("h3")?.textContent?.trim() ||
            "";
    
          // PRICE
          const priceText = el.querySelector(".prc")?.textContent || "";
          const price = parseInt(priceText.replace(/[^\d]/g, ""), 10) || 0;
    
          // IMAGE
          const imgEl = el.querySelector("img");
          let image =
            imgEl?.getAttribute("data-src") ||
            imgEl?.getAttribute("data-image") ||
            imgEl?.getAttribute("src") ||
            null;
    
          if (image?.startsWith("//")) image = "https:" + image;
    
          // URL
          let url = el.querySelector("a.core")?.href || null;
          if (url?.startsWith("/")) url = "https://www.jumia.co.ke" + url;
    
          return name && price
            ? { name, price, currency: "KES", store: "Jumia", image, url }
            : null;
        })
        .filter(Boolean)
    );
    

    // 🔍 FILTER RELEVANT PRODUCTS
    products = filterRelevantProducts(products, searchTerm);

    const duration = ((performance.now() - start) / 1000).toFixed(2);
    console.log(`✅ Extracted ${products.length} relevant products in ${duration}s`);

    const withImages = products.filter((p) => p.image).length;
    console.log(`📸 Products with valid images: ${withImages}/${products.length}`);

    return products;
  } catch (err) {
    console.error("❌ Error scraping Jumia:", err.message);
    return [];
  } finally {
    await browser.close();
    console.log("🧹 Browser closed (Jumia)");
  }
}

// Standalone test
if (import.meta.url === `file://${process.argv[1]}`) {
  const term = process.argv[2] || "laptop";
  fetchJumiaProducts(term)
    .then((products) => {
      console.log(`✅ Found ${products.length} relevant Jumia products`);
      products.slice(0, 5).forEach((p, i) => console.log(`${i + 1}. ${p.name}`));
    })
    .catch(console.error);
}
