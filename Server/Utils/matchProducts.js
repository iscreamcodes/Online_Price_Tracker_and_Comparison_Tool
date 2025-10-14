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
