import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function scrapeAmazon(searchTerm = "laptop") {
  console.log(`🚀 Scraping Amazon for "${searchTerm}"...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`;
    console.log(`🌍 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
    await delay(3000);

    // 🧠 Detect if Amazon is blocking with captcha
    const title = await page.title();
    const currentUrl = await page.url();
    if (title.toLowerCase().includes("robot") || currentUrl.includes("captcha")) {
      console.log("⚠️ Captcha detected. Screenshot saved as amazon-captcha.png");
      await page.screenshot({ path: "amazon-captcha.png", fullPage: true });
      return [];
    }

    // 🧭 Scroll down to load more results
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
    await delay(2000);

    // 📦 Extract products
    const products = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('[data-component-type="s-search-result"]')
      );

      return items.map((el) => {
        const title =
          el.querySelector("h2 a span")?.textContent?.trim() ||
          el.querySelector("h2")?.textContent?.trim() ||
          null;

        // ✅ Extract ASIN and build product URL
        const asin = el.getAttribute("data-asin");
        let url = asin ? `https://www.amazon.com/dp/${asin}` : null;

        if (!url) {
          const linkEl = el.querySelector("h2 a, a.a-link-normal");
          const href = linkEl?.getAttribute("href");
          if (href) {
            const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
            if (asinMatch) url = `https://www.amazon.com/dp/${asinMatch[1]}`;
            else if (href.startsWith("/"))
              url = "https://www.amazon.com" + href.split("?")[0];
          }
        }

        // 🖼️ Image
        const image =
          el.querySelector("img.s-image")?.src ||
          el.querySelector("img")?.getAttribute("src") ||
          null;

        // 💰 Extract price
        let price = null;
        const priceText =
          el.querySelector(".a-price .a-offscreen")?.textContent?.trim() || "";
        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        if (priceMatch) price = parseFloat(priceMatch[0].replace(/,/g, ""));

        // 💵 Currency detection
        const currency = priceText.includes("KES") ? "KES" : "USD";

        return {
          name: title || "No title",
          price,
          currency,
          image,
          url: url || "No URL",
        };
      });
    });

    console.log(`✅ Extracted ${products.length} products from Amazon`);
    return products.filter((p) => p.name && p.image && p.price);
  } catch (error) {
    console.error("❌ Amazon scraping error:", error.message);
    await page.screenshot({ path: "amazon-error.png", fullPage: true });
    return [];
  } finally {
    await browser.close();
    console.log("✅ Browser closed (Amazon)");
  }
}

// ✅ For quick standalone testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const term = process.argv[2] || "laptop";
  scrapeAmazon(term).then((products) => {
    console.log(`\n🎉 Found ${products.length} products:`);
    console.log(products);
  });
}
