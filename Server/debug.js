// debugKilimall.js
import { fetchKilimallProducts } from "./ProductsSource/kilimallPuppeteer.js";

async function debugKilimall() {
  const searchTerm = "iphone 16";
  console.log(`🔍 Debugging Kilimall scraper for: "${searchTerm}"\n`);
  
  try {
    const browser = await import('playwright').then(p => p.chromium.launch({ 
      headless: false, // Set to true to see browser
      slowMo: 500
    }));
    
    const page = await browser.newPage();
    
    const url = `https://www.kilimall.co.ke/?q=${encodeURIComponent(searchTerm)}`;
    console.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for results - try multiple selectors
    const selectors = [
      '.goods-item',
      '.product-item',
      '[class*="item"]',
      '[class*="product"]',
      '.item'
    ];
    
    let foundSelector = null;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        foundSelector = selector;
        console.log(`✅ Found products using selector: "${selector}"`);
        break;
      } catch (e) {
        console.log(`❌ Selector "${selector}" not found`);
      }
    }
    
    if (!foundSelector) {
      console.log("🔍 No product selectors found, checking page content...");
      const bodyText = await page.textContent('body');
      console.log(`📄 Page text sample: ${bodyText.substring(0, 200)}...`);
    }
    
    // Extract raw HTML to see what's available
    const sampleHtml = await page.$$eval(foundSelector || 'body', (elements, limit = 3) => {
      return elements.slice(0, limit).map((el, index) => {
        // Try multiple selectors for name
        const nameSelectors = [
          '.title',
          '.name',
          'h3',
          'h4',
          '[class*="title"]',
          '[class*="name"]',
          'a'
        ];
        
        let name = 'Not found';
        for (const selector of nameSelectors) {
          const element = el.querySelector(selector);
          if (element && element.textContent?.trim()) {
            name = element.textContent.trim();
            break;
          }
        }
        
        // Try multiple selectors for URL
        const linkSelectors = [
          'a',
          '.image a',
          '.thumb a'
        ];
        
        let url = 'Not found';
        for (const selector of linkSelectors) {
          const element = el.querySelector(selector);
          if (element && element.href) {
            url = element.href;
            break;
          }
        }
        
        // Get price
        const priceSelectors = [
          '.price',
          '.cost',
          '.money',
          '[class*="price"]'
        ];
        
        let price = 'Not found';
        for (const selector of priceSelectors) {
          const element = el.querySelector(selector);
          if (element && element.textContent?.trim()) {
            price = element.textContent.trim();
            break;
          }
        }
        
        return {
          index: index + 1,
          name,
          url,
          price,
          html: el.outerHTML.substring(0, 300) + '...'
        };
      });
    });
    
    console.log("\n🔍 DEBUG DATA FROM KILIMALL:");
    sampleHtml.forEach(item => {
      console.log(`\n${item.index}. Name: "${item.name}"`);
      console.log(`   URL: ${item.url}`);
      console.log(`   Price: ${item.price}`);
      console.log(`   HTML sample: ${item.html}`);
    });
    
    await browser.close();
    
  } catch (error) {
    console.log(`💥 Debug failed: ${error.message}`);
  }
}

debugKilimall();