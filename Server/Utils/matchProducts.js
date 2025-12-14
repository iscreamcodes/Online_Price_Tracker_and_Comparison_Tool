import stringSimilarity from "string-similarity";

function normalizeName(name) {
  if (!name) return "";

  return name
    .toLowerCase()
    // keep letters, numbers, spaces, hyphens, and dots (so "15.6" stays)
    .replace(/[^a-z0-9\s\-.]/g, "")
    // remove filler words but keep storage, size, and model terms
    .replace(
      /\b(new|original|for sale|with|and|the|a|an|of|by|dual sim|smartphone|mobile|phone)\b/g,
      ""
    )
    // collapse multiple spaces/hyphens
    .replace(/[-\s]+/g, " ")
    .trim();
}

function tokenSimilarity(a, b) {
  const tokensA = new Set(a.split(" "));
  const tokensB = new Set(b.split(" "));
  const intersection = [...tokensA].filter((t) => tokensB.has(t));
  return intersection.length / Math.max(tokensA.size, tokensB.size);
}

function extractBrandModel(name) {
  const words = name.split(" ");
  // Heuristic: first 2–4 meaningful tokens often represent brand + model
  return words.slice(0, 4).join(" ");
}

export function flattenProducts(allProducts) {
  return allProducts.map((product) => {
    const fullName = product.name || product.title || "";
    const normalized = normalizeName(fullName);

    return {
      name: fullName,
      normalizedName: normalized,
      store: product.store,
      price: product.price,
      currency: product.currency,
      rating: product.rating,
      image: product.image || "",
      url: product.url || "",
    };
  });
}

export function normalizeProduct(product, store) {
  // Extract price and currency
  let price = product.price || product.Listing_Price || 0;
  let currency = product.currency || product.Listing_Currency || "KES";
  
  // Clean price if it's a string
  if (typeof price === 'string') {
    price = Number(price.replace(/[^\d.]/g, "")) || 0;
  }

  return {
    name: product.name || product.title || product.Product_Name || "Unknown Product",
    price: price,
    currency: currency,
    store: store || product.store || product.Listing_Store_Name || "Unknown Store",
    image: product.image || product.Listing_Image_URL || product.Product_Image_URL || "",
    url: product.url || product.Listing_URL || "",
    rating: product.rating || null,
    category: product.category || product.Product_Category || "General",
    category_code: product.category_code || product.Product_Category_code || "CAT_GENERAL", // Added
  };
}

const currencyRatesKES = {
  KES: 1,           // base
  USD: 150,         // 1 USD ≈ 150 KES
  EUR: 165          // 1 EUR ≈ 165 KES
};

export function normalizePriceToKES(price, currency) {
  if (!currencyRatesKES[currency]) return price; // fallback
  return price * currencyRatesKES[currency];
}