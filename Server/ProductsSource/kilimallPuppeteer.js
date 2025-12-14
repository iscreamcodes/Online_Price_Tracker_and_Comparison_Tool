// kilimallPuppeteer.js - IMPROVED + SAFE IMAGE FIX
import { chromium } from 'playwright';
import { normalizeProduct } from '../Utils/productUtils.js';

export async function fetchKilimallProducts(searchQuery) {
  console.log(`🛍️ Scraping Kilimall for "${searchQuery}"...`);
  
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 45000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=site-per-process'
    ]
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  const allProducts = [];
  
  try {
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    const searchUrl = `https://www.kilimall.co.ke/search?q=${encodeURIComponent(searchQuery)}`;
    console.log(`🌍 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('⏳ Waiting for page to load...');

    try {
      await Promise.race([
        page.waitForSelector('.goods-item, .product-item, [class*="item"], .item', { timeout: 15000 }),
        page.waitForSelector('.no-result, .no-products, .empty', { timeout: 15000 }),
        page.waitForSelector('body', { timeout: 15000 })
      ]);
    } catch {}

    await page.waitForTimeout(2000);

    console.log('⏳ Extracting products…');

    const products = await page.evaluate((searchTerm) => {
      const items = [];
      
      const selectors = [
        '.goods-item',
        '.product-item', 
        '.item',
        '[class*="product"]',
        '[class*="item"]',
        '.goods-list .item',
        '.product-list > div'
      ];
      
      let productElements = [];
      for (const selector of selectors) {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
          productElements = Array.from(els);
          break;
        }
      }
      
      if (productElements.length === 0) {
        const allDivs = document.querySelectorAll('div');
        productElements = Array.from(allDivs).filter(div => {
          const text = div.textContent || '';
          return text.length > 20 && text.length < 500 &&
                 (text.includes('KSh') || /\d{3,}/.test(text));
        });
      }

      productElements.slice(0, 30).forEach(element => {
        try {
          // NAME
          const nameSelectors = [
            '.title', '.name', '.goods-name', '.product-name',
            '.item-title', 'h3', 'h4', '[class*="title"]'
          ];
          
          let name = '';
          for (const sel of nameSelectors) {
            const el = element.querySelector(sel);
            if (el?.textContent?.trim()) {
              name = el.textContent.trim();
              break;
            }
          }
          
          if (!name) {
            const link = element.querySelector('a');
            name = link?.textContent?.trim() || 'Unknown Product';
          }

          // PRICE
          const priceSelectors = [
            '.price', '.money', '.cost', '.current-price',
            '.new-price', '[class*="price"]', 'strong'
          ];
          
          let priceText = '';
          for (const sel of priceSelectors) {
            const el = element.querySelector(sel);
            if (el?.textContent?.trim()) {
              priceText = el.textContent.trim();
              break;
            }
          }
          
          if (!priceText) {
            const text = element.textContent || '';
            const match = text.match(/(KSh|KES)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (match) priceText = match[0];
          }

          const priceMatch = priceText.replace(/[^\d.]/g, '');
          const price = priceMatch ? parseFloat(priceMatch) : 0;

          // IMAGE — SAFE UPDATED VERSION
          let image = "";

          const tagImg = element.querySelector("img");

          image =
            tagImg?.dataset?.src ||
            tagImg?.getAttribute("data-src") ||
            tagImg?.getAttribute("data-original") ||
            tagImg?.getAttribute("data-lazy") ||
            tagImg?.src ||
            "";

          if (!image || image.includes("placeholder-image")) {
            const deepImg =
              element.querySelector(".img-content") ||
              element.querySelector(".swipe-image img") ||
              element.querySelector(".zoom-image") ||
              element.querySelector("img[data-src]");

            if (deepImg) {
              image =
                deepImg.dataset?.src ||
                deepImg.getAttribute("data-src") ||
                deepImg.src ||
                image;
            }
          }

          if (image && image.startsWith("/")) {
            image = "https://www.kilimall.co.ke" + image;
          }

          // URL
          const link = element.querySelector('a');
          let url = link?.href || '';
          if (url && !url.startsWith('http')) {
            url = `https://www.kilimall.co.ke${url.startsWith('/') ? url : '/' + url}`;
          }

          if (name && name !== 'Unknown Product' && price > 0) {
            items.push({
              name: name.substring(0, 200),
              price: price,
              originalPrice: priceText,
              image: image,
              url: url,
              store: 'Kilimall',
              currency: 'KES'
            });
          }
        } catch (e) {
          console.log("Error parsing product:", e);
        }
      });

      return items;
    }, searchQuery);

    console.log(`📊 Raw Kilimall extraction: ${products.length} items`);

    const relevantProducts = filterRelevantProducts(products, searchQuery);
    allProducts.push(...relevantProducts);

  } catch (error) {
    console.error('❌ Kilimall scraping error:', error.message);
    return [];
  } finally {
    await browser.close();
  }

  const normalizedProducts = allProducts.map(product => 
    normalizeProduct(product, 'kilimall')
  );

  console.log(`✅ Kilimall completed: ${normalizedProducts.length} relevant products`);
  return normalizedProducts;
}


