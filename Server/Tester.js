// TesterAmazon.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function debugAmazonScraper(searchTerm = "laptop") {
  console.log(`🚀 Starting Amazon debug scraper for "${searchTerm}"...`);
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
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
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await delay(3000);

    // 🧠 Detect if Amazon is blocking you with captcha
    const pageTitle = await page.title();
    const currentUrl = await page.url();

    if (pageTitle.toLowerCase().includes("robot") || currentUrl.includes("captcha")) {
      console.log("⚠️ Amazon captcha detected — screenshot saved as amazon-captcha.png");
      await page.screenshot({ path: "amazon-captcha.png", fullPage: true });
      return;
    }

    // 🧭 Scroll to load all results
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 200);
      });
    });
    await delay(2000);

    // 📦 Extract products - FIXED URL EXTRACTION
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-component-type="s-search-result"]'));

      return items.slice(0, 10).map((el) => {
        const title =
          el.querySelector("h2 a span")?.textContent?.trim() ||
          el.querySelector("h2")?.textContent?.trim() ||
          null;

        // ✅ IMPROVED: Extract ASIN and build direct product URL
        let url = null;
        const asin = el.getAttribute('data-asin');
        
        if (asin) {
          // Build direct product URL using ASIN
          url = `https://www.amazon.com/dp/${asin}`;
        } else {
          // Fallback: Try to extract from href and parse
          const linkElement = el.querySelector("h2 a, a.a-link-normal");
          if (linkElement) {
            const href = linkElement.getAttribute("href");
            if (href) {
              // Extract ASIN from href if present
              const asinMatch = href.match(/\/dp\/([A-Z0-9]{10})/);
              if (asinMatch) {
                url = `https://www.amazon.com/dp/${asinMatch[1]}`;
              } else if (href.includes('/dp/')) {
                // Clean up sponsored links
                const cleanHref = href.split('?')[0];
                url = cleanHref.startsWith('/') ? 'https://www.amazon.com' + cleanHref : cleanHref;
              }
            }
          }
        }

        const image =
          el.querySelector("img.s-image")?.src ||
          el.querySelector("img")?.getAttribute("src") ||
          null;

        // ✅ FIXED PRICE EXTRACTION - Handle KES to USD conversion
        let price = null;
        const priceText = el.querySelector(".a-price .a-offscreen")?.textContent?.trim() || "";
        
        // Check if price is in KES (Kenyan Shilling)
        if (priceText.includes('KES')) {
          const kesMatch = priceText.match(/KES\s*([\d,]+\.?\d*)/);
          if (kesMatch) {
            const kesAmount = parseFloat(kesMatch[1].replace(/,/g, ''));
            // Convert KES to USD (approximate conversion rate ~100 KES = 1 USD)
            price = kesAmount / 100;
          }
        } else {
          // Handle USD prices
          const usdMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (usdMatch) {
            price = parseFloat(usdMatch[1].replace(/,/g, ''));
          }
        }

        return {
          name: title,
          price: price,
          currency: "USD",
          image,
          url: url || "Product URL not available",
          asin: asin || "No ASIN"
        };
      });
    });

    console.log(`\n✅ Found ${products.length} products`);
    console.log(JSON.stringify(products, null, 2));

  } catch (err) {
    console.error("❌ Error during Amazon scraping:", err.message);
    await page.screenshot({ path: "amazon-error.png", fullPage: true });
  } finally {
    await browser.close();
    console.log("✅ Browser closed");
  }
}

const term = process.argv[2] || "laptop";
debugAmazonScraper(term);