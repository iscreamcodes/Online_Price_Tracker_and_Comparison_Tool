// Tester.js - Create this file in your Server directory
import { fetchKilimallProducts, testKilimallAPI } from "./ProductsSource/kilimallApi.js";

async function main() {
  console.log("🧪 Starting Kilimall API Test with Correct Endpoints\n");
  
  // Test specific query with timing
  console.log("1. Testing 'samsung phone' search:");
  const startTime = Date.now();
  const products = await fetchKilimallProducts("samsung phone");
  const duration = Date.now() - startTime;
  
  console.log(`✅ Found ${products.length} products for "samsung phone" in ${duration}ms\n`);
  
  // Show product details
  if (products.length > 0) {
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Price: KES ${p.price} | Rating: ${p.rating || 'N/A'}`);
      console.log(`   Image: ${p.image ? '✅' : '❌'} | URL: ${p.url ? '✅' : '❌'}\n`);
    });
  } else {
    console.log("❌ No relevant Samsung products found");
  }
  
  // Run comprehensive test
  console.log("\n2. Running comprehensive test:");
  await testKilimallAPI();
}

main().catch(console.error);