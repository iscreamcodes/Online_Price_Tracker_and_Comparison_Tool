// debugMasokoGraphQL.js
import { chromium } from "playwright";

async function debugMasokoGraphQL(searchTerm = "Samsung Galaxy") {
  console.log(`🚀 Debugging GraphQL for "${searchTerm}"...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // ✅ Intercept and log GraphQL requests
  page.on("request", async (req) => {
    if (req.url().includes("masoko.com/graphql") && req.method() === "POST") {
      try {
        const postData = req.postData();
        console.log("\n📡 GraphQL Request Detected:");
        console.log("🔗 URL:", req.url());
        console.log("📤 Request body:");
        console.log(postData);
      } catch (err) {
        console.warn("⚠️ Failed to read request data:", err.message);
      }
    }
  });

  // Optional: show JSON responses too (for debugging)
  page.on("response", async (res) => {
    if (res.url().includes("masoko.com/graphql")) {
      try {
        const json = await res.json();
        console.log("📥 Response keys:", Object.keys(json));
        if (json.data?.search?.items?.length)
          console.log("✅ Found", json.data.search.items.length, "items in response!");
      } catch {}
    }
  });

  const searchUrl = `https://www.masoko.com/search-results?query=${encodeURIComponent(searchTerm)}`;
  console.log("🌍 Navigating to:", searchUrl);

  await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(5000);

  console.log("✅ Page loaded, waiting for GraphQL calls...");
  await page.waitForTimeout(7000);

  await browser.close();
  console.log("🧹 Browser closed.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  debugMasokoGraphQL();
}
