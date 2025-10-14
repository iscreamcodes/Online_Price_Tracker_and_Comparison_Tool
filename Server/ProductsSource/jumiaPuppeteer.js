// jumiaPuppeteer.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJumiaProducts(searchTerm = "laptop") {
  const browser = await puppeteer.launch({
    headless: true, // set to false if you want to see the browser
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
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
    const searchUrl = `https://www.jumia.co.ke/catalog/?q=${encodeURIComponent(searchTerm)}`;
    console.log(`🌍 Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 120000 });
    await delay(2000);

    // 🍪 Handle cookies popup
    const cookieAccepted = await page.evaluate(() => {
      const acceptButton = Array.from(document.querySelectorAll("button")).find((btn) =>
        btn.textContent?.toLowerCase().includes("accept cookies")
      );
      if (acceptButton) {
        acceptButton.click();
        return true;
      }
      return false;
    });

    if (cookieAccepted) {
      console.log("🍪 Accepted cookies popup");
      await delay(2000);
    }

    // 🧭 Scroll for lazy-loaded products
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 500;
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

    console.log("⏳ Extracting products...");
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("article.prd, .c-prd"));
      return items
        .map((el) => {
          const name =
            el.querySelector("h3.name")?.textContent?.trim() ||
            el.querySelector("h3")?.textContent?.trim() ||
            null;

          const priceText =
            el.querySelector(".prc")?.textContent?.replace(/[^\d]/g, "") || null;
          const price = priceText ? parseInt(priceText, 10) : null;

          const image =
            el.querySelector("img")?.getAttribute("data-src") ||
            el.querySelector("img")?.src ||
            null;

          const linkElement = el.querySelector("a.core") || el.querySelector("a[href]");
          let url = linkElement?.href || null;
          if (url && url.startsWith("/")) url = "https://www.jumia.co.ke" + url;

          return name && price && url
            ? {
                name,
                price,
                currency: "KES",
                store: "Jumia",
                rating: null,
                image,
                url,
                last_checked: new Date(),
              }
            : null;
        })
        .filter(Boolean);
    });

    console.log(`✅ Extracted ${products.length} products from Jumia`);
    return products;
  } catch (error) {
    console.error("❌ Error scraping Jumia:", error.message);
    return [];
  } finally {
    await browser.close();
  }
}

// 🧪 For quick testing (run: node jumiaPuppeteer.js laptop)
if (import.meta.url === `file://${process.argv[1]}`) {
  const term = process.argv[2] || "laptop";
  fetchJumiaProducts(term)
    .then((products) => {
      console.log(`✅ Found ${products.length} Jumia products`);
      console.log(products.slice(0, 5)); // preview first few
    })
    .catch(console.error);
}