// ---------- FILTERING (unchanged, just cleaned formatting) ----------
function filterRelevantProducts(products, searchTerm) {
  if (!products.length) return [];
  
  console.log(`🔍 Filtering ${products.length} Kilimall products for "${searchTerm}"...`);
  
  const searchLower = searchTerm.toLowerCase().trim();
  const searchWords = searchLower.split(/\s+/).filter(w => w.length > 1);
  
  if (searchWords.length === 0) return products.slice(0, 20);
  
  const relevantProducts = products.filter(product => {
    const name = product.name.toLowerCase();
    let score = 0;

    if (name.includes(searchLower)) score += 50;

    for (const word of searchWords) {
      if (word.length > 2 && name.includes(word)) score += 20;
      else if (word.length > 4 && name.includes(word.substring(0, 4))) score += 10;
    }

    if (product.price > 0 && product.price < 1000000) score += 5;
    if (name.length > 10 && name.length < 100) score += 3;

    product.relevanceScore = score;
    return score > 5;
  });

  relevantProducts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  
  console.log(`📊 Relevance passed: ${relevantProducts.length}`);
  
  return relevantProducts.slice(0, 20);
}


// ---------- FALLBACK (unchanged) ----------
export async function fetchKilimallProductsFallback(searchQuery) {
  console.log(`🔄 Using fallback Kilimall scraper for "${searchQuery}"...`);
  
  try {
    const response = await fetch(`https://www.kilimall.co.ke/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 10000
    });
    
    if (!response.ok) return [];

    const html = await response.text();
    const products = [];
    const regex = /<div[^>]*class=[^>]*(goods-item|product-item|item)[^>]*>([\s\S]*?)<\/div>/gi;
    
    let match;
    while ((match = regex.exec(html)) !== null && products.length < 10) {
      const block = match[0];
      
      const nameMatch =
        block.match(/<h3[^>]*>([^<]*)<\/h3>/) ||
        block.match(/title="([^"]*)"/) ||
        block.match(/<a[^>]*>([^<]*)<\/a>/);

      const priceMatch = block.match(/(KSh|KES)?\s*(\d{1,3}(?:,\d{3})*)/);

      if (nameMatch && priceMatch) {
        products.push({
          name: nameMatch[1].trim(),
          price: parseFloat(priceMatch[2].replace(/,/g, '')),
          currency: 'KES',
          store: 'Kilimall',
          url: `https://www.kilimall.co.ke/search?q=${encodeURIComponent(searchQuery)}`
        });
      }
    }

    return products.map(p => normalizeProduct(p, 'kilimall'));
    
  } catch {
    return [];
  }
}
