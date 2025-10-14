import puppeteer from "puppeteer";

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true, // change to false if you want to see it
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function fetchKilimallProducts(query = "laptop") {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const url = `https://www.kilimall.co.ke/search?q=${encodeURIComponent(query)}&page=1&source=search|enterSearch|${encodeURIComponent(query)}`;
  console.log("Navigating to:", url);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });

  // wait a bit for JS-rendered content
  await new Promise((r) => setTimeout(r, 5000));

  await page.waitForSelector(".product-item", { timeout: 30000 });

  const products = await page.evaluate(() => {
    const items = document.querySelectorAll(".product-item");
    return Array.from(items).slice(0, 15).map((el) => {
      const name =
        el.querySelector(".title, .product-title, h2")?.innerText.trim() || "Untitled";

      const rawPrice =
        el.querySelector(".price, .price-current, .product-price")?.innerText.trim() ||
        el.innerText.match(/KSh\s?[\d,]+/i)?.[0] ||
        "";

      const price = parseInt(rawPrice.replace(/[^\d]/g, ""), 10) || 0;

      const image =
        el.querySelector("img")?.getAttribute("data-src") ||
        el.querySelector("img")?.getAttribute("src") ||
        "";

      const url = el.querySelector("a")?.href || "";

      const rating =
        el.querySelector(".star")?.innerText?.trim() ||
        el.querySelector(".rating")?.innerText?.trim() ||
        null;

      return {
        name,
        price,
        currency: "KES",
        image,
        url,
        rating,
        store: "Kilimall",
      };
    });
  });

  console.log(`✅ Extracted ${products.length} products from Kilimall`);
  await page.close();
  return products;
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// For standalone testing:
if (process.argv[1].includes("kilimallPuppeteer.js")) {
  const query = "laptop";
  fetchKilimallProducts(query)
    .then((products) => {
      console.log("Sample products:", products.slice(0, 3));
      return closeBrowser();
    })
    .catch((err) => {
      console.error("❌ Error:", err);
      return closeBrowser();
    });
}
