import Users from "../Model/Users.js";

/**
 * Add or update a tracked product for a user
 */
export async function trackProduct({
  userId,
  productId,
  name,
  url,
  store,
  currency,
  price,
}) {
  const user = await Users.findById(userId);
  if (!user) throw new Error("User not found");

  // Check if the product already exists in tracked_products
  const existing = user.User_preferences.tracked_products.find(
    (p) => p.productId.toString() === productId.toString()
  );

  if (existing) {
    // ✅ Only update basic info, NO price history
    existing.name = name || existing.name;
    existing.url = url || existing.url;
    existing.store = store || existing.store;
    existing.currency = currency || existing.currency;
    console.log(`📝 Updated existing tracked product: ${name}`);
  } else {
    // ✅ Add new tracked product WITHOUT priceHistory
    user.User_preferences.tracked_products.push({
      productId,
      name,
      url,
      store,
      currency,
      trackedSince: new Date(),
      // ❌ REMOVED: priceHistory: [{ price }]
    });
    console.log(`✨ Added new tracked product: ${name}`);
  }

  await user.save();
  return user.User_preferences.tracked_products;
}