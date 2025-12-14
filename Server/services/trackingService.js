import Users from "../Model/Users.js";
import Alerts from "../Model/Alerts.js"; // ⬅️ Make sure this is correct

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
  const existing = user.User_preferences.User_tracked_products.find(
    (p) => p.Tracked_product_id.toString() === productId.toString()
  );

  if (existing) {
    // ✅ Update existing product only — NO alert needed
    existing.Tracked_name = name || existing.Tracked_name;
    existing.Tracked_url = url || existing.Tracked_url;
    existing.Tracked_store = store || existing.Tracked_store;
    existing.Tracked_currency = currency || existing.Tracked_currency;

    console.log(`📝 Updated existing tracked product: ${name}`);
  } else {
    // ✅ Add new tracked product
    user.User_preferences.User_tracked_products.push({
      Tracked_product_id: productId,
      Tracked_name: name,
      Tracked_url: url,
      Tracked_store: store,
      Tracked_currency: currency,
      Tracked_since: new Date(),
    });

    console.log(`✨ Added new tracked product: ${name}`);

    // ⭐⭐⭐ AUTO-CREATE ALERT HERE ⭐⭐⭐
    await Alerts.create({
      Alert_userId: userId,
      Alert_productId: productId,
      Alert_type: "price_drop",
      Alert_triggerPrice: price,   // price at time of tracking
      Alert_createdAt: new Date(),
      Alert_status: "active",
    });

    console.log("🔔 Auto-alert created for tracked product");
  }

  await user.save();
  return user.User_preferences.User_tracked_products;
}
