import { normalizePriceToKES } from "../Utils/normalizePrice.js"; // adjust path if needed

// helpers/productUtils.js
export function normalizeProduct(item, source) {
  const price = Number(item.price) || 0;
  const priceKES = normalizePriceToKES(price, item.currency || "USD");

  return {
    name: item.name || item.title || "Unknown Product",
    price: priceKES, // normalized price
    currency: "KES", // unified currency
    store: item.store || source, // consistent naming
    rating: item.rating ? Number(item.rating) : null,
    image: item.image || item.imageUrl || item.img || null, // ✅ keep consistent
    url: item.url || item.link || item.href || null,        // ✅ fixed missing field
    last_checked: new Date(),
  };
}

  
  
  export function filterAndSort(products, { sortBy, minPrice, maxPrice, minRating }) {
    let filtered = products;
  
    if (minPrice) filtered = filtered.filter(p => p.price >= minPrice);
    if (maxPrice) filtered = filtered.filter(p => p.price <= maxPrice);
    if (minRating) filtered = filtered.filter(p => (p.rating || 0) >= minRating);
  
    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === "price") return a.price - b.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
    }
  
    return filtered;
  }
  