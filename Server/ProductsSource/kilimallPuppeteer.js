// kilimallPuppeteer.js - REWRITTEN with better filtering
import { chromium } from 'playwright';
import { normalizeProduct } from '../Utils/productUtils.js';

export async function fetchKilimallProducts(searchQuery) {
  console.log(`🛍️ Scraping Kilimall for "${searchQuery}"...`);
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 30000
  });
  
  const page = await browser.newPage();
  const allProducts = [];
  
  try {
    // Navigate to search page
    const searchUrl = `https://www.kilimall.co.ke/search?q=${encodeURIComponent(searchQuery)}&page=1&source=search|enterSearch|${encodeURIComponent(searchQuery)}`;
    console.log(`🌍 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });

    // Wait for products to load
    console.log('⏳ Waiting for products to load...');
    await page.waitForSelector('.goods-item, [class*="product"], [class*="item"]', { timeout: 10000 });
    
    // Extract product information
    console.log('⏳ Extracting products...');
    const products = await page.$$eval('.goods-item, [class*="product"], [class*="item"]', (items, searchTerm) => {
      return items.map(item => {
        try {
          // Try multiple selectors for name
          const name = 
            item.querySelector('.title, .name, .goods-name, [class*="title"], [class*="name"]')?.textContent?.trim() ||
            item.querySelector('a')?.title ||
            item.textContent?.trim();
          
          // Try multiple selectors for price
          const priceText = 
            item.querySelector('.price, .money, .cost, [class*="price"], [class*="cost"]')?.textContent?.trim() ||
            item.querySelector('strong')?.textContent?.trim() ||
            '0';
          
          // Try multiple selectors for image
          const image = 
            item.querySelector('img')?.src ||
            item.querySelector('img')?.getAttribute('data-src') ||
            item.querySelector('[class*="image"] img')?.src ||
            '';
          
          // Try multiple selectors for URL
          const link = item.querySelector('a');
          const url = link?.href ? (link.href.startsWith('http') ? link.href : `https://www.kilimall.co.ke${link.href}`) : '';
          
          // Clean price
          const priceMatch = priceText.replace(/[^\d.]/g, '');
          const price = priceMatch ? parseFloat(priceMatch) : 0;
          
          if (!name || name.length < 2) return null;
          
          return {
            name: name,
            price: price,
            originalPrice: priceText,
            image: image,
            url: url,
            store: 'Kilimall',
            currency: 'KES'
          };
        } catch (error) {
          return null;
        }
      }).filter(Boolean);
    }, searchQuery);

    console.log(`✅ Extracted ${products.length} products from Kilimall`);
    
    // Apply lenient filtering
    const relevantProducts = filterRelevantProducts(products, searchQuery);
    allProducts.push(...relevantProducts);

  } catch (error) {
    console.error('❌ Kilimall scraping error:', error.message);
  } finally {
    await browser.close();
  }

  // Normalize products
  const normalizedProducts = allProducts.map(product => 
    normalizeProduct(product, 'kilimall')
  );

  console.log(`✅ Kilimall completed: ${normalizedProducts.length} relevant products`);
  return normalizedProducts;
}

// 🎯 LENIENT FILTERING - Keeps most products
function filterRelevantProducts(products, searchTerm) {
  if (!products.length) return [];
  
  console.log(`🔍 Filtering ${products.length} Kilimall products for "${searchTerm}"...`);
  
  const searchLower = searchTerm.toLowerCase().trim();
  const searchWords = searchLower.split(/\s+/).filter(word => word.length > 2);
  
  const relevantProducts = products.filter(product => {
    const productName = product.name.toLowerCase();
    
    // 🎯 SCORING SYSTEM - Very lenient
    let score = 0;
    
    // Exact match bonus
    if (productName.includes(searchLower)) {
      score += 100;
    }
    
    // Word-by-word matching
    for (const word of searchWords) {
      if (productName.includes(word)) {
        score += 20;
      } else if (word.length > 3) {
        // Partial word matching
        for (const productWord of productName.split(/\s+/)) {
          if (productWord.includes(word) || word.includes(productWord)) {
            score += 10;
            break;
          }
        }
      }
    }
    
    // Category/keyword bonuses
    const categoryKeywords = ['cleaner', 'vacuum', 'vaccum', 'clean', 'washing', 'home', 'appliance'];
    for (const keyword of categoryKeywords) {
      if (productName.includes(keyword)) {
        score += 5;
      }
    }
    
    product.relevanceScore = score;
    return score >= 10; // Very low threshold - keeps most products
  });
  
  // Sort by relevance
  relevantProducts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  
  console.log(`📊 Relevance breakdown:`);
  products.forEach((p, i) => {
    console.log(`   ${i+1}. [${p.relevanceScore || 0} pts] ${p.name.substring(0, 50)}...`);
  });
  
  console.log(`✅ Kept ${relevantProducts.length} relevant products after filtering`);
  
  return relevantProducts;
}

// 🚀 SIMPLE VERSION - No filtering at all
export async function fetchKilimallProductsSimple(searchQuery) {
  console.log(`🛍️ SIMPLE: Scraping Kilimall for "${searchQuery}"...`);
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const products = [];
  
  try {
    const searchUrl = `https://www.kilimall.co.ke/search?q=${encodeURIComponent(searchQuery)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 15000 });
    
    await page.waitForTimeout(3000);
    
    // Simple extraction without complex filtering
    const extracted = await page.$$eval('.goods-item, .product-item, [class*="item"]', (items) => {
      return items.slice(0, 20).map(item => {
        const name = item.querySelector('.title, .name, .goods-name')?.textContent?.trim() || 'Unknown Product';
        const priceText = item.querySelector('.price, .money')?.textContent?.trim() || '0';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
        const image = item.querySelector('img')?.src || '';
        const url = item.querySelector('a')?.href || '';
        
        return {
          name,
          price,
          image,
          url: url.startsWith('http') ? url : `https://www.kilimall.co.ke${url}`,
          store: 'Kilimall',
          currency: 'KES'
        };
      }).filter(p => p.name && p.name !== 'Unknown Product');
    });
    
    products.push(...extracted);
    
  } catch (error) {
    console.error('❌ Kilimall simple scraping error:', error);
  } finally {
    await browser.close();
  }
  
  console.log(`✅ Kilimall simple: ${products.length} products`);
  return products.map(p => normalizeProduct(p, 'kilimall'));
}

// 🧪 Test function
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchKilimallProducts("vacuum cleaner")
    .then(products => {
      console.log(`\n📦 Final Kilimall results: ${products.length} products`);
      products.forEach((p, i) => {
        console.log(`${i+1}. ${p.name} - KES ${p.price}`);
      });
    })
    .catch(console.error);
}