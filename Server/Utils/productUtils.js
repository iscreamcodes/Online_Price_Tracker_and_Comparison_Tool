import { normalizePriceToKES } from "../Utils/normalizePrice.js";

export function normalizeProduct(item, source) {
  const priceText = String(item.price || "").replace(/[^\d.,]/g, "");
  const price = parseFloat(priceText.replace(/,/g, "")) || 0;
  const priceKES = normalizePriceToKES(price, item.currency || "USD");

  return {
    name: item.name || item.title || "Unknown Product",
    price: priceKES,              // normalized numeric price
    currency: "KES",              // unified currency
    store: item.store || source,  // track origin
    rating: item.rating ? Number(item.rating) : null,
    image: item.image || item.imageUrl || item.img || null,
    url: item.url || item.link || item.href || null,
    last_checked: new Date(),
  };
}
